agents.md — 四 Agent 产权 / 协作 / 裁决

放置位置：protocol/agents.md 单 Agent 详细职责卡在 protocol/agents/{frontend,assets,backend,ai}.md（按需读，不必每次全读）。 核心一句话：产权固定，路径不固定。 谁拥有什么写死在这里；东西放哪、叫什么，当次 handoff 或用户当场说。
§1 四 Agent 与产权总表

Agent	代号	唯一拥有（写权）	只读消费	禁动（碰即借调/提案）
前端	A1 frontend	当次 handoff 指定的 sections/ blocks/ components/ layout/ public/ i18n/ templates/ 子集	SpaceVanta.market/season/api、sv:data / sv:market / sv:season 事件、routes.json、endpoints.json（只读键名）	worker/*、d1/*、R2 结构与版本、模型几何/锚点、端点 URL、checkout 全路由
资产	A2 model	R2 前缀 bundle/ scene/ mto/ _derived/、manifest.json、contracts/model-registry.json、resolve() 实现	handoff 图纸（Appendix A/B/C）、PALETTE、锚点冻结面	主题 .html/.css/.js、Worker 业务码、D1、价格/规则
后端	A3 backend	workers/{market-festival,shipping-intelligence,bundle,mto,season,cart,privilege} 内部逻辑、d1/migrations 新增、contracts/endpoints.json 登记	A2 的 assets-lock（模型 URL+版本）、Shopline 商品/订单只读 API	历史 migration、他人 worker 内部逻辑、checkout*、主题模板、R2 写
编排	A4 ai	agents/ai.md、SV_AGENT_* 登记位（G-0 只登记）	各 Worker 的只读事实输出	化身设计/命名/配色（G-1 前）、worker/ai/ 实现、任何价格/运费/时效/库存/订单状态输出

§1.1 产权三条铁律

一物一主：任何文件 / 表 / 前缀 / 端点，有且只有一个 Agent 能写。
跨区必经书面：借调单落 handoffs/requests/，口头不算、顺手改算违规。
并行不撞文件：按 §3 的序并行；同一文件永不双写。


§2 借调单（普通跨域协作）

路径：protocol/handoffs/requests/<from>-to-<to>-<事由>.md

markdown
# 借调 A1 → A2 · 需要 hero_master 的 resolve 返回形状
- 依据 handoff : H-001 v1 段2（master_ready 态）/ F-02
- 要什么       : resolve(slot=hero_master, id=Bundle_MOTHER) 返回 {url,ver,perm,poster,master_page_url}
- 要到什么程度 : 字段冻结即可，实现可后到；本 rev 只要契约不求真数据
- 我需要的时间 : rev1 内；拿不到 → F-02 走 $fallback-poster（§降级矩阵）
- 回执         : A2 填 ACK / BLOCKED_BY_* + 预计 rev
规则

借调方不许自己造一个临时实现（不许 A1 前端 mock worker 地址、不许 A3 猜 R2 路径）。
被借调方 1 个 rev 内必须回执（ACK 或 BLOCKED + 原因）。
借调单没回执 → 借调方按降级矩阵走兜底，并在 SUMMARY §3 写 DEFERRED_TO_<A?>。
连续 2 个 rev 未回 → 升级为 BLOCKED_* 显式问用户（防静默烂尾）。


§3 路由 / 端点 / 集成面变更：提案制（≠ 普通借调）

见 PROTOCOL.md §3 与 STACK.md §E。摘要：

Cursor 有权提案（ADD worker/API、DEL 废弃、CHANGE 路由），无权生效。
提案文件：handoffs/requests/cursor-to-user-<动作>-<事由>.md，五要素（动作/为什么/影响面/不影响性证明/回滚）。
用户 APPROVED 才生效；DEL/CHANGE 一律 ADD新 → 并存2rev → DEL旧，确认不影响也不许即时删。
未获批准就改 = BLOCKED_BY_APPROVAL，该次交付判无效。


§4 标准并行序（只是默认节奏，不是排期）

⚠️ 开发哪一块、什么顺序，由用户决定（PROTOCOL §7）。本节只在"某一块已选定"之后描述其内部依赖流。

A2 出 registry 片段 + assets-lock（模型 URL/版本/权限/poster/master_page_url）
  ↓ 锁版
A3 按 lock 校验/登记 endpoints，出或确认接口契约（未登记 → 提案 §3）
  ↓ 契约
A1 按契约 + handoff 渲染（内联 schema + presets + t() 键先落 en.json）
  ↓ 十五门
A4 只读挂 G-0 ⌀24mm 虚线圈（?sv_agent=off 熔断），不接任何能力
  ↓
十五门全绿 → 出包 → SUMMARY 双写 → outgoing → 用户点发送 → Gemini vN+1
逆向依赖（A1 等 A3、A3 等 A2 时）：不停工，用兜底子块把该 F-ID 标 pending，其余照交；写 DEFERRED_TO_*。 禁止：A1 自己 mock 端点、A3 自己猜 R2 路径、A2 自己定价格规则、A4 自己给数字。


§5 冲突裁决表（谁听谁）

冲突	裁决
handoff 图纸 ⟷ 协议红线	协议赢 → BLOCKED_BY_* 问用户，不由 Cursor 选边
handoff 图纸 ⟷ Shopline 平台能力	平台赢 → BLOCKED_BY_DESIGN，回 Gemini 改图（附平台事实截图）
用户当场口述 ⟷ 已落盘 handoff	用户当场赢，但 Cursor 必须当场把口述写进 handoffs/incoming/ 的补丁段并注明时间，防失忆
A2 的 assets-lock ⟷ A1 想用的版本	lock 赢；要升版 → 新 handoff，不自动追新
A3 端点现状 ⟷ Cursor 想改路径	现状赢 → 走 §3 提案
性能 ⟷ 视觉	先过 §F 硬指标（LCP≤2.5s / Hot≤4 / 375 零横滚），再谈视觉；过不了 → BLOCKED_BY_DESIGN 回图
DNA 令牌 ⟷ 设计稿给的裸 hex	令牌赢；裸 hex 不许落码，回 Gemini 换成令牌语义（门禁 [7]）
效率 ⟷ 停工	永远停工赢。宁可停一次，不做错一版。

§6 数据槽铁律（A1 唯一合法取数姿势）

html
<div data-sv-slot data-sv-kind="bundle" data-sv-key="bundle" data-sv-path="/pool"
     data-sv-params="market, country, locale" data-sv-refresh-on="market"
     data-sv-state="idle">
  <!-- 兜底内容：private block，取数失败/未配置时访客看到的就是它 -->
  {{#content "blocks" /}}
  <div data-sv-live>{{{ bundle_render_hook }}}</div>   ← 仅 ready 时显示
</div>
模板脚本只监听 sv:data / sv:market / sv:season；不自己读 sv_ship_to（唯一读法 SpaceVanta.market.get().country，底层形状由 A3 适配，换形状不改模板）。
不拼 worker 地址（门禁 [13]）；只 SpaceVanta.api.get(key, path, params)。
data-sv-state 四态 idle|loading|ready|error 必须有对应 UI；error 不许白屏不许转圈到底。
兜底内容用 private block 实现，不是空 div、不是"即将上线"。
首屏不阻塞：sv-core.js 3s 超时、永不 reject、60s 缓存、仅 https。
端点是 null（未登记）→ 该槽保持 idle + 兜底可见，静默，不报错不闪Toast。


§7 禁动清单（任何 Agent，命中即 BLOCKED）

checkout* 全路由与结账行为（→ checkout.lock）
d1/migrations/ 中早于本次 handoff 指定编号的历史迁移文件
PALETTE*.json 锁定令牌与 dna.css 里 --sv-paper / --sv-paper-subtle / --sv-ink / --sv-seam-aura
Bundle_MOTHER / MTO_MOTHER / SCENE_MOTHER 的锚点名、allowedSlots、6°/3mm 容差、挂载序 A→B→C→A、顶盖零穿模三坐标
他人 Worker 的内部逻辑（只读消费其输出）
R2 已发布版本路径（/<line>/<id>/<ver>/ 不可变；要改就发新 ver，旧的不覆写）
contracts/*.json 的字段形状（改 = MAJOR 升版 + 用户同意）
AI 的 G-0 闸门（未收到「开 G-1」口令，禁做化身/命名/配色/接 worker/ai/）

§8 每 rev 的 Agent 侧交付物（缺一不算完）

Agent	必交
A1	主题源码 diff + 十五门日志 + public/ 新增件体积 + i18n 新增键清单 + 降级实测截图（关 Worker 后）
A2	model-registry 片段 diff + manifest.json 新版本 + assets-lock.json + 面数/体积达标表（LOD0≤120k / poster≤90KB）
A3	端点/契约 diff（endpoints.json 版本升）+ Zod schema + 幂等键策略 + 超时/降级矩阵 + D1 migration（新增文件，不改历史）
A4	G-0 登记位状态（idle/off 二态）+ 零数字断言（本 rev 未输出任何价格/运费/时效/库存/订单事实）
四份汇总进 MANIFEST.json，再由 SUMMARY（≤40 行六段）上浮给人 / Gemini 读。
