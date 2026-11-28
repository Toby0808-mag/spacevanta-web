#!/usr/bin/env python3
"""Antigravity 代码清单工具（v2.3：全局清单只管全局/驱动层共用代码；模板内部代码各自一份模板清单）。
  pull   <branch> <范围路径…>      开工前必拉：对账最新主干、列出变动、查锁、登记基线
  submit <branch> [L5版本]         完工必交：重算台账、写变更、释放锁
  dep    <branch> <模板A> <模板B> <B内部路径>   A 需要调用 B 的内部组件：登记依赖（并提示看 B 的清单）
  release <branch>                 全局代码冲突已由用户批准修改后：把该分支的 HOLD 源实现转为 KEPT
  check  <base> <head> <branch>    CI：清单随 PR 更新、基线不过期、不与他人锁冲突、依赖未过期
全局/驱动层（含 public 里的共有资源）除了登记变动，还**保留源实现**：submit 时把改动/删除文件的"修改前版本"存入 code-checklist/source-keep/；
冲突时（开工后他人也改了同一文件）这些源实现标 HOLD，不自动清理，须用户批准后才可继续修改。
清单只保留当前版 + 最近 2 份备份（_backup/）；日志段落只留最近若干条。
范围划分见 code-checklist/scopes.json：
  全局/驱动层 → code-checklist/CODE_CHECKLIST.md
  模板内部    → code-checklist/templates/<模板>/CODE_CHECKLIST.md（Drive：theme/<模板>/antigravity/code-checklist/）
  3D 资产     → 不进代码清单（逐资产的 asset.json / TRACK 管理）"""
import subprocess, sys, re, hashlib, datetime, os, json, glob

ROOT_CL = 'code-checklist/CODE_CHECKLIST.md'
DEFAULT_SCOPES = {
    "global_prefixes": ["web/layout/", "web/components/", "web/blocks/", "web/public/sv-dna/", "web/i18n/",
                        "web/config/", "web/snippets/", "web/sections/header-group", "web/sections/footer-group",
                        "web/sections/sv-slot/", "web/templates/policy.", "web/templates/gift_card.", "web/templates/proofing."],
    "keep_backups": 2, "keep_log_entries": 5, "keep_source_batches": 3,
    "global_files": ["web/theme.schema.json", "web/theme.config.json"],
    "template_rules": [
        {"prefix": "web/sections/", "depth": 1},
        {"prefix": "web/public/", "depth": 1, "only_if_section_exists": True},
        {"prefix": "web/templates/", "stem": True}
    ]
}


def scopes():
    S = dict(DEFAULT_SCOPES)
    p = 'code-checklist/scopes.json'
    if os.path.exists(p):
        S.update(json.load(open(p, encoding='utf-8')))
    return S


def git(*a, ok=False):
    r = subprocess.run(['git', '-c', 'core.quotepath=false', *a], capture_output=True, text=True)
    if r.returncode and not ok:
        sys.exit('git %s 失败：%s' % (' '.join(a), r.stderr.strip()))
    return r.stdout if r.returncode == 0 else ''


def exists(ref_path):
    return subprocess.run(['git', 'cat-file', '-e', ref_path], capture_output=True).returncode == 0


def classify(p):
    """返回 ('global',None) | ('template',名) | ('other',None)"""
    S = scopes()
    if p in S['global_files'] or any(p.startswith(x) for x in S['global_prefixes']):
        return ('global', None)
    for r in S['template_rules']:
        if p.startswith(r['prefix']):
            rest = p[len(r['prefix']):]
            if not rest.strip('/'):
                return ('broad', None)
            if r.get('stem'):
                return ('template', rest.split('/')[0].split('.')[0])
            head = rest.split('/')[0]
            # public 下：有同名 section 的目录属于该模板；其余（含根目录文件）都是共有资源＝全局
            if r.get('only_if_section_exists') and not os.path.isdir('web/sections/' + head):
                return ('global', None)
            return ('template', head)
    return ('other', None)


def cl_path(kind, name):
    return ROOT_CL if kind == 'global' else 'code-checklist/templates/%s/CODE_CHECKLIST.md' % name


def in_group(path, kind, name):
    k, n = classify(path)
    return k == kind and (kind == 'global' or n == name)


def role_of(p):
    if p.startswith(('web/', 'assets/3d/products/', 'assets/3d/ecosystem/ag/', 'verify/ag/', 'code-checklist/')):
        return 'ag'
    if p.startswith(('workers/', 'agent/', 'contracts/', 'assets/3d/ecosystem/cu/', 'verify/cu/')):
        return 'cu'
    if p.startswith(('design/', 'docs/brand/')):
        return 'design'
    if p.startswith('track/'):
        return 'track'
    return 'gov'


