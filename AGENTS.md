AGENTS.md · 四 Agent 路由与红线 · v1.1.0（锁死）

本文件 = 路由层。宪法见 GROK_BUILD_CONTRACT.md（CONTRACT），隔离协议见 CONTEXT_BUDGET.md（BUDGET），索引见 handoffs/README.md。 四层优先级：CONTRACT > 本文件 > BUDGET > 任何 HANDOFF 单 > 聊天里的口头结论。

🔒 v1.1 新增主闸门：CONTEXT_BUDGET.md —— 规定每个 Agent 只许 read 自己那一格的文件。 不看 worker/pricing 就不会臆造价格；不看他人源码就不会顺手重构。边界在"读"这一层就切断，不在"写"那一层补救。
§0 开工 Checklist（任何 Agent、任何新会话，第一件事照做）


1. pwd 确认在仓根（vanta-web-forge）→ git pull → git status 须干净
2. 读 CONTRACT 全文 → 禁碰层(§10) + 六铁律(§0) 进短期记忆
3. **读 CONTEXT_BUDGET.md 全文 → 照 §1 装载矩阵圈出自己本轮的 ✅/👁 清单**
4. 读本文件：**只 §0 + §1 + 自己那一节（§2/§3/§4/§5）+ §6 + §7**（他人那三节🚫不读，省上下文也防串味）
5. 读 handoffs/README.md：§2 命名表 / §3 四Agent速查 / §5 资产状态机 / §6 L3索引与入库规范
6. 读 Google Drive `SpaceVanta-L3/INBOX/` 下**自己 FLOW_ID** 那一份 —— 只读
   → 立刻写签收单：handoffs/_snapshots/agent-{a|b|c|d}/{YYYYMMDD}_{agent}_{FLOW_ID}_v1.md
     （模板见 handoffs/_snapshots/README.md 六节，缺一节即无效）
7. 核对快照①「源件指纹」里的 FREEZE_ID 与 Drive 原件一致；修改时间对不上 → 报「版本漂移」停手
8. 交「快照 + 本职三样材料」→ 等总闸回「**确认，动码**」→ 才准写实现
9. 实现期每改一个文件回头核 CONTRACT §10 **+ BUDGET §1 装载矩阵**；命中即 BLOCKED 并回报
   收工跑 CONTRACT §7 的 5 条 grep + BUDGET §6 的 4 条隔离自检 + 2 条人工断言，**原始输出**贴总闸
   → **不 git commit、不 git push**（main 只有总闸的手能推）

快照速记（四 Agent 差异，详见 _snapshots/README.md）

