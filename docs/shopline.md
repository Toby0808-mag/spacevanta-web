# docs/shopline.md — Shopline 平台事实表（L0 唯一判据）

> **放置位置**：`protocol/docs/shopline.md`
> **地位**：L0 > L1(协议) > L2(骨架) > 当次 handoff。**本表与 handoff 冲突 → 停工问用户，Agent 不得自行选边。**
> **来源**：`SpaceVanta Base 0.1.0` 源码实测（Shopline **Fashion 1.1.14 / OS 3.0** 清腔版）+ 上线后回填项。
> **铁律**：表里写 `TBD_PROBE` 的，= **先探明再写，不猜**。探针跑完必须回填 + 记日期 + 记 OS 版本。

---

## §A 目录职责（职责，不是清单；Base 745 文件皆可增删改名，见 PROTOCOL §0）

| 目录 / 文件 | 职责 | 硬规则 |
|---|---|---|
| `layout/` | 外壳：`theme` / `password` / `gift_card` / `proofing` | **仅 .html**；`theme.html` 必须保留 head、header-group、`{{#content "layout" /}}`、footer-group |
| `templates/` | 页面模板 = JSON `{sections, order}`；`policy/gift_card/proofing` 为 HTML | 每页一个 JSON；`templates/pages/*.json` 只许出现 `contracts/routes.json` 登记的 3 个 |
| `sections/<A>/<A>.html` | 区块；**同名双段才注册** | 目录名 == 主文件名；同目录放 `.css/.js`；末尾内联 `{{#schema}}…{{/schema}}` **且必带 presets** |
| `sections/<A>/blocks/<b>.html` | private block，命名自由 | 类型名写 `$b`；三处齐（content/schema/磁盘）；每个配 `<b>.schema` 等价声明（内联或同目录 schema 文件，**以实测为准 P3**） |
| `header-group.json` / `footer-group.json` | 分组 | 经 `{{#sections "header-group" /}}` 渲染 |
| `blocks/` | 全局共用块（`heading`、`product-card/card`…） | 跨 section 复用才放这；同样守同名双段 |
| `components/` | 可复用片段：`{{#component "icons/close" /}}` | `script` / `stylesheet` / `image` 是平台通用组件，**优先用它们引 css/js** |
| `public/` | `asset_url()` 的根 | **禁 .glb / .liquid / .json 当资产**；单文件上限见 §C 探针 |
| `i18n/xx.json` | 前台文案 | 40 个语言文件已保留；**新增键先落 `en.json`** |
| `i18n/xx.schema.json` | 编辑器文案（`t:sections.…`） | 仅 en / zh-hans-cn / zh-hant-tw 有译文，其余暂英；`options_N`、`presets_N` 编号 |
| `theme.schema.json` / `theme.config.json` | 全局设置定义 / 默认取值 | DNA 三色（Paper/Ink/Seam）在此可改；端点地址**不放这里**（门禁[13]） |

### 区块内相对路径规则（源码实证，最容易错）
- `./x.css` → **相对该区块文件所在目录**（`sections/<A>/x.css`）
- 其余（`{{ 'x.css' | asset_url() }}`）→ **相对 `public/`**
- 区块私有 css/js **放同目录**；跨区块共用放 `public/` 并经 `asset_url()`。

---

## §B 语法白名单速查（详见 `protocol/STACK.md §B` 与 `contracts/filters.json`）

```
输出   {{ x }} 转义 / {{{ x }}} 不转义
过滤   | t() | asset_url() | class_list() | default() | plus()      ← 仅这 5 + 已登记自定义
控制   {{#if}}…{{#else/}}…{{/if}} · {{#for a in b}}…{{/for}} · {{#var x=/}} · {{#set x=/}}
引用   {{#component "名" k=v/}} · {{#section "名"/}} · {{#sections "组"/}}
       {{#content "blocks"/}}（渲染 private block）· {{#content "layout"/}}（仅 layout）
schema {{#schema}}{…}{{/schema}}   ← 内联，必含 name/icon/settings/blocks/presets
```
**禁**：`{%`、`{{!--`、`include`/`render`、绝对 URL、`/pages/`、`/api/`、自造 helper、未登记过滤器。

### 设置项类型（仅 14 种）
`text textarea select checkbox range color color_scheme image url font style.spacing style.layout`
（+ 平台内建 `header / paragraph / video / product / collection / blog / article / page / html` 类 block 类型，以编辑器实际为准 **P4**）
- 配色一律 `color-{{ section.settings.color_scheme.id }}`
- 间距/布局一律 `{{ section.settings | class_list() }}`
- **禁裸 hex**（仅 `dna.css` / `PALETTE*.json` 豁免，门禁[7]）

---

## §C 体积与性能探针表（**待 A1 实测回填**）

| 探针 | 对象 | 梯度 | 结果 | 结论上限 | 实测日 / OS |
|---|---|---|---|---|---|
| P1 | `public/` 单文件 | 60 / 100 / 200 / 500 KB | TBD_PROBE | TBD_PROBE | — |
| P2 | `sections/<A>/<A>.html` | 80 / 150 / 300 KB | TBD_PROBE | TBD_PROBE | — |
| P3 | private block schema 形态 | 内联声明 / 同目录 `.schema` 文件 / 无 schema | TBD_PROBE | **判定 Base 说明未覆盖的那一条，回填本节并同步 STACK.md §C** | — |
| P4 | `presets` 缺失是否真的不进「添加区块」 | 有 / 无 | TBD_PROBE | 若属实→门禁[4] 保持 FAIL 级 | — |
| P5 | 多语言 url 过滤器真名 | `url()` / `link()` / 自动补前缀 | TBD_PROBE | 回填 `contracts/filters.json#locale_url_filter` | — |
| P6 | 包体与文件数 | Base=1.9MB/745 文件；硬顶 **10MB** | TBD_PROBE | 单 zip ≤10MB；根层直出 `layout/…` 不套目录 | — |