def field(text, name):
    m = re.search(r'^%s:[ \t]*(.*)$' % re.escape(name), text, re.M)
    return m.group(1).strip() if m else ''


def set_field(text, name, val):
    if re.search(r'^%s:' % re.escape(name), text, re.M):
        return re.sub(r'^%s:.*$' % re.escape(name), lambda m: '%s: %s' % (name, val), text, flags=re.M)
    return '%s: %s\n' % (name, val) + text


def section(text, name):
    m = re.search(r'<!-- %s -->\n(.*?)<!-- /%s -->' % (name, name), text, re.S)
    return [l for l in m.group(1).splitlines() if l.strip()] if m else []


def set_section(text, name, lines):
    body = ''.join(l + '\n' for l in lines)
    pat = r'<!-- %s -->\n.*?<!-- /%s -->' % (name, name)
    new = '<!-- %s -->\n%s<!-- /%s -->' % (name, body, name)
    if re.search(pat, text, re.S):
        return re.sub(pat, lambda m: new, text, flags=re.S)
    return text + '\n' + new + '\n'


def blank(kind, name):
    title = '全局/驱动层共用代码' if kind == 'global' else '模板「%s」内部代码' % name
    return ('# Antigravity 代码清单：%s\n\nPULLED_SHA:\nUPDATED_AT:\nUPDATED_BY:\n\n'
            '规则：开工前 pull、完工后 submit，随 PR 提交。其他模板要调用本模板内部组件，请先读本清单，并用 `dep` 登记依赖。\n\n'
            '## 1. 在途施工锁\n<!-- LOCKS -->\n<!-- /LOCKS -->\n\n## 2. 文件台账\n<!-- FILES -->\n<!-- /FILES -->\n\n'
            '## 3. 变更记录\n<!-- CHANGES -->\n<!-- /CHANGES -->\n\n## 4. 拉取记录\n<!-- PULLS -->\n<!-- /PULLS -->\n\n'
            '## 5. 依赖其他模板内部组件（DEP|被依赖模板|路径|被依赖方基线SHA|时间）\n<!-- DEPS -->\n<!-- /DEPS -->\n\n'
            '## 6. 已保留的源实现（SRC|批次|分支|路径|修改前基线SHA|KEPT/HOLD；仅全局/驱动层）\n<!-- SOURCES -->\n<!-- /SOURCES -->\n\n'
            '## 7. 异常与人工备注\n') % title


def gitbytes(ref_path):
    r = subprocess.run(['git', 'show', ref_path], capture_output=True)
    return r.stdout if r.returncode == 0 else None


def stamp():
    return datetime.datetime.now().strftime('%Y%m%d-%H%M%S')


def backup_and_prune(path, kind, name):
    """改写清单前：把当前版存入 _backup/，只留最近 keep_backups 份。"""
    if not os.path.exists(path):
        return
    sub = 'global' if kind == 'global' else 'templates/%s' % name
    d = 'code-checklist/_backup/%s' % sub
    os.makedirs(d, exist_ok=True)
    import shutil
    shutil.copyfile(path, '%s/CODE_CHECKLIST.%s.md' % (d, stamp()))
    olds = sorted(glob.glob(d + '/CODE_CHECKLIST.*.md'))
    for f in olds[:-scopes()['keep_backups']]:
        os.remove(f)


def trim(lines):
    return lines[-scopes()['keep_log_entries']:]


def locks(text):
    out = []
    for l in section(text, 'LOCKS'):
        p = l.split('|')
        if p[0] == 'LOCK' and len(p) >= 6:
            out.append(dict(branch=p[1], scope=p[2], sha=p[3], date=p[4], state=p[5]))
    return out


def overlap(a, b):
    a, b = a.rstrip('/') + '/', b.rstrip('/') + '/'
    return a.startswith(b) or b.startswith(a)


def now():
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M')


def main_ref():
    for r in (os.environ.get('MAIN_REF'), 'origin/main', 'main'):
        if r and git('rev-parse', '--verify', '-q', r, ok=True).strip():
            return r
    sys.exit('找不到主干分支')


def groups_of(paths):
    g = {}
    for p in paths:
        k, n = classify(p)
        if p.rstrip('/') in ('web', 'web/sections', 'web/public', 'web/templates'):
            k = 'broad'
        if k == 'broad':
            sys.exit('范围太宽：%s。请指定全局子目录（如 web/components/）或具体模板（如 web/sections/hero-bridge/）。' % p)
        if k in ('global', 'template'):
            g.setdefault((k, n), []).append(p)
    return g


