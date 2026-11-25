# PROTOCOL.md — SpaceVanta 前端施工协议（总纲）

> **放置位置**：SpaceVanta-Web 仓库根下的 **`protocol/PROTOCOL.md`**；`.cursor/rules/` **必须在仓库根**（Cursor 只自动加载根路径），见 `UPLOAD.md` 与根目录 `_文件目录对照表.md`
> **版本**：v1.1.1 · 2026-11-25（批准 PROP-001 / PROP-002 生效版）
> **效力**：本协议只规定**写法与红线**。目录、文件名、模板命名**由当次 handoff 或用户当场口述决定**，协议不固定架构。
> **唯一判据顺序**：L0 Shopline 平台语法 > L1 本协议 > L2 主题骨架 > 当次 handoff。handoff 不能推翻协议，协议不能推翻 Shopline。

---

## §0 骨架豁免条款（最先读，防止"照着 745 个文件长"）

`SpaceVanta Base 0.1.0`（源自 Shopline 官方 **Fashion 1.1.14 / OS 3.0**，已清 Treat 专属内容）**是为了通过 Shopline 上传校验而存在的「非空气器」，不是户型图。**

1. 它里面**每一个路径、每一个文件名都不是约束**。存在 ≠ 要用；不存在 ≠ 不能建。
2. **三个动作全部合法，且不需要额外审批**：
   - 🟢 **新建**：骨架里没有 `bundle` / `scene` / `mto` 的任何东西 → 照建（`sections/sv-bundle-hero/`、 `workers/bundle/` …）
   - 🔴 **删除**：Treat 残留、Fashion 原版区块、首页占位、用不上的语言条目 → 直接删
   - 🔵 **替换**：同名同位置换成我们的实现（Fashion product-card → SV 沉睡卡）
3. **唯一不可动的是"规则"，不是"文件"**（规则清单见 `STACK.md`）：
   `sections/<A>/<A>.html` 同名双段 · schema 内联且**必带 presets** · private block 三处齐 · 语法白名单 · i18n 键先行 · `asset_url()` 为根 · `layout/theme.html` 保留 `{{#content "layout" /}}` 与 header/footer-group · zip 根层直出 · ≤10MB
4. **删到只剩一个能上传的最小壳也合规**——只要 `STACK.md §F` 十五门全绿。
5. **判据只有一句**：删之前问 **"删了它，十五门还过吗？"** 过就删；不过说明它承载的是**规则**不是**内容** → 留规则、换内容。

---

## §1 三层宪法

| 层 | 内容 | 谁能改 |
|---|---|---|
| **L0 平台层** | Shopline OS 3.0 主题语法（`STACK.md §A–§D`） | 没人改，只跟官方版本走；探明后写进 `docs/shopline.md` |
| **L1 协议层** | 本文件 + `STACK.md` + `checkout.lock` + `agents.md` + `contracts/*` | **只有用户点头后改**，改完升版号并写 `docs/changelog.md` |
| **L2 骨架层** | 主题的 745 个文件 | **Cursor 可自由增删改名**，只要过十五门 |
| **L3 施工层** | 当次 handoff | Gemini 出图、用户批准；Cursor **只执行，不自行发明需求** |

---

## §2 目录职责（这是"职责"，不是"清单"）

```text
layout/            外壳：theme / password / gift_card / proofing
                   theme.html 管 head、header-group、{{#content "layout" /}}、footer-group
templates/         页面模板 = JSON { sections + order }；policy/gift_card/proofing 为 HTML
sections/<A>/<A>.html     ← 同名双段，A 即注册名；同目录放 .css/.js
          /blocks/<b>.html ← private block，命名自由，类型名写 $b
blocks/            全局共用块（heading / product-card/card …）
components/        可复用片段 {{#component "icons/close" /}}；script/stylesheet/image 为通用件
public/            asset_url() 的根；区块内 ./x.css 相对本文件目录，其余相对 public/
i18n/              xx.json 前台文案 / xx.schema.json 编辑器文案
theme.schema.json  全局设置定义     theme.config.json 默认预设取值
```

