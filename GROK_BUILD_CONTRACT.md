SpaceVanta 构建契约 · GROK BUILD CONTRACT

版本：v1.0.0（锁死）｜生效：总闸确认并推送后｜优先级：本文件 > HANDOFF 施工单 > Agent 自行推论

本文件只回答一个问题：谁能在哪里改什么，改之前必须得到谁的确认。 仓库治理口径：Git 存约定与代码，R2 存 3D 资产，Google Drive 只做 Gemini 的 L3 交付中转。
0. 五条不可协商的宪法

#	铁律	违反时动作
C1	契约优先：本文件与施工单冲突 → 停手，输出冲突点，等总闸裁决	BLOCKED，不写代码
C2	总闸唯一合并权：任何 Agent 不得直接 commit/push 到 main	只交 diff/补丁，等人工审
C3	占位即断路：assetStatus="placeholder_only" → 锁 S0_COLD_IDLE，全页 0 次 .glb 请求	点[升维]直落 fallback_poster
C4	MOCK 不得入境：{{KEY}} 缺失就整块不渲染；禁编默认值、const MOCK、假价格假运费	grep 命中即打回
C5	锚点单一作者：anchor_A/B/C、slot_base/lid/ring 等字面量只有 Agent B 能定义，A/C/D 只能 import 消费	A 侧出现字面量即 BLOCKED

1. 三存储分工（本次定稿的核心）


        ┌──────────────── Google Drive ────────────────┐
        │ Gemini 投放区（L3 施工单中转，Agent 只读）       │
        │ /SpaceVanta-L3/INBOX/_draft/   未定稿，禁止开工  │
        │ /SpaceVanta-L3/INBOX/          已定稿待入库      │
        │ /SpaceVanta-L3/ARCHIVE/        已入库归档         │
        └───────────────┬───────────────────────────────┘
                        │ 总闸核对 FLOW_ID/FREEZE_ID 后搬入
                        ▼
        ┌──────────────── GitHub（唯一真源）──────────────┐
        │ 契约：GROK_BUILD_CONTRACT / AGENTS / .cursor/rules│
        │ 索引：handoffs/README.md（L3 清单 + Drive 原链接）│
        │ 快照：handoffs/<domain>/HANDOFF_*.md（只读存档）   │
        │ 代码：src/ worker/ d1/ ...                        │
        └───────────────┬───────────────────────────────┘
                        │ Agent 只认 GitHub 路径
                        ▼
        ┌──────────────── R2（资产肉身）──────────────────┐
        │ sv-models @ assets.spacevanta.com                │
        │ GLB / KTX2 / poster1600 / thumb640 / silhouette  │
        │ ❌ 任何 3D 与派生图永不进 Git、永不进 Drive 当真源 │
        └─────────────────────────────────────────────────┘
1.1 Drive 的三条硬规则

Drive 是收件箱，不是真源。 Agent 可以从 Drive 读，但必须以 GitHub 里同 FLOW_ID 的快照为准；两者不一致 → 停手报「版本漂移」，等总闸同步，不许自己挑一个信。
Agent 只读 Drive，永不写回。 A/B/C/D 任何情况下不得在 Drive 创建、修改、重命名、移动 HANDOFF。要改只能出《变更申请》。
Drive 里的 _draft/ 是隔离区。 文件名在 _draft/ 下、或缺 FLOW_ID / FREEZE_ID / 段2 状态矩阵 / 段6 验收表任一项 → draft，任何 Agent 不得据此开工。

1.2 GitHub 快照为什么还要留？

因为 Agent 会话会过期、Drive 链接会失效、云端检索会漂移。只有 git log 能回答“上周三那份单到底写了什么”。 所以：Drive 收 → 总闸核对 → 原样搬进 handoffs/<domain>/ → 同一次 commit 更新 README 索引表。 这一步不能省，也不能让 Agent 代做。


2. 角色与交付物（谁出什么，落在哪）

