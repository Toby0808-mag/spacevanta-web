# HANDOFF_TEMPLATE.md — Gemini 出图 / 用户派单 用的八段空白模板

> **放置位置**：`protocol/HANDOFF_TEMPLATE.md`
> **落盘位置**：`protocol/handoffs/incoming/HANDOFF_<line>_<模板名>_v<N>.md`（Gemini 写；用户口头派单也照此填）
> **谁填**：Gemini（设计侧）。**Cursor 永不生成 handoff**，只能回 `requests/` 与 `outgoing/SUMMARY`。
> **铁律**：
> ① 八段齐 = 可开工；缺任一段 → `BLOCKED_BY_HANDOFF`，Cursor 停工问，**不许自己补**。
> ② 所有金额 / 门槛 / 比例 / 时效 / 截单日一律写 `{{PLACEHOLDER}}`，真值由 worker 注入（`hardcodedTransactionValues = 0`）。
> ③ **协议不定义开发目标与顺序**——做哪张 handoff 100% 由用户决定（PROTOCOL §7）。本模板只管"一张 handoff 长什么样"。
> ④ 状态名禁止用 `loading / error / success` 这类模糊词，必须用本单段 2 里登记的枚举。
> ⑤ 路径/命名若本单段 6 没写 → Cursor 必须问，禁止自造目录。

---

