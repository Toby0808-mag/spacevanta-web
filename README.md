# SpaceVanta 前端施工协议 v1.1.0

> **放置位置**：`protocol/README.md`（本文件是协议包的唯一入口，30 秒读完再动别的）
> 定稿：2026-11-25 · 平台：**Shopline OS 3.0** · 主题骨架标本：`SpaceVanta Base 0.1.0`
> 适用对象：Cursor（四个 Agent 角色）· 出图方 Gemini · 裁决人：你

---

## 0. 三句话记住这套协议

1. **协议只管「怎么写代码」和「红线」，不管「文件放哪、先做哪个」。**
   目录与命名由当次 handoff 或你当场口述给；**开发目标与顺序 100% 由你决定**（`PROTOCOL.md §7`）。
2. **路由是常量。** 页面路由冻结在 `contracts/routes.json`；Worker 路由随代码源冻结在 `contracts/endpoints.json`。
   要增删改 → **Cursor 可以提案，但必须你 APPROVED 才生效**，且一律 `ADD 新 → 并存 2 个 rev → DEL 旧`（即使"确认不影响"也不许即时删）。
3. **十五门全绿才出包。** `bash protocol/scripts/check_gates.sh <主题根>`，`FAIL=0` 才能打 zip 上传 Shopline。

---

## 1. 文件地图（每个文件放哪 · 谁读 · 何时读）

> ⚠️ **唯一例外**：`.cursor/rules/` 必须提到**仓库根**，Cursor 才自动加载。其余全部住 `protocol/`。

| # | 本包内文件 | **最终放置位置（仓库根起）** | 主读方 | 何时必读 |
|:-:|:--|:--|:--|:--|
| 1 | `README.md` | `protocol/README.md` | 你 / 全员 | 第一次 |
| 2 | `PROTOCOL.md` | `protocol/PROTOCOL.md` | 全员 | **每次开工**（宪法，12 节） |
| 3 | `STACK.md` | `protocol/STACK.md` | A1 主读 | 写模板前 + 出包前（§F 十五门细则） |
| 4 | `checkout.lock` | `protocol/checkout.lock` | 全员 | 任何碰 cart→checkout 的念头出现时 |
| 5 | `agents.md` | `protocol/agents.md` | 全员 | 跨产权协作 / 借调 / 提案前 |
| 6 | `HANDOFF_TEMPLATE.md` | `protocol/HANDOFF_TEMPLATE.md` | **Gemini**、你 | 出图填八段 |
| 7 | `agents/frontend.md` | `protocol/agents/frontend.md` | A1 | 每个前端 rev |
| 8 | `agents/assets.md` | `protocol/agents/assets.md` | A2 | 建/升模型、写 `resolve()` |
| 9 | `agents/backend.md` | `protocol/agents/backend.md` | A3 | 改 worker / 登记端点 / 提提案 |
| 10 | `agents/ai.md` | `protocol/agents/ai.md` | A4 | 每次编排（G-1 口令前只读不建） |
| 11 | `contracts/routes.json` | `protocol/contracts/routes.json` | A1/A2/A4 | 任何跳转、生成 CTA 前 |
| 12 | `contracts/endpoints.json` | `protocol/contracts/endpoints.json` | A3 写 / 其余只读 | 取数前查 key；提案落 `proposal_log` |
| 13 | `contracts/filters.json` | `protocol/contracts/filters.json` | A1 | 用过滤器时（白名单只有 5 个） |
| 14 | `contracts/model-slot.schema.json` | `protocol/contracts/model-slot.schema.json` | A1/A2 | section 声明 `model_slot` 时 |
| 15 | `contracts/model-registry.schema.json` | `protocol/contracts/model-registry.schema.json` | **A2 写** / A1·A3 只读 | 建/升模型、校验锚点与 perm |
| 16 | `docs/shopline.md` | `protocol/docs/shopline.md` | 全员（**L0 唯一判据**） | 语法存疑 / 上传报错 / 填 limits 探针 |
| 17 | `docs/models.md` | `protocol/docs/models.md` | 全员 | 判断母/子、沉睡/活跃、能不能换色 |
| 18 | `docs/changelog.md` | `protocol/docs/changelog.md` | 全员 | 开工扫最新 2 条 + **作废表** |
| 19 | `scripts/check_gates.sh` | `protocol/scripts/check_gates.sh` | 人 / CI | 出包前，必跑 |
| 20 | `handoffs/README.md` | `protocol/handoffs/README.md` | 全员 | 收发件前 |
| 21 | `handoffs/incoming/HANDOFF_bundle_bundle-hero_v1.md` | 同路径 | A1/A2/A3 | **H-001，已批准可开工** |
| 22 | `handoffs/requests/` | `protocol/handoffs/requests/` | 全员 | 借调 / 要路径 / 交风险分析 |
| 23 | `handoffs/outgoing/` | `protocol/handoffs/outgoing/` | A4 归集 → **你点发送** | 每 rev SUMMARY 回传 Gemini |
| 24 | `handoffs/snapshots/.gitkeep_example_SUMMARY.md` | `protocol/handoffs/snapshots/<ID>/v<rev>/SUMMARY.md` | **Gemini（第一读者）** | 每 rev 必出，≤40 行六段 |
| 25-27 | `.cursor/rules/{execution,ownership,models}.mdc` | **`.cursor/rules/`（仓库根！）** | Cursor | 会话自动加载 |