### §2.0 主题独立页路由冻结表（**契约级，见 `contracts/routes.json`**）

| 业务线 | 规范路径（**不带 locale 前缀**） | templates 文件 | 主 section | 母模型 |
|---|---|---|---|---|
| **Bundle** | `/pages/bundles` | `templates/pages/bundles.json` | `sv-bundle-hero` | `Bundle_MOTHER` |
| **MTO** | `/pages/made-to-order` | `templates/pages/made-to-order.json` | `sv-mto-stage` | `MTO_MOTHER` |
| **Scene 枢纽** | `/pages/scene` | `templates/pages/scene.json` | `sv-scene-showcase` | `SCENE_MOTHER`（**仅 `is_flagship` 商品有母模型**） |

**五条铁规**
1. 多语言前缀由平台注入（`/en-us/pages/bundles`），**协议里的规范写法永远不带 locale 前缀**；模板内跳转写法以 `docs/shopline.md` 实测的官方过滤器为准——**先探明再写，不猜**（A1 探针 P0）。
2. **前端禁止拼接任何 `/pages/...` 字面量**（门禁 [14]）。回母页 CTA 一律用 `A2 resolve().master_page_url`，或查 `contracts/routes.json`。
3. 改路由 = 破坏性变更，走 **§3 路由提案/废除流程**：handoff 点名 → `routes.json` 升 MAJOR → SUMMARY 第 2 段记录 → **旧路由保留重定向 2 个 rev**。
4. 业务线代号是 **`scene`**（不是 skin；历史文档里的 "skin 枢纽" 一词全部作废，统一称 **Scene 枢纽**）。
5. `templates/pages/*.json` 文件名 = 路径 slug 转连字符小写；**页面标题/面包屑/SEO 文案保持设计原样**，两者不许混。

### §2.1 命名不变量（唯一强制的路径规则）

1. `sections/<A>/<A>.html` —— **目录名 == 主文件名**，否则 templates 注册不上、编辑器调不出。
2. 模块名（目录/文件/block type）**禁点号命名空间**（`ui.search.x`、`*.zion.*` 类全废）；只用小写 + 连字符；**无固定前缀**（不强制 `sx-`/`sv-`，叫什么都行，一旦定了就是破坏性变更）。
3. private block **三处齐**：主文件 `{{#content "blocks" /}}` ⟺ schema `blocks[].type: "$b"` ⟺ 磁盘 `blocks/b.html`。`$` 只用于 private block 类型名，`public/` 静态引用不带 `$`。
4. `public/` 引用统一 `{{ 'x.css' | asset_url() }}`；区块私有 css/js 放同目录写 `./x.css`；**`public/` 禁 `.glb` / `.liquid`**。
5. 改名 = 破坏性变更，四处同改：目录名 + 主文件名 + 所有 `templates/*.json` 的 sections 键 + i18n 键前缀；必须 handoff 点名 + SUMMARY §2 记录。**禁止顺手 rename。**

---

## §3 路由与 Worker 配置：冻结 + **Cursor 提案权（须用户同意）**

### §3.1 冻结原则
**Worker 路由随代码源走，是常量，不是 handoff 里的临时配置项。**
- 增量开发过程中**不改**任何已上线路由与端点配置。
- 前端**只经** `SpaceVanta.api.get(key, path, params)` 调用，`key` 必须是 `contracts/endpoints.json` 已登记键。
- **硬禁**：在 `sections/ blocks/ components/ theme.config.json/ schema 设置项/ data-*` 里出现 `https://`、`/api/`、`workers.dev` 字符串（门禁 [13]）。

### §3.2 Cursor **有权提案**，但**无权生效**
Cursor 在开发中发现需要动集成面时，**必须提案、不得自行改**，提案写进 `handoffs/requests/cursor-to-user-<事由>.md`，五要素齐：