def cmd_pull(branch, scope):
    subprocess.run(['git', 'fetch', '-q', 'origin'], capture_output=True)
    M = main_ref()
    msha = git('rev-parse', M).strip()
    G = groups_of(scope)
    if not G:
        print('范围内没有代码清单管理的文件（3D 资产不进代码清单）。')
        return
    if subprocess.run(['git', 'merge-base', '--is-ancestor', msha, 'HEAD']).returncode:
        print('⚠ 当前分支未包含最新主干：请先合并/变基到 %s，再开工。' % M)
    for (kind, name), sc in G.items():
        path = cl_path(kind, name)
        label = '全局/驱动层' if kind == 'global' else '模板 ' + name
        print('\n######## 清单：%s（%s）' % (label, path))
        cur = git('show', '%s:%s' % (M, path), ok=True)
        text = open(path, encoding='utf-8').read() if os.path.exists(path) else (cur or blank(kind, name))
        last = field(cur, 'PULLED_SHA')
        print('主干 %s（%s）；本清单上次基线：%s' % (M, msha[:10], last[:10] or '无'))
        hits = 0
        if last and exists(last):
            rows = [l.split('\t') for l in git('diff', '--name-status', '-M', last, M).splitlines() if l]
            rows = [r for r in rows if in_group(r[-1], kind, name)]
            print('== 自上次基线以来，本清单范围内的代码变动（%d 个文件）' % len(rows))
            for r in rows:
                f = r[-1]
                hit = any(overlap(f, s) for s in sc)
                hits += hit
                print('  %-3s %-7s %s%s' % (r[0], role_of(f), f, '   ⚠ 与你的施工范围重叠' if hit else ''))
        else:
            print('== 无可比较的上次基线（首次或已变基）：请人工核对台账')
        for L in locks(cur):
            if L['state'] == 'ACTIVE' and L['branch'] != branch and any(overlap(L['scope'], s) for s in sc):
                sys.exit('⛔ 范围被他人占用：%s 持有 %s（自 %s）。先协调，不得开工。' % (L['branch'], L['scope'], L['date']))
        for d in section(cur, 'DEPS'):
            p = d.split('|')
            if len(p) >= 4 and p[0] == 'DEP':
                dk = cl_path('template', p[1])
                moved = [x for x in git('diff', '--name-only', p[3], M).splitlines() if x.startswith(p[2])] if exists(p[3]) else []
                print('  依赖 %s:%s → %s' % (p[1], p[2], ('⚠ 被依赖方已变动 %d 个文件，请读 %s' % (len(moved), dk)) if moved else '未变动'))
        if kind == 'global' and hits:
            print('⚠ 冲突风险：他人改了你范围内的全局文件。修改前会保留源实现；若 submit 时判定冲突，源实现标 HOLD，须你批准后才可继续修改。')
        backup_and_prune(path, kind, name)
        text = set_field(text, 'PULLED_SHA', msha)
        text = set_field(text, 'UPDATED_AT', now())
        L = [l for l in section(text, 'LOCKS') if not l.startswith('LOCK|%s|' % branch)]
        L += ['LOCK|%s|%s|%s|%s|ACTIVE' % (branch, s, msha[:10], now()) for s in sc]
        text = set_section(text, 'LOCKS', L)
        text = set_section(text, 'PULLS', trim(section(text, 'PULLS') +
                           ['PULL|%s|%s|%s|%s' % (branch, msha[:10], now(), ('重叠%d个文件' % hits) if hits else '无重叠')]))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'w', encoding='utf-8').write(text)
        print('已写入 %s（基线 %s，已登记锁）。' % (path, msha[:10]))
        if hits:
            print('⚠ %d 个变动与你的范围重叠：先读懂再动手。' % hits)
    print('\n请把上述清单文件随分支提交。')


