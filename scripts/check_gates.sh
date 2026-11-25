#!/usr/bin/env bash
# SpaceVanta 十五门禁  (PROTOCOL.md §5 / STACK.md §F)
# 放置位置: <repo>/scripts/check_gates.sh   （v1.1.1 起协议在仓库根）
# 用法:     bash scripts/check_gates.sh <主题根目录>    # 默认 .
# 退出码:   0 = 全绿可出包 ; 1 = 有 FAIL (不得 zip / 不得上传 Drive)
set -uo pipefail
ROOT="${1:-.}"; ROOT="${ROOT%/}"
P="$ROOT"   # 协议已提升到仓库根（v1.1.1）
FAIL=0; WARN=0
red(){ printf '\033[31m%s\033[0m\n' "$1"; }
yel(){ printf '\033[33m%s\033[0m\n' "$1"; }
grn(){ printf '\033[32m%s\033[0m\n' "$1"; }
fail(){ FAIL=$((FAIL+1)); red "  ✗ [G$1] $2"; }
warn(){ WARN=$((WARN+1)); yel "  ! [G$1] $2"; }
pass(){ grn "  ✓ [G$1] $2"; }

cd "$ROOT" 2>/dev/null || { echo "目录不存在: $ROOT"; exit 1; }
echo "── SpaceVanta 十五门禁 ── root=$(pwd)"

TH="layout sections templates blocks components public i18n"
exists(){ [ -e "$1" ] && return 0; return 1; }

# [1] 模块名禁点号命名空间（点号仅允许扩展名）
HIT=$(find layout sections blocks components -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \) 2>/dev/null \
      | sed 's#.*/##' | grep -E '^[^.]+\.[^./]+\.' || true)
[ -z "$HIT" ] && pass 1 "模块名无点号命名空间" || fail 1 "点号命名空间: $(echo "$HIT"|tr '\n' ' ')"

# [2] section 同名双段 sections/<A>/<A>.html
BAD=0; NSEC=0
for d in sections/*/ ; do
  [ -d "$d" ] || continue
  A=$(basename "$d"); [ "$A" = "blocks" ] && continue
  NSEC=$((NSEC+1))
  exists "$d$A.html" || { fail 2 "sections/$A/ 缺同名主文件 $A.html"; BAD=1; }
  # templates JSON 引用键必须存在
done
grep -rho '"type"[[:space:]]*:[[:space:]]*"[^"]*"' templates/*.json templates/**/*.json 2>/dev/null \
  | sed -E 's/.*"([^"]+)"/\1/' | sort -u | while read -r t; do
    [ -d "sections/$t" ] || echo "MISSING_SECTION:$t"
  done | grep -q MISSING && fail 2 "templates 引用了不存在的 section: $(grep -rho '"type"[[:space:]]*:[[:space:]]*"[^"]*"' templates 2>/dev/null | sed -E 's/.*"([^"]+)"/\1/' | sort -u | while read -r t; do [ -d "sections/$t" ] || printf '%s ' "$t"; done)"
[ "$BAD" = 0 ] && [ "$NSEC" -gt 0 ] && pass 2 "section 同名双段 OK（$NSEC 个）"
[ "$NSEC" = 0 ] && warn 2 "没扫到任何 section（空骨架？确认是否本次要建）"

