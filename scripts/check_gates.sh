#!/usr/bin/env bash
# SpaceVanta 闸门：路径所有权 + L5 不可变 + 受保护前缀。用法：scripts/check_gates.sh <base-ref> [head-ref] [branch-name]
set -u
BASE="${1:?base ref}"; HEAD="${2:-HEAD}"; BRANCH="${3:-$(git rev-parse --abbrev-ref HEAD)}"
fail=0
err(){ echo "FAIL: $*"; fail=1; }
case "$BRANCH" in
  ag/*)     ROLE=ag;;
  cu/*)     ROLE=cu;;
  design/*) ROLE=design;;
  gov/*)    ROLE=gov;;
  *) echo "FAIL: 分支名必须以 ag/ cu/ design/ gov/ 开头（当前：$BRANCH）"; exit 1;;
esac
allowed(){ # $1=path
  local p="$1"
  case "$p" in
    change/CR-*.md) return 0;;                        # 变更单：任何角色
  esac
  case "$ROLE" in
    ag) case "$p" in web/*|assets/3d/products/*|assets/3d/ecosystem/ag/*|verify/ag/*) return 0;; esac;;
    cu) case "$p" in workers/*|agent/*|contracts/*|assets/3d/ecosystem/cu/*|verify/cu/*) return 0;; esac;;
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
    design/L5/*) case "$st" in A*) ;; *) err "L5 不可变（只能新增）：$st $f";; esac;;
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
[ $fail = 0 ] && echo "OK: gates passed ($ROLE)" || exit 1