**主题本体** `layout/ sections/ templates/ blocks/ components/ public/ i18n/ theme.schema.json theme.config.json`
→ **仓库根层直出，不进 `protocol/`，也不在本 zip 里**。协议与主题同仓不同目录。

---

## 2. 四层宪法（冲突时从上往下压）

```
L0  Shopline OS 3.0 平台事实   ← docs/shopline.md（语法白名单/上传校验/limits 实测）
L1  本协议                    ← PROTOCOL / STACK / checkout.lock / contracts/*
L2  主题骨架 Base 0.1.0       ← 745 文件皆可 🟢建 🔴删 🔵换（§0 骨架豁免）
L3  当次 handoff              ← 只给"做什么+长什么样+路径"，不能推翻 L0/L1
```
**handoff 不能推翻协议；协议不能推翻 Shopline。**

---

## 3. 四条最硬的红线（背下来）

| 红线 | 一句话 |
|:--|:--|
| 🚫 **Checkout 冻结** | 结账全路由/样式/功能/注入/中途重定向**禁动**。合发分发只在 **Cart 页**属性透传，进 Checkout 时 cart 已是最终态。必碰 → 五步审批 + 六问风险分析 + 你书面 APPROVED |
| 🔒 **路由即常量** | 模板里出现 `workers.dev` / `/api/` / `/pages/` 字面量 → 门禁 [12][13] **FAIL**。跳转只走 `routes.json` 或 `resolve().master_page_url` |
| 🧬 **母子不变量** | 母唯一（Hero，0 面，独占季节换肤，锚点 A→B→C→A 冻结）；子同级无大小、**零换色权**、100% 派生；**活跃子与沉睡子(S3后)都必须有回母页 CTA**；沉睡 **0 个 GLB 请求** |
| 💰 **零裸交易值 / 零裸 hex** | 金额门槛比例时效全 `{{PLACEHOLDER}}`（`hardcodedTransactionValues=0`）；颜色只许 `--svd-*` / `color_scheme` / `class_list()`。门禁 [7][8] |

---

## 4. 停工码（宁可停，不许猜）

| 码 | 触发 | 怎么办 |
|:--|:--|:--|
| `BLOCKED_BY_DESIGN` | handoff 八段缺段 / 图纸没定 | 问你 → Gemini 补版 → 复工 |
| `BLOCKED_BY_HANDOFF` | 段 6 没给路径 | 发 `requests/cursor-to-user-*.md`，**禁止自造目录** |
| `BLOCKED_BY_CONTRACT` | 端点 key 未登记或 `url: null` | 走 `$fallback-list` 兜底继续做呈现，**不猜域名**；A3 抄入部署事实后自动解除 |
| `BLOCKED_BY_APPROVAL` | 提案 `PROPOSED_PENDING_USER` | 停下等你说 APPROVED / REJECTED |
| `BLOCKED_BY_CHECKOUT` | 需求必然触碰结账 | 停工 + 六问风险分析 + 你书面确认 + Drive 留新版 handoff |