| 要素 | 内容 |
|---|---|
| ① 动作 | `ADD` 新 worker / `ADD` 新 API / `DEL` 废弃 worker 或路由 / `CHANGE` 主题页路由 |
| ② 为什么 | 对应哪份 handoff 哪一段（F-ID / 状态 / 占位符），不写"感觉需要" |
| ③ 影响面 | 谁调用、谁被删、`endpoints.json` / `routes.json` 哪几行变、前端哪几个 section 受影响 |
| ④ **不影响性证明**（DEL/CHANGE 必填） | 全仓引用扫描结果 + 十五门重跑结果 + 灰度/并存方案 + 回滚三步 |
| ⑤ 回滚 | 具体命令 + 回到哪个 rev / 哪个 R2 版本 |

**流程**：Cursor 提案 → **用户书面同意（在 request 文件里回 `APPROVED` 或口头说"同意"并由 Cursor 落痕）** → A3 改 `endpoints.json` / `routes.json` 并升版 → SUMMARY §2 记录 → 才允许施工。

### §3.3 三类动作的默认规则
- **ADD（建新 worker / 新店面-后台 API）**：提案 → 同意 → 登记（`endpoints.json` 加键，`status: active`）→ MINOR 升版 → 方可调用。**未登记即调用 = `BLOCKED_BY_CONTRACT`。**
- **DEL（废除 worker / 路由）**：提案 + **不影响性证明** → 同意 → 标 `status: deprecated` + `sunset_rev` → **并存期 2 个 rev 内旧路由必须仍可用** → 期满才下线（MAJOR 升版）。**确认不影响也不许即时删。**
- **CHANGE（改主题页路由 / 改端点路径）**：**不走"就地改"**，一律按「ADD 新的 → 并存 2 rev → DEL 旧的」两段式做。

### §3.4 `endpoints.json` 的语义
`url` 字段 = **A3 从 Worker 部署清单抄进来的事实**，不是待设计决策、不是可协商配置。
- 未抄入 → `null` → 该功能**静默关闭**（A1 走兜底子块），并标 `BLOCKED_BY_CONTRACT`。
- **Cursor 永不猜 `*.workers.dev` 域名。**

### §3.5 边缘能力池：**鼓励首次使用，禁止因"没做过"而不提**（用户 2026-11-25 拍板）

账户已含 **Workers Paid**（D1 / R2 / KV / Queues / Analytics Engine / Email Workers / VPC·mTLS / 自定义域 / Workers for Platform）。

> **允许因为"逻辑上更优"而首次使用一项尚未用过的 Cloudflare 能力；禁止因为"没做过"而不提案。**
> **唯一前提：逻辑成立 + 回退路线可用（§3.6）+ 用户 APPROVED。**

| 能力 | 我们最合适的落点（举例，非排期） | 首次使用门槛 | 强一致红线 |
|---|---|---|---|
| **Workers KV** | 地域 / 季节 / 促销文案等**读多写少**配置；`model-registry` Hot 路径缓存 | 低（**首选试点**） | 🔒 **禁放**价格/库存/运费/幂等键/订单状态 |
| **Analytics Engine** | Promote S0→S1/S2/S3 各段耗时、Hot Canvas 峰值、降级命中率 | **最低**（纯旁路，炸了零影响） | 只写不读，不得参与响应判定 |
| **Queues** | 加购后异步：埋点 / 退差价回算 / LOD 衍生 / 邮件触发 | 中 | **消费者必须幂等**（`bundle_commit_log.idempotency_key` 去重） |
| **D1** | 交易、幂等、审计快照 ✅ 已在用 | — | 五样强一致数据**只走 D1** |
| **R2** | 模型 / 商品卡 / 贴片，`assets.spacevanta.com` ✅ 已在用 | — | 版本路径不可变 |
| **Email Workers** | 订单 / MTO SLA 提醒 | 中高 | 需域验证 + 退订合规，提案单必写 |
| **VPC / mTLS** | Shopline Admin API、ERP 私网 | 高 | 涉密钥，**必须由用户亲自配**，Cursor 只出方案 |
| **Workers AI / Vectorize** | —— | 🔒 **冻结** | **G-1 口令前连提案都不接**；AI 永不吐交易事实 |