角色	性质	只交付	落点	绝不交付
Gemini	外部 L3 交付方（不在 A/B/C/D 内）	HANDOFF_<FLOW_ID>_vNN.md（含 FLOW_ID/FREEZE_ID/段0–段6）	Drive INBOX → 总闸搬 GitHub	图片、GLB、KTX2、代码、价格
Agent A	网页/前端施工	Workers+Assets 组件、S0→S5、routes.ts、assetPaths.ts	src/、wrangler.toml	锚点字面量、GLB、Worker 业务逻辑
Agent B	全站模型装配与资产谱系	motherRig.ts（唯一锚点真源）、ASSET_REGISTRY.md、装配契约	src/three/rig/、handoffs/bundle/	页面/路由、材质光照、实模、价格
Agent C	3D 资产生产（建模方）	GLB/LOD/压缩/poster/silhouette + 资产检查报告	R2 + registry 改 ready	HANDOFF、锚点命名、页面代码
Agent D	Space Rental 智能体	G-0 插座 props 契约、能力登记表、G-1 升级闸门	handoffs/agent-D/	任何 fact（价/运/时效/库存）、化身、LLM SDK
Grok / Projects	参谋（我）	指令文本、契约全文、冲突裁决建议、审图清单	对话里，不碰仓库	直接写码、直接 push
总闸（你）	唯一合并权	搬单入库、审 diff、commit/push、下「开 G-1」口令	—	让 Agent 自决合并
2.1 Grok Build 退役声明

骨架已立（契约 + handoffs 三层 + wrangler + 令牌），本项目内禁用 Grok Build 生成或搬运代码：它读不到 .cursor/rules 与 GROK_BUILD_CONTRACT.md，会绕过全部禁碰层，且产物需人工搬运 = 必然分叉。

唯一例外：开一个与本仓无关的全新项目打桩；打完即 git init 并交 Cursor 接管。

3. 脚手架与路径裁决（已裁定，不许翻案）

