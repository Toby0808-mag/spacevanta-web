#!/usr/bin/env python3
"""施工方学习记录（Antigravity=ag / Cursor=cu 各一份）：learning/<antigravity|cursor>/LEARNING_LOG.md
  review <角色> <分支> [标签,逗号分隔]            每次施工前必过：列出基本盘、相关失败记录、成功记录，并登记已读
  add    <角色> <分支> <PASS|FAIL|PARTIAL> <标签> <目标> <要点> [--differs 与已失败路线的不同] [--next 下轮/其他方向可走]
  base   <角色> <标签> <写法> <验证证据>           收录"已有可用的写法/语言"为基本盘（最后的 fallback）
  check  <角色> <base> <head> <分支>              CI：本次 PR 必须更新学习记录、含本分支的 REVIEW 与至少一条 TRY
重复踩坑拦截：新的尝试若包含某条已失败的标签组合，必须写 --differs（说明这次哪里不同）。"""
import subprocess, sys, re, datetime, argparse, os

DIRS = {'ag': 'antigravity', 'cu': 'cursor'}
SEED = {
    'ag': [
        ('B001', 'shopline-syntax', '输出 {{ x }} 转义 / {{{ x }}} 不转义；引用 {{#component "名" /}}、{{#section "名" /}}、{{#sections "组" /}}；文案 {{ "a.b" | t() }}', '来源：官方 Fashion 1.1.14 源码（Treat5）通读'),
        ('B002', 'shopline-schema', '区块必须在末尾 {{#schema}}…{{/schema}} 里声明 presets，否则不出现在编辑器"添加区块"', '来源：官方源码 + 项目 doc 08'),
        ('B003', 'shopline-comment', '源码里没有 {{!-- --}} 注释写法：新文件不用模板注释', '来源：官方源码全文检索未出现'),
        ('B004', 'shopline-asset', 'public/ 是 asset_url() 的根；区块里 ./x.css 相对该文件所在目录', '来源：官方源码'),
        ('B005', 'sv-core', 'window.SpaceVanta：market/season/api/slots；失败静默回退；3 秒超时；仅 https', '来源：SpaceVanta-Base 0.1.0，真实浏览器测过'),
    ],
    'cu': [
        ('B001', 'workers', '既有 Worker：market-festival、shipping-intelligence、bundle、MTO（Cloudflare Workers + D1）', '来源：项目文档；施工方首次接手时须核实并补写具体可用写法'),
        ('B002', 'contracts', '既有接口：/v1/shipping、/market/active', '来源：项目文档；参数名以线上实际为准，核实后补写'),
    ]}


def git(*a, ok=False):
    r = subprocess.run(['git', '-c', 'core.quotepath=false', *a], capture_output=True, text=True)
    if r.returncode and not ok:
        sys.exit('git %s 失败：%s' % (' '.join(a), r.stderr.strip()))
    return r.stdout if r.returncode == 0 else ''


def path(role):
    return 'learning/%s/LEARNING_LOG.md' % DIRS[role]


def now():
    return datetime.datetime.now().strftime('%Y-%m-%d %H:%M')


def clean(x):
    return str(x).replace('|', '／').replace('\n', ' ').strip()


def section(text, name):
    m = re.search(r'<!-- %s -->\n(.*?)<!-- /%s -->' % (name, name), text, re.S)
    return [l for l in m.group(1).splitlines() if l.strip()] if m else []


def set_section(text, name, lines):
    body = ''.join(l + '\n' for l in lines)
    pat = r'<!-- %s -->\n.*?<!-- /%s -->' % (name, name)
    new = '<!-- %s -->\n%s<!-- /%s -->' % (name, body, name)
    return re.sub(pat, lambda m: new, text, flags=re.S) if re.search(pat, text, re.S) else text + '\n' + new + '\n'


def blank(role):
    base = ['BASE|%s|%s|%s|%s|%s' % (i, t, clean(w), clean(e), '种子') for i, t, w, e in SEED[role]]
    t = ('# %s 学习记录\n\n'
         '用途：每次新尝试的失败点与通过点；每次施工前先过一遍；"基本盘"是已验证可用的写法/语言，新路线跑不通时的最后保底。\n'
         '标签用英文小写、逗号分隔（如 shopline-syntax,hotspot,glb）。行内不要写 `|`。\n\n'
         '## 1. 基本盘 BASELINE（BASE|id|标签|可用写法/语言|验证证据|来源）\n<!-- BASELINE -->\n%s<!-- /BASELINE -->\n\n'
         '## 2. 施工前已读 REVIEWS（REVIEW|时间|分支|标签|看到的失败条数）\n<!-- REVIEWS -->\n<!-- /REVIEWS -->\n\n'
         '## 3. 尝试 TRIES（TRY|id|时间|分支|结果|标签|目标|要点（失败点/通过点）|与已失败路线的不同）\n<!-- TRIES -->\n<!-- /TRIES -->\n\n'
         '## 4. 成功记录 SUCCESS（SUCC|id|时间|标签|下轮/其他方向可走）\n<!-- SUCCESS -->\n<!-- /SUCCESS -->\n') % (
        '施工方', ''.join(l + '\n' for l in base))
    return t


def load(role):
    p = path(role)
    return open(p, encoding='utf-8').read() if os.path.exists(p) else blank(role)


def save(role, text):
    p = path(role)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(text)


def tagset(s):
    return set(t.strip().lower() for t in s.split(',') if t.strip())


