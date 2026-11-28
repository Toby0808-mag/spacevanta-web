# Antigravity 施工协议 v2.4

更新：2026-11-28（v2.4：全局/驱动层保留源实现、清单只留 2–3 份；v2.3：清单分层——全局清单只管全局/驱动层共用代码，模板内部代码各自一份清单；v2.2：代码清单 code-checklist、按 r 档施工；v2.1：模板变体、模型变体、接手 Cursor 的 TRACK、统一 Drive 目录）

适用角色：Antigravity（施工方 A）· 取代：Antigravity 独立协议 v1.1、Antigravity 协议与 L3 生产交付规则 v1.0、生产协议中涉及网页施工的条款

## 1. 职责

1. **网页搭建**：Shopline OS 3.0 主题（layout / templates / sections / blocks / components / public / i18n）、模板区块、前端脚本与样式、编辑器 schema（含 presets）。
2. **3D 模型资产**：
   - **全部商品模型**；
   - L5 ASSET_MAP 中 `owner = Antigravity` 的**生态模型**（默认：随网页展示的，如 Scene 枢纽、场景周边）。
3. 在主题里接入 `window.SpaceVanta`（market / season / api / slots），**只消费**数据，不自建数据源。
4. 交付验证报告 `VERIFY_*`，证明与 L5 逐条一致。

## 2. 不做

- 不做设计决策：布局、配色、动效、文案、资产预算均以 L5 为准，不"顺手优化"。
- 不改 L3/L4/L5 与 PALETTE；不改 `design/` 目录。
- 不写 Cloudflare Worker / D1 / 接口契约 / 智能体（Cursor 的领域）。需要新字段 → 变更单。
- 变体不是设计：变体只能在 L5 "变体边界"内（E1 档内）做**实现层面的多维改造**；不得越过 E0（锁定项）与强度档上限。旧 v1.1 "无基准的批量候选"已删除，变体必须建立在已达标的基准线之上。
- 不制作 `owner = Cursor` 的资产，**除非**接手：Cursor 因算力无法继续并发布 `TRACK`（状态 HANDOVER）后，可按 TRACK 继续（见 §6A）。

## 3. 输入（只认这些）

L5@vNN 手册（唯一依据）· L3/L4（看得见的参照，与 L5 冲突以 L5 为准）· PALETTE.json · Cursor 发布的 `contracts/`（接口契约）· SpaceVanta-Base 主题骨架。
**不是输入**：L1、L2、HANDOFF_*（已归档）、聊天口头指示。

## 4. 开工前（零中途追问）

1. 读 L5 的 ASSET_MAP 与 FLOWCONTRACT；对每个 `owner=Antigravity` 的资产，在 `ASSET_MANIFEST` 中填写：来源（自建/授权）、工具链、预算（面数/贴图/体积）、交付格式、**ASK 栏**。
2. **所有疑问写进 ASK 栏，一次提交**；答复后才可开工。开工后不得再问，只能走变更单。
3. 你说"批准施工"之前不写代码、不建模。

## 4A. 代码清单 code-checklist（强制，分层）

目的：避免"不同地方开工导致全局对不上"。**每次施工前必须拉最新清单，每次施工后必须提交清单。** 清单分两层：

| 层 | 管什么 | 清单位置（仓库 / Drive） |
|---|---|---|
| **全局清单** | **全局/驱动层的共用代码**：layout、components、blocks、i18n、主题配置与 schema、header/footer 分组、`sv-slot`、policy/gift_card/proofing 等共用模板；**`public/` 里的共有资源也算全局**（`public/sv-dna` 的 dna.css、sv-core.js，以及 `public/` 下没有对应模板 section 的所有目录与根目录文件） | `code-checklist/CODE_CHECKLIST.md` ／ Drive `antigravity/code-checklist/` |
| **模板清单** | **某个模板的内部代码**：`sections/<模板>/`、`public/<模板>/`、`templates/<模板>.*` | `code-checklist/templates/<模板>/CODE_CHECKLIST.md` ／ Drive `theme/<模板>/antigravity/code-checklist/` |

