#!/usr/bin/env python3
"""链路验证：被退回后重交付前，确认本次改动的文件"被准确调用"（引用链没断）。只检查本次改动的文件，不翻旧账。
  run   <base> <分支> [--role ag|cu] [--all]   本地跑并写 delivery/<分支>/CHAIN_CHECK.md（RESULT: PASS|FAIL）
  check <base> <head> <分支> [--role ag|cu]    CI 复跑（不写文件），失败返回非零
ag（网页）：组件引用存在 / 区块引用存在 / asset_url 指向的静态资源存在 / | t() 的键在 i18n/en.json 存在 / 模板 JSON 的区块类型存在 / 区块带 presets
cu（Worker）：wrangler.toml 的 main 文件存在 / contracts/<worker>.md 存在（契约测试仍须施工方自行提交结果）"""
import subprocess, sys, re, os, json, datetime, argparse

W = 'web'


def git(*a, ok=False):
    r = subprocess.run(['git', *a], capture_output=True, text=True)
    if r.returncode and not ok:
        sys.exit('git %s 失败：%s' % (' '.join(a), r.stderr.strip()))
    return r.stdout if r.returncode == 0 else ''


def safe(b):
    return b.replace('/', '-')


def changed(base, head=None):
    if head:
        fs = [l.split('\t')[-1] for l in git('diff', '--name-status', '-M', '%s...%s' % (base, head)).splitlines() if l and l[0] != 'D']
    else:
        mb = git('merge-base', base, 'HEAD').strip() or base
        fs = [l.split('\t')[-1] for l in git('diff', '--name-status', '-M', mb).splitlines() if l and l[0] != 'D']
        fs += git('ls-files', '-o', '--exclude-standard').splitlines()
    return sorted(set(f for f in fs if os.path.isfile(f)))


def en_keys():
    p = '%s/i18n/en.json' % W
    if not os.path.exists(p):
        return None
    d = json.load(open(p, encoding='utf-8'))
    return d


def has_key(d, k):
    for part in k.split('.'):
        if not isinstance(d, dict) or part not in d:
            return False
        d = d[part]
    return True


def comp_exists(name, here):
    c = [os.path.normpath(os.path.join(W, 'components', name + '.html')),
         os.path.normpath(os.path.join(os.path.dirname(here), name + '.html'))]
    return any(os.path.exists(x) for x in c)


def asset_exists(name, here):
    c = [os.path.normpath(os.path.join(W, 'public', name)), os.path.normpath(os.path.join(os.path.dirname(here), name))]
    return any(os.path.exists(x) for x in c)


def check_ag(files):
    res = []
    en = en_keys()
    for f in files:
        if not f.startswith(W + '/'):
            continue
        if f.endswith('.html'):
            s = open(f, encoding='utf-8', errors='replace').read()
            for m in re.finditer(r'\{\{#component\s+"([^"]+)"', s):
                res.append((comp_exists(m.group(1), f), '%s 引用组件 %s' % (f, m.group(1))))
            for m in re.finditer(r'\{\{#section\s+"([^"]+)"', s):
                res.append((os.path.exists('%s/sections/%s/%s.html' % (W, m.group(1), m.group(1))), '%s 引用区块 %s' % (f, m.group(1))))
            for m in re.finditer(r'\{\{#sections\s+"([^"]+)"', s):
                res.append((os.path.exists('%s/sections/%s.json' % (W, m.group(1))), '%s 引用分组 %s' % (f, m.group(1))))
            for m in re.finditer(r'"([^"{}]+)"\s*\|\s*asset_url\(\)', s):
                res.append((asset_exists(m.group(1), f), '%s 引用资源 %s' % (f, m.group(1))))
            if en is not None:
                for m in re.finditer(r'"([A-Za-z0-9_.]+)"\s*\|\s*t\(', s):
                    res.append((has_key(en, m.group(1)), '%s 文案键 %s 存在于 en.json' % (f, m.group(1))))
            if '/sections/' in f and '{{#schema}}' in s and '"presets"' not in s and 'blocks/' not in f:
                res.append((False, '%s 区块缺少 presets（编辑器不会出现）' % f))
        elif f.endswith('.json') and '/templates/' in f:
            try:
                d = json.load(open(f, encoding='utf-8'))
            except Exception as e:
                res.append((False, '%s 不是合法 JSON：%s' % (f, e)))
                continue
            for k, v in (d.get('sections') or {}).items():
                t = v.get('type', '') if isinstance(v, dict) else ''
                if t and not t.startswith(('$', '@', 'shopline://')):
                    res.append((os.path.exists('%s/sections/%s/%s.html' % (W, t, t)), '%s 区块类型 %s' % (f, t)))
    return res


def check_cu(files):
    res = []
    for f in files:
        m = re.match(r'^workers/([^/]+)/', f)
        if m:
            w = m.group(1)
            wt = 'workers/%s/wrangler.toml' % w
            if os.path.exists(wt):
                mm = re.search(r'^\s*main\s*=\s*"([^"]+)"', open(wt, encoding='utf-8').read(), re.M)
                if mm:
                    res.append((os.path.exists('workers/%s/%s' % (w, mm.group(1))), 'workers/%s wrangler main %s 存在' % (w, mm.group(1))))
            else:
                res.append((False, 'workers/%s 缺少 wrangler.toml' % w))
            res.append((os.path.exists('contracts/%s.md' % w) or os.path.exists('contracts/%s.json' % w), 'contracts/%s 契约文件存在' % w))
    return sorted(set(res), key=str)


def evaluate(files, role):
    r = []
    if role in ('ag', 'both'):
        r += check_ag(files)
    if role in ('cu', 'both'):
        r += check_cu(files)
    return r


def role_from_branch(b):
    return 'cu' if b.startswith(('cu/', 'cu-u/')) else 'ag'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest='c', required=True)
    r = sp.add_parser('run'); r.add_argument('base'); r.add_argument('branch'); r.add_argument('--role', choices=['ag', 'cu']); r.add_argument('--all', action='store_true')
    c = sp.add_parser('check'); c.add_argument('base'); c.add_argument('head'); c.add_argument('branch'); c.add_argument('--role', choices=['ag', 'cu'])
    x = ap.parse_args()
    role = x.role or role_from_branch(x.branch)
    if x.c == 'run':
        files = [os.path.join(dp, f).replace('\\', '/') for dp, _, fs in os.walk(W) for f in fs] if x.all else changed(x.base)
    else:
        files = changed(x.base, x.head)
    res = evaluate(files, role)
    bad = [m for ok, m in res if not ok]
    for ok, m in res:
        print(('PASS ' if ok else 'FAIL ') + m)
    print('\n检查 %d 项，失败 %d 项（范围：%s）' % (len(res), len(bad), '全部' if getattr(x, 'all', False) else '本次改动的文件'))
    if x.c == 'run':
        p = 'delivery/%s/CHAIN_CHECK.md' % safe(x.branch)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        L = ['RESULT: %s' % ('FAIL' if bad else 'PASS'), 'AT: %s' % datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
             'ROLE: %s' % role, 'CHECKED: %d' % len(res), '']
        L += [('PASS|' if ok else 'FAIL|') + m for ok, m in res]
        open(p, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
        print('已写入 ' + p)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
