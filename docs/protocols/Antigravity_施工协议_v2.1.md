# Antigravity 施工协议 v2.1

更新：2026-11-27（v2.1：模板变体、模型变体、接手 Cursor 的 TRACK、统一 Drive 目录）

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
- **衡量标准＝维度**：Antigravity 的模型以"维度"推进（造型准确、材质/色相合规、面数体积预算、Hot/Cold 适配、网页加载表现、移动端表现等逐维打分），按 L5 把全部维度做到达标。
- **模型变体（可选，1–2 个）**：L5 事项全部达标后，可额外跑 **1–2 个**变体模型。必须先提交 `MODEL_VARIANT_RATIONALE.md`：变体是什么、对应哪个维度、预期收益、成本（时间/面数/体积）、**为什么值得跑**、什么情况下放弃。理由不充分不跑；变体不得超出预算与 E0。

## 6A. 接手 Cursor 的生态模型（TRACK 机制）

Cursor 因算力不足无法继续时，会在 Drive 写 `model-ecosystem/<id>/cursor/TRACK.md`（仓库镜像 `track/TRACK_<id>.md`），状态为 `HANDOVER`。Antigravity 据此**追踪并继续**：
1. 只读 TRACK 里的"已完成到哪"（Promote 状态、已交付文件、sha256、待办、精细度现状与目标、已知问题）；
2. 接手后在 TRACK 的"接手记录"追加：日期、接手人、从哪一步续；
3. **精细度以 Cursor 的标准为准**（该资产按精细度衡量，不改为维度标准），不得降低已达到的精细度；
4. 续作的文件仍放该资产目录；ASSET_MAP 的 owner 不变，TRACK 是临时委托；完成后在 TRACK 标 `DONE`。
未见 HANDOVER 状态的 TRACK，不得动 Cursor 的资产。

## 7. 四道硬闸（合入前全过）

1. **L5 一致**：验收清单逐条打勾，附证据（截图/录屏/数值）。
2. **令牌与色相**：无 hex 越界；设计稿对比度表复测一致。
3. **稳定性**：断网、接口 5xx、超时、关闭季节、减少动效五场景无报错。
4. **资产预算**：面数/体积/Hot 数量符合 ASSET_MAP。

## 7A. Drive 目录（统一）

`theme/<模板>/antigravity/`：`build/`（构建产物）· `VERIFY_*.md` · `VARIANTS.md` + `variants/` · `change/CR-*.md`。模型：`model-product/<sku>/antigravity/`、`model-ecosystem/<id>/antigravity/`。只写自己的角色目录；`Gemini/` 只读。

## 8. 提交流程

分支 `ag/<模块>-<L5版本>` → PR（标题含 `L5@vNN`）→ CI（所有权 + 闸门脚本）→ 你"批准合入"。CI 红 = 不合入。

## 9. 变更控制

T0/T1 自行处理并在 PR 说明；**T2/T3 一律提交 `change/CR-*.md`**（现象、L5 条款、影响、建议），等 Gemini 出 L5 新版 + 你批准。**不得先改后补单。**

## 10. 验证报告 `VERIFY_<模块>_vNN.md`（你自己写，自己改）

对照 L5 九节逐条：通过/失败/不适用 + 证据；失败必须写原因，不得美化。Gemini 在 L4 复评时读取它。

## 11. 完成定义

四道闸全过 + VERIFY 无空项 + 变更单全部有裁决 + 你"批准合入"。

## 12. 与旧协议相比的关键变化

- 新增：生态模型按 owner 分配、变更单、L5 版本号入 PR；**模板变体 10–20 个**与**模型变体 1–2 个**（均须假设/理由）；接手 Cursor 的 TRACK；评分用 L4 九维。
- 删除：无基准的批量候选（改为"基准线后的受控变体"）、"Anti-gravity (Gemini)" 归属、Cursor 做主题接入。
- 修正：HANDOFF 不再是输入；VERIFY 归施工方所有。