**提案三要素（写进 `PROP-NNN`，缺一即退回）**
1. **逻辑为什么成立**：数据形状（读多写少？最终一致可接受？）、写放大、命中率预估、成本量级。
2. **回退路线落在 §3.6 第几级**（必须指名，不许写"有兜底"三个字糊过去）。
3. **可观测 + 逃生闸**：接 Analytics Engine 打点（命名 `sv_<domain>_<metric>`）+ 一个 `?sv_<cap>=off` 总闸，**关掉即回上一级，无需重新部署**。

> **一句话刻进 `ownership.mdc`：「没做过」不是否决理由；「说不清回退」才是。**

### §3.6 Fallback 六级阶梯：**回退路线是交付物，不是安慰话**（用户 2026-11-25 拍板）

任何新能力 / 任何 async 取数，接入前必须先指明**自己落在第几级、失败掉到哪一级**：

```text
L0 边缘快路径     KV / Cache API 命中                       ← 最快，目标 ≤50ms
     ↓ miss 或 >800ms
L1 源计算         Worker 现算（D1 查询 / 规则纯函数）
     ↓ D1 异常或 >3s
L2 静态快照       R2 上的 versioned JSON（每次发布 / 每日构建）
     ↓ R2 不可达
L3 构建期内联     theme.config.json 的 last_known_good（随主题版本走）
     ↓ 也没有
L4 区块兜底子块   {{#content "blocks" /}} 里的 $fallback-list / $fallback-poster / $fallback-copy
     ↓
L5 静默不渲染     整块消失，页面**继续可购**
                  ⛔ 任何一级都不许出现：白屏 / 无限转圈 / {{PLACEHOLDER}} 裸露 / 假价格
```

**四条硬规**
1. **每一级自身必须是可用终态**，不允许任何一级是"loading…"。
2. **写路径不许静默降级成脏写**：KV / 队列写失败 → 进 **Queues 重试（幂等键去重）** → 3 次死信落 D1 `dead_letter` 表等人工处理。**`catch{}` 吞掉或只 `console.log` = 门禁 [15b] FAIL。**
3. **KV 最终一致 ⇒ 五样禁放**：价格、库存、运费、幂等键、订单状态。**只走 D1（强一致）**。KV 只放可容忍 ≤60s 陈旧的内容。
4. **总闸优先于代码**：新能力上线必须同时上 `?sv_<cap>=off`（对齐已有 `sv_season/motion/agent` 三闸），**30 秒可关回旧路径，不发版**。

**交付附带物**：每个 rev 的 `SUMMARY.md` 必须附一张 **降级表**（`谁 → L几 → 失败掉到 L几 → 访客看到什么`），缺行 → 门禁 [15a] FAIL。

---

## §4 模型与业务不变量（L1，定稿）

