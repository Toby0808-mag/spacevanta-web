SpaceVanta L3 施工单索引与多 Agent 协作协议

本目录性质：只读真源（Read-Only Source of Truth）。 这里存放各流程/模型的 L3 工程移交单（HANDOFF）、资产登记表与 Agent 契约。 任何 Agent 不得就地修改已冻结的 HANDOFF；需要变更时，新建版本文件（v04 / v02）或提交《变更申请》，等总闸（用户）确认。
0. 优先级与裁决顺序（冲突时从上到下）

text
1) GROK_BUILD_CONTRACT.md        ← 宪法（唯一真源，最高优先级）
2) AGENTS.md                     ← 路由与禁碰层
3) handoffs/README.md            ← 本文件：分工 + 变更协议
4) handoffs/**/HANDOFF_*.md      ← 各流程 L3 施工单（段0/段2/段2.5/段3/段6 为冻结面）
5) handoffs/bundle/ASSET_REGISTRY.md ← 全站模型资产登记表（Agent B 唯一维护）
冲突处理铁律：低层与高层冲突 → 停手，输出《冲突点 + 两个方案的利弊 + 建议裁决》，等总闸确认。 严禁 Agent 自行裁决、静默兼容、或“先写了再说”。

1. 四 Agent 分工表

Agent	职责	唯一产出 / 真源	禁碰（硬红线）
A · 网页施工	Workers + 静态 Assets(wrangler)、页面骨架、Promote S0→S5 状态机、{{KEY}} 占位（textContent 渲染）、无障碍、fallback_poster	src/components/**、src/app 或 Workers 路由层	worker/* 内部逻辑、d1/migrations 历史、checkout*、PALETTE.json 锁令牌、PLACEHOLDERS.md
B · 模型装配与谱系	全站模型五层谱系、锚点名（逐字冻结）/挂载顺序/snap 容差/seam_rail、SKU→锚点映射、Hot 额度分配（≤4）、装配契约、资产登记表	handoffs/bundle/ASSET_REGISTRY.md、src/three/rig/*.ts（纯装配，无材质无光照）	实际建模与 GLB 导出（归 C）、页面实现（归 A）、智能体（归 D）、一切交易数据
C · 3D 资产生产	Blender→GLB 导出、draco/meshopt 压缩、LOD 预算、派生图（poster1600/thumb640/silhouette）、命名规范、R2 上传与自检报告	R2 桶 sv-models（https://assets.spacevanta.com）+ handoffs/**/ASSET_REPORT_*.md	锚点命名（归 B）、页面状态机（归 A）、智能体（归 D）、交易数据
D · Space Rental 智能体	G-0 插座 props 契约、智能体能力登记表、G-0→G-1 升级闸门、非 PII 意图埋点草案	handoffs/agent-D/G0_agent_slot_contract.md、CAPABILITY_REGISTRY.md	AI 永不输出运费/时效/价格/库存/订单状态/可购买性；未收到「开 G-1」口令不得接 worker/ai/*、不得设计化身/起名/配色
五层模型谱系（Agent B 管辖面）

text
L-Mother  母模型   Bundle_MOTHER ✅ / MTO_MOTHER ✅（0 三角面，纯逻辑装配根，永不上材质/高光/阴影）
L-Hot     活跃子   Hot 舞台挂载态（Child_Tray + 已挂载 M-Proto）      全站 Hot ≤ 4
L-Cold    沉睡子   Cold 卡 / 槽位芯片（poster + silhouette，0 次 GLB 请求）
L-Proto   商品原型 M-Proto：每 SKU 恰好 1 份源几何，三态同源派生（Law 1）
L-Deriv   派生图   poster1600 ≤90KB / thumb640 / silhouette（C 产出，B 登记）
当前冻结 / 待补状态（勿误读为“只有 Bundle 母模型”）

项	状态	归属
Bundle_MOTHER 锚点契约（anchor_A/B/C，A→B→C→A，6°/3mm，seam_rail 闭环）	✅ 已冻结	B
MTO_MOTHER 锚点契约（slot_base/slot_lid/slot_ring，base→lid→ring）	✅ 规范就绪	B
Child_Tray + 亮金属 SV 顶盖零穿模硬坐标（local Y 约束）	✅ 已定版	B
Bundle 活跃子模型装配细则（Hot 舞台挂载态）	⏳ 待 B 提交	B
Bundle 沉睡子模型细则（Cold 卡 silhouette 派生映射）	⏳ 待 B 提交	B
MTO 活跃 / 沉睡子模型装配与 slot 参数域	⏳ 待 B 提交	B
各 SKU M-Proto 实模（12 SKU 基线）	⏳ 全部 placeholder_only	C 生产 → B 登记
Space Rental 智能体	🔒 G-0 只登记（⌀24mm 虚线圈，?sv_agent=off 可熔断）	D
原则：母模型先行冻结锚点，不等子模型；子模型逐个到位、逐个登记、逐个激活，不阻塞页面开发。
2. 《变更申请》协议（跨 Agent 改动必填）

任何跨职责改动（锚点名 / R2 路径 / 资产状态 / 状态机 / 占位符键 / 路由前缀）必须先发申请，不得直接改码。

text
【申请】改什么 ID / 路径 / 状态：
【影响】A / B / C / D 哪几方，各自要改哪几个文件：
【为什么】业务或技术理由（一句到三句）：
【迁移】旧值如何过渡（双写期？别名？灰度？）：
【回滚】不行的情况下怎么退回去：
【验证】怎么证明改对了（验收命令 / 截图点）：
流程：申请 → 总闸确认 → 先在登记表写 proposed → 执行 → 验收 → 转 locked。 未确认前：只允许在登记表标 proposed，不许落代码。

3. 资产状态机（A / B / C 三方联动的唯一契约）

text
placeholder_only ──(C 三件套齐 + 自检过)──> ready ──(B 填 glbLod0Url)──> A 自动激活 S1..S5
三件套 = LOD0.glb + poster1600.webp(≤90KB) + silhouette.svg，缺一不许标 ready。
placeholder_only 时：Agent A 锁死 S0 COLD_IDLE，0 次 GLB 网络请求；点 [升维] 直接落 fallback_poster，保留已选配置，禁转圈/白屏/报错弹窗。
命名逐字冻结：SV_MP_<SKU>_lod0|lod1|lod2.glb、_poster1600.webp、_thumb640.webp、_silhouette.svg。 禁止 _final / _v3 / _new / _test2 等野后缀。
R2 路径：bundle/<SKU_ID>/…、mto/<SKU_ID>/…；域固定 https://assets.spacevanta.com，前端禁止硬编码其他源。
4. 占位符与交易层铁律（全 Agent 通用）

呈现层只保留 {{KEY}} 原文，用 textContent 渲染；缺失 / 超时 → 整块不渲染，禁编默认值、禁 MOCK 进 src/。
const MOCK 只允许存在于 artifacts/design/*.html 设计样机与 *.test.ts，build 期须可 tree-shake。
市场判定只认 URL 前缀 /{market}/ 与 sv_ship_to，绝不从 accept-language 猜；组件内禁硬编码 /en-us/。
本仓所有 HANDOFF 批次对交易层（pricing / shipping / bundle 计价 / mto / season / config）默认只读消费；写入类（如 cart-commit）须单独口头放行进入 B 组。
checkout* 全线【禁动】；d1/migrations 历史迁移【禁动】；PALETTE.json 的 lockedTokens（--sv-paper / --sv-paper-subtle / --sv-ink / --sv-seam-aura）只读【禁动】。

5. 脚手架与路径映射裁决（已定，不再争论）

施工单原文	本仓裁决	原因
Next.js app/[locale]/(shop)/…	Workers + 静态 Assets (wrangler)；app/[market]/… → src/pages/<market>/… + src/components/**	契约 v1.3.0 已锁定技术栈，不用 Next.js
默认 /en-us/ 硬编码	动态 /{market}/，从路由参数读取并透传	Hero 单段 0 多市场冻结表优先于示例默认值
/?sv_season=off / ?sv_motion=off / ?sv_agent=off	三个熔断参数必须实现，非法值按默认（season=off、motion=on、agent=on）	段 1 F-10 / F-11 验收项
6. 施工单索引

FLOW_ID	FREEZE_ID	文件	主责 Agent	批次
sv_flow_hero_bridge_v03	sv_home_herobridge_asset_v01	home-hero-bridge/HANDOFF_sv_flow_hero_bridge_v03.md	A（+B 供装配契约）	A 组 → B 组 → C 组
sv_flow_bundle_v01	sv_bundle_mother_v01_0	bundle/HANDOFF_sv_flow_bundle_v01.md	B（规范）+ A（呈现）	A 组 → B 组（需放行）→ C 组
—	—	bundle/ASSET_REGISTRY.md	B 唯一维护	持续
—	—	agent-D/G0_agent_slot_contract.md	D 唯一维护	停在 G-0
新 HANDOFF 入库规范（重要 · Gemini / 任何外部来源通用）

text
命名：  HANDOFF_sv_flow_<name>_vNN.md          （不改名，保留原文件名）
目录：  handoffs/<flow-domain>/                 （hero-bridge / bundle / mto / scene / rental-agent …）
必附：  段0 抬头(FLOW_ID/FREEZE_ID/批次) · 段2 状态矩阵 · 段2.5 冻结面 · 段3 文件落点 · 段6 验收表
禁入：  src/ 、任何 .html 设计样机、任何含真实 MOCK 数据的文件
索引：  入库同一次 commit 里，更新本文件第 6 节表格 + 填「主责 Agent」
冲突：  与契约/脚手架裁决冲突 → 先在本文件第 5 节加一行裁决，再让 Agent 动工
入库 Commit Message 模板：


docs(handoff): <FLOW_ID> L3 vNN 施工单入库 → handoffs/<domain>/ ；主责 Agent=<X>；批次=A
7. 状态机总闸（Promote 六态 · 全 Agent 共识）

text
S0 COLD_IDLE    poster1600 + 虚线 silhouette，0 GLB 请求        常驻（无实模时永久停驻）
S1 PROMOTE_ARM  卡片 scale(1.02) + 左缘 seam 强化               ≤80ms（无 JS → 开静态大图页）
S2 CROSSFADE    poster 1→0 / 3D 0→1，同机位同暖底 ΔE≤2          240ms（motion=off → 0ms）
S3 HOT_LIVE     <body> 顶层独立舞台 + 不可见 Mother 虚线锚点      首帧 ≤600ms 暖 / ≤1200ms 冷
S4 DEMOTE       回 poster；Canvas 不卸载，降 LOD1 停 rAF         120ms（Esc/关闭/滚出）
S5 COLD PARK    dispose 三件套（geometry/material/texture）       60s 闲置或内存告警 → 回 S0
fallback_poster 原地停 poster + 保留已选配置 + [查看大图]         LOD失败/WebGL不可用/placeholder_only
禁止出现的状态名：loading / error / success / processing / pending。 超时一律落 timeout_hidden（整块不渲染）或 fallback_poster，永不白屏、永不转圈、永不弹红框。

8. Agent 启动顺序（串行，别并行空转）

text
现在    ▶ Agent A：Hero-Bridge A 组（空壳 + 静态占位 + S0..S5 壳 + a11y + fallback_poster）
          Agent B：同步出 ASSET_REGISTRY 正式版 + Bundle/MTO 母→槽装配矩阵（纯文档即可）
验收过  ▶ Agent B：写 src/three/rig/*（Bundle 先 → 活跃/沉睡子模型细则 → MTO 随后）
有首模  ▶ Agent C：试点 1 个 SKU（导出→压→派生图→传 R2→自检报告）→ B 标 ready → A 自动升维
        ▶ Agent C：验收过再批量补其余 11 SKU
要动脑  ▶ 先发出口令「开 G-1」→ Agent D 出《G-1 能力边界与审查单》→ 总闸批准 → 才接 worker/ai/*
一句话：A 先跑通壳 → B 定谱系 → C 出首模 → D 等口令。新施工单 = 新 Agent；同一施工单的小修正 = Follow-up。

9. 快速自检（每次 commit 前跑）

bash
# 1) 裸交易值不得进 src
grep -rnE "¥|＄|\$[0-9]|HK\$|[0-9]+% off|满[0-9]|order by [A-Z][a-z]+ [0-9]" src/ && exit 1

# 2) 组件层不得出现裸 hex（PALETTE*.json 与 dna.css 豁免）
grep -rnE "#[0-9A-Fa-f]{6}" src/ --exclude="PALETTE*.json" --exclude="dna.css" && exit 1

# 3) MOCK 不得进 src（测试文件除外）
grep -rn "const MOCK" src/ --exclude="*.test.ts" --exclude="*.spec.ts" && exit 1

# 4) 禁止硬编码市场前缀
grep -rnE "/en-us/" src/ --exclude="*.test.ts" && exit 1

# 5) placeholder_only 阶段不得有 GLB 请求写死
grep -rnE "\.glb" src/ | grep -v "placeholder_only\|assetStatus\|test.glb.html" && echo "⚠️ 复核：是否所有 .glb 引用都受 assetStatus 门控？"
最后更新：四 Agent 分工上线（A 网页 / B 模型装配与谱系 / C 3D 资产生产 / D Space Rental 智能体）；G-0 只登记不实现。
