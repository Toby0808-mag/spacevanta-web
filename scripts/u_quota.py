#!/usr/bin/env python3
"""U 系列 token 限额校验（每个模型的一次迭代最多 1,000,000 token，builder 自动跑额度）。
  check-sheet <方向单.md>                 校验方向单：总额、四个池、每个方向的档位与上限
  check-runs  <方向单.md> <运行记录.md…>   校验运行记录：单方向不超上限、各池不超额、合计不超总额
方向单格式（每行一项）：
  TOKEN_QUOTA: 1000000
  POOL_OVERHEAD: 50000          # 施工前过记录、写运行记录与学习记录
  POOL_DIRECTIONS: 750000       # 各方向探索（所有方向上限之和不得超过）
  POOL_FOLLOWUP: 150000         # 复核/追加：只给已出正向结论的方向，做复现或加深
  POOL_SUBMIT_RESERVE: 50000    # 收尾提交保留，不可挪用，保证"无论有无结论都提交"
  DIR|<id>|<类型 缺陷/功能/展示>|<owner ag/cu>|<档位 S/M/L>|<上限 token>|<描述>
运行记录需含：SHEET: <方向单路径>、DIR_ID: <id>、POOL: DIRECTIONS 或 FOLLOWUP、TOKENS_USED: <整数>、RESULT: <结论>"""
import re, sys, os

MAX_TOTAL = 1_000_000
TIER_CAP = {'S': 40_000, 'M': 75_000, 'L': 150_000}
POOLS = ['POOL_OVERHEAD', 'POOL_DIRECTIONS', 'POOL_FOLLOWUP', 'POOL_SUBMIT_RESERVE']


def num(x):
    return int(str(x).replace(',', '').replace('_', '').strip())


def parse_sheet(path):
    t = open(path, encoding='utf-8').read()
    f = {}
    for k in ['TOKEN_QUOTA'] + POOLS:
        m = re.search(r'^%s:\s*([\d,_]+)' % k, t, re.M)
        f[k] = num(m.group(1)) if m else None
    dirs = {}
    for l in t.splitlines():
        if l.startswith('DIR|'):
            p = [x.strip() for x in l.split('|')]
            if len(p) >= 6:
                dirs[p[1]] = dict(type=p[2], owner=p[3], tier=p[4], cap=num(p[5]) if p[5].replace(',', '').isdigit() else None)
    return f, dirs


def check_sheet(path):
    f, dirs = parse_sheet(path)
    err = []
    for k in ['TOKEN_QUOTA'] + POOLS:
        if f[k] is None:
            err.append('缺少 %s' % k)
    if err:
        return err
    if f['TOKEN_QUOTA'] > MAX_TOTAL:
        err.append('总限额 %d 超过单次模型迭代上限 %d' % (f['TOKEN_QUOTA'], MAX_TOTAL))
    if sum(f[k] for k in POOLS) > f['TOKEN_QUOTA']:
        err.append('四个池之和 %d 超过总限额 %d' % (sum(f[k] for k in POOLS), f['TOKEN_QUOTA']))
    if not dirs:
        err.append('没有任何方向（DIR|…）')
    tot = 0
    for i, d in dirs.items():
        if d['tier'] not in TIER_CAP:
            err.append('方向 %s 档位必须是 S/M/L' % i)
            continue
        if d['cap'] is None or d['cap'] > TIER_CAP[d['tier']]:
            err.append('方向 %s 上限 %s 超过 %s 档的上限 %d' % (i, d['cap'], d['tier'], TIER_CAP[d['tier']]))
        if d['owner'] not in ('ag', 'cu'):
            err.append('方向 %s 的 owner 必须是 ag 或 cu' % i)
        tot += d['cap'] or 0
    if tot > f['POOL_DIRECTIONS']:
        err.append('所有方向上限之和 %d 超过方向池 %d' % (tot, f['POOL_DIRECTIONS']))
    return err


def check_runs(sheet, runs):
    f, dirs = parse_sheet(sheet)
    err = check_sheet(sheet)
    used = {'DIRECTIONS': 0, 'FOLLOWUP': 0}
    per = {}
    for r in runs:
        t = open(r, encoding='utf-8').read()
        g = lambda k: (re.search(r'^%s:\s*(.+)$' % k, t, re.M) or [None, ''])[1].strip()
        did, pool, tok = g('DIR_ID'), g('POOL').upper(), g('TOKENS_USED')
        if not (did and pool and tok.replace(',', '').isdigit() and g('RESULT')):
            err.append('%s 缺少 DIR_ID/POOL/TOKENS_USED/RESULT（无论有无结论都必须填写）' % r)
            continue
        if did not in dirs:
            err.append('%s 的方向 %s 不在方向单里' % (r, did))
            continue
        if pool not in used:
            err.append('%s 的 POOL 必须是 DIRECTIONS 或 FOLLOWUP' % r)
            continue
        n = num(tok)
        used[pool] += n
        if pool == 'DIRECTIONS':
            per[did] = per.get(did, 0) + n
    for did, n in per.items():
        if dirs[did]['cap'] is not None and n > dirs[did]['cap']:
            err.append('方向 %s 用了 %d，超过其上限 %d' % (did, n, dirs[did]['cap']))
    if f['POOL_DIRECTIONS'] is not None and used['DIRECTIONS'] > f['POOL_DIRECTIONS']:
        err.append('方向池用了 %d，超过 %d' % (used['DIRECTIONS'], f['POOL_DIRECTIONS']))
    if f['POOL_FOLLOWUP'] is not None and used['FOLLOWUP'] > f['POOL_FOLLOWUP']:
        err.append('复核/追加池用了 %d，超过 %d' % (used['FOLLOWUP'], f['POOL_FOLLOWUP']))
    return err, used


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) == 2 and a[0] == 'check-sheet':
        e = check_sheet(a[1])
    elif len(a) >= 3 and a[0] == 'check-runs':
        e, u = check_runs(a[1], a[2:])
        print('方向池已用 %d，复核/追加池已用 %d' % (u['DIRECTIONS'], u['FOLLOWUP']))
    else:
        sys.exit(__doc__)
    for x in e:
        print('FAIL:', x)
    print('OK: u-quota passed' if not e else '')
    sys.exit(1 if e else 0)