- **三条业务线并列**：`bundle` / `scene`（枢纽）/ `mto`。**Scene 线仅 `is_flagship = true` 的商品拥有母模型。**
- **母模型唯一**：独立页 Hero 一个，完整权限，**形状 + 颜色唯一真源，独占季节换肤**。
- **子模型全部同级、无大小**；**零独立换色权**，100% 派生母模型；母换肤 → 子同步展开。
- **活跃子** = 3D 直接业务；**沉睡子** = 近 2D poster + 虚线 silhouette，**`0` 个 GLB 请求**，poster ≤90KB。
- **沉睡点击 = 升维**：`S0 COLD_IDLE → S1 ≤80ms → S2 240ms 同机位同光比 ΔE≤2 → S3 HOT_LIVE`；失败停本地 poster + `View Full Poster`，**零转圈零白屏**；闲置 60s 或内存告警 → `S5` 显式 dispose 回基线 `±2`。
- **活跃子与沉睡子都强制挂「回母模型独立页」CTA**；URL **只能**来自 `A2 resolve().master_page_url`（查 `routes.json`），**前端禁拼**。子跳过去只获得**公开查看权**，不等于获得配置权。
- **母模型自身永不打材质 / 高光 / 接触阴影**，只存锚点 + 容差 + `seam_rail`；挂载序 **`A → B → C → A` 冻结**；`anchor_A/B/C` 的 `allowedSlots` 与 `6°/3mm` 容差冻结；顶盖 `SV` 零穿模三坐标冻结（`lidPivot` 板厚 0.08 / 顶面 `Y=+0.0400`；micro-plinth 底 `+0.0405` 高 `0.0035`；`SV` 组挂 `Y=+0.0440` 且 `boundingBox.min.y ≥ 0`）。
- 全站 **Hot Canvas ≤ 4**；`M-Proto` 每 SKU 恰好 1 份源几何，LOD0 ≤120k / LOD1 ≤45k / LOD2 ≤12k / poster ≤90KB。
- **资产域 `assets.spacevanta.com`（Cloudflare R2）**，**版本路径不可变**（`/<line>/<id>/<ver>/...`），回滚 = 指针回指，**不重传**。代码源与 `public/` **零 `.glb`**。
- Worker 只吐 **URL + 版本 + 权限**；呈现层保留 `{{PLACEHOLDER}}` 语义，真值由 Worker 边缘注入；**`hardcodedTransactionValues = 0`**。
- **DNA 令牌 `--svd-*` 只读**：`--sv-paper` / `--sv-paper-subtle` / `--sv-ink` / `--sv-seam-aura` 冻结禁动；季节皮肤**只改 `--sv-season-accent`**，且只用于图形/线，不用于正文。
- **AI 闸门停 G-0**：只登记 `SV_AGENT_<role>_<variant>_vNN` + ⌀24mm 虚线圈，`?sv_agent=off` 熔断不留位。**未收到「开 G-1」口令，严禁设计化身 / 起名 / 配色 / 接 `worker/ai/`。** AI **永不输出、推算、播报价格 / 运费 / 时效 / 库存 / 订单状态**（Fact 只来自 Shopline / Worker）。
- 总闸必须全链路真生效：`?sv_season=off` / `?sv_motion=off` / `?sv_agent=off`。
- 动效 `prefers-reduced-motion` 必须处理；`reduced-motion` 下升维改 0ms 淡切且已选零丢失。

---

## §5 十五门禁（全绿才出包；机器卡点，脚本 `scripts/check_gates.sh`）

