GROK BUILD CONTRACT · v1.1.0（锁死）

本文件是 SpaceVanta 前端仓的宪法层。与任何施工单、任何 Agent 输出、任何聊天结论冲突时，以本文件为准。 改本文件 = 破坏性变更，必须走《变更申请》(见 AGENTS.md §6)，总闸（用户）确认后才动。 生效日：2026-11-25。真源位置：GitHub 仓库根 GROK_BUILD_CONTRACT.md。
§0 六条不可协商铁律

无契约不施工。没有 FLOW_ID + FREEZE_ID + 段2状态矩阵 + 段6验收表（定稿四项）的 L3 单，任何 Agent 不得臆造路径映射、锚点、SKU、价格字段。缺一项 → 停手报「无契约」。
Agent 永不 commit main。A/B/C/D 只交 diff 与自检输出；git commit / git push 只有总闸的手能按。崩了永远一行 git revert <sha> 回来。
锚点单一作者。全仓只有 Agent B 能写 anchor_A/B/C、slot_base/lid/ring 与 bay_*。A/C/D 的 src/ 下 grep 这些字面量必须为 0。
placeholder_only ⇒ 0 次 GLB。资产未 ready 时锁 S0_COLD_IDLE，全页 .glb 网络请求数为 0；点[升维]跳过 fetch 直落 fallback_poster。S2/S3 属 unreachable，需显式守卫函数，不许靠"碰巧没请求"。
Git 存约定，R2 存肉，Drive 是信箱。
GitHub = 契约 + 索引 + 快照（文本，可 diff）
R2 (sv-models / assets.spacevanta.com) = GLB / KTX2 / poster / silhouette（永不进 Git）
Google Drive SpaceVanta-L3/ = Gemini 投 L3 单的只读收发室（Agent 只读，永不写回）
铁律 6 · 上下文隔离（v1.1 新增）：每个 Agent 只许 read CONTEXT_BUDGET.md §1 装载矩阵里 标 ✅/👁 的文件。禁全仓 grep -r、禁 @codebase 全库问答、禁开子 Agent 代读、禁"顺手修别人的 bug"。 越界读取未落码 = L1 自查记录；已改动 = L2 还原并停手；已 push = L3 交总闸 revert。

理由：读到了就会臆造。把 worker/pricing 挡在上下文外，比写十遍"不要编价格"都管用。

§1 三存储分工（唯一口径）


Gemini ──HANDOFF.md──> Drive/INBOX ──总闸核对定稿四项──> GitHub 索引登记
                            ↑ 只读·永不写回                    │
                            └──── Agent 报「版本漂移」停手 ←────┘

Agent B ──motherRig.ts(唯一锚点真源)──> Agent A ──Hero-Bridge S0/S1/S5──> 总闸审 diff ──> push
Agent B ──生产规格单──> Agent C ──GLB+poster+silhouette──> R2 ──registry:ready──> A 自动升维
Agent D ──⌀24mm 插座 props──> Agent A（零 AI）      ──等「开 G-1」口令才接 worker/ai
存哪	放什么	谁写	谁读	进 Git?
GitHub	本契约 / AGENTS.md / handoffs/README.md / ASSET_REGISTRY.md / _snapshots/ / src/	总闸推；B 写 registry；A/B/C/D 写 src 各自的	全体 Agent	✅ 是
Google Drive SpaceVanta-L3/	INBOX/HANDOFF_*.md（Gemini 的 L3 单）、ARCHIVE/	仅 Gemini 投、总闸归档	全体 Agent 只读	❌ 否
R2 sv-models	*.glb *.ktx2 poster1600.* thumb640.* silhouette.svg	仅 Agent C	A 按 registry URL 取	❌ 否（禁进 Git）
Drive 三条硬规则

只读：Agent 不得在 Drive 创建 / 修改 / 移动 / 重命名任何文件，含"临时笔记""我的理解.md"。
版本漂移即停手：读到的 Drive 修改时间 ≠ 自己上次快照记录的时间 → 停手，输出 ⚠️ 版本漂移 {FLOW_ID}：Drive 已更新至 {新时间}，我上次快照 {旧时间}。请总闸确认后我再读。 绝不自行挑新版或旧版。
GitHub 不留 L3 副本：handoffs/home-hero-bridge/、handoffs/bundle/ 已删除。GitHub 只留 README 索引表 + _snapshots/ 签收单。冲突时以 Drive 原件为准，但必须停手等裁决。