def tries(text):
    out = []
    for l in section(text, 'TRIES'):
        p = l.split('|')
        if p[0] == 'TRY' and len(p) >= 9:
            out.append(dict(id=p[1], at=p[2], br=p[3], res=p[4], tags=tagset(p[5]), goal=p[6], note=p[7], diff=p[8]))
    return out


def cmd_review(role, branch, tags):
    text = load(role)
    T = tagset(tags)
    print('== 基本盘（最后的 fallback）')
    for l in section(text, 'BASELINE'):
        p = l.split('|')
        if not T or tagset(p[2]) & T:
            print('  %s [%s] %s —— %s' % (p[1], p[2], p[3], p[4]))
    fails = [t for t in tries(text) if t['res'] == 'FAIL' and (not T or t['tags'] & T)]
    print('== 相关失败记录（%d 条）：不要重复踩' % len(fails))
    for t in fails:
        print('  %s [%s] %s —— %s' % (t['id'], ','.join(sorted(t['tags'])), t['goal'], t['note']))
    print('== 成功记录（可走的方向）')
    for l in section(text, 'SUCCESS'):
        p = l.split('|')
        if not T or tagset(p[3]) & T:
            print('  %s [%s] %s' % (p[1], p[3], p[4]))
    R = section(text, 'REVIEWS')
    R.append('REVIEW|%s|%s|%s|%d' % (now(), clean(branch), ','.join(sorted(T)) or '-', len(fails)))
    text = set_section(text, 'REVIEWS', R[-30:])
    save(role, text)
    print('\n已登记"施工前已读"。请把学习记录随分支提交。')


def cmd_add(role, branch, res, tags, goal, note, differs, nxt):
    text = load(role)
    T = tagset(tags)
    prior = [t for t in tries(text) if t['res'] == 'FAIL' and t['tags'] <= T]
    if prior and not differs:
        sys.exit('⛔ 这个标签组合已有失败记录（%s）：%s\n请用 --differs 写明这次哪里不同，或换一个方向。' % (
            ','.join(t['id'] for t in prior), '; '.join(t['note'] for t in prior)[:300]))
    n = len(tries(text)) + 1
    tid = 'T%04d' % n
    rows = section(text, 'TRIES') + ['TRY|%s|%s|%s|%s|%s|%s|%s|%s' % (
        tid, now(), clean(branch), res, ','.join(sorted(T)), clean(goal), clean(note), clean(differs or '-'))]
    text = set_section(text, 'TRIES', rows)
    if res == 'PASS' and nxt:
        s = section(text, 'SUCCESS') + ['SUCC|%s|%s|%s|%s' % (tid, now(), ','.join(sorted(T)), clean(nxt))]
        text = set_section(text, 'SUCCESS', s)
    save(role, text)
    print('已记录 %s（%s）。' % (tid, res))
    if res == 'PASS':
        print('提示：若这是稳定可用的写法/语言，可用 base 命令收录进基本盘。')


def cmd_base(role, tag, how, ev):
    text = load(role)
    rows = section(text, 'BASELINE')
    nid = 'B%03d' % (len(rows) + 1)
    rows.append('BASE|%s|%s|%s|%s|%s' % (nid, clean(tag), clean(how), clean(ev), now()))
    save(role, set_section(text, 'BASELINE', rows))
    print('已收录基本盘 %s。' % nid)


def cmd_check(role, base, head, branch):
    p = path(role)
    changed = git('diff', '--name-only', '%s...%s' % (base, head)).splitlines()
    if p not in changed:
        print('FAIL: PR 未更新 %s（施工前须 review，完工须记录尝试）' % p)
        return 1
    text = git('show', '%s:%s' % (head, p), ok=True)
    err = []
    if not any(l.startswith('REVIEW|') and ('|%s|' % branch) in l for l in section(text, 'REVIEWS')):
        err.append('没有本分支的"施工前已读"登记：先运行 review')
    if not any(t['br'] == branch for t in tries(text)):
        err.append('本分支没有任何尝试记录（TRY）：通过与失败的都要记')
    for e in err:
        print('FAIL:', e)
    if not err:
        print('OK: learning-log passed')
    return 1 if err else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest='c', required=True)
    r = sp.add_parser('review'); r.add_argument('role', choices=DIRS); r.add_argument('branch'); r.add_argument('tags', nargs='?', default='')
    a = sp.add_parser('add'); a.add_argument('role', choices=DIRS); a.add_argument('branch'); a.add_argument('result', choices=['PASS', 'FAIL', 'PARTIAL'])
    a.add_argument('tags'); a.add_argument('goal'); a.add_argument('note'); a.add_argument('--differs', default=''); a.add_argument('--next', default='')
    b = sp.add_parser('base'); b.add_argument('role', choices=DIRS); b.add_argument('tag'); b.add_argument('how'); b.add_argument('evidence')
    c = sp.add_parser('check'); c.add_argument('role', choices=DIRS); c.add_argument('base'); c.add_argument('head'); c.add_argument('branch')
    x = ap.parse_args()
    if x.c == 'review': cmd_review(x.role, x.branch, x.tags)
    elif x.c == 'add': cmd_add(x.role, x.branch, x.result, x.tags, x.goal, x.note, x.differs, x.__dict__['next'])
    elif x.c == 'base': cmd_base(x.role, x.tag, x.how, x.evidence)
    else: sys.exit(cmd_check(x.role, x.base, x.head, x.branch))
