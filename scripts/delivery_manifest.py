#!/usr/bin/env python3
"""交付清单：每次交付列出该交付的 新增/删除/修改 文件，未改变的不列。
  make  <base> <分支> [--redelivery 退回原因]   生成 delivery/<分支>/MANIFEST.md
  check <base> <head> <分支>                   CI：清单必须存在且与实际 diff 一致；被退回重交付的必须有通过的 CHAIN_CHECK.md
不列入的基础设施路径：delivery/、learning/、code-checklist/"""
import subprocess, sys, re, os, argparse

EXCL = ('delivery/', 'learning/', 'code-checklist/')


def git(*a, ok=False):
    r = subprocess.run(['git', '-c', 'core.quotepath=false', *a], capture_output=True, text=True)
    if r.returncode and not ok:
        sys.exit('git %s 失败：%s' % (' '.join(a), r.stderr.strip()))
    return r.stdout if r.returncode == 0 else ''


def safe(b):
    return b.replace('/', '-')


def mpath(b):
    return 'delivery/%s/MANIFEST.md' % safe(b)


def parse(lines):
    out = set()
    for l in lines:
        if not l.strip():
            continue
        p = l.split('\t')
        st, f = p[0][0], p[-1]
        if f.startswith(EXCL) or (len(p) > 2 and p[1].startswith(EXCL)):
            continue
        if st == 'R':
            out.add(('M', '%s -> %s' % (p[1], p[2])))
        elif st in 'AMDC':
            out.add(({'A': 'A', 'D': 'D', 'M': 'M', 'C': 'A'}[st], f))
        else:
            out.add(('M', f))
    return out


def current(base):
    mb = git('merge-base', base, 'HEAD').strip() or base
    s = parse(git('diff', '--name-status', '-M', mb).splitlines())
    for f in git('ls-files', '-o', '--exclude-standard').splitlines():
        if not f.startswith(EXCL):
            s.add(('A', f))
    return mb, s


def render(branch, mb, items, redeliv):
    L = ['BRANCH: %s' % branch, 'BASE_SHA: %s' % mb[:10], 'REDELIVERY: %s' % ('yes' if redeliv else 'no')]
    if redeliv:
        L.append('RETURNED_REASON: %s' % redeliv)
    for k, t in (('A', '新增'), ('D', '删除'), ('M', '修改')):
        L += ['', '## %s' % t] + ['%s|%s' % (k, f) for kk, f in sorted(items) if kk == k]
    return '\n'.join(L) + '\n'


def cmd_make(base, branch, redeliv):
    mb, items = current(base)
    p = mpath(branch)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(render(branch, mb, items, redeliv))
    n = {k: sum(1 for kk, _ in items if kk == k) for k in 'ADM'}
    print('已生成 %s：新增 %d / 删除 %d / 修改 %d（未改变的不列）' % (p, n['A'], n['D'], n['M']))
    if redeliv:
        print('这是退回后的重交付：请先跑 python3 scripts/chain_check.py run %s %s，通过后再提交。' % (base, branch))


def cmd_check(base, head, branch):
    p = mpath(branch)
    text = git('show', '%s:%s' % (head, p), ok=True)
    if not text:
        print('FAIL: 缺少交付清单 %s（运行 delivery_manifest.py make）' % p)
        return 1
    listed = set()
    for l in text.splitlines():
        m = re.match(r'^([ADM])\|(.+)$', l)
        if m:
            listed.add((m.group(1), m.group(2)))
    actual = parse(git('diff', '--name-status', '-M', '%s...%s' % (base, head)).splitlines())
    err = []
    miss = sorted(actual - listed)
    extra = sorted(listed - actual)
    if miss:
        err.append('清单漏列：' + '; '.join('%s %s' % x for x in miss[:8]))
    if extra:
        err.append('清单多列（实际未改动）：' + '; '.join('%s %s' % x for x in extra[:8]))
    if re.search(r'^REDELIVERY:\s*yes', text, re.M):
        cc = git('show', '%s:delivery/%s/CHAIN_CHECK.md' % (head, safe(branch)), ok=True)
        if not re.search(r'^RESULT:\s*PASS', cc or '', re.M):
            err.append('被退回后的重交付：缺少通过的链路验证 delivery/%s/CHAIN_CHECK.md（RESULT: PASS）' % safe(branch))
    for e in err:
        print('FAIL:', e)
    if not err:
        print('OK: delivery-manifest passed')
    return 1 if err else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest='c', required=True)
    m = sp.add_parser('make'); m.add_argument('base'); m.add_argument('branch'); m.add_argument('--redelivery', default='')
    c = sp.add_parser('check'); c.add_argument('base'); c.add_argument('head'); c.add_argument('branch')
    x = ap.parse_args()
    if x.c == 'make': cmd_make(x.base, x.branch, x.redelivery)
    else: sys.exit(cmd_check(x.base, x.head, x.branch))
