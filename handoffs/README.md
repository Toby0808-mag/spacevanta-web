handoffs/README.md · L3 施工单索引 · 入库规范 · Agent 分工

版本：v1.0.0｜配套：GROK_BUILD_CONTRACT.md v1.0.0 / AGENTS.md v1.0.0

本文件是所有 Agent 找施工单的唯一入口。 规则一句话：Gemini 投 Drive → 总闸核对 → 原样搬进本目录 → 同一次 commit 更新第 6 节索引。
1. 三存储分工（Agent 必读）

位置	放什么	谁写	Agent 权限
Google Drive SpaceVanta-L3/	Gemini 投的 L3 施工单（中转收件箱）	仅 Gemini	只读；永不在 Drive 创建/改/删/改名
GitHub handoffs/	契约 + L3 快照（唯一真源）+ 索引	仅总闸	只读施工单；ASSET_REGISTRY.md 仅 B 写、C 改自己 SKU 行
R2 sv-models	GLB / KTX2 / poster / silhouette	仅 Agent C	A/B/D 只通过 registry 拿 URL，禁直连猜路径
Drive 目录约定


SpaceVanta-L3/
├── _draft/      未定稿（缺 FLOW_ID/FREEZE_ID/段2/段6 任一项）→ 全员禁开工
├── INBOX/       已定稿待入库 → 总闸核对后搬 GitHub
└── ARCHIVE/     已入库的原件归档（总闸搬完移进来，标 _archived_vNN）
版本漂移处理（唯一动作）

Drive 里 v05、GitHub 快照 v04 → 停手，输出：


⚠️ 版本漂移：FLOW_ID=sv_flow_xxx  Git=v04 / Drive=v05
请求总闸：确认 v05 是否定稿 → 搬入并 commit → 我再开工。
（我不自行选用任一版本）


2. 命名对照表（口误收敛，唯一口径）

正式名	也常被叫成	角色	只交付	落点
Gemini	Jimmy 奶 / Jimmy 奶泡 / 吉米	外部 L3 交付方（不在 A/B/C/D 内）	HANDOFF_*.md 纯文档	Drive INBOX → 本目录
Agent A	A 减 A / 网页那个	网页/前端施工	Workers+Assets 组件	src/
Agent B	A 减 B / 装配那个 / 母模型那个	全站模型装配与谱系	motherRig.ts + registry	src/three/rig/ + handoffs/bundle/
Agent C	Drug bill / 抓 bill / Groq Bill / 建模那个	3D 资产生产	GLB/LOD/poster → R2	R2 + 检查报告
Agent D	Space Rental 智能体 / G-0	智能体登记	插座 props 契约 + 能力表	handoffs/agent-D/
Grok / Projects	我 / 参谋	出指令、审图、裁决	文本（不碰仓库）	对话
Grok Build	Build 模式	❌ 已退役	—	本项目禁用（见契约 §2.1）
总闸	你	唯一合并权	搬单、审 diff、push	—
两条禁混装铁律

Gemini 只交文档：不出图片、不出 GLB、不出 KTX2、不出代码。
Agent C 只交资产走 R2：不出 HANDOFF、不改名锚点、不写页面。
Git 存「约定」，R2 存「肉」，Drive 只是「收发室」。


3. 四 Agent 分工速查

Agent	白名单目录	开工前交什么	最大禁区
A · 网页	src/components(除 three/rig)、src/client、src/pages、src/styles/dna.tokens.css(令牌段)	映射表 / 文件清单 / S0-S5 边界+0次GLB自证	锚点字面量、Worker 内部、GLB
B · 装配	src/three/rig、handoffs/bundle/ASSET_REGISTRY.md	五层谱系表 / 母→槽→SKU 矩阵 / A←B 契约	页面路由、材质光照、实模
C · 资产	R2 桶 + reports/asset-check/ + registry 自己那几行	生产规格确认 + 资产检查报告	三件套不齐标 ready、野命名
D · 智能体	handoffs/agent-D/（G-1 后才开 src/agent-slot/）	G-0 props 契约 / 能力表 v0 / G-1 闸门清单	任何 fact 输出、无口令接 LLM
并行规则：A ∥ B 可同时开工，接线点在 B 的 motherRig.ts；B 未交 → A 用 anchor:null stub，互不阻塞。