**填表前按保守值卡（门禁[9]）**：`public` ≤60KB/文件 · `section.html` ≤80KB · `poster` ≤90KB · zip ≤10MB。

**性能预算（H-001 起验收）**：Hero LCP **<2.5s**（移动端 4G）· CLS <0.1 · INP <200ms · `S1` 反馈 ≤80ms · `S2` 240ms（`motion=off` 时 0ms）· `S3` 首帧 暖≤600ms / 冷≤1200ms · 375px 零横向滚动 · `prefers-reduced-motion` 全链路生效。

---

## §D 编辑器踩坑登记（**踩一次记一条，只增不删**）

| ID | 坑 | 现象 | 规避（已进门禁） |
|---|---|---|---|
| E-01 | 区块无 `presets` | 编辑器「添加区块」里**根本不出现**该区块 | 门禁[4]：无 presets = FAIL |
| E-02 | `| t()` 键没进 `en.json` | 前台直接**露出键名** | 门禁[8]：键闭合校验 |
| E-03 | schema `options_N` / `presets_N` 编号断档 | 编辑器下拉缺项 / 预设消失 | 门禁[8]：编号连续性 |
| E-04 | `sections/A/A.html` 目录名≠文件名 | 注册不上、模板 JSON 引用 404 | 门禁[2] |
| E-05 | private block 三处不齐（写了 `$motion` 但磁盘无文件 / 没进 schema `blocks[]`） | 区块白一块或编辑器拖不进去 | 门禁[3] |
| E-06 | 区块 css 写成 `{{ 'x.css'|asset_url() }}` 但文件放在区块目录 | 404 | §A 相对路径规则：`./x.css` |
| E-07 | zip 多套一层目录 | 上传后主题结构全错 | 打包：根层直接 `layout/ sections/ …` |
| E-08 | 老 Fashion 区块残留裸 hex / 硬编码「满 XX 包邮」 | 门禁[7] 红 + 品牌串味 | 删或换 SV 版；交易值一律 `{{PLACEHOLDER}}` |
| E-09 | 改了 section 名没改 `templates/*.json` 的 sections 键 | 线上整页空白 | §PROTOCOL 2.1：改名四处同改 + SUMMARY §2 |

---

## §E 上传校验清单（本地跑不了，每次上传对着勾）

- [ ] zip ≤10MB，根层直出 `layout/ sections/ templates/ blocks/ components/ public/ i18n/ theme.schema.json theme.config.json`
- [ ] 后台能打开**编辑器首页**不报错
- [ ] 主题设置里出现 **「Space Vanta DNA」** 分组（Paper / Ink / Seam 三色可改）
- [ ] 「添加区块」里出现 **Space Vanta** 分类，含 `SV data slot` 与本次新增区块（← E-01 复验）
- [ ] 三个独立页可在 URL 直达：`/pages/bundles`、`/pages/made-to-order`、`/pages/scene`（+ 一个 locale 前缀变体）
- [ ] `?sv_season=off` / `?sv_motion=off` / `?sv_agent=off` 三个总闸实测生效，`agent=off` **不留空位**
- [ ] 断网/掐 worker：页面仍渲染，兜底子块可见，**无白屏无 toast 风暴**
- [ ] 375px 无横向滚动；底部吸附栏留 `safe-area`
- [ ] 报错原文（若有）→ 贴进 `handoffs/requests/cursor-to-user-shopline-upload-<日期>.md`，**不猜着改**
- [ ] 涉及运费/收款/合发分发的改动 → **真实下一单**通过后才算上线（PROTOCOL §10）

---

## §F DNA 令牌（只读禁动；季节只改一个）

```
--svd-paper #FBF7F0 · --svd-paper-2 #F3ECE0 · --svd-ink #252321 · --svd-ink-soft #6B655C
--svd-line #E4DDD0 · --svd-seam #1D6BFF · --svd-s1..s7 · --svd-r-* · --svd-dur/--svd-ease · --svd-focus
--sv-season-accent   ← 默认 = seam；季节皮肤只改它；**仅用于图形/线，禁用于正文**
```
冻结禁动：`--sv-paper` / `--sv-paper-subtle` / `--sv-ink` / `--sv-seam-aura`。
基础件：`.svd-seam(.svd-seam-in)` / `.svd-card` / `.svd-chip` / `.svd-btn(--ghost)` / `.svd-visually-hidden`。
**模板只用 `--svd-*` 与 `color_scheme`，禁写死颜色值。**

---

## §F2 已知平台限制 / 待确认（TBD，禁止自行假设）

| 项 | 状态 | 处理 |
|---|---|---|
| Base 说明 §7 三条假设（`sv_ship_to` 形状、market/country 查询参数名、两个 worker 域名） | 部分已定 | `sv_ship_to` → **唯一读法 `SpaceVanta.market.get().country`**（A3 适配底层）；端点以 `contracts/endpoints.json` 为准 |
| private block 是否允许"无 schema，仅被 section `blocks[]` 登记" | **P3 待探** | 探明前按"**空也必须声明**"从严执行 |
| 全局 `blocks/<B>/<B>.html` 的跨 section 引用语法 | 未探 | 首次真用到时由用户当场给写法，协议不预设 |
| i18n 语言全集（40 个）中哪些必须随包维护 | 未定 | 当前：en + zh-hans-cn + zh-hant-tw 必须有译文，其余可英；删语言包需用户点头 |
| 主题版本升级（OS 3.0 → 更高）时的回归范围 | 未定 | 升级即重跑 P1–P6 探针 + 十五门 + §E 清单，升 `docs/shopline.md` MINOR |