```text
[1]  模块名禁点号           : sections|blocks|components 名含 "."（除扩展名）→ FAIL
[2]  section 同名双段       : sections/<A>/<A>.html 不成立 或 dir≠file → FAIL
[3]  private block 三处齐   : {{#content "blocks"}} ⟺ schema blocks[].type "$b" ⟺ blocks/b.html
                             任一缺 → FAIL；磁盘有 block 未被登记 → WARN（2 rev 后提示删）
[4]  schema 必带 presets    : 区块 {{#schema}} 无 presets → FAIL（编辑器「添加区块」里不可见，已踩坑）
[5]  schema 纯净            : schema 段命中 https|.glb|M-[A-Z]|#[0-9A-Fa-f]{6}|¥|＄|[0-9]+% → FAIL
[6]  模板语法白名单         : 出现 {% | {{!-- | 白名单外过滤器/helper → FAIL（见 STACK.md §A/§B）
[7]  零裸 hex / 零裸交易值  : 命中 #[0-9A-Fa-f]{6}（除 dna.css、PALETTE*.json）→ FAIL
                             命中 ¥|＄|HK\$|[0-9]+% off|满[0-9]|order by [A-Z][a-z]+ [0-9] → FAIL
[8]  i18n 闭合              : 每个 | t() 键在 i18n/en.json 存在；schema t: 键在 en.schema.json 存在；
                             options_N / presets_N 编号连续无断档 → 否则 FAIL
[9]  后缀与体积             : layout/sections=.html；components/blocks=.html|.css|.js；public 禁 .glb；
                             实测表未填前 public ≤60KB、section ≤80KB、poster ≤90KB；包 ≤10MB → 超限 FAIL
[10] 零 GLB 于 Cold         : 沉睡子路径出现 .glb 请求 → FAIL（S0 必须 0 请求）
[11] Checkout 触碰          : MANIFEST.checkout_touched=true 且无用户书面确认 → FAIL
[12] 降级可达               : 掐掉全部 Worker 后仍渲染（兜底子块/静默隐藏），白屏或抛错 → FAIL
[13] Worker 路由冻结        : 主题源码命中 https?:// | /api/ | workers.dev → FAIL
                             （唯一豁免 contracts/endpoints.json 与 sv-core.js 内部）；
                             api.get(key) 的 key 未登记 → FAIL
[14] 页面路由冻结           : 模板/区块出现 /pages/ 字面量 → FAIL（须查 routes.json 或 resolve()）；
                             templates/pages/*.json 不在 routes.json 白名单 → FAIL
[15] Fallback 可达性         : （§3.6 六级阶梯，本版新增）
     (a) 本 rev 每处 async 取数必须在 SUMMARY 降级表写明 L0→L? 落点，缺一行 → FAIL
     (b) 每个 await fetch / env.KV.get / env.D1.prepare 同层须有 catch 且命中 L2~L5；
         裸 catch{} 或仅 console.log → FAIL
     (c) 掐断 Worker+KV+R2 后实跑：白屏 / 无限转圈 / {{PLACEHOLDER}} 裸露 / 假价格 → FAIL
         （(c) 属人工闸门，见 §10 第 4 项；其余 a/b/d/e 由脚本静态卡）
     (d) 新能力接入但缺 ?sv_<cap>=off 总闸 → FAIL
     (e) 价格|库存|运费|幂等键|订单状态 出现在 KV 读写路径 → FAIL（强一致红线）
```
**zip 根层直接 `layout/ sections/ …`，不许再套一层文件夹。**；门禁全清单细则见 `STACK.md §F`。

---

## §6 四 Agent × 产权（**产权固定，路径不固定**）

详见 `agents.md` 与 `agents/{frontend,assets,backend,ai}.md`。速查：

| Agent | 唯一拥有 | 只读消费 | 禁动 |
|---|---|---|---|
| **A1 frontend** | 当次 handoff 指定的 `sections/ blocks/ components/ layout/ public/ i18n/` 子集 | `SpaceVanta.market/season/api` + `sv:data / sv:market / sv:season` | `worker/*`、`d1/*`、R2 结构、模型几何、端点地址 |
| **A2 model** | R2 前缀 `bundle/ scene/ mto/`、`manifest.json`、`model-registry`、`resolve()` | handoff 图纸 | 主题文件、Worker 业务码 |
| **A3 backend** | `workers/*` + `d1/migrations` 新增 + **`endpoints.json` 登记** | 模型 URL（从 assets-lock 读） | 历史 migration、他人 worker 内部逻辑、`checkout*` |
| **A4 ai** | `agents/ai.md` + `SV_AGENT_*` 登记位（G-0） | 各 Worker 只读事实 | 化身/命名/配色（G-1 前）、任何价格运费时效库存订单输出 |

**借调单**：跨产权一律落盘 `handoffs/requests/<from>-to-<to>-<事由>.md`（**口头不算**），写清要什么、依据 handoff 哪段、要到什么程度；被借调方回 `ACK` / `BLOCKED-*`。**路由/端点类变更走 §3.2 提案，不走普通借调。**