项	裁决
脚手架	Cloudflare Workers + 静态 Assets（wrangler）；❌ Next.js / ❌ app/[locale]/page.tsx / ❌ next/link / ❌ SSR 业务
HANDOFF 段3 的 app/[market]/(shop)/page.tsx	→ src/components/home-hero-bridge/* + src/client/routes.ts + worker 入口 Assets 兜底
市场	动态 /{market}/：en-us / en-gb / en-au / en-ca / en-sg / en-hk + 扩展位
market 来源	只从 URL 前缀 + sv_ship_to；❌ 禁从 accept-language 猜；❌ 全仓禁 /en-us/ 字面量
站内跳转	一律 routes.ts 构造，组件内禁拼 URL 字符串
资产路径	一律 src/client/assetPaths.ts 单点；本轮本地 src/assets/placeholder/（poster ≤90KB），换 R2 只改这一文件
R2 测试件	bundle/test.glb.html 是连通性测试，非资产，任何组件禁引用，正式上线前删
令牌	只 var(--sv-*)；src/ 下裸 hex = 0；PALETTE.json 的 lockedTokens 只读

4. Agent 启动协议（每个 Agent 每次开工都走）

① 读 Git：GROK_BUILD_CONTRACT.md → AGENTS.md → handoffs/README.md
② 读索引：在 README 第6节按 FLOW_ID 找到施工单 → 确认 GitHub 快照存在
③ 若总闸给了 Drive 链接：可读作参考；与 GitHub 快照不一致 → 报「版本漂移」停手
④ 读施工单指定段落（不是全文囫囵吞）：段0 DNA / 段1 意图 / 段2 状态矩阵 / 段2.5 冻结面 / 段3 路径 / 段6 验收
⑤ 交「三样」：路径映射表 · 文件改动清单 · 状态机边界+自证方法
⑥ 总闸回「确认，动码」→ 才准写实现
⑦ 实现完跑 §6 五条 grep → 贴原始输出 → 等审 → **总闸 commit**，Agent 不 push
任何一步缺契约 → 输出「缺哪个文件·我去哪找·建议谁补」并停手。臆造映射 = 最严重违规。

5. 变更申请协议（跨 Agent 改动唯一通道）


【申请】改什么 ID / 路径 / 状态
【归属】触及哪一层契约 / 哪个 Agent 的产出
【影响】A / B / C / D 各受什么影响（逐条写“无影响”也要写）
【为什么】不做会怎样（禁止写“更好看”这类无验收口径的理由）
【迁移】旧值如何过渡；已有引用怎么改
【回滚】不行怎么退（git revert 哪类提交 / registry 状态回退到哪）
【验证】改完跑什么断言算过
总闸确认前，登记处只写 proposed，不落代码、不改 registry 状态、不改名。

6. 提交前五条 grep（Agent 自证，贴原始输出）

bash
echo "1 裸hex :"; grep -rnE '#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}\b' src/ --include=*.ts --include=*.tsx --include=*.css | grep -v 'dna.tokens.css' | wc -l
echo "2 硬编码市场:"; grep -rn '/en-us/\|/en-gb/\|/en-au/' src/ | wc -l
echo "3 MOCK  :"; grep -rn 'const MOCK\|MOCK_\|fakePrice\|DUMMY' src/ | wc -l
echo "4 GLB引用:"; grep -rn '\.glb\|test\.glb\.html' src/ | wc -l
echo "5 锚点越权:"; grep -rn 'anchor_A\|anchor_B\|anchor_C\|slot_base\|slot_lid\|slot_ring\|bay_[0-9]' src/components src/client | wc -l
期望全 0。第 5 条只对 A/C/D 生效（B 的 src/three/rig/motherRig.ts 是唯一合法出处）。

另加两条人工断言：

DevTools Network 过滤 .glb → 0 条（挂载期 / 点升维 / Esc 关弹层 / 60s 后各查一次）
?sv_agent=off → AgentSlot 整条消失，DOM 不留空节点、tab 序无空洞、不白屏

7. Promote 状态机契约（A 实现，B/C 供料）

态	含义	数据来源	placeholder_only 下
S0_COLD_IDLE	冷卡静置，poster+silhouette	registry.posterUrl	✅ 唯一可达起始态
S1_ARMED	已聚焦/已选配置，预载声明	carriedConfig	✅ 可达（仍 0 GLB）
S2_STREAMING	GLB 流式载入	registry.glbLod0Url	⛔ unreachable，需显式守卫函数
S3_HOT_READY	LOD0 就绪可升维	Agent C ready	⛔ unreachable
S4_HOT_ACTIVE	3D 舞台交互中	Mother rig + snap	⛔ unreachable
S5_FALLBACK	超时/失败 → 静态大图	poster1600	✅ 点[升维]与 60s 超时均落此
守卫不许靠“碰巧没请求”：canEnter(state, registry) 纯函数显式返回 false + reason，单测覆盖 4 个断言点（挂载 / 点升维 / Esc / 60s dispose）。 S5 必须保留 carriedConfig（已选 SKU/槽位不丢）+「查看大图」+ SR 播报「改用静态大图」，禁转圈、禁白屏、禁报错弹窗。


8. 四开关（F-10，A 组必须全实现）

开关	行为	红线
?sv_motion=off	补间/crossfade 0ms 直切，状态机与焦点序不变	同 prefers-reduced-motion
?sv_season=off	--sv-seam/--sv-accent/--sv-season-icon 整条不渲染，回暖纸态	❌ 绝不动 --sv-paper / --sv-paper-subtle
?sv_agent=off	AgentSlotG0 整条消失	不留空位、不白屏、tab 序无洞
?sv_mother_rig=on	调试显 Mother 虚线框+空心锚点球	生产默认 off；Mother 自身永不上材质/高光/阴影

9. 禁碰层总表（命中即 BLOCKED，停手回报）


worker/fact/*  worker/shopline/*  worker/pricing/*  worker/bundle/*
worker/mto/*   worker/shipping/*  worker/season/*   worker/config/*
  → 本轮全部只读，B 组才接；A 组 0 次业务请求
d1/migrations/*（含历史全部，一行不改）
checkout*/*   PLACEHOLDERS.md   PALETTE.json 的 lockedTokens
artifacts/design/*.html（禁 import）  *.glb *.blend *.ktx2 *.avif（走 R2）
Google Drive 中的 HANDOFF（只读，永不写回）
worker/ai/*（无「开 G-1」口令前，D 也不许碰）

10. 版本与回滚

契约变更 = minor 升版 + 变更申请 + 总闸 commit；破坏性变更（禁碰层增删、锚点改名、状态机枚举改动）= major 升版，必须先在 Drive _draft/ 走一轮评审。
任何 Agent 交码出事 → git revert <sha> 单行回退，因此禁止 Agent 自 push、禁止 --force、禁止 amend 已推送提交。
本契约自身的历史只存在于 git log，不抄进 Drive。