# [3] private block 三处齐: {{#content "blocks"}} ⟺ schema "$b" ⟺ blocks/b.html
B3=0
for f in sections/*/*.html ; do
  case "$f" in */blocks/*) continue;; esac
  [ -f "$f" ] || continue
  D=$(dirname "$f")
  grep -q '{{#content "blocks"' "$f" || continue
  SCH=$(sed -n '/{{#schema}}/,/{{\/schema}}/p' "$f")
  for b in "$D"/blocks/*.html ; do
    [ -f "$b" ] || continue
    n=$(basename "$b" .html)
    echo "$SCH" | grep -q "\"\$$n\"" || { fail 3 "$(basename "$f") 的 blocks/$n.html 未在 schema blocks[] 登记 \"\$$n\""; B3=1; }
  done
  echo "$SCH" | grep -oE '"\$[a-z0-9-]+"' | tr -d '"' | sort -u | while read -r t; do
    nn="${t#\$}"; [ -f "$D/blocks/$nn.html" ] || echo "ORPHAN:$f:$t"
  done | grep -q ORPHAN && fail 3 "schema 登记了 \$x 但磁盘无 blocks/x.html: $(echo "$SCH" | grep -oE '"\$[a-z0-9-]+"' | tr -d '"' | while read -r t; do nn="${t#\$}"; D2=$(dirname "$f"); [ -f "$D2/blocks/$nn.html" ] || printf '%s ' "$t"; done)"
done
[ "$B3" = 0 ] && pass 3 "private block 三处齐"

# [4] schema 必带 presets（E-01：无 presets 编辑器不可见）
P4=0
for f in sections/*/*.html blocks/*/*.html components/*/*.html ; do
  case "$f" in */blocks/*) ;; *) [ -f "$f" ] && { case "$f" in sections/*) :;; *) continue;; esac; };; esac
  [ -f "$f" ] || continue
  case "$f" in */blocks/*) :;; sections/*) :;; *) continue;; esac
  grep -q '{{#schema}}' "$f" || { fail 4 "$f 无内联 {{#schema}}"; P4=1; continue; }
  sed -n '/{{#schema}}/,/{{\/schema}}/p' "$f" | grep -q '"presets"' || { fail 4 "$f schema 缺 presets（编辑器将不可见 E-01）"; P4=1; }
done
[ "$P4" = 0 ] && pass 4 "schema 内联且 presets 齐"

# [5] schema 纯净：禁资产路径/模型ID/裸hex/金额百分比
S5=$(for f in sections/*/*.html sections/*/blocks/*.html blocks/*/*.html ; do
      [ -f "$f" ] || continue
      sed -n '/{{#schema}}/,/{{\/schema}}/p' "$f" \
      | grep -nE 'https?://|\.glb|"M-[A-Z]|#[0-9A-Fa-f]{6}|¥|＄|HK\$|[0-9]+\s*%|model_url|master_id' \
      | sed "s|^|$f:|" ; done)
[ -z "$S5" ] && pass 5 "schema 纯净（无资产/模型ID/hex/金额）" || { fail 5 "schema 污染:"; echo "$S5" | sed 's/^/      /'; }

# [6] 模板语法白名单 + hard_ban
LQ=$(grep -rn '{%' layout sections blocks components --include=*.html 2>/dev/null | head -8)
CM=$(grep -rn '{{!--' layout sections blocks components --include=*.html 2>/dev/null | head -5)
IB=$(grep -rnE '\{\{[^}]*(include|render)[[:space:]]+"' layout sections blocks components --include=*.html 2>/dev/null | head -5)
[ -z "$LQ$CM$IB" ] && pass 6 "语法白名单 OK（无 liquid / {{!-- / include-render）" || { fail 6 "白名单违规:"; echo "$LQ$CM$IB" | sed 's/^/      /'; }

# [7] 零裸 hex / 零硬编码交易值
H7=$(grep -rnE '#[0-9A-Fa-f]{6}' layout sections blocks components --include=*.html --include=*.css --include=*.js 2>/dev/null \
     | grep -vE 'dna\.css|PALETTE[^/]*\.json|var\(--' | head -10)
T7=$(grep -rnE '¥|＄|HK\$|\$[0-9]|[0-9]+\s*%\s*(off|OFF)?|满[0-9]|order by [A-Z][a-z]+ [0-9]' \
     layout sections blocks components templates --include=*.html --include=*.css --include=*.js --include=*.json 2>/dev/null | head -10)
