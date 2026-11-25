# CHANGELOG — SpaceVanta 前端施工协议

> 放置位置：`protocol/docs/changelog.md`
> 规则：只增不改。每条含 **日期 / 版本 / 改了什么 / 为什么 / 谁批的**。
> 版本语义（PROTOCOL §12）：**MAJOR** = 冻结面或契约形状变（母锚点、路由、端点增删、perm 位）；**MINOR** = 新增可选字段/新 Agent 卡/新门禁；**PATCH** = 措辞与举例修正，不改判据。

---

## v1.1.0 · 2026-11-25 —— 路由冻结 + Cursor 提案权 + 开发顺序归用户
**改了什么**
1. `contracts/routes.json` 新建并冻结三页：`/pages/bundles`、`/pages/made-to-order`、**`/pages/scene`**
   - **业务线代号 `scene` 取代 `skin`**（用户口误更正）。`skin` 一词仅作为**已定资产名残留**：`sv-skin-showcase`、`SKIN_MOTHER`、`--sv-*`（DNA 令牌前缀，与业务线无关，不改）。**新命名一律用 `scene` / `SV Scene` / `Scene_MOTHER`（首次建时）**。
   - Scene 枢纽 URL 由 `/pages/Product collection sceneshowcase` 简化为 **`/pages/scene`**（用户改定）。
   - 规范写法**不带 locale 前缀**（`/en-us/` 由平台注入）；模板内禁 `/pages/` 字面量，一律查表或 `resolve().master_page_url`。
2. **Worker 路由 = 常量，废除制**（STACK §E）：不上线即冻结，随代码源走。
   - 唯一变更路径：**提案 → 用户 APPROVED → ADD 新 → 并存 2 个 rev → DEL 旧**。
   - **即使"确认不影响"也不许即时删**（防隐性依赖）。
   - 前端禁拼 worker 域名/路径；`endpoints.json` 的 `url` 是**从部署清单抄入的只读事实，不是待设计决策**。
3. **Cursor 提案权（PROTOCOL §3）**：可提议 增/删 后台↔店面集成 API、废止不再使用的 worker、为新主题能力建新 worker 并给配置；**五要素齐**（为什么/改什么/影响面/并存与回滚/验证法）→ 落 `endpoints.json#proposal_log` → 状态 `PROPOSED_PENDING_USER` → **用户 APPROVED 才生效**，否则 `BLOCKED_BY_APPROVAL` 停工。
4. **开发目标与顺序 100% 归用户（PROTOCOL §7）**：协议**不定义**"先做哪个模板 / 先接哪个 worker"。用户口头说 Drive 里哪份就做哪份；遇到关联部分未就绪 → 标 `DEFERRED_TO_<AGENT>` 记账**继续做本单**，不停工、不代做。
5. 门禁 **12 → 14 条**：[12] Worker 路由冻结、[13] 页面路由冻结、[14] 母子不变量 + 回母页 CTA 强制。（编号以 `STACK.md §F` 表为准）
6. 停工码新增：**`BLOCKED_BY_APPROVAL`**（提案待批）、**`BLOCKED_BY_CONTRACT`**（端点未登记/为 null）；保留 `BLOCKED_BY_DESIGN` / `BLOCKED_BY_CHECKOUT` / `BLOCKED_BY_HANDOFF`。

**为什么**：前三轮把这三条混在一起了——我一度把"端点未填"当成设计待决、把路由当成可随手改的配置、还自作主张排了 H-001→H-004 顺序。用户明确：路由是常量、改动走提案+批准、做什么做哪个**由人说了算**。

**谁批的**：用户 2026-11-25 口述确认。

---

## v1.0.1 · 2026-11-25 —— 骨架豁免 + 语法白名单实证化
- 新增 **§0 骨架豁免**：`SpaceVanta Base 0.1.0`（Fashion 1.1.14 / OS 3.0 仿制壳，745 文件）只是**为通过 Shopline 上传校验的非空气器**，不是户型图。🟢建 / 🔴删 / 🔵换 全合法，判据只有一句"删完十五门还过吗"。
- **§2.1 命名不变量 5 条**定稿：`sections/<A>/<A>.html` 同名双段才注册；模块名禁点号命名空间（`ui.search.x` 类全废）；**无固定前缀**（早前臆测的 `sx-` 条款作废）；private block **三处齐**（`{{#content "blocks"}}` ⟺ schema `blocks[].type:"$b"` ⟺ `blocks/b.html`）；改名 = 破坏性变更（目录+主文件+templates JSON+i18n 键前缀 四处同改）。
- **§3 / STACK §B–D 语法白名单**改为从源码读出：`{{ }}`/`{{{ }}}` + **仅 5 个过滤器** `t()|asset_url()|class_list()|default()|plus()` + 控制流 `if/for/var/set` + 引用 `component/section/sections/content/schema`；**禁 `{%`、`{{!--`、自造 helper**。
- **schema 内联**（`{{#schema}}{{/schema}}` 写在区块末尾，**不是**外部 `.json`）+ **`presets` 强制**（无 presets 区块不进编辑器「添加区块」，踩坑记录 E-01）。
- **i18n 键先行**：`{{ "a.b.c"|t() }}` 键必须先落 `i18n/en.json`（+ zh-hans-cn / zh-hant-tw）；schema 标签 `t:sections.<A>.settings.<id>.label` 落 `<locale>.schema.json`；`options_N` / `presets_N` **编号连续无断档**。
- `asset_url()` 为根；**区块私有 css/js 放同目录写 `./x.css`**，其余相对 `public/`；`public/` 与代码源**禁 `.glb`**。
- 体积**实测制**：`docs/shopline.md §C` 探针 P0–P6 全 `TBD_PROBE`；填表前保守卡 public ≤60KB / section.html ≤80KB / poster ≤90KB / zip ≤10MB。

