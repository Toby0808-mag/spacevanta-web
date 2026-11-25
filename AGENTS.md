AGENTS.md · 四 Agent 路由与运行规则

版本：v1.0.0（锁死）｜配套：GROK_BUILD_CONTRACT.md v1.0.0（冲突时契约优先）

打开这个文件你要在 10 秒内知道三件事：我是谁、我能写哪些目录、我开工前要先交什么。
0. 开工前 60 秒 Checklist（所有 Agent 通用）

## 动工前强制流程（所有Agent）
1. 读Git根：AGENTS.md + GROK_BUILD_CONTRACT.md
2. 读Drive：对应HANDOFF（路径由Gemini指定，只读）
3. 产出：handoffs/_snapshots/{agent}_{YYYYMMDD_HHmm}_summary.md
   - 包含：段3映射摘要、状态机/锚点/资产边界、禁碰确认、Drive文件版本标识
   - 不写Drive，不改契约，不commit（等你审）
4. 交“动工前摘要+原定材料（如A的三样）”→等你回“确认，动码”

## Drive交互规则
- 只读，绝不写回（含不创建临时文件）
- 发现Drive与Git快照冲突→停手，报“版本漂移”，等你裁决


text
[ ] 1. git pull（本地必须最新；有冲突停手报总闸，禁自行 --ours/--theirs）
[ ] 2. 读 GROK_BUILD_CONTRACT.md（宪法）
[ ] 3. 读 AGENTS.md（本文件，找自己的段）
[ ] 4. 读 handoffs/README.md 第6节索引 → 按 FLOW_ID 定位本轮施工单
[ ] 5. 确认 GitHub 快照存在：handoffs/<domain>/HANDOFF_<FLOW_ID>_vNN.md
[ ] 6. 若有 Drive 链接 → 只读比对；与快照不一致 → 报「版本漂移 vNN(Git) vs vMM(Drive)」停手
[ ] 7. 确认施工单不在 _draft/、且含 FLOW_ID+FREEZE_ID+段2矩阵+段6验收表
[ ] 8. 交「三样」→ 等「确认，动码」→ 写码 → 跑 5 条 grep → 贴输出 → 等审 → **总闸 commit**
缺任一条契约 → 停手，输出「缺什么·建议谁补·我去哪找」，禁止臆造。

1. 路由总表