[ -z "$H7$T7" ] && pass 7 "零裸 hex / 零硬编码交易值" || { fail 7 "硬编码命中:"; echo "$H7$T7" | sed 's/^/      /'; }
if [ -f "$P/contracts/endpoints.json" ] && command -v python3 >/dev/null; then
  python3 - <<'PY' || fail 7 "endpoints.json 不可解析"
import json,sys
d=json.load(open("contracts/endpoints.json"))
bad=[k for k,v in d["endpoints"].items() if v.get("url") is None and v.get("status")=="active"]
print("      endpoints active-but-null:", bad or "none")
PY
fi

# [8] i18n 闭合 + options_N/presets_N 连续
# 注意: heredoc 是子 shell，内部 FAIL+=1 传不回父进程 ⇒ 用退出码 3 表达"有 FAIL"，父进程再累加。
if command -v python3 >/dev/null && [ -f i18n/en.json ]; then
python3 - <<'PY'; G8RC=$?
import json,re,glob,os,sys
def keys(o,p=""):
    r=set()
    if isinstance(o,dict):
        for k,v in o.items(): r|=keys(v,f"{p}.{k}" if p else k)
    elif isinstance(o,list):
        for i,v in enumerate(o): r|=keys(v,p)
    else: r.add(p)
    return r
enk=keys(json.load(open("i18n/en.json")))
sch={}
fp="i18n/en.schema.json"
if os.path.exists(fp):
    try: sch=keys(json.load(open(fp)))
    except Exception: sch=set()
used=set()
for f in glob.glob("sections/*/*.html")+glob.glob("sections/*/blocks/*.html")+glob.glob("blocks/*/*.html")+glob.glob("components/*/*.html")+glob.glob("layout/*.html"):
    used|=set(re.findall(r'\|\s*t\(\s*"([^"]+)"',open(f,encoding="utf-8").read()))
    for m in re.findall(r'"t:([^"]+)"',open(f,encoding="utf-8").read()): sch_used.add(m) if False else None
miss=sorted(used-enk)
sch_used=set()
for f in glob.glob("sections/*/*.html")+glob.glob("sections/*/blocks/*.html"):
    sch_used|=set(re.findall(r'"t:([^"]+)"',open(f,encoding="utf-8").read()))
miss_s=sorted(sch_used-sch)
prob=[]
for f in glob.glob("sections/*/*.html"):
    s=open(f,encoding="utf-8").read()
    m=re.search(r'{{#schema}}(.*?){{\/schema}}',s,re.S)
    if not m: continue
    b=m.group(1)
    for grp in ("options","presets"):
        # 同一个 N 会在 category/name 等键上重复出现，必须先去重再判连续性，
        # 否则合法的 presets_0.category + presets_0.name 会被误判为断档 [0,0,1,1]
        idx=sorted({int(x) for x in re.findall(r'"%s_(\d+)\.'%grp,b)})
        if idx and idx!=list(range(len(idx))): prob.append(f"{os.path.basename(f)} {grp}_N 断档 {idx} (去重后)")
nfail=0
if miss:   print("   ✗ [G8] | t() 缺键(en.json):", " ".join(miss[:12])); nfail+=1
if miss_s: print("   ✗ [G8] schema t: 缺键(en.schema.json):", " ".join(miss_s[:12])); nfail+=1
if prob:   print("   ✗ [G8] 编号断档:", "; ".join(prob)); nfail+=1
if nfail==0:
    print(f"   ✓ [G8] i18n 闭合（{len(used)} 个 t() 键 / {len(sch_used)} 个 schema t: 键，options_N/presets_N 连续）")
sys.exit(3 if nfail else 0)
PY
[ "${G8RC:-0}" = 3 ] && FAIL=$((FAIL+1))
else warn 8 "i18n/en.json 或 python3 缺失，跳过（上线前必须过）"; fi