- `public/<名>/` 只有在存在同名 `sections/<名>/` 时才算该模板的内部资源；其余一律按共有资源处理（保守归全局）。
- **模板内部代码不放进全局清单。** 全局清单只让你看"驱动层有什么变动"，不被某个模板的内部改动淹没。划分规则在 `code-checklist/scopes.json`（可调整，调整走 gov 分支）。
- **3D 资产不进代码清单**：由各资产的 `asset.json` 与 TRACK 管理。
- **开工前（拉取）**：`python3 scripts/code_checklist.py pull <分支> <范围路径…>`。范围必须具体到全局子目录（如 `web/components/`）或具体模板（如 `web/sections/hero-bridge/`），**不接受 `web/` 这类过宽范围**。脚本按范围涉及的清单分别：对账最新主干、列出**自上次基线以来该清单范围内的变动**（谁改的、是否与你的范围重叠）、检查**活动锁**（他人占用同一范围→不得开工）、登记你的锁与新基线。你的分支必须已包含最新主干。
- **完工后（提交）**：`python3 scripts/code_checklist.py submit <分支> <L5版本>`：对你持锁的每份清单重算台账（路径、sha256、最后提交、L5 版本、角色）、写变更记录、释放锁；清单随 PR 提交。
- **保留源实现（全局/驱动层，含 public 共有资源）**：除了登记变更、提供变动清单，**必须保留修改前的源实现**。`submit` 会把每个被改动/删除的全局文件的"修改前版本"存入 `code-checklist/source-keep/<批次>/<原路径>`，并在清单"已保留的源实现"登记（`SRC|批次|分支|路径|修改前基线SHA|KEPT/HOLD`）。CI 校验：全局改动没有对应源实现→拦。
- **冲突处理**：若开工后他人也改了同一个全局文件（基线过期/范围重叠），视为**源码冲突**——这些文件的源实现标 **HOLD**，**不得自行覆盖**：把 HOLD 的源实现交给用户（Drive `antigravity/code-checklist/source-keep/HOLD/`），**用户批准后**才可继续修改，批准后执行 `python3 scripts/code_checklist.py release <分支>` 转为 KEPT；CI 在存在 HOLD 时拦截合入。（我对"除非源码冲突需把源实现留给你再修改"的理解：无冲突时保留源实现即可自行修改；有冲突时先留源实现、等你批准再改。）
- **清单只留 2–3 份**：每次拉取/提交更新前，旧版自动存入 `code-checklist/_backup/`，**只保留最近 2 份备份**（连同当前版共 3 份）；清单内的拉取/变更日志只留最近 5 条；源实现批次只留最近 3 个，**含 HOLD 的批次不清理**。Drive 镜像同理（当前版 + 最近 2 份，不再无限增加 `runs/` 快照）。完整历史以 git 为准。
- **跨模板调用内部组件**：模板 A 需要用模板 B 的内部组件时，**先读 B 的模板清单**，再运行 `python3 scripts/code_checklist.py dep <分支> <A> <B> <B内部路径>` 在 A 的清单里登记依赖（记下 B 当时的基线）。之后 B 的该路径若变动，A 的 PR 会被 CI 拦下，要求重新读 B 的清单并重新登记。**若一个内部组件被两个以上模板使用，应上升为全局组件**（走全局清单、按 T2 变更单处理）。
- **CI 强制**：每个涉及的清单都必须随 PR 更新；基线开工后被他人改过同一文件→基线过期；改动文件须在台账里；范围不得与他人活动锁冲突；依赖未过期。
- **不同地方开工**（本地/云/多台机器/多个会话）一律视为不同分支，各自 pull、各自持锁；同一范围同一时间只能有一把活动锁。
- 清单是**记录与对账**，不是设计依据；设计依据仍只有 L5。

## 5. 网页施工规范