def keep_sources(text, branch, M, diff):
    """全局/驱动层：保留改动/删除文件的修改前源实现。冲突（开工后他人也改过同一文件）→ HOLD。"""
    pulled = field(text, 'PULLED_SHA')
    since = set(git('diff', '--name-only', pulled, M).splitlines()) if pulled and exists(pulled) else set()
    batch = '%s_%s' % (stamp(), branch.replace('/', '-'))
    msha = git('rev-parse', M).strip()[:10]
    rows, held = [], 0
    for l in diff:
        st, f = l.split('\t')[0], l.split('\t')[-1]
        if st[0] == 'A':
            continue
        old = l.split('\t')[1] if st[0] == 'R' else f
        data = gitbytes('%s:%s' % (M, old))
        if data is None:
            continue
        dst = 'code-checklist/source-keep/%s/%s' % (batch, old)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, 'wb').write(data)
        state = 'HOLD' if f in since else 'KEPT'
        held += state == 'HOLD'
        rows.append('SRC|%s|%s|%s|%s|%s' % (batch, branch, old, msha, state))
    allrows = section(text, 'SOURCES') + rows
    # 只保留最近 N 个批次；含 HOLD 的批次不清理
    batches = []
    for r in allrows:
        b = r.split('|')[1]
        if b not in batches:
            batches.append(b)
    holdb = set(r.split('|')[1] for r in allrows if r.endswith('|HOLD'))
    drop = [b for b in batches[:-scopes()['keep_source_batches']] if b not in holdb]
    import shutil
    for b in drop:
        shutil.rmtree('code-checklist/source-keep/%s' % b, ignore_errors=True)
    allrows = [r for r in allrows if r.split('|')[1] not in drop]
    if rows:
        print('已保留 %d 个文件的源实现（批次 %s）%s' % (len(rows), batch, ('；其中 %d 个因冲突标 HOLD：请把这些源实现交给用户，批准后才可继续修改' % held) if held else ''))
    return set_section(text, 'SOURCES', allrows)


def cmd_release(branch):
    path = ROOT_CL
    text = open(path, encoding='utf-8').read()
    rows = [r.replace('|HOLD', '|KEPT') if ('|%s|' % branch) in r and r.endswith('|HOLD') else r for r in section(text, 'SOURCES')]
    backup_and_prune(path, 'global', None)
    open(path, 'w', encoding='utf-8').write(set_section(text, 'SOURCES', rows))
    print('已把分支 %s 的 HOLD 源实现转为 KEPT（仅在用户已批准修改后执行）。' % branch)


def cmd_submit(branch, l5):
    M = main_ref()
    files = glob.glob('code-checklist/CODE_CHECKLIST.md') + glob.glob('code-checklist/templates/*/CODE_CHECKLIST.md')
    done = 0
    for path in files:
        text = open(path, encoding='utf-8').read()
        if not any(l.startswith('LOCK|%s|' % branch) for l in section(text, 'LOCKS')):
            continue
        if path == ROOT_CL:
            kind, name = 'global', None
        else:
            kind, name = 'template', path.split('/')[2]
        rows = []
        for f in git('ls-files', '-co', '--exclude-standard', '--', 'web').splitlines():
            if os.path.isfile(f) and in_group(f, kind, name):
                h = hashlib.sha256(open(f, 'rb').read()).hexdigest()[:12]
                c = git('log', '-1', '--format=%h', '--', f, ok=True).strip() or '-'
                rows.append('FILE|%s|%s|%s|%s|%s' % (f, h, c, l5 or '-', role_of(f)))
        backup_and_prune(path, kind, name)
        text = set_section(text, 'FILES', sorted(set(rows)))
        diff = [l for l in git('diff', '--name-status', '-M', M).splitlines() if l and in_group(l.split('\t')[-1], kind, name)]
        if kind == 'global':
            text = keep_sources(text, branch, M, diff)
        summ = ' '.join('%s:%s' % (l.split('\t')[0], l.split('\t')[-1]) for l in diff)[:2000] or '无文件变动'
        text = set_section(text, 'CHANGES', trim(section(text, 'CHANGES') + ['CHG|%s|%s|%s|%s' % (now(), branch, l5 or '-', summ)]))
        text = set_section(text, 'LOCKS', [l.replace('|ACTIVE', '|DONE') if l.startswith('LOCK|%s|' % branch) else l
                                           for l in section(text, 'LOCKS')])
        text = set_field(text, 'UPDATED_AT', now())
        text = set_field(text, 'UPDATED_BY', branch)
        open(path, 'w', encoding='utf-8').write(text)
        print('已更新 %s：%d 个文件台账；锁已释放。' % (path, len(rows)))
        done += 1
    if not done:
        sys.exit('未找到属于分支 %s 的活动锁：是否忘了 pull？' % branch)
    print('请把更新后的清单随 PR 提交。')