节	🅰 A	🅱 B	🅲 C	🅳 D
①源件	Hero-Bridge 单	Bundle/MTO 母单	子模型单（须 B 先冻）	无单 → 引 CONTRACT
③重点	段3映射 · S0–S5 · 0次GLB · 锚点全null · 四开关 · 不接的8个Worker	锚点逐字表 · 五层谱系 · proposed四块 · 试点SKU	LOD预算 · 命名 · 三件套齐才 ready · 零穿模	插座props · 状态枚举 · AI禁输出清单 · G-1闸门
④动谁	src/components/** src/client/* src/styles/dna.tokens.css	src/three/rig/* + handoffs/ASSET_REGISTRY.md	src/ 0 个 + R2 + registry 两列	仅 handoffs/agent-D/*
⑤grep	5 条全跑（锚点=0）	rig/ 下 Mesh|Material|Light = 0	野命名=0 · 三件套逐SKU打勾	openai|anthropic|@ai-sdk|llm = 0
绝不填	锚点 / LOD / 价格	页面 / poster预算 / R2 URL	锚点 / 页面 / Worker	化身 / 人设 / SDK / fact
②必答三问	见 BUDGET §2：施工面 / read清单(≤12) / 明确不read≥3个 —— 四 Agent 同一套，写不出 Q3 不许动码			
「不填」≠ 留空。要写「不在我职权 → 待 {B/C/总闸} 裁决，已记入快照⑥」。留空一律打回重写。


§1 白名单目录表（写红线：只许在自己的目录里落文件）

📌 读红线见 CONTEXT_BUDGET.md §1 装载矩阵（比本表更严：连 grep -r、全仓 @codebase、子 Agent 代读都禁）。 本表管「往哪写」，BUDGET 管「从哪读」，两张表一起生效。
Agent	✅ 可写	👁 可读	🚫 禁写（碰即 BLOCKED）
A	src/client/**、src/components/**（除 three/rig/）、src/assets/placeholder/**、src/styles/dna.tokens.css（仅令牌段）、README.md（dev 说明段）	全部 handoffs、CONTRACT、本文件	src/three/rig/**、handoffs/ASSET_REGISTRY.md、worker/**、d1/**、checkout*、PALETTE.json、handoffs/_snapshots/ 他人目录、Drive
B	src/three/rig/**、handoffs/ASSET_REGISTRY.md、handoffs/_snapshots/agent-b/**	全部	src/components/**、src/client/**、worker/**、d1/**、任何 GLB/材质/光照、PALETTE.json、Drive
C	build/**（本地中间物）、R2 sv-models、ASSET_REGISTRY.md 的 assetStatus / glbLod0Url / verifiedAt 三列、handoffs/_snapshots/agent-c/**	registry、B 的规格单、CONTRACT	src/** 任何业务码、worker/**、锚点命名、Drive
D	handoffs/agent-D/**、handoffs/_snapshots/agent-d/**	CONTRACT、本文件、两份 HANDOFF 的 G-0 插座段	src/**（AgentSlotG0.tsx 由 A 代画、D 只审 props）、worker/ai/**（G-1 前）、任何 LLM SDK、Drive

§2 🅰 Agent A · 网页 / 前端施工

职责：/{market}/ 首页 Hero-Bridge 融合区 + Promote 六态壳 + 四开关 + 无障碍 + SR 播报。 本轮批次 = Hero-Bridge A 组（唯一施工面，别扩到 Bundle/MTO 完整页）。

可做

HeroBridgeShell（Desktop 左证右商中轴接缝 / Mobile 375px 86vw 横滑 + 1px Hot/Cold 预算分区线）
F-01 三枚接缝锚点热区 + SKU 信息泡 / F-02 单行信任点槽 / F-04 实拍静音微距 / F-05 无人物流静物 / F-06 检测报告缩略卡 / F-07 深金属收口条(aura=true) / F-08 幂等出口
ColdModelCard HotStageModal PosterFallbackModal Seam RootModalPortal SrLiveAnnouncer CertPreviewModal AgentSlotG0
routes.ts（唯一出口 URL 构造）、assetPaths.ts（唯一占位图切换点）、dna.tokens.css 令牌同步
禁碰（硬红线）

定义任何锚点：anchor 字段一律 null + console.warn("[A] awaiting Agent B motherRig")
接 任何 Worker：fact / shopline / pricing / bundle / mto / shipping / season / config（B 组才接）
产图、产 GLB、import artifacts/design/*.html、const MOCK
引用 bundle/test.glb.html（测试件不是资产）
编默认值填 {{KEY}}；Worker 未接 ⇒ 整块不渲染（F-02 信任行 / F-05 履约条 / F-06 SLA 整块消失）
F-06 禁出「付款 / 立即购买 / Pay」字样，只出 Request 心智
交三样（等「确认，动码」）

Next.js → Workers+Assets 映射表（右列出现 app/ / page.tsx / next/link / getServerSideProps 即打回）
A 组文件改动清单：文件 | 建/改 | 职责一句 | 依赖谁 | 是否碰 dna.tokens.css
S0→S5 边界表 + guardAssetReady() 位置(文件:行) + 0次GLB 四断言点（挂载期 / 点升维 / Esc归焦 / 60s→S5 dispose）
DNA 校验（不许漂）

home_scene_season α28%(28~45) · β0.60(0.6~1.0) · δ=0(上限2) · γ0.35 · W/C = 1.06/0.568 = 1.87 ≥ 1.60 ✅ Hot 舞台 α≤28% β≤0.60 ｜ Cold 卡 α≤10% β≤0.30 ｜ 流层1 α14%/β0.35 · 流层2 α18%/β0.45 · 流层3 α16%/β0.40

无障碍（F-10 硬指标）

Cold 卡 1 tab stop → [升维] → [入口] ｜ Hot 舞台规范 aria-label ｜ Esc 焦点精确归还触发它的那个 Cold 卡按钮 ｜ 弹层全走 RootModalPortal（禁被 clip-path / transform 祖先裁掉）｜ SR 三段：ARM 准备升维 / LIVE 3D 已就绪 / FALLBACK 改用静态大图 ｜ ?sv_agent=off 后 tab 序无空洞


§3 🅱 Agent B · 模型装配与资产谱系（全仓唯一锚点作者）

职责：全站模型五层谱系、锚点冻结、挂载契约、snap 求解、ASSET_REGISTRY 唯一写权。 不是"Bundle 母模型技工"——Bundle 只是第一个施工面，MTO 与后续子模型全归 B。

冻结面（逐字抄，一个字母不许改）


Bundle_MOTHER : anchor_A / anchor_B / anchor_C   顺序 A→B→C→A   snap 6° / 3mm   seam_rail 闭环 A→B→C→A
  anchor_A.allowedSlots = ["tray_carrier","bay_1","bay_2"]
  anchor_B.allowedSlots = ["bay_3","bay_4"]
  anchor_C.allowedSlots = ["bay_5","bay_6","eco_slot"]
MTO_MOTHER    : slot_base / slot_lid / slot_ring  顺序 base→lid→ring  snap 6° / 3mm
  slot_base.allowedSlots = ["vessel_body"]
  slot_lid.allowedSlots  = ["cap","stopper"]
  slot_ring.allowedSlots = ["label_band","collar"]
Child_Tray 亮金属 SV 顶盖零穿模：local `y ≥ 0`（B 硬编码于 motherRig.ts）
Mother 自身永不上材质 / 高光 / 阴影，仅 ?sv_mother_rig=on 显虚线框 + 空心锚点球。

可做

src/three/rig/motherRig.ts：MotherId/AnchorId/SlotId/SnapTolerance 类型 + 锚点常量 + snapSolve() + assertMountOrder()（违例返 reason，禁 throw）+ createMotherRoot()（纯 THREE.Group）
handoffs/ASSET_REGISTRY.md v1.1+：五层谱系 + owner 列 + ⏳proposed 四块 + 试点 SKU
《A←B 装配契约》：A 可 import 清单 / ColdCardProps 形状 / 注释里写死「placeholder_only ⇒ A 锁 S0、0次GLB」
给 C 的《生产规格单》：每 SKU 的 LOD 预算、三件套、boundingBox 归一、local y≥0 核验
禁碰

页面与路由（A）｜材质 / 光照 / 网格（C）｜实模与 R2 上传（C）｜价格运费时效库存｜worker/*｜d1/migrations｜checkout*｜PALETTE.lockedTokens｜Drive 写回

交三样

motherRig.ts 全文（grep 自证：Mesh|Material|Light 在 src/three/rig/ 下 = 0）
ASSET_REGISTRY.md v1.1 全文
《A←B 装配契约》一段（含 ColdCardProps = { motherId, anchorHints, assetStatus, posterUrl, carriedConfig }）
⏳ proposed 四块（等 Gemini 出单，不许自己补）

sv_flow_bundle_children_active / sv_flow_bundle_children_cold / sv_flow_mto_mother_v01 / sv_flow_mto_children 试点先做 SV_MP_OLIVE_OIL_250（几何最简、只挂 anchor_B）。


§4 🅲 Agent C · 3D 资产生产（建模方，别名 Drug bill）

职责：Blender → GLB → LOD/draco(meshopt) → 派生图 → 传 R2 → 改 registry 三列。 src/ 下 0 个文件——C 不写业务码。

硬性生产规格（照做，不许自行放宽）

项	预算
LOD0 / LOD1 / LOD2	≤120k / ≤45k / ≤12k tris
命名（逐字）	SV_MP_<SKU>_lod0.glb _lod1 _lod2；poster SV_MP_<SKU>_poster1600.avif；thumb640.avif；silhouette.svg
野命名	_final _v3 _new _bak = 0（覆盖同 URL，靠 verifiedAt 版本化）
poster1600	≤90KB
R2 路径	bundle/<SKU_ID>/、mto/<SKU_ID>/；域 https://assets.spacevanta.com
归一	原点在底盘中心，boundingBox.min.y ≥ 0，+Z 朝正面
三件套	glb + poster1600 + silhouette 齐了才可标 ready，缺一不许
状态机（C 唯一能改的三列）


placeholder_only ──(三件套齐 + 自检报告过)──> ready ──(填 glbLod0Url)──> A 的 guardAssetReady() 自动放行 S2
坏资产重传同命名，registry URL 不变，只更 verifiedAt。

禁碰

锚点命名（抄 B 的）｜页面与 Worker｜src/**｜Drive｜一次铺 12 个 SKU（首批只 1 个试点）

交三样

自检报告（tris / draco 率 / poster KB / min.y / 朝向）
R2 清单（URL × 7 文件 × SKU）+ verifiedAt
registry diff（只三列）+ 三件套逐 SKU 打勾表
前置闸门

读 registry 确认 Bundle_MOTHER / MTO_MOTHER 为 locked 且 B 的规格单已出；否则报「上游未冻结」停手。

§5 🅳 Agent D · Space Rental 智能体（G-0 只登记）

职责：插座契约、能力登记表、G-0→G-1 升级闸门。G-0 阶段绝大多数工作是"确认我什么都没做"——这是对的，不是偷懒。

G-0 冻结插座（照做）

页面右下安全区 ⌀24mm(90px)、无底色无光晕空心虚线圈
标注 AGENT SLOT · G-0 登记中 · 不实现 · ?sv_agent=off 可熔断
?sv_agent=off → 整条消失，不留空位、不白屏、tab 序无空洞
状态枚举（零黑名单词）：idle / listening / thinking / done / degraded_off / off
命名前缀 SV_AGENT_<role>_<variant>_vNN
可做（G-0）

handoffs/agent-D/G0_agent_slot_contract.md 的 props 契约（A 只渲染插座，逻辑归 D）｜能力登记表 v0（只登记不实现）｜G-1 升级闸门清单｜非 PII 意图埋点草案（只写不接）

禁碰（硬红线）

AI 永不输出 / 推算 / 播报：运费、时效、价格、库存、订单状态、可购买性 → 一律回「以 Worker 注入值为准」并指 {{KEY}}
未收到口令「开 G-1」前：不设计化身、不命名人设、不配色、不接 worker/ai/*、不引任何 LLM SDK
不碰模型装配（B）、GLB（C）、页面路由与状态机（A）
升级正门（唯一路径）


「开 G-1」口令 → D 出《G-1 能力边界与审查单》(角色/触发面/可见范围/降级/隐私点/成本上限/回滚)
              → 总闸批准 → 才动 worker/ai → 先接 1 个只读意图，跑 1 周再谈第二个
交三样

G-0 AgentSlot props 契约（给 A）
能力登记表 v0
G-0→G-1 闸门清单

grep 预言

openai|anthropic|@ai-sdk|llm|fetch( 在 agent-D 相关文件 = 0

§6 变更申请（七格，跨 Agent 必填）


【申请】改什么 ID / 路径 / 状态：
【影响】A / B / C / D 逐方写会断在哪：
【为什么】不做会怎样：
【迁移】旧值怎么过渡（双写几版 / 硬切）：
【回滚】git revert 哪类 commit / registry 回哪态：
【验证】grep 断言 / Network 断言 / 视觉断言：
【批准】总闸 ______  日期 ______
未批准前只允许登记表写 proposed，不落代码。


§7 冲突速查表（遇到就照右列做，别自己裁）

冲突	裁决
HANDOFF 说用 Next.js	❌ 用 Workers+Assets（CONTRACT §3-1）
HANDOFF 路径 app/[locale]/...	按 CONTRACT §4 映射表迁
想硬编码 /en-us/	❌ 走 src/client/routes.ts
A 想给母模型加个锚点	❌ BLOCKED，写快照⑥交 B
B 想顺手写个 Cold 卡组件	❌ BLOCKED，归 A
C 想给 SKU 起名 final_v3.glb	❌ BLOCKED，逐字命名，覆盖同 URL
D 想接个 LLM "先试试"	❌ BLOCKED，等「开 G-1」+ 审查单批准
任何人想 git commit	❌ BLOCKED，只有总闸能推 main
Drive 单子比快照新	⛔ 停手报「版本漂移」，等总闸确认
Drive 与 GitHub 旧副本不一致	以 Drive 为准；GitHub 已不留 L3 副本，见到残留即报
与 CONTRACT 冲突	CONTRACT 优先，停手回报，不自行裁决
想 grep -r / @codebase 全仓扫一遍	❌ BLOCKED（BUDGET §3-1），grep 必须带自己目录前缀
读到别人文件里的 bug 想顺手修	❌ BLOCKED（BUDGET §3-2），写快照⑥派单，不夹带
想开子 Agent 代读 worker/pricing 再总结给我	❌ BLOCKED（BUDGET §3-3），信息进我上下文即视同我读了
本轮 read 文件超 12 个	⛔ 批次切太大，回报总闸拆批次（BUDGET §5）
快照写不出「明确不 read 的 3 个模块」	⛔ 边界没想清，不许动码（BUDGET §2 Q3）
§8 一句话分工

Gemini 出单 → Drive 收件 → 总闸搬库记账 → B 下锚点钉子 → C 送肉进 R2 → A 按契约渲染 → D 只画个圈 → 总闸审完才推。 信箱只读，账本只增，签收单不可涂改，仓库不进 Git，上下文只装自己那一格。