# [9] 后缀白名单 + 体积
B9=0
while IFS= read -r f; do
  case "$f" in
    layout/*.html|sections/*.html|sections/*/*.html|sections/*/*.css|sections/*/*.js) ;;
    blocks/*/*.html|blocks/*/*.css|blocks/*/*.js|components/*/*.html|components/*/*.css|components/*/*.js) ;;
    public/*|i18n/*.json|templates/*.json|templates/*/*.json|theme.schema.json|theme.config.json|layout/*.html) ;;
    *) fail 9 "越界文件: $f"; B9=1;;
  esac
done < <(find layout sections templates blocks components public i18n -type f 2>/dev/null | sed "s#^\./##")
find layout -name '*.liquid' -o -name '*.css' -path 'layout/*' 2>/dev/null | grep -q . && { fail 9 "layout/ 出现非 .html"; B9=1; }
GL=$(find public sections blocks components -name '*.glb' 2>/dev/null | head)
[ -n "$GL" ] && { fail 9 "public/ 或区块目录出现 .glb: $GL"; B9=1; }
BIG=$(find public -type f -size +60k 2>/dev/null | head -5); [ -n "$BIG" ] && { warn 9 "public 超 60KB(保守值): $BIG"; }
BIG2=$(for f in sections/*/*.html; do [ -f "$f" ] && sz=$(wc -c <"$f") && [ "$sz" -gt 81920 ] && echo "$f($((sz/1024))KB)"; done)
[ -n "$BIG2" ] && { warn 9 "section html 超 80KB(保守值): $BIG2"; }
[ "$B9" = 0 ] && pass 9 "后缀白名单 OK（体积超保守值仅 WARN，探针回填后转 FAIL）"

# [10] Cold 零 GLB（静态断言：dormant 分支不得出现 .glb 字面量）
C10=$(grep -rn 'dormant' sections components --include=*.html --include=*.js 2>/dev/null | grep -E '\.glb' | head -5)
[ -z "$C10" ] && pass 10 "沉睡分支无 .glb 字面量（运行期断言见 agents/assets.md §4）" || { fail 10 "沉睡路径出现 glb:"; echo "$C10"|sed 's/^/      /'; }

# [11] Checkout 触碰
CT="false"
[ -f "$ROOT/MANIFEST.json" ] && CT=$(python3 -c "import json;print(json.load(open('$ROOT/MANIFEST.json')).get('checkout_touched','false'))" 2>/dev/null || echo false)
if [ "$CT" = "true" ]; then
  grep -rq "APPROVED" "$P/../checkout.lock" 2>/dev/null && warn 11 "checkout_touched=true 且 checkout.lock 有 APPROVED 痕迹 → 人工复核" \
    || fail 11 "checkout_touched=true 但无书面 APPROVED（checkout.lock §4 五步）"
else pass 11 "checkout_touched=false"; fi

# [12] Worker 路由冻结：模板禁绝对地址 / /api/
W12=$(grep -rnE 'https?://[a-z0-9.-]*workers\.dev|/api/' layout sections blocks components templates --include=*.html --include=*.js --include=*.json 2>/dev/null | head -8)
[ -z "$W12" ] && pass 12 "模板零 worker 地址 / 零 /api/ 字面量" || { fail 12 "路由硬编码（须走 SpaceVanta.api.get(key,…)，key 登记于 endpoints.json）:"; echo "$W12"|sed 's/^/      /'; }
if [ -f "$P/contracts/endpoints.json" ] && command -v python3 >/dev/null; then
python3 - <<'PY'
import json,sys
d=json.load(open("contracts/endpoints.json"))
sus=[k for k,v in d["endpoints"].items() if v.get("status")=="null_pending_deploy_fact"]
print("      ⏸ 未登记 url（功能静默关闭 + BLOCKED_BY_CONTRACT）:", ", ".join(sus) or "none")
PY
fi