**谁批的**：用户逐步口述纠正（"sx 是我口误""没有 pop 是 public""schema 是口误的原词""骨架只是能上传的壳，路径可删可建"）。

---

## v1.0.0 · 2026-11-25 —— 首版定稿
四 Agent 产权 / 三业务树（bundle·scene·mto，scene 仅 `is_flagship` 有母）/ 母唯一·子同级·零换色权·100% 派生 / 沉睡 poster 0 GLB + 点击升维 S0–S5 / **活跃与沉睡均强制回母页 CTA** / 母 0 面 + 锚点 A→B→C→A + 顶盖零穿模四坐标 / Hot Canvas ≤4 / LOD 预算 / 资产域 `assets.spacevanta.com`(R2) 版本路径不可变 / Worker 只吐 URL+版本+权限 / `hardcodedTransactionValues=0` / DNA `--svd-*` 令牌只读、季节只改 `--sv-season-accent` / AI 停 **G-0** 且永不输出价格运费时效库存订单 / **Checkout 冻结**（合发分发只在 Cart 页属性透传）/ handoff 闭环 + **双套号**(handoff vN / rev) + 快照双写(Drive 全量 · Git 仅 SUMMARY≤40行六段) + 回传 `handoffs/outgoing/` 由用户点发送。

---

## ⚠️ 作废旧条款（防止旧口径复活；命中即按作废处理）
| 作废内容 | 出自 | 现按 |
|:--|:--|:--|
| section 必须 `sx-` 固定前缀 | v1.0 草案 | §2.1 无固定前缀，`<A>` 由 handoff/用户给 |
| schema 是外部独立 `.json` 并构建注入 | v1.0 草案 | schema **内联** `{{#schema}}`，必带 presets |
| `${motion}` 花括号插值调用 private block | 口述转写误记 | `{{#content "blocks" /}}` + schema `$b` + `blocks/b.html` 三处齐 |
| 存在 `pop/` 目录（仅 js/css） | 口误 | **无 `pop/`**，弹层是 `components/pop-*.html` + 同名 css/js |
| 平台是 Shopify / `{% schema %}` | 早期口误 | **Shopline OS 3.0**，语法白名单见 STACK §B |
| `handful` / `hang off` 等转写字 | 语音误识 | 一律 **handoff** |
| 业务线代号 `skin` | v1.0.0 | **`scene`**；仅已定资产名保留 skin 字样 |
| Scene 页 `/pages/Product collection sceneshowcase` | v1.0.1 初稿 | **`/pages/scene`** |
| 端点 `null` = "等设计决策，可先填 workers.dev 猜一个" | v1.0 草案 | `null` = **部署事实未抄入**，禁猜，走兜底 + `BLOCKED_BY_CONTRACT` |
| 协议排定 H-001→H-004 开发顺序 | v1.0 草案 | **协议不定义顺序**，100% 由用户决定（§7） |
| Worker 路由可随 handoff 调整 | v1.0 草案 | **废除制 + 提案 + APPROVED + 并存 2 rev**（STACK §E） |

## v1.1.0-final 收尾
- 修 `scripts/check_gates.sh` G8：`options_N`/`presets_N` 索引**先去重再判连续性**，否则合法的 `presets_0.category`+`presets_0.name` 被误判断档 [0,0,1,1]（会误杀合法双 presets）。
- 修 G8 三处 `sys.exit(1)` → 计入 FAIL 继续跑：原先 G8 一挂就早退，G9~G14 根本不执行，导致"EXIT=0 却有 FAIL"的假绿。
- 新增 `handoffs/README.md`（四目录职责 / 双套号 / 提案制 / 5 停工码 / 开工五动作）。
- 双向验证：干净主题树 G1–G14 全 ✓ EXIT=0；注入裸hex+worker地址+/pages/字面量+缺CTA 后 FAIL=4 EXIT=1 且禁止出包。