> **`DEFERRED_TO_<AGENT>` 不是停工码**：关联部分没就绪就记账挂起，**本单继续做完**（PROTOCOL §7）。

---

## 5. 30 秒上手（三个角色）

**你（裁决人）**
```
① 说一句："做 H-001，A 组"          ← 顺序你定，协议不排期
② 补一样：endpoints.json 里 bundle/mto/season 的线上地址（让 A3 抄）
③ 收 SUMMARY → 看第 3 段 blocker → 点发送回 Gemini
④ 提案来了回 APPROVED / REJECTED / 改一版再说
```

**Gemini（出图）**
```
照 HANDOFF_TEMPLATE.md 填八段 → 落 protocol/handoffs/incoming/
段 2.5 必须答"是否改冻结面=否"（答是→那是 MAJOR 变更，不是一张 handoff）
段 6 路径必须给全；给不出的写进段 7，别留白让 Cursor 猜
```

**Cursor（施工，四角色）**
```
1 读 PROTOCOL → 2 读 STACK §F 十五门 → 3 读 agents/<自己>.md → 4 读 handoff 八段 + 最新快照 assets-lock
5 段 6 没给的路径 → requests/ 问，不 mkdir
6 写完跑 check_gates.sh，FAIL=0 才出包
7 出 zip+MANIFEST（Drive 全量快照）+ SUMMARY（Drive 快照 & protocol/snapshots/ 双写逐字相同）
8 SUMMARY 落 handoffs/outgoing/ → 标 delivered_pending_feedback，等你点发送
```

---

## 6. 当前状态（2026-11-25）

| 项 | 状态 |
|:--|:--|
| 协议版本 | **v1.1.0** 定稿（`docs/changelog.md` 含**作废条款表**，旧口径复活即按作废处理） |
| 门禁 | 14 条，脚本 `bash -n` 过，最小假主题树试跑 FAIL=0 / WARN=2 |
| 冻结路由 | `/pages/bundles` ✅ · `/pages/made-to-order` ✅ · `/pages/scene` ✅（**`skin` 代号已废**，仅 `sv-skin-showcase` / `SKIN_MOTHER` / `--sv-*` 等已定资产名残留） |
| Worker 端点 | `market` ✅active · `shipping` ✅active · `bundle`/`mto`/`season` ⏸`url:null`（**等部署事实，不是等设计**） · `privilege`/`cart_dispatch` ✅active_local |
| 提案队列 | `PROP-001 新增 worker/scene` → `PROPOSED_PENDING_USER`（H-002 才需要，不阻塞 H-001） |
| 探针 P0–P6 | 全 `TBD_PROBE`；填表前保守卡 public ≤60KB / section.html ≤80KB / poster ≤90KB / zip ≤10MB |
| 首个施工图 | **H-001 `H-20261125-bundle-hero`**（A 组：F-01 / F-02 / F-06 + Promote S0–S5 + `$model-cta` 通用件），八段齐、**已批准** |
| Checkout | 冻结中，`已批准例外` 列表**为空** |
| AI 闸门 | **G-0**（只登记 ⌀24mm 虚线圈，`?sv_agent=off` 熔断不留位）；未收到「开 G-1」口令严禁建化身 |
| GitHub | **一个字节未动** —— 按 `UPLOAD.md` 开 `protocol/v1.1` 分支提 PR，你 review 后 squash merge 才生效 |

---

## 7. 贴在显示器上的三条

1. **自己 mkdir 新目录** → 违规。先发 `handoffs/requests/cursor-to-user-*.md`。
2. **模板里写 `https://…workers.dev` 或 `/pages/…`** → 门禁 [12][13] 直接 FAIL。
3. **"确认不影响，我先把旧路由删了"** → 违废除制。提案 → APPROVED → 并存 2 rev。**即时删一律违规**，哪怕真没影响。

> 完整落地步骤、回滚、H-001 起跑顺序 → 见 **`protocol/UPLOAD.md`**。 ✍️