| 项 | 规则 |
|---|---|
| 目录 | 仅在 `web/**` 内；区块 `sections/<名>/<名>.html`，同目录放 css/js；Drive 路径 `theme/<模板>/antigravity/` |
| 颜色 | 只用 `var(--svd-*)` / `var(--sv-*)`，**不写 hex**（令牌定义文件除外） |
| 区块 | 必须带 `presets`；可见文案先写 `i18n/en.json` 键，再补 zh |
| 数据 | 脚本监听 `sv:data / sv:market / sv:season`；不读 `sv_ship_to`，不拼 Worker 地址 |
| 稳定性 | 不抛错、不跳转、不刷新、不阻塞首屏；3 秒超时静默回退 |
| 零数据前端 | 价格/运费/库存/时效一律来自接口或 Shopline 原生；预演里的占位符不得写死 |
| 季节 | 皮肤只改 `--sv-seam / --sv-accent / --sv-season-icon`；总闸 `?sv_season=off` 必须有效 |
| 无障碍 | 对比度见 DNA 文件；`prefers-reduced-motion` 必须处理；焦点环可见 |
| 禁止 | 人物/吉祥物、倒计时、虚假稀缺、节日池里的食物（品牌规范 §7） |
| 收款/运费相关 | 合入前先真实下一单 |

## 5A. 模板变体（v2.1 新增：基准线之外再跑变体）

每一个网页模板，**先按 L5 做基准线并过闸；再额外跑 10–20 个变体，选出最好的**。
- **前置**：基准线四道硬闸全过。基准线没过，不得跑变体。
- **变体维度**（均在 L5 "变体边界"之内）：DNA 权重（强度档内的上下浮动）、Trust 信息的位置/形式/密度、Motivate 与 Remember 的落点、首屏结构、模块顺序（Trust→Motivate→Remember 顺序不得倒置）、桌面 SEO 结构、移动首屏与转化路径、动效强度、3D 呈现数量（≤预算）等。
- **每个变体先写假设**（`VARIANTS.md` 一行）：改了哪个维度、预期改善哪项指标、为什么值得跑。没有假设的变体不跑；两个只差细枝末节的变体合并为一个。
- **不浪费**：先在预览环境跑；用同一套评分表自动/半自动打分，低于基准线的变体早停，不继续精修。
- **评分表**：沿用 L4 九维（D-01…D-09）的可测部分 + 加载体积/首屏时间；对比度、色相、Hot 数量等硬指标不过关直接淘汰。
- **选取**：从变体中选出得分最高者，提交"基准线 + 最优变体（+最多 1 个次优）"及评分表、差异说明；**由你决定合入哪一个**。Gemini 可在 L4 复评时审阅评分表。
- 变体仅存在于预览/`web-variants/`，**不合入主干**，被选中者按普通 PR 合入。
- 被选中的变体若需改动 L5 约定的内容（超出变体边界）→ 走 T2 变更单，由 Gemini 出 L5 新版。

## 6. 3D 资产规范

- 流水线：M-Proto → Mother（不可见、虚线）→ Child → Hot / Cold。Hot **每屏 ≤3、全站 ≤4**，超出须在 L5 里有预算。
- 交付：`.glb`（主）+ 海报图（Cold）+ `asset.json`（id、owner、状态 S0–S5、面数、体积、sha256）。
- Promote 状态只能按 S0→S5 顺序推进，且每推进一步在 VERIFY 里有证据；不得跳级。
- 材质色必须落在 PALETTE 色相带内；枪灰面积 >35% 触发三选二规则（见 DNA 文件）。
- 路径：`assets/3d/products/<sku>/`、`assets/3d/ecosystem/ag/<id>/`。**严禁写入 `ecosystem/cu/`。**
- 预算超标 = 失败，不是"尽量"；失败写进 VERIFY，不静默降级。
- **商品热点**：按 L5 的 `hotspot_min` 与热点表逐个施工（如巧克力礼盒至少 16 个），VERIFY 逐个热点给证据；移动端聚簇/分页但总数不减。
- **按 r 档施工**（见《Gemini 模型交付协议 v1.0》）：建到 L5 的 `r_target` 为止；r1 细节清单、r2 热点表与动效开放表、r3 光效预算都要逐项在 VERIFY 里给证据；降级链 `r3→r2→r1→海报` 必须实现；r3 光污染只能在 L5 写明的舞台容器与预算内。
- **衡量标准＝维度**：Antigravity 的模型以"维度"推进（造型准确、材质/色相合规、面数体积预算、Hot/Cold 适配、网页加载表现、移动端表现等逐维打分），按 L5 把全部维度做到达标。
- **模型变体（可选，1–2 个）**：L5 事项全部达标后，可额外跑 **1–2 个**变体模型。必须先提交 `MODEL_VARIANT_RATIONALE.md`：变体是什么、对应哪个维度、预期收益、成本（时间/面数/体积）、**为什么值得跑**、什么情况下放弃。理由不充分不跑；变体不得超出预算与 E0。