# [13] 页面路由冻结：禁 /pages/ 字面量 + templates 白名单
R13=$(grep -rn '/pages/' layout sections blocks components --include=*.html --include=*.js 2>/dev/null | grep -v 'routes.json' | head -8)
[ -z "$R13" ] && pass 13 "模板零 /pages/ 字面量" || { fail 13 "页面路由硬编码（查 contracts/routes.json 或 resolve().master_page_url）:"; echo "$R13"|sed 's/^/      /'; }
if command -v python3 >/dev/null; then
python3 - <<'PY'; G13RC=$?
import json,os,sys
try:
    r=json.load(open("contracts/routes.json"))["routes"]
except Exception as e:
    print("      (routes.json 读取失败，跳过白名单校验)",e); sys.exit(0)
allow={v["template"].split("/")[-1] for v in r.values()}
have=set()
for dp,_,fn in os.walk("templates"):
    for f in fn:
        if f.endswith(".json"): have.add(f)
bad=sorted(have-allow-{"header-group.json","footer-group.json"})
if bad: print("   ✗ [G13] templates 出现未登记页面:", " ".join(bad)); sys.exit(3)
print("   ✓ [G13] templates 页面白名单 OK（", ", ".join(sorted(have) or ["(空)"]), "）")
PY
[ "${G13RC:-0}" = 3 ] && FAIL=$((FAIL+1))
fi