**数据槽铁律**：模板脚本**只监听** `sv:data / sv:market / sv:season`，**不自己读 `sv_ship_to`、不自己拼 worker 地址**；取数经 `SpaceVanta.api.get(key,path,params)`（3s 超时、永不 reject、60s 缓存、**仅 https**）；状态写 `data-sv-state = idle|loading|ready|error`；`[data-sv-live]` 元素只在 `ready` 显示；**兜底内容用 private block 实现**，取数失败访客看到的就是它。

**并行序**：A2 出 registry/lock → A3 按 lock 出契约 → A1 按契约渲染 → A4 只读挂 G-0 圈。逆向依赖 → `BLOCKED_BY_CONTRACT`。

---

## §7 开发目标与顺序：**由用户决定，协议不定义**（重要）

> **本协议不规定"先做哪个模板、这一轮做几条线"。** 排期权 100% 在用户手里。

1. **Cursor 的开工输入只有两个**：① 本次 handoff（`handoffs/incoming/` 里用户指定那份）；② 用户当场口述的路径/命名/范围。
   **Drive 里有什么文件，就开发哪个**——Cursor 不自行挑活、不按"依赖关系"自行排期、不因为"顺手"多做一个 section。
2. **遇到关联未就绪时 → mark 为后续处理，不停工硬等**：
   - 需要别的 Agent 产出但还没有（如 `worker/bundle` 未登记、A2 未出 registry）→ 在 SUMMARY §3 写
     `DEFERRED_TO_<AGENT>: <缺什么> · 依据 handoff 哪段 · 阻塞了哪个 F-ID`
   - **当前 handoff 内不受阻塞的部分继续做完并正常交付**，被阻塞的 F-ID 标 `pending`，用兜底子块保证 §5[12] 降级可达。
   - 同一件事**连续 2 个 rev 仍 DEFERRED** → 升级为 `BLOCKED_*` 显式问用户（防止静默烂尾）。
3. **用户可以一句话改序**："先做 MTO 的 S0→S3，bundle 放后面" → Cursor 立刻切，不需要改协议、不需要理由。
4. **协议只保证"无论按什么顺序做，十五门与红线都成立"**，不保证顺序本身。
5. **禁止**：Cursor 因为"Bundle 是主推"就抢先做 Bundle；因为"反正要建"就顺手把 scene 页也建了；因为"等 A3 太久"就自己在前端 mock 一个 worker 地址（→ 门禁 [13] FAIL）。

---

## §8 handoff 闭环（双套号 + 快照双写）

```
Gemini 出 handoff vN（八段，照 HANDOFF_TEMPLATE.md 填）
  → 用户批准 → 落 Drive <业务>/<模板>/HANDOFF_..._vN.md，并复制到 protocol/handoffs/incoming/
    → Cursor 第一动作：拉最新快照读 assets-lock.json，按锁版施工（不自动追新）
      → 十五门全绿 → 出包
        → 双写：Drive 快照【全量】 zip + MANIFEST + assets-lock + contracts-lock + blockers + rollback
                Git  protocol/handoffs/snapshots/<handoff-id>/v<rev>.md 【仅 SUMMARY，≤40行六段】
          → SUMMARY §3 原样上浮所有 BLOCKED_* 与 DEFERRED_TO_*
            → 落 handoffs/outgoing/ → 【用户点发送】 → Gemini 出 vN+1 → 回到顶部
```
- **`handoff vN`** = 设计侧图纸版；**`rev`** = 同一图纸下施工侧第几次交付。**两套号，SUMMARY 标题同行并列。**
- SUMMARY 六段固定：①这轮推进了什么（≤5条动词开头）②相对上轮变化 ③blockers + deferred 原样上浮 ④实测数据 ⑤建议 Gemini 下轮做什么 ⑥锁定态一行。
- **未回传 = `delivered_pending_feedback`，不算 done。**
- **停工码（只许停，不许先做后报）**：
  `BLOCKED_BY_DESIGN`（图纸缺）/ `BLOCKED_BY_CHECKOUT`（碰结账）/ `BLOCKED_BY_HANDOFF`（无路径无命名，问用户）/ `BLOCKED_BY_CONTRACT`（端点或路由未登记）/ `BLOCKED_BY_APPROVAL`（§3.2 提案未获同意）。