4. 变更申请模板（跨 Agent 唯一通道）


【申请】改什么 ID / 路径 / 状态：
【归属】触及哪层契约、谁的产出：
【影响】A：… / B：… / C：… / D：…（无影响也要写“无”）
【为什么】不做会怎样（须有可验收口径）：
【迁移】旧值怎么过渡、已有引用怎么改：
【回滚】git revert 哪类提交 / registry 状态退回哪：
【验证】跑什么断言算过：
确认前登记处只写 proposed，不落代码、不改状态、不改名。

5. 资产状态机（B 登记 / C 推进 / A 消费）


placeholder_only ──(C: 三件套齐 + 检查报告过)──> ready ──(填 glbLod0Url)──> A 激活 S1→S4
      │                                              ↑
      └── 此时 A 锁 S0_COLD_IDLE，S2/S3 unreachable ──┘
试点首模：SV_MP_OLIVE_OIL_250（几何最简、只挂 anchor_B）
test.glb.html = R2 连通性测试件，非资产，上线前删
全 12 SKU + MTO 族当前 glbLod0Url = null

6. 📥 L3 施工单入库规范（Gemini 每交一单，照这走）

6.1 定稿判定（四项全有才算定稿）

FLOW_ID ✅ · FREEZE_ID ✅ · 段2 状态矩阵 ✅ · 段6 验收表 ✅ 缺任一项 → 丢 Drive/_draft/，文件名加 _draft，全员禁开工。

6.2 入库五步（总闸执行，Agent 不得代做）

text
① Gemini 投 Drive/SpaceVanta-L3/INBOX/HANDOFF_sv_flow_<name>_vNN.md
② 总闸核对：四项定稿标记 + FLOW_ID 唯一 + 无裸价/运费字面量 + 与契约无冲突
③ 原样搬入 handoffs/<domain>/HANDOFF_sv_flow_<name>_vNN.md   ← 文件名禁改，改=丢谱系
④ 同一次 commit 更新本文件 6.3 索引表（填 FLOW_ID/FREEZE_ID/主责Agent/批次/状态）
⑤ Drive 原件移到 ARCHIVE/ 并改名加 _archived_vNN
6.3 L3 索引表（唯一权威清单）

FLOW_ID	FREEZE_ID	施工单路径	主责 Agent	批次	状态
sv_flow_hero_bridge	sv_home_herobridge_asset_v01	handoffs/home-hero-bridge/HANDOFF_sv_flow_hero_bridge_v03.md	A（B 供锚点 / C 供资产）	A 组	🟢 已入库·待 A 交三样
sv_flow_bundle	sv_bundle_mother_v01	handoffs/bundle/HANDOFF_sv_flow_bundle_v01.md	B（A 建空壳 / C 供资产）	母模型冻结	🟢 已入库·待 B 出 motherRig v1
sv_flow_bundle_children_active	—	⏳ Gemini 待交	B → C	后续	⚪ 未提交
sv_flow_bundle_children_cold	—	⏳ Gemini 待交	B → C	后续	⚪ 未提交
sv_flow_mto_mother	sv_mto_mother_v01（锚点已冻结，单待补）	⏳ Gemini 待交	B	后续	🟡 锚点已冻·单未到
sv_flow_mto_children	—	⏳ Gemini 待交	B → C	后续	⚪ 未提交
sv_flow_agent_g0	—	handoffs/agent-D/G0_agent_slot_contract.md（本仓自建占位）	D	G-0	🟢 占位·只登记不实现
新单入库 = 在表尾加一行；状态词只允许：⚪未提交 / 🟡部分 / 🟢已入库 / 🔵施工中 / ✅已验收 / ⏸暂停 / ❌作废。
6.4 入库 Commit Message 模板（照抄填空）