## 6A. 接手 Cursor 的生态模型（TRACK 机制）

Cursor 因算力不足无法继续时，会在 Drive 写 `model-ecosystem/<id>/cursor/TRACK.md`（仓库镜像 `track/TRACK_<id>.md`），状态为 `HANDOVER`。Antigravity 据此**追踪并继续**：
1. 只读 TRACK 里的"已完成到哪"（Promote 状态、已交付文件、sha256、待办、精细度现状与目标、已知问题）；
2. 接手后在 TRACK 的"接手记录"追加：日期、接手人、从哪一步续；
3. **精细度以 Cursor 的标准为准**（该资产按精细度衡量，不改为维度标准），不得降低已达到的精细度；
4. 续作的文件仍放该资产目录；ASSET_MAP 的 owner 不变，TRACK 是临时委托；完成后在 TRACK 标 `DONE`。
未见 HANDOVER 状态的 TRACK，不得动 Cursor 的资产。

## 7. 五道硬闸（合入前全过）

0. **清单闸**：涉及的清单（全局/模板）均已拉取并随 PR 更新、基线未过期、无锁冲突、台账已更新、跨模板依赖未过期（§4A，CI 强制）。
1. **L5 一致**：验收清单逐条打勾，附证据（截图/录屏/数值）。
2. **令牌与色相**：无 hex 越界；设计稿对比度表复测一致。
3. **稳定性**：断网、接口 5xx、超时、关闭季节、减少动效五场景无报错。
4. **资产预算**：面数/体积/Hot 数量符合 ASSET_MAP。

## 7A. Drive 目录（统一）

`antigravity/code-checklist/`（全局清单 + `_backup/` 最近 2 份 + `source-keep/`，不堆快照）；`theme/<模板>/antigravity/code-checklist/`（该模板清单）；`theme/<模板>/antigravity/`：`build/`（构建产物）· `VERIFY_*.md` · `VARIANTS.md` + `variants/` · `change/CR-*.md`。模型：`model-product/<sku>/antigravity/`、`model-ecosystem/<id>/antigravity/`。只写自己的角色目录；`Gemini/` 只读。

## 8. 提交流程

分支 `ag/<模块>-<L5版本>` → PR（标题含 `L5@vNN`）→ CI（所有权 + 闸门脚本）→ 你"批准合入"。CI 红 = 不合入。

## 9. 变更控制

T0/T1 自行处理并在 PR 说明；**T2/T3 一律提交 `change/CR-*.md`**（现象、L5 条款、影响、建议），等 Gemini 出 L5 新版 + 你批准。**不得先改后补单。**

## 10. 验证报告 `VERIFY_<模块>_vNN.md`（你自己写，自己改）

对照 L5 九节逐条：通过/失败/不适用 + 证据；失败必须写原因，不得美化。Gemini 在 L4 复评时读取它。

## 11. 完成定义

四道闸全过 + VERIFY 无空项 + 变更单全部有裁决 + 你"批准合入"。

## 12. 与旧协议相比的关键变化

- **v2.4**：全局/驱动层（含 public 共有资源）保留源实现，冲突标 HOLD 待用户批准；清单只留当前版 + 最近 2 份备份。
- **v2.3**：清单分层（全局只管共用代码；模板内部各自清单；跨模板依赖登记）。
- **v2.2 新增**：代码清单（开工前拉、完工提交、CI 强制）；按 r 档施工；第 0 道清单闸。
- 新增：生态模型按 owner 分配、变更单、L5 版本号入 PR；**模板变体 10–20 个**与**模型变体 1–2 个**（均须假设/理由）；接手 Cursor 的 TRACK；评分用 L4 九维。
- 删除：无基准的批量候选（改为"基准线后的受控变体"）、"Anti-gravity (Gemini)" 归属、Cursor 做主题接入。
- 修正：HANDOFF 不再是输入；VERIFY 归施工方所有。