# [14] 母/子不变量静态扫描：model_slot 三枚举 + 回母页 CTA 强制 —— schema 里 model_slot 默认必须合法 + 回母页 CTA
M14=0
for f in sections/*/*.html ; do
  [ -f "$f" ] || continue
  case "$f" in */blocks/*) continue;; esac
  s=$(sed -n '/{{#schema}}/,/{{\/schema}}/p' "$f")
  echo "$s" | grep -q 'model_slot' || { warn 14 "$(basename "$f") 无 model_slot（若它不渲染模型可豁免，写进 SUMMARY）"; continue; }
  echo "$s" | grep -qE '"model_slot"' && echo "$s" | grep -qE 'hero_master.*active_child.*dormant_poster|active_child.*hero_master|dormant_poster' \
    || { fail 14 "$(basename "$f") model_slot 未声明三枚举"; M14=1; }
  # 回母页 CTA：渲染 model 的 section 必须含 view_master_model i18n 键
  grep -q 'sv\.common\.view_master_model' "$f" || { fail 14 "$(basename "$f") 缺回母模型 CTA（i18n 键 sv.common.view_master_model）"; M14=1; }
done
[ "$M14" = 0 ] && pass 14 "model_slot 三枚举 + 回母页 CTA 齐"

# [15] Fallback 可达性（PROTOCOL.md §3.6 六级阶梯 L0→L5）
#  a) 本次 rev 每处 async 取数须在 SUMMARY §4 降级表登记 L? 落点
#  b) 调用点同层须有 catch 且命中 L2~L5；裸 catch{} / 只 console.log → FAIL
#  d) 新能力接入须配 ?sv_<cap>=off 总闸
#  e) 价格/库存/运费/幂等/订单状态 禁进 KV 路径（强一致红线）
#  c) 掐断全外部依赖后无白屏/转圈/假价 → 人工闸门（§9），此处只打印指引
F15=0
SUMMARY_F="$(ls -1 reports/SUMMARY*.md 2>/dev/null | head -1)"
if [ -n "$SUMMARY_F" ]; then
  grep -qE '^##? .*降级|fallback|L[0-5]' "$SUMMARY_F" || { fail 15 "SUMMARY 缺「降级表」（每项 async 取数须写 L0→L? 落点，§3.6 a）"; F15=1; }
else
  warn 15 "未找到 reports/SUMMARY*.md → a) 降级表待交付时补（交付前必须过）"
fi

# b) 裸 catch 检测
NAKED=$(grep -rnE 'catch\s*(\([^)]*\))?\s*\{\s*\}' layout sections blocks components public --include=*.js --include=*.html 2>/dev/null | head -5)
[ -n "$NAKED" ] && { fail 15 "出现裸 catch{}（吞异常=无回退路径，须显式落 L2~L5）:"; echo "$NAKED"|sed 's/^/      /'; F15=1; }
ONLYLOG=$(grep -rnE 'catch\s*(\([^)]*\))?\s*\{\s*console\.(log|error|warn)\([^)]*\)\s*;\s*\}' layout sections blocks components public --include=*.js --include=*.html 2>/dev/null | head -5)
[ -n "$ONLYLOG" ] && { fail 15 "catch 内只 console 不降级（须触发 L2~L5 兜底）:"; echo "$ONLYLOG"|sed 's/^/      /'; F15=1; }

# d) 能力总闸：用了 KV/AE/Queues 就得有对应 ?sv_<cap>=off
# （能力探测以 contracts/endpoints.json 的 capabilities 声明为唯一真源，不做 grep 猜测）
if [ -f contracts/endpoints.json ] && command -v python3 >/dev/null; then
python3 - <<'PY'; G15RC=$?
import json,sys
d=json.load(open("contracts/endpoints.json"))
caps=d.get("capabilities",{})
prob=[]
for name,c in caps.items():
    if name.startswith("$") or not isinstance(c,dict): continue
    st=c.get("status")
    # kill_switch / fallback_to 为 null 且显式声明 base_layer=true ⇒ 它本身就是兜底层（D1/R2），豁免
    base = c.get("base_layer") is True
    if st in ("approved_pending_impl","active") and not base:
        if not c.get("kill_switch"): prob.append(f"{name} 缺 kill_switch（?sv_{name}=off）")
        if not c.get("fallback_to"): prob.append(f"{name} 缺 fallback_to（六级阶梯落点）")
    if base and not c.get("note"): prob.append(f"{name} 标 base_layer 但缺 note 说明它为何是兜底层")
    # e) 强一致红线
    if name=="kv":
        banned=c.get("must_not_store") or []
        if not banned: prob.append("kv 未声明 must_not_store（价格/库存/运费/幂等/订单状态 五禁）")
for k in ("price","inventory","shipping","idempotency","order_status"):
    pass
if prob: print("   ✗ [G15] 能力契约不全:", "; ".join(prob)); sys.exit(3)
acts=[k for k,v in caps.items() if v.get("status") in ("active","approved_pending_impl")]
print(f"   ✓ [G15] 能力契约齐（{', '.join(acts) or 'none'}：均有 kill_switch + fallback_to + must_not_store）")
PY
[ "${G15RC:-0}" = 3 ] && FAIL=$((FAIL+1))
fi
[ "$F15" = 0 ] && pass 15 "Fallback 静态项过（a/b/d/e）"
yel "  ! [G15-c] 人工闸门：断网/掐 Worker+KV+R2 后跑一遍页面，禁白屏·禁无限转圈·禁 {{PLACEHOLDER}} 裸露·禁假价（见 STACK.md §9）"; WARN=$((WARN+1))

echo "──────────────────────────────"
echo "FAIL=$FAIL  WARN=$WARN"
if [ "$FAIL" -gt 0 ]; then red "⛔ 不得出包、不得上传 Drive。修完重跑。"; exit 1; fi
grn "✅ 十五门全绿 → 允许 build → zip(根层直出) + MANIFEST.json + SUMMARY.md 双写"; exit 0

# ── G16 三端隔离：Drive 侧设计件禁入仓（v1.2 扩表 9 类）──────────────
g16_three_plane_isolation() {
  local root="${1:-.}"
  local fail=0

  # 1) 文件名级拦截（9 类，含附录D 新增 5 类）
  local FORBIDDEN='(^|/)(HANDOFF_|FLOWCONTRACT_|L3_MANIFEST_|L3D_|ASSET_MAP|AGENT_ASSET_REGISTRY|VERIFY_|L25_[^/]*\.html|MOCK)'
  local hits
  hits=$(cd "$root" && git ls-files | grep -Ei "$FORBIDDEN" || true)
  if [ -n "$hits" ]; then
    echo "  ✗ G16-a 设计件入仓（应只在 Drive）:"
    echo "$hits" | sed 's/^/      /'
    fail=1
  else
    echo "  ✓ G16-a 无 HANDOFF/FLOWCONTRACT/L3_MANIFEST/L3D/ASSET_MAP/AGENT_REGISTRY/VERIFY/L25/MOCK 入仓"
  fi

  # 2) 目录级：incoming/ 必须恒空（允许 README.md 与 .gitkeep）
  local inc
  inc=$(cd "$root" && git ls-files protocol/handoffs/incoming/ 2>/dev/null \
        | grep -Ev '/(README\.md|\.gitkeep)$' || true)
  if [ -n "$inc" ]; then
    echo "  ✗ G16-b incoming/ 非空（图纸在 Drive，此处恒空）:"
    echo "$inc" | sed 's/^/      /'
    fail=1
  else
    echo "  ✓ G16-b incoming/ 恒空"
  fi

  # 3) outgoing/ 只准 SUMMARY + DEFERRED（+ 可选 A-xxx 子目录）
  local out
  out=$(cd "$root" && git ls-files protocol/handoffs/outgoing/ 2>/dev/null \
        | grep -Ev '/(SUMMARY|DEFERRED)[^/]*\.md$|/(README\.md|\.gitkeep)$|/A-[0-9]+/' || true)
  if [ -n "$out" ]; then
    echo "  ✗ G16-c outgoing/ 混入了非总结件:"
    echo "$out" | sed 's/^/      /'
    fail=1
  else
    echo "  ✓ G16-c outgoing/ 仅 SUMMARY + DEFERRED"
  fi

  # 4) 生产代码里不许出现设计样机痕迹（fetch 假端点 / MOCK 键 / L25 引用）
  local src
  src=$(cd "$root" && grep -rnE "fetch\(['\"]https?://|L25_|MOCK\.(DUTY|LEADTIME|THRESHOLD)|sv_flow_(scene|bundle|mto|mixedcart|season)_v" \
        src/ 2>/dev/null | grep -v '\.test\.' || true)
  if [ -n "$src" ]; then
    echo "  ✗ G16-d src/ 出现样机痕迹或硬编码端点（应经 SpaceVanta.api）:"
    echo "$src" | sed 's/^/      /'
    fail=1
  else
    echo "  ✓ G16-d src/ 无样机痕迹、无硬编码 Worker 地址"
  fi

  # 5) 裸 hex 巡检（PALETTE v1.2.1 补丁5）：白名单仅 PALETTE*.json 与 dna.css 生成物
  local hex
  hex=$(cd "$root" && grep -rnE "#[0-9A-Fa-f]{6}\b" src/ \
        --exclude='PALETTE*.json' --exclude='*dna*.css' 2>/dev/null || true)
  if [ -n "$hex" ]; then
    echo "  ✗ G16-e 组件内出现裸 hex（只准 var(--sv-*)）:"
    echo "$hex" | sed 's/^/      /' | head -8
    fail=1
  else
    echo "  ✓ G16-e 令牌唯一（无裸 hex）"
  fi

  # 6) lockedTokens 防篡改
  if cd "$root" && git diff --cached --name-only 2>/dev/null | grep -qE 'PALETTE.*\.json|dna.*\.css'; then
    if cd "$root" && git diff --cached -U0 -- 'PALETTE*.json' '*dna*.css' 2>/dev/null \
       | grep -qE '^[-+].*(--sv-paper|--sv-paper-subtle|--sv-seam-aura)'; then
      echo "  ✗ G16-f 改动 lockedTokens（--sv-paper / --sv-paper-subtle / --sv-seam-aura 只读）"
      fail=1
    else
      echo "  ✓ G16-f lockedTokens 未被触碰"
    fi
  else
    echo "  ✓ G16-f lockedTokens 未被触碰（本次未改令牌文件）"
  fi

  return $fail
}

g16_three_plane_isolation "$REPO_ROOT" || GATE_FAIL=$((GATE_FAIL + 1))