docs(handoff): <FLOW_ID> vNN 入库 — <一句话范围>

- FREEZE_ID: <...>
- 主责: Agent <X> ｜ 批次: <A组/B组/...>
- Drive 原件: <ARCHIVE 链接> ｜ 定稿核验: FLOW✅ FREEZE✅ 段2✅ 段6✅
- 冲突裁决: <若有，写“契约§x 胜”；无则写“无”>
6.5 按类型分流（别再往 handoffs 里塞错东西）

Gemini / 别人给你的	去哪	谁碰
L3 工程移交单 HANDOFF_*.md	handoffs/<domain>/	总闸搬，Agent 读
L1/L2 视觉与架构图	docs/design/	只读参考，禁 import 进 src/
模型说明 / 装配规格 Markdown	handoffs/<domain>/MODEL_<名>.md + registry 加一行	B 登记
GLB / KTX2 / poster / blend	❌ 永不进 Git、永不进 Drive 当真源 → R2	仅 C
资产检查报告	reports/asset-check/*.md	C 写，B/A 读
契约类改动	根目录 *.md + 变更申请	仅总闸 merge

7. 目录结构（当前应长这样）


.
├── GROK_BUILD_CONTRACT.md      ← 宪法（Git only）
├── AGENTS.md                   ← 路由与红线（Git only）
├── wrangler.toml
├── src/
│   ├── index.ts                worker 入口 + Assets 兜底 + market 解析
│   ├── client/{routes,assetPaths}.ts
│   ├── components/
│   │   ├── primitives/{Seam,RootModalPortal}.tsx
│   │   ├── promote/{AssetManifestTypes,ColdModelCard,HotStageModal,PosterFallbackModal}.tsx
│   │   ├── home-hero-bridge/*.tsx
│   │   └── agent-slot/         （G-1 后才建）
│   ├── three/rig/motherRig.ts  ← ⭐ B 独占，全仓唯一锚点真源
│   ├── assets/placeholder/     本地占位 poster（≤90KB），换 R2 只改 assetPaths.ts
│   └── styles/dna.tokens.css   仅令牌
├── handoffs/
│   ├── README.md               ← 本文件
│   ├── bundle/
│   │   ├── HANDOFF_sv_flow_bundle_v01.md
│   │   └── ASSET_REGISTRY.md   ← B 独占维护（C 只改自己 SKU 行）
│   ├── home-hero-bridge/
│   │   └── HANDOFF_sv_flow_hero_bridge_v03.md
│   └── agent-D/
│       └── G0_agent_slot_contract.md
├── reports/asset-check/        C 的检查报告
├── docs/design/                L1/L2 图，禁 import
├── d1/migrations/              🔒 历史冻结
└── checkout*/                  🔒 禁碰


8. Agent 读单顺序卡（贴在每个人脑门上）

Agent	读哪几段就够
A	段0 DNA · 段1 意图 · 段2 状态矩阵 · 段2.5 冻结面（只取类型，不取锚点值）· 段3 路径 · 段4 内容 · 段6 验收
B	段0 · 段2.5 冻结面（母模型/锚点/seam/零穿模）· 段6 验收
C	段2.5 的 LOD/贴图/命名预算 · ASSET_REGISTRY.md 自己那几行 · B 的生产规格单
D	段2.5 的「G-0 冻结插座」小节 · 本文件 §2/§3
只读需要的段，别囫囵吞全文再自行发挥。


9. 一句话

Drive 收纸，Git 记账，R2 放肉；B 定钉，C 出肉，A 装场面，D 留插座；Agent 交 diff，总闸按合并键。
