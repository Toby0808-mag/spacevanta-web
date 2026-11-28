#!/usr/bin/env bash
# SpaceVanta 闸门：路径所有权 + L5 不可变 + 受保护前缀。用法：scripts/check_gates.sh <base-ref> [head-ref] [branch-name]
set -u
git(){ command git -c core.quotepath=false "$@"; }   # 中文文件名不被转义成 \346… 形式
BASE="${1:?base ref}"; HEAD="${2:-HEAD}"; BRANCH="${3:-$(git rev-parse --abbrev-ref HEAD)}"
fail=0
UMODE=0
err(){ echo "FAIL: $*"; fail=1; }
case "$BRANCH" in
  ag-u/*)   ROLE=ag; UMODE=1;;   # U 系列自动跑沙箱：只能写 u-runs/ 与自己的学习记录
  cu-u/*)   ROLE=cu; UMODE=1;;
  ag/*)     ROLE=ag;;
  cu/*)     ROLE=cu;;
  design/*) ROLE=design;;
  gov/*)    ROLE=gov;;
  *) echo "FAIL: 分支名必须以 ag/ cu/ ag-u/ cu-u/ design/ gov/ 开头（当前：$BRANCH）"; exit 1;;
esac
handover(){ # $1=资产路径 assets/3d/ecosystem/cu/<id>/...；基准分支里存在 STATUS: HANDOVER 的 TRACK 才放行
  local id; id=$(echo "$1" | sed -E 's#^assets/3d/ecosystem/cu/([^/]+)/.*#\1#')
  git show "$BASE:track/TRACK_${id}.md" 2>/dev/null | grep -Eq '^STATUS:[[:space:]]*HANDOVER' 
}
allowed(){ # $1=path
  local p="$1"
  case "$p" in
    change/CR-*.md) return 0;;                        # 变更单：任何角色
    track/TRACK_*.md) [ "$ROLE" = ag ] || [ "$ROLE" = cu ] && return 0;;
  esac
  if [ "$UMODE" = 1 ]; then
    case "$ROLE" in
      ag) case "$p" in u-runs/ag/*|learning/antigravity/*) return 0;; esac;;
      cu) case "$p" in u-runs/cu/*|learning/cursor/*) return 0;; esac;;
    esac
    return 1
  fi
  [ "$ROLE" = ag ] && case "$p" in assets/3d/ecosystem/cu/*) handover "$p" && return 0;; esac
  case "$ROLE" in
    ag) case "$p" in web/*|assets/3d/products/*|assets/3d/ecosystem/ag/*|verify/ag/*|code-checklist/*|learning/antigravity/*|delivery/*) return 0;; esac;;
    cu) case "$p" in workers/*|agent/*|contracts/*|assets/3d/ecosystem/cu/*|verify/cu/*|learning/cursor/*|delivery/*) return 0;; esac;;
    design) case "$p" in design/*|docs/brand/*) return 0;; esac;;
    gov) case "$p" in .github/*|.cursor/*|scripts/*|docs/protocols/*|AGENTS.md) return 0;; esac;;
  esac
  return 1
}
while IFS=$'\t' read -r st f g; do
  [ -z "$st" ] && continue
  [ -n "${g:-}" ] && f="$g"                         # 重命名取新路径
  allowed "$f" || err "$ROLE 无权修改：$f"
  case "$f" in
    design/*/L5/*) case "$st" in A*) ;; *) err "L5 不可变（只能新增）：$st $f";; esac;;
  esac
  if [ "$ROLE" = ag ] || [ "$ROLE" = cu ]; then
    case "$(basename "$f")" in
      L3_*|L4_*|L5_*|ASSET_MAP_*|AGENT_ASSET_REGISTRY*|PRESENT_LOG_*|PALETTE*) err "施工方不得触碰设计侧受保护文件：$f";; esac
  fi
done < <(git diff --name-status -M "$BASE...$HEAD")
# hex 提示（默认警告；STRICT_HEX=1 则失败）
if [ "$ROLE" = ag ]; then
  hits=$(git diff -U0 "$BASE...$HEAD" -- 'web/sections/**' 'web/components/**' 'web/blocks/**' 'web/public/**/*.css' ':!web/public/sv-dna/dna.css' \
    | grep -E '^\+[^+]' | grep -Ei '#[0-9a-f]{6}\b|#[0-9a-f]{3}\b' | head -5 || true)
  if [ -n "$hits" ]; then
    echo "WARN: 新增行出现 hex（应改用 var(--svd-*)）："; echo "$hits"
    [ "${STRICT_HEX:-0}" = 1 ] && fail=1
  fi
fi
# U 系列 token 限额闸：方向单（design/*）与运行记录（ag-u/ cu-u/）
D="$(dirname "$0")"
while IFS= read -r sheet; do
  [ -z "$sheet" ] && continue
  python3 "$D/u_quota.py" check-sheet "$sheet" || fail=1
done < <(git diff --name-only "$BASE...$HEAD" | grep -E '(^|/)U1_.*方向单\.md$' || true)
if [ "$UMODE" = 1 ]; then
  runs=$(git diff --name-only "$BASE...$HEAD" | grep -E '^u-runs/(ag|cu)/U1/.*/U1_run_[^/]*\.md$' || true)
  if [ -n "$runs" ]; then
    sheet=$(grep -h -m1 '^SHEET:' $runs | head -1 | sed 's/^SHEET:[[:space:]]*//')
    if [ -z "$sheet" ] || [ ! -f "$sheet" ]; then echo "FAIL: 运行记录缺少有效的 SHEET: 方向单路径"; fail=1
    else python3 "$D/u_quota.py" check-runs "$sheet" $runs || fail=1; fi
  fi
fi
# 施工方（非 U 沙箱）：学习记录闸 + 交付清单闸（+ 被退回重交付时复跑链路验证）
if { [ "$ROLE" = ag ] || [ "$ROLE" = cu ]; } && [ "$UMODE" = 0 ]; then
  D="$(dirname "$0")"; SAFE="${BRANCH//\//-}"
  python3 "$D/learning_log.py" check "$ROLE" "$BASE" "$HEAD" "$BRANCH" || fail=1
  python3 "$D/delivery_manifest.py" check "$BASE" "$HEAD" "$BRANCH" || fail=1
  if git show "$HEAD:delivery/$SAFE/MANIFEST.md" 2>/dev/null | grep -Eq '^REDELIVERY:[[:space:]]*yes'; then
    python3 "$D/chain_check.py" check "$BASE" "$HEAD" "$BRANCH" --role "$ROLE" || fail=1
  fi
fi
# Antigravity：代码清单闸（开工前拉取、完工提交、基线不过期、锁不冲突）
if [ "$ROLE" = ag ] && [ "$UMODE" = 0 ]; then
  python3 "$(dirname "$0")/code_checklist.py" check "$BASE" "$HEAD" "$BRANCH" || fail=1
fi
[ $fail = 0 ] && echo "OK: gates passed ($ROLE)" || exit 1