```markdown
# HANDOFF_<line>_<slug>_v<N>.md

## 段 0 · 抬头（30 秒速览）
HANDOFF_ID    : H-<YYYYMMDD>-<line>-<slug>
LINE          : bundle | mto | scene            ← 三选一，代号冻结
MODEL_LINE    : Bundle_MOTHER | MTO_MOTHER | SKIN_MOTHER
IS_FLAGSHIP   : yes | no                        ← 仅 scene 线有意义；no ⇒ 无母模型，走商品卡
PAGE_ROUTE    : /pages/bundles | /pages/made-to-order | /pages/scene   ← 必须命中 contracts/routes.json
TEMPLATE_FILE : templates/pages/<slug>.json
SECTION       : sections/<A>/<A>.html            ← 同名双段；A 由用户或 Gemini 指定，Cursor 不自造
MODEL_SLOT    : hero_master | active_child | dormant_poster
DNA 强度档     : 中（α 12~20% / β 0.3~0.5 / δ=0..1 / γ 0.35 / W/C ≥ 1.60）
交易层归属     : worker/<x>（唯一写入方）+ 只读消费 worker/<y>、worker/<z>
本单批次       : A 组（纯呈现与 3D 装配壳）→ B 组（交易与回算，需口头放行）→ C 组（埋点）
FREEZE_ID     : <母模型冻结面 ID，如 sv_bundle_mother_v1_0>
依赖 handoff   : H-xxxx 或「无」
本单不含        : 明确写出不做的事（防越界自由发挥）

前置闸门（逐项勾，全过才可发单）
- [ ] 上一 rev 的 SUMMARY.md 已读，blocker 已消化或原样继承到本单段 7
- [ ] 母模型冻结面（§2.5 等价段）未变；若变 → 这是 MAJOR，需用户书面 APPROVED
- [ ] 用到的 worker key 已在 contracts/endpoints.json 登记（active）；为 null ⇒ 本单走兜底并写进段 7
- [ ] hardcodedTransactionValues = 0（本单段 5 全为 {{PLACEHOLDER}}）

## 段 1 · 功能清单 FUNCTION INVENTORY（8 列齐，一行一验收单元）
| F-ID | 功能名 | 触发条件 | 状态迁移 | 空/错/超时降级 | 可见反馈 | DNA(α/β/δ) | 交易层归属 |
|:--|:--|:--|:--|:--|:--|:--|:--|
| F-01 | … | … | master_intro_peek → master_ready | 读不到 worker/x → 整块不渲染退常规列表；reduced-motion 跳开盒 | … | 15%/0.45/0 | 只读 worker/x |
| F-02 | … | … | … | WebGL 不可用 → 静态 poster，不白屏 | … | … | 无（纯呈现） |
（每个 F-ID 必须能在段 2 状态矩阵里找到对应行）

## 段 2 · 状态 × 视图矩阵 STATE MATRIX
### 2.1 主流程 N 态（禁 loading/error/success）
```text
状态              渲染块                数据来自              可点控件                        降级目标
master_intro_peek …                    worker/bundle+shipping [Take This Set][Got it]       2.8s/触控→master_ready
master_ready      …                    …                      …                             无数据→退单品列表
aux_editing       …                    BundleDriver+…         [Take My Custom Set][⇄][×]    算价超时→保留草稿禁价
timeout_fallback  非阻塞暖调 toast       —                      [Retry][继续浏览]              回上一有效态，绝不白屏
```
### 2.2 Promote 跨区升维 6 态（若本单含 3D 卡必填，时限逐字照抄）
```text
S0 COLD_IDLE   poster+虚线silhouette，0 GLB 请求     常驻            —
S1 PROMOTE_ARM 卡片 scale(1.02)+左缘 seam 竖线        ≤80ms          无JS→静态大图页
S2 CROSSFADE   poster 1→0 / 3D 0→1，同机位 ΔE≤2       240ms(off=0ms)  取模失败→停 poster+[View Full Poster]
S3 HOT_LIVE    可环绕/开盖/点槽，携带已选              暖≤600/冷≤1200  WebGL✗→SVG 托盘 poster
S4 DEMOTE      回 poster，Canvas 保活降 LOD1 停 rAF    120ms          焦点还给原 Cold 卡按钮
S5 COLD_PARK   dispose(geo/mat/tex)                   闲置60s/内存告警 内存回基线 ±2
```
### 2.3 同源驱动层（多端不得各建状态机）
唯一状态根：`XxxDriverStore{…}`；唯一入口：`dispatch(intent, payload, mode)`
mode ∈ desktop_stage | right_panel_inline | drag_drop | mobile_m1 | mobile_s1_flip | promote_pipeline | cart_handoff | ecosystem_slot
校验单点（MAX_QTY/MIN_SKUS/MAX_PER_SKU/CROSS_POOL_LIMIT/mixed_mto_hint）收敛于驱动层纯函数，并与 worker 服务端校验同构。

## 段 2.5 · 母模型锚点冻结面 & 资产谱系（ASSET FROZEN FACE）
> 本节等同 Schema，命名大小写逐字冻结；CI 按此校验。改任何一行 = MAJOR + 用户 APPROVED。
- 对象名 `<LINE>_MOTHER`（纯 THREE.Group）；**自身永不上材质/高光/接触阴影**
- 锚点：`anchor_A[…]` `anchor_B[…]` `anchor_C[…]`，snap 容差 6°/3mm，挂载序 **A→B→C→A** 冻结，`seam_rail` 闭环
- 零穿模坐标（Bundle 线）：lid 厚 0.08 / lid 顶 +0.0400 / plinth 底 +0.0405 高 0.0035 / SV 组 +0.0440 / min.y 归一化 y≥0
- 谱系表：M-Proto 基线 __ SKU（LOD0≤120k / LOD1≤45k / LOD2≤12k / poster≤90KB）· Mother **0 面**· Hot ≤1（全站≤4）· Cold **0 GLB 请求**
- [ ] 本单是否改动冻结面？ **否**（选"是"→ 停下，走 MAJOR 变更，不在本单里悄悄改）

## 段 3 · 组件树与文件落点 COMPONENT MAP
> 每项标【新】/【改】/【禁动】。**只给结构与职责，不给实现代码。** 路径由本段显式指定，Cursor 不自造。
```text
【新】sections/<A>/<A>.html              ← 内联 {{#schema}} 必带 presets；settings 只含展示开关 + model_slot
【新】sections/<A>/blocks/<b>.html       ← private block，命名自由；三处齐（{{#content "blocks"}} ⟺ "$b" ⟺ 磁盘）
【新】sections/<A>/<A>.css / .js         ← 区块内以 ./<A>.css 引用；禁内联 <style>/<script>
【新】templates/pages/<slug>.json        ← { sections:[{type:"<A>", …}], order:[…] }；文件名须等于 routes.json
【改】components/product-card/card.html   ← 换 SV 版：poster + 虚线 silhouette，沉睡 0 GLB
【禁动】checkout*（全路由/样式/功能）      ← 硬红线
【禁动】worker/{pricing,mto,shipping,season}/* ← 本单只读消费
【禁动】d1/migrations/ 中早于 00XX 的历史迁移
【禁动】--sv-paper / --sv-paper-subtle / --sv-ink / --sv-seam-aura
【禁动】artifacts/design/*.html           ← 仅设计留档，严禁移入主题树
```

## 段 4 · 占位符注入表 PLACEHOLDER REGISTRY（交易值一个都不许写死）
| `{{KEY}}` | 出现位置(F-ID) | 唯一注入方(worker key) | 类型 | 缺失/超时行为 | 可缓存 |
|:--|:--|:--|:--|:--|:--|
| `{{LOCALE_PRICE}}` | F-03/F-09 | bundle | 已格式化价格串 | 主 CTA **保持禁用**，不渲染假价 | 否 |
| `{{SET_SAVING}}` | F-03 | bundle | 本地化礼遇串 | 隐藏礼遇条，保留基础装盒 | 否 |
| `{{DUTY}}` / `{{LEADTIME}}` / `{{THRESHOLD}}` | F-01/F-10 | shipping | 本地化串 | 整条 Trust 带隐藏 | 是 Edge 1h |
| `{{MIN_SKUS}}`/`{{MAX_QTY}}`/`{{MAX_PER_SKU}}`/`{{CROSS_POOL_LIMIT}}` | F-04/05/10 | bundle | integer | 禁用对应控件 + 回落规则页跳链 | 是 |
| `{{ONE_PARCEL_NOTE}}` | F-07 | shipping | 本地化串 | 生态插槽**整条静默隐藏**（禁灰置"即将上线"） | 是 |
| `{{MTO_REPLY_SLA}}`/`{{MTO_CART_HINT}}` | F-08 | mto | 本地化串 | 回落默认英文引导 | 是 |
| `{{ORDER_BY}}` | F-11 | season | ISO Date 本地化 | 截单标记不渲染 | 是(到点失效) |

## 段 5 · 接口与事件契约 CONTRACT（只定义形状/幂等/降级/埋点，不定义实现）
```text
GET  /model/resolve?slot=&line=&id=&locale=   → {url|null, poster, silhouette, version, perm(7位), master_page_url, budget, ttl}
POST /bundle/quote        body{locale,poolId,items[],crossPoolItems[]} → {subtotal, saving, tiers, limits}   Zod 拒未知键
POST /bundle/cart-commit  header Idempotency-Key → {cartToken, lineKeys[]}   429/503|超时>4s → toast+Retry，保留已选
GET  /bundle/pool?locale=&cursor=             → {name, items[], crossLeft, next}
GET  /market/active · /shipping/quote · /mto/sla · /season/active
```
- 前端唯一取数口：`SpaceVanta.api.get(key, path, params, {timeout:3000, ttl})`，**永不 reject**，返回 `null` 走段 2 降级
- 事件：`sv:data{kind,key,path,data}` / `sv:market{key,country,source}` / `sv:season{id,skin,on}`；模板**只监听**，不读 `sv_ship_to`、不拼 worker 地址
- 幂等：`bundle_commit_log(idempotency_key UNIQUE)`；连点 3 次只写 1 条
- 埋点：`<line>.<object>.<verb>`，必带 `flow_id / rev / slot / line / model_version / locale / duration_ms / outcome`
- 总闸必须生效：`?sv_motion=off`（S2 0ms 淡切）· `?sv_season=off` · `?sv_agent=off`（不留空位）

## 段 6 · 路径授权（**本段空着 Cursor 就必须问，禁止自造**）
```text
SECTION_DIR   : sections/<A>/
PRIVATE_BLOCKS: blocks/<b1>.html（用途一句话）· blocks/<b2>.html
CSS/JS        : ./<A>.css · ./<A>.js   （或 public/<A>/… 若跨区块复用）
TEMPLATE      : templates/pages/<slug>.json
I18N_KEYS     : sv.<line>.<slug>.<x>.label …   ← 先落 i18n/en.json（+zh-hans-cn/zh-hant-tw）
SCHEMA_T      : t:sections.<A>.settings.<id>.label …  ← 落 i18n/en.schema.json
```
> 未列出却又需要的路径 → 发 `handoffs/requests/cursor-to-user-<事由>.md`，等用户口头给，**不许 `mkdir` 猜**。

## 段 7 · 已知 blocker 与待裁决（原样继承 + 新增，SUMMARY §3 会回显）
- BLOCKED_BY_DESIGN：__________________________（图纸缺什么）
- BLOCKED_BY_CONTRACT：worker/<x>.url = null ⇒ 走 `$fallback-list`，A3 抄入部署事实后解除
- BLOCKED_BY_APPROVAL：提案 PROP-___ 待用户 APPROVED（新增/废除 worker 或改路由）
- BLOCKED_BY_HANDOFF：段 6 未授权的路径
- （无则写 `none`，不要留空）

## 段 8 · 验收表 ACCEPTANCE（机器 + 人工，逐条可判）
- [ ] `bash protocol/scripts/check_gates.sh .` → **FAIL=0**（十五门；WARN 需逐条书面解释）
- [ ] `grep -c '{%' 主题树` = 0；`.liquid` 计数 = 0；zip 根层直出 `layout/ sections/ …`，≤10MB
- [ ] schema 内搜不到 `https` / `.glb` / `M-[A-Z]` / 裸 hex / 金额百分比；**每个区块都有 presets**（编辑器可见）
- [ ] 每个 `| t()` 键在 `i18n/en.json` 存在；`options_N`/`presets_N` 编号连续
- [ ] Network 面板：`S0` 沉睡卡 **0 个 .glb 请求**；`S5` 后内存回基线 ±2；连升 5 次不涨
- [ ] 掐掉全部 worker：页面仍渲染，兜底子块可见，**无白屏、无 toast 风暴、无 console error**
- [ ] 375px 零横向滚动；`prefers-reduced-motion` 下 S2=0ms；焦点顺序 `Cold卡 → 升维CTA → 回母页CTA → Cart`
- [ ] 活跃子与沉睡子(S3后) 3D 内**都有回母页 CTA**，URL 来自 `resolve()` 非拼接（A-3 恒真断言）
- [ ] `?sv_motion=off` / `?sv_season=off` / `?sv_agent=off` 三闸实测生效
- [ ] 模板内搜不到 `workers.dev` / `/api/` / `/pages/` 字面量（门禁[12][13]）
- [ ] 涉及运费/收款/合发分发 → **真实下一单**通过后才算上线
- [ ] 交付双件齐：`theme@<id>@v<rev>.zip + MANIFEST.json` 与 `handoffs/snapshots/<id>/v<rev>/SUMMARY.md(≤40行六段)`，哈希互验
- [ ] SUMMARY 已写入 `handoffs/outgoing/` 并**经用户点发送**回 Gemini（未回传 = `delivered_pending_feedback`）
```
```

---

## 填单自检（Gemini 发单前 20 秒）

1. 八段齐？段 2 每个 F-ID 在段 2.1 有行？段 5 每个 `{{KEY}}` 在段 4 有行？
2. 段 2.5 写了"是否改冻结面"且答**否**？（答是 → 它不是一张 handoff，是一次 MAJOR 变更）
3. 段 4 有没有漏网的真钱真数？（`grep -nE '¥|HK\$|[0-9]+%'` 应为空）
4. 段 6 路径是不是**都给了**？没给的写进段 7 而不是留白。
5. 段 8 有没有我会自己骗自己的条目？（"视觉OK"不可判 → 改成"375px 零横向滚动"这种可判的）
6. 状态名有没有混进 `loading/error/success`？

**六问全过 → 落 `handoffs/incoming/` → 用户派单 → Cursor 开工。** ✍️