Drive 三条硬规则

只读：Agent 不得在 Drive 创建 / 修改 / 移动 / 重命名任何文件，含"临时笔记""我的理解.md"。
版本漂移即停手：读到的 Drive 修改时间 ≠ 自己上次快照记录的时间 → 停手，输出 ⚠️ 版本漂移 {FLOW_ID}：Drive 已更新至 {新时间}，我上次快照 {旧时间}。请总闸确认后我再读。 绝不自行挑新版或旧版。
GitHub 不留 L3 副本：handoffs/home-hero-bridge/、handoffs/bundle/ 已删除。GitHub 只留 README 索引表 + _snapshots/ 签收单。冲突时以 Drive 原件为准，但必须停手等裁决。
§2 角色与交付物总表

角色	属于	交付物	落点	绝不交付
Gemini	外部 L3 交付方（不在 A/B/C/D 内）	HANDOFF_*.md 工程移交单（纯文档）	Drive INBOX/	图片 / GLB / KTX2 / 代码
Agent A	Cursor · 网页施工	src/client/*、src/components/**、src/styles/dna.tokens.css	GitHub	锚点 / GLB / MOCK / Worker 接线
Agent B	Cursor · 装配谱系	src/three/rig/motherRig.ts、handoffs/ASSET_REGISTRY.md	GitHub	页面路由 / 材质光照网格 / 实模
Agent C	Cursor · 3D 资产（建模方）	GLB+LOD+压缩+派生图 + R2 上传 + registry 两列	R2	移交单 / 页面 / 锚点命名
Agent D	Cursor · Space Rental 智能体	handoffs/agent-D/*（G-0 仅登记）	GitHub	化身 / 人设 / LLM SDK / 任何 fact 输出
Grok（Projects / 本对话）	参谋	指令文本 / 文档全文 / 审图 / 冲突裁决	聊天里	永不直接碰仓库
Grok Build	—	👋 已退役	—	本项目内禁止再用于生成代码
总闸（用户）	唯一合并权	审 diff → git commit / push	GitHub	—
Grok Build 退役声明

骨架已立（.gitignore、wrangler 入口、契约三层、handoffs/ 结构、AGENTS 路由），Build 模式的唯一价值「从零打桩」已用完； 它在云端沙盒生成、够不到本仓、且读不到 .cursor/rules 与本节禁碰层，继续用必然分叉。 → 本项目内代码施工 100% 走 Cursor Agent A/B/C/D。仅当未来开完全无关的新项目时可用它打桩，打完立刻交 Cursor 接管。


§3 裁决表（总闸已裁定，Agent 不许翻案）

#	议题	裁决	理由
1	脚手架	Cloudflare Workers + 静态 Assets (wrangler)，不用 Next.js	边缘静态优先；无 SSR 需求；少一层构建
2	Next.js 路径映射	所有 app/[locale]/... app/[market]/(shop)/page.tsx components/X/* public/* 一律按下表迁移	见 §4
3	市场 market	动态 /{market}/：en-us en-gb en-au en-ca en-sg en-hk + 扩展位。只从 URL 前缀 + sv_ship_to 取，禁从 accept-language 猜，禁硬编码 /en-us/，全走 src/client/routes.ts	猜市场 = 错价错运费
4	资产占位	registry 全 placeholder_only ⇒ 锁 S0_COLD_IDLE、0 条 .glb。poster/silhouette 用 src/assets/placeholder/，路径集中 src/client/assetPaths.ts 一处	换 R2 只改一个文件
5	R2 现状	sv-models / assets.spacevanta.com 仅有 bundle/test.glb.html —— 连通性测试件，不是资产，任何组件禁止引用；正式上线前删	别把测试件当 SKU
6	业务占位符	{{KEY}} 保留原文、textContent 渲染；Worker 未接 ⇒ 整块不渲染。禁编默认值、禁 const MOCK 进 src/、禁 import artifacts/design/*.html	假数据比空数据更危险
7	交易事实	价格 / 运费 / 时效 / 库存 / 订单状态 / 可购买性 只来自 Shopline / Worker 注入。任何 Agent（含 D 智能体）永不推算、永不播报、永不兜底	合规红线
8	设计令牌	色只从 var(--sv-*) 来，src/ 下裸 hex = 0；PALETTE.json 的 lockedTokens 只读	DNA 不漂
9	季节开关	?sv_season=off 只覆写 --sv-seam / --sv-accent / --sv-season-icon 三令牌回暖纸态；绝不碰 --sv-paper / --sv-paper-subtle	纸态是底色不是季节
10	智能体	G-0 只画 ⌀24mm(90px) 无底色无光晕空心虚线圈 + AGENT SLOT · G-0 登记中 · 不实现 · ?sv_agent=off 可熔断。零 SDK、零接口、零人设。升级需显式口令「开 G-1」 + D 出《G-1 能力边界与审查单》+ 总闸批准	插座与能力分离

§4 Next.js → Workers+Assets 映射（Agent A 照此填右列）

原 Next.js 路径（HANDOFF 段3）	本仓真实落点	备注
app/[market]/(shop)/page.tsx（Hero 区）	src/components/home-hero-bridge/HeroBridgeShell.tsx + worker 入口 src/index.ts Assets 兜底	纯静态+边缘，禁 SSR 逻辑
app/[locale]/... 其它路由	src/client/routes.ts 静态路由表	一个文件收口
components/HeroBridge/*	src/components/home-hero-bridge/*	A 组施工目录
components/primitives/*	src/components/primitives/{Seam,RootModalPortal}.tsx	弹层必须挂 <body>
public/hero-poster.*	src/assets/placeholder/* → 经 src/client/assetPaths.ts	非 GLB
next/link / router.push	src/client/routes.ts 唯一出口构造器	组件内拼字符串 = 打回
getServerSideProps / useSearchParams(路由)	URLSearchParams 读 ?sv_*；market 从路径段取	禁 accept-language

§5 Agent 七步启动协议（任何会话、任何 Agent，第一件事）


1. pwd 确认在仓根 → git pull → git status 须干净
2. 读本文件（全文）→ 禁碰层进短期记忆
3. 读 AGENTS.md（§0 Checklist + 本职那一节）
4. 读 handoffs/README.md（§2 命名表 / §5 状态机 / §6 索引与入库规范）
5. 读 Drive/INBOX 下**自己 FLOW_ID** 那一份 —— 只读
   → 写 handoffs/_snapshots/agent-{a|b|c|d}/{YYYYMMDD}_{agent}_{FLOW_ID}_v1.md
6. 对照 FREEZE_ID 与快照「源件指纹」；不一致 → 报「版本漂移」停手
7. 交「快照 + 本职三样材料」→ 等总闸回「确认，动码」→ 才准写实现
   → 实现完跑 §7 自检，原始输出贴总闸 → **不 commit**

§6 变更申请协议（跨 Agent 改动必填，七格）

markdown
【申请】改什么 ID / 路径 / 状态：
【影响】A / B / C / D 哪几方（逐方写会断在哪）：
【为什么】不做会怎样：
【迁移】旧值怎么过渡（几个版本、双写还是硬切）：
【回滚】不行怎么退（git revert 哪类 commit / registry 状态回哪）：
【验证】怎么证明改对了（grep 断言 / Network 断言 / 视觉断言）：
【批准】总闸：______   日期：______
未批准前只允许在登记表写 proposed，不落代码。

§7 提交前自检（五条 grep + 两条人工，原始输出必须贴总闸）

bash
# 1) 裸 hex 色值 → 期望 0（只许 var(--sv-*)）
grep -rnE '#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b' src/ --include=*.ts --include=*.tsx --include=*.css | grep -v 'dna.tokens.css' | wc -l

# 2) 硬编码市场 → 期望 0（全走 routes.ts）
grep -rn '/en-us/' src/ | wc -l

# 3) 假数据 → 期望 0
grep -rn 'const MOCK\|MOCK_DATA\|fakePrice\|dummySku' src/ | wc -l

# 4) GLB 引用 → 期望 0（含 test.glb.html；A/C/D 均为 0，B 的 rig/ 下也应为 0）
grep -rn '\.glb' src/ | wc -l

# 5) 锚点越权 → A/C/D 期望 0；B 仅在 src/three/rig/motherRig.ts 内出现（定义处计数须等于契约条目数）
grep -rnE 'anchor_[ABC]\b|slot_(base|lid|ring)\b|bay_[0-9]' src/components src/client src/styles | wc -l
两条人工断言（grep 测不出，必须口头交代）

A1 · 0 次 GLB：wrangler dev → DevTools Network 过滤 .glb → ①首屏挂载 ②点[升维] ③Esc 关闭归焦 ④挂满 60s 进入 S5，四个时点均 0 条。
A2 · 焦点归还：Esc 关闭 Hot 舞台后，焦点精确回到触发它的那个 Cold 卡按钮（不是 <body>、不是首个 tabbable）。



§8 Promote 状态机契约（A 消费，B/C 供料）

态	名称	渲染块	数据来源	可点控件	降级目标	placeholder_only 下
S0	COLD_IDLE	Cold 卡（poster+silhouette，α≤10% β≤0.30）	registry 静态字段	[升维][入口]	—	✅ 默认锁死于此
S1	COLD_ARMED	Cold 卡 + 接缝呼吸	本地 carriedConfig	[升维][入口]	→S5	✅ 可达（跳过 fetch）
S2	PROBING	探活中	HEAD .glb	取消	→S5	⛔ unreachable · 守卫 guardAssetReady()
S3	STREAMING	LOD0 渐进	R2 流式	取消	→S5	⛔ unreachable · 同上守卫
S4	HOT_LIVE	Hot 舞台（α≤28% β≤0.60，全站 Hot ≤4）	motherRig + M-Proto	全交互	→S5	⛔ 需 assetStatus==="ready"
S5	FALLBACK_STATIC	PosterFallbackModal（保留 carriedConfig + 查看大图 + SR「改用静态大图」）	本地占位	[查看大图][关闭]	—	✅ S1 直落此态
守卫必须显式（不许靠"碰巧没发请求"）：

ts
// src/components/promote/HotStageModal.tsx
function guardAssetReady(st: AssetManifestEntry): 'S2' | 'S5' {
  if (st.assetStatus !== 'ready' || st.glbLod0Url === null) return 'S5'; // placeholder_only → 直落
  return 'S2';
}
§9 全局开关（F-10，A 组必须全实现，一个不许漏）
开关	行为	边界
?sv_motion=off	全部补间 / crossfade 0ms 直切	状态机与焦点序不变；同 prefers-reduced-motion
?sv_season=off	季节三令牌整条不渲染，回暖纸态	只动 --sv-seam / --sv-accent / --sv-season-icon
?sv_agent=off	AgentSlotG0 整条消失	不留空位、不白屏、tab 序无空洞
?sv_mother_rig=on	显 Mother 虚线框 + 空心锚点球	生产默认 off；B 未交付时 A 允许 no-op + console.info("[A] motherRig pending B")
§10 禁碰层总表（命中即 BLOCKED，停手回报，不许"顺手改一下"）


worker/fact/*  worker/shopline/*  worker/pricing/*  worker/bundle/*
worker/mto/*   worker/shipping/*  worker/season/*  worker/config/*   （内部逻辑，本轮纯只读）
worker/ai/*                                                          （等「开 G-1」）
d1/migrations/*（含全部历史）
checkout*/*
PLACEHOLDERS.md
PALETTE.json 的 lockedTokens
artifacts/design/*.html                                              （样机，禁 import）
*.glb *.blend *.ktx2 *.avif                                          （进 R2，不进 Git）
handoffs/_snapshots/ 下的历史快照                                     （只增不改不删）
Google Drive SpaceVanta-L3/ 下任何文件                                （只读）


§11 回滚规则

场景	动作
A/B/C/D 交的码审不过	不 merge、不 commit；Agent 在原 diff 上改，历史不留脏 commit
已 push 后发现问题	git revert <sha>（禁 reset --hard 推 main），并在 handoffs/README.md §6 索引表标 REVERTED
registry 标错 ready	B 把状态退回 placeholder_only + 填《变更申请》+ 通知 A（A 侧靠 guardAssetReady() 自动回 S0/S5，无需改码）
锚点改名	破坏性变更：七格申请 + 全 Agent 影响面 + 迁移版本；未批准前旧名继续用
Gemini 单子改版	总闸重搬 + 新快照 _v2.md；Agent 见版本漂移自动停手
R2 资产坏	C 重传同命名（禁 _final/_v3/_new），registry 不动 URL 只动 verifiedAt
§12 版本

版本	日期	变更
v1.0.0	2026-11-25	首版锁死：五铁律 / 三存储分工 / Drive 只读+版本漂移 / Grok Build 退役 / 裁决表 10 条 / 七步协议 / 变更申请七格 / 5grep+2人工 / S0–S5 契约 / 四开关 / 禁碰总表 / 回滚