Agent	名称	可写目录（白名单）	唯一真源产出	只读依赖	禁碰
A	网页/前端施工	src/components/**（除 three/rig/）、src/client/**、src/pages/**、src/styles/dna.tokens.css（仅令牌段）、wrangler.toml、README.md	routes.ts、assetPaths.ts、Hero-Bridge 组件树	B 的 motherRig.ts 类型与常量、registry 的 assetStatus	Worker 内部、锚点字面量、GLB、任何 AI
B	模型装配与资产谱系	src/three/rig/**、handoffs/bundle/ASSET_REGISTRY.md、handoffs/**/*.md（契约类）	motherRig.ts（全仓唯一锚点真源）、装配契约、registry	Gemini 的 HANDOFF 段2.5、C 的资产检查报告	页面/路由、材质光照网格、实模、价格、AI
C	3D 资产生产	R2 桶 sv-models、handoffs/bundle/ASSET_REGISTRY.md（仅改自己 SKU 行与状态）、reports/asset-check/*.md	GLB/LOD/KTX2/poster/silhouette + 检查报告	B 的命名规范与 LOD 预算、registry 现状	HANDOFF 撰写、锚点改名、页面、Worker、Git 里的二进制
D	Space Rental 智能体	handoffs/agent-D/**、未来 src/agent-slot/**（G-1 后）	G-0 插座 props 契约、能力登记表、G-1 闸门清单	A 渲染的 <AgentSlotG0> 插座	一切 fact 输出、化身/人设/配色、LLM SDK、worker/ai/*（无口令）
1.1 接线点（唯一，不许私开第二条）


B ──export motherRig.ts──> A（import 消费，禁改）
B ──生产规格单──> C ──上传R2+改registry: ready──> A 自动激活 S1→S4（A 不改码）
Gemini ──HANDOFF(Drive)──> 总闸 ──搬入GitHub+索引──> A/B/C/D 各取所需
D ──AgentSlotG0 props 契约──> A（只画 ⌀24mm 圈，零 AI 逻辑）
B 未交付前：A 的 Cold 卡一律 anchor: null + console.warn("[A] awaiting Agent B motherRig")，严禁自编 anchor_A / slot_base / bay_1。



2. Agent A · 网页/前端施工

本轮批次：Hero-Bridge A 组（唯一范围）

可做

Workers+静态 Assets 路由、/{market}/ 前缀解析、routes.ts 出口构造、Promote S0→S5 状态机壳、ColdModelCard、HotStageModal、PosterFallbackModal、Hero 双端骨架（Desktop 左证右商中轴接缝 / Mobile 375px 86vw 横滑+1px Hot/Cold 分区线）、F-01~F-08 各层、AgentSlotG0（只画圈）、SrLiveAnnouncer、四开关、a11y 焦点管理、dna.tokens.css 令牌同步。

本轮 Bundle / MTO 页

只建路由空壳 + Cold 卡用 anchor:null stub。不实现 6 格编排、不算价、不加购、不接 Worker。

禁碰

worker/* 内部逻辑、d1/migrations、checkout*、PLACEHOLDERS.md、PALETTE.json 的 lockedTokens、src/three/rig/**（B 的地盘）、*.glb、任何价格/运费/时效/库存字面量、artifacts/design/*.html import。

交三样（写码前）

Next.js → Workers+Assets 映射表：左列 = HANDOFF 段3 原路径，右列 = 本仓真实落点，逐条不许漏，右列出现 app/、page.tsx、next/link 即打回。
A 组文件改动清单：每文件 新建/改 · 职责一句话 · 依赖谁 · 被谁依赖 · 是否碰 dna.tokens.css。
S0→S5 边界表：每态的 渲染块 / 数据来源 / 可点控件 / 降级目标；S2/S3 标 unreachable + 写出守卫函数名（禁“碰巧没请求”）；0 次 GLB 的 4 个自动化断言点（挂载 / 点升维 / Esc / 60s dispose）。
a11y 硬指标

Cold 卡 1 tab stop → [升维] [入口]；Esc 焦点精确归还触发它的那个按钮（不是 body）；弹层全走 RootModalPortal；SR 三段播报 ARM/LIVE/FALLBACK；?sv_agent=off 后 tab 序无空洞。


3. Agent B · 模型装配与资产谱系

管辖五层

L-Mother（Bundle_MOTHER ✅ / MTO_MOTHER ✅）· L-Hot（全站 Hot ≤4）· L-Cold（0 GLB，poster+silhouette）· L-Proto（每 SKU 恰好 1 份源几何，Law 1 一夫一妻）· L-Deriv（poster/thumb/silhouette，C 产出、B 登记）

冻结面（逐字，改名=major 破坏性变更）


Bundle_MOTHER : anchor_A / anchor_B / anchor_C   顺序 A→B→C→A   snap 6°/3mm   seam_rail 闭环 A→B→C→A
  anchor_A.allowedSlots = ["tray_carrier","bay_1","bay_2"]
  anchor_B.allowedSlots = ["bay_3","bay_4"]
  anchor_C.allowedSlots = ["bay_5","bay_6","eco_slot"]
MTO_MOTHER    : slot_base / slot_lid / slot_ring  顺序 base→lid→ring  snap 6°/3mm
  slot_base:["vessel_body"]  slot_lid:["cap","stopper"]  slot_ring:["label_band","collar"]
Child_Tray + 亮金属 SV 顶盖：local Y 零穿模硬坐标（冻结）
当前进度（别当成“只有 Bundle 母模型”）

✅ Bundle_MOTHER / MTO_MOTHER 锚点契约 locked
✅ Child_Tray 零穿模坐标 locked
⏳ proposed（待 B 逐个定义，不阻塞 A）：Bundle 活跃子模型装配细则 / Bundle 沉睡子模型 silhouette 派生映射 / MTO 活跃子模型 slot 参数域 / MTO 沉睡子模型派生映射
⏳ 12 SKU + MTO 族 M-Proto 全 placeholder_only，等 C 出实模
本轮交付

src/three/rig/motherRig.ts — 常量 + 类型（MotherId/AnchorId/SlotId/SnapTolerance）+ 纯函数 snapSolve() / assertMountOrder()（违规返 reason，不 throw）+ createMotherRoot()（纯 THREE.Group，零材质零光照零网格）
handoffs/bundle/ASSET_REGISTRY.md → v1.1（五层表 + owner 列 + proposed 四块 + 试点 SV_MP_OLIVE_OIL_250）
《A←B 装配契约》— A 能 import 什么 / ColdCard props 形状 / placeholder_only ⇒ 锁 S0 写进注释供 A 断言
铁律

Mother 自身永不上材质/高光/阴影（仅 ?sv_mother_rig=on 显虚线框+空心锚点球）；一 SKU 一源几何三态派生；锚点改名走变更申请；陌生 SKU/锚点不发明，先出登记申请。

4. Agent C · 3D 资产生产（建模方）

生产规格（逐字命名，禁 _final/_v3/_new）


SV_MP_<SKU>_lod0.glb  ≤120k tris
SV_MP_<SKU>_lod1.glb  ≤45k tris
SV_MP_<SKU>_lod2.glb  ≤12k tris
SV_MP_<SKU>_poster1600.webp ≤90KB
SV_MP_<SKU>_thumb640.webp
SV_MP_<SKU>_silhouette.svg
R2 路径：sv-models / bundle/<SKU_ID>/... | mto/<SKU_ID>/...
域：https://assets.spacevanta.com
draco/meshopt 压缩；boundingBox.min.y ≥ 0（零穿模自证）；中心点与朝向归一；贴图 ≤2K。

状态流转（唯一通道）

placeholder_only ──(三件套齐 + 自检过)──> ready ──(填 glbLod0Url)──> A 自动激活 三件套（glb + poster1600 + silhouette）缺一不许标 ready。

每单必附《资产检查报告》

handoffs/../reports/asset-check/SV_MP_<SKU>.md：面数 / 贴图尺寸 / 文件体积 / 中心点朝向 / bbox / LOD 衰减比 / R2 URL / 三件套齐否。

禁碰

锚点命名（B）、页面与状态机（A）、智能体（D）、HANDOFF 撰写（Gemini）、任何二进制进 Git、价格运费。

试点

首批只做 1 个 SKU：SV_MP_OLIVE_OIL_250（几何最简、只挂 anchor_B）。验收过再批量。


5. Agent D · Space Rental 智能体（G-0 冻结）

G-0 = 只登记，不实现化身、不接 AI

页面右下安全区 ⌀24mm(90px) 无底色无光晕空心虚线圈 + 标注 AGENT SLOT · G-0 登记中 · 不实现 · ?sv_agent=off 可熔断
状态枚举（零黑名单词）：idle / listening / thinking / done / degraded_off / off
命名前缀 SV_AGENT_<role>_<variant>_vNN
对 A 只出 props 契约（status / label / onDismiss?），A 只画圈，零 AI 判断、零 SDK import
硬红线

AI 永不输出/推算/播报：运费、时效、价格、库存、订单状态、可购买性 → 一律回「以 Worker 注入值为准」并指向对应 {{KEY}}。 未收到总闸口令 「开 G-1」 前：不设计化身、不命名人设、不配色、不碰 worker/ai/*、不引 LLM SDK。

开 G-1 的正门

① D 出《G-1 能力边界与审查单》（能力面 / 隐私与 PII / 成本上限 / fact 只读证明 / 回滚路径）→ ② 总闸批准 → ③ 才动 worker/ai。

6. 五条 grep + 两条人工断言

见 GROK_BUILD_CONTRACT.md §6。Agent 交码必须贴原始输出，不许只写「已通过」。

7. 冲突速查表（遇到就照这行做）

冲突	裁决
HANDOFF 段3 写 Next.js 路径	Workers+Assets 胜，A 出映射表
HANDOFF 默认 /en-us/ vs 多市场表	多市场表胜，动态 /{market}/
A 想自己定锚点	B 胜，A 改 anchor:null + warn
C 想标 ready 但 poster 缺	拒收，三件套齐才 ready
D 想接 LLM 做导览	无「开 G-1」口令 → 停
Drive 版与 GitHub 快照不一致	GitHub 胜，报版本漂移给总闸
施工单缺段6验收表	draft，全员不得开工
契约与施工单都沉默	不发明，出变更申请等总闸
8. 一句话记住

Gemini 出纸，B 定钉，C 出肉，A 装场面，D 只留插座；Drive 收件，Git 记账，R2 放肉；Agent 交 diff，你按合并键。