def cmd_dep(branch, a, b, path):
    M = main_ref()
    if classify(path) != ('template', b):
        sys.exit('路径 %s 不属于模板 %s 的内部代码。若多个模板都要用，请把它上升为全局组件（走全局清单）。' % (path, b))
    msha = git('rev-parse', M).strip()
    pa = cl_path('template', a)
    text = open(pa, encoding='utf-8').read() if os.path.exists(pa) else blank('template', a)
    rows = [l for l in section(text, 'DEPS') if not l.startswith('DEP|%s|%s|' % (b, path))]
    rows.append('DEP|%s|%s|%s|%s' % (b, path, msha, now()))
    os.makedirs(os.path.dirname(pa), exist_ok=True)
    open(pa, 'w', encoding='utf-8').write(set_section(text, 'DEPS', rows))
    print('已登记依赖：%s → %s:%s（基线 %s）' % (a, b, path, msha[:10]))
    print('请先读 %s 了解该组件现状。若被多个模板使用，建议上升为全局组件。' % cl_path('template', b))


def cmd_check(base, head, branch):
    err = []
    changed = [l.split('\t')[-1] for l in git('diff', '--name-status', '-M', '%s...%s' % (base, head)).splitlines() if l]
    G = {}
    for f in changed:
        k, n = classify(f)
        if k in ('global', 'template'):
            G.setdefault((k, n), []).append(f)
    if not G:
        print('OK: 无需代码清单的施工文件变动')
        return 0
    for (kind, name), work in G.items():
        path = cl_path(kind, name)
        tag = '[%s]' % ('全局' if kind == 'global' else '模板 ' + name)
        if path not in changed:
            err.append('%s PR 未更新 %s（开工前拉取、完工提交是强制的）' % (tag, path))
            continue
        text = git('show', '%s:%s' % (head, path), ok=True)
        pulled = field(text, 'PULLED_SHA')
        if not pulled or not exists(pulled):
            err.append('%s PULLED_SHA 缺失或无效' % tag)
        else:
            since = set(git('diff', '--name-only', pulled, base).splitlines())
            stale = sorted(f for f in work if f in since)
            if stale:
                err.append('%s 基线已过期：开工后主干上这些文件又被改过，需重新 pull 并核对：%s' % (tag, ', '.join(stale[:8])))
        base_text = git('show', '%s:%s' % (base, path), ok=True)
        for L in locks(base_text):
            if L['state'] == 'ACTIVE' and L['branch'] != branch and any(overlap(f, L['scope']) for f in work):
                err.append('%s 范围与他人活动锁冲突：%s 持有 %s' % (tag, L['branch'], L['scope']))
        listed = set(l.split('|')[1] for l in section(text, 'FILES') if l.startswith('FILE|'))
        unl = [f for f in work if f not in listed and exists('%s:%s' % (head, f))]
        if unl:
            err.append('%s 台账缺少本次改动文件（未运行 submit？）：%s' % (tag, ', '.join(unl[:8])))
        if kind == 'global':
            srcs = {r.split('|')[3]: r.split('|') for r in section(text, 'SOURCES') if r.startswith('SRC|') and ('|%s|' % branch) in r}
            for l in git('diff', '--name-status', '-M', '%s...%s' % (base, head)).splitlines():
                st, f = l.split('\t')[0], l.split('\t')[-1]
                old = l.split('\t')[1] if st[0] == 'R' else f
                if st[0] != 'A' and in_group(f, 'global', None):
                    row = srcs.get(old)
                    if not row or not exists('%s:code-checklist/source-keep/%s/%s' % (head, row[1], old)):
                        err.append('%s 未保留源实现：%s（全局/驱动层改动必须保留修改前的源实现；运行 submit）' % (tag, old))
                    elif row[5] == 'HOLD':
                        err.append('%s 源实现处于 HOLD（冲突，待用户批准）：%s' % (tag, old))
        for d in section(text, 'DEPS'):
            p = d.split('|')
            if len(p) >= 4 and p[0] == 'DEP' and exists(p[3]):
                moved = [x for x in git('diff', '--name-only', p[3], base).splitlines() if x.startswith(p[2])]
                if moved:
                    err.append('%s 依赖的模板 %s 内部代码自登记后已变动：%s；需读其清单并重新 dep' % (tag, p[1], ', '.join(moved[:5])))
    for e in err:
        print('FAIL:', e)
    if not err:
        print('OK: code-checklist passed')
    return 1 if err else 0


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    if a[0] == 'pull' and len(a) >= 3:
        cmd_pull(a[1], a[2:])
    elif a[0] == 'submit' and len(a) >= 2:
        cmd_submit(a[1], a[2] if len(a) > 2 else '')
    elif a[0] == 'release' and len(a) == 2:
        cmd_release(a[1])
    elif a[0] == 'dep' and len(a) == 5:
        cmd_dep(*a[1:])
    elif a[0] == 'check' and len(a) == 4:
        sys.exit(cmd_check(*a[1:]))
    else:
        sys.exit(__doc__)