- **延迟码（不停工，mark 后续）**：`DEFERRED_TO_A1/A2/A3/A4`。

---

## §9 Checkout 冻结 → 详见 `checkout.lock`

结账全路由（cart → checkout → processing → 结果页）的**功能、DOM、样式、脚本注入、字段、中途重定向全线禁动**。
合发 / 分发（`Ship Together / Separately`）只在 **Cart 页**以属性透传实现（`worker/cart/dispatchIntent`），**进 Checkout 时 cart 已是最终态**。
真要碰 → `BLOCKED_BY_CHECKOUT` + 五问风险分析（触哪环 / Shopline 有无官方扩展点 / 能否前移 / 回滚降级 / 转化与支付合规）+ 用户书面确认 + Drive 落新版 handoff。

---

## §10 上线前人工闸门（机器测不了的三件）

1. **真实下一单**：涉及运费 / 收款 / 合发分发的改动，必跑一次真实支付再合。
2. **Shopline 后台上传校验**（本地跑不了）：报错原文回传；重点看 编辑器能开首页 · 主题设置出现「Space Vanta DNA」· 添加区块里有 `SV data slot` 与新区块 · 三个独立页可在编辑器选中 · 375px 零横向滚动。清单见 `docs/shopline.md §6`。
3. **体积探针**填 `docs/shopline.md §limits`：P1–P5 梯度包实测 `public/` 与 section 单文件上限，带实测日期 + OS 版本；填表前按 §5[9] 保守值卡。

---

## §11 动第一刀的五步（顺序由用户给，这里是"单块施工法"）

```text
1. 复制骨架当基线，不改既有文件
2. 用户给 handoff（指定做哪块）+ 当场口述路径，例：
   sections/sv-bundle-hero/sv-bundle-hero.html
   sections/sv-bundle-hero/blocks/{motion,tray-slot,cross-pool-card}.html
   public/sv-bundle-hero/motion.css
   没给 → BLOCKED_BY_HANDOFF，问，不许自造目录
3. A2 先出 registry 片段 + assets-lock → A3 出/确认契约（未登记则提案 §3.2）→ A1 渲染 → A4 挂 G-0 圈
4. 跑十五门 → 绿 → 出 zip（根层直出）+ MANIFEST + SUMMARY
5. SUMMARY 落 outgoing → 用户点发送 → Gemini vN+1
```
骨架里删什么**不用问**，只问 §0.5 那一句。

---

## §12 版本与变更

- 协议 MAJOR：红线/门禁增减、产权变更、路由废除 → **必须用户同意**
- 协议 MINOR：新增白名单过滤器/设置类型、新增端点登记、新增业务线
- 协议 PATCH：措辞澄清、示例补充
- 每次变更写 `docs/changelog.md`，并在 SUMMARY §2 里点名"协议从 vX 升到 vY，影响了哪些 in-flight handoff"

**当前 v1.1.0 变更**：① `scene` 取代 `skin`，Scene 枢纽路由冻结为 `/pages/scene`；② 新增 §3 Cursor 路由/配置**提案权（须用户同意）**与废除并存制；③ 新增 §7 **开发目标与顺序归用户 + DEFERRED 机制**；④ 门禁 12 → **15**（路由冻结两条）；⑤ 新增 `BLOCKED_BY_APPROVAL` / `BLOCKED_BY_CONTRACT` 与 `DEFERRED_TO_*`。
作废条款清单见 `docs/changelog.md`（防止旧口径复活：`sx-` 前缀、`skin` 命名、`/pages/Product collection sceneshowcase`、外部 `.schema.json` 文件、`${motion}` 插值写法、"端点待设计填"）。
