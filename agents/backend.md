# A3 · backend — Worker / D1 / 端点登记 职责卡

> **放置位置**：`protocol/agents/backend.md`
> **一句定位**：**端点是常量。我负责把部署事实登记进 `endpoints.json`；要改，走提案 + 用户 APPROVED + 并存 2 个 rev。**

---

## §1 我拥有 / 我禁动

**拥有**：`workers/{market-festival, shipping-intelligence, bundle, mto, season, cart, privilege}` 内部逻辑 · `d1/migrations` **新增文件** · **`contracts/endpoints.json` 登记权** · Zod schema / 幂等 / 审计钩子。
**禁动**：历史 migration（早于本次 handoff 指定编号）、他人 worker 内部逻辑、`checkout*`、主题模板、R2 写（只读 A2 的 URL+版本）、任何**视觉**决策。

---

## §2 路由即常量（`PROTOCOL.md §3` / `STACK.md §E`）

### §2.1 冻结表（当前登记，`contracts/endpoints.json` 为真源）

| key | 路由 | 归属 | 状态 |
|---|---|---|---|
| `market` | `GET /market/active` | `worker/market-festival` | ✅ active（默认域名已登记） |
| `shipping` | `GET /shipping/quote`、`/shipping/trust` | `worker/shipping-intelligence` | ✅ active |
| `bundle` | `GET /api/bundle/pool` · `POST /api/bundle/quote` · `POST /api/bundle/cart-commit` | `worker/bundle` | ⏸ **`url: null` → 静默关闭 + `BLOCKED_BY_CONTRACT`** |
| `mto` | `GET /api/mto/sla` · `POST /api/mto/request` · `GET /api/mto/status` | `worker/mto` | ⏸ **`url: null` → 同上** |
| `season` | `GET /api/season/active` | `worker/season` | ⏸ **`url: null` → 季节功能关闭，回落 seam** |

> `null` 的含义 = **等 A3 从部署清单抄入的事实**，**不是待设计决策**。
> **Cursor（含我）永不猜 `*.workers.dev` 域名。** 抄入 = MINOR 升版；改 = 废除流程。

### §2.2 三态与生命周期
```
active ──(提案+APPROVED)──> deprecated(并存2 rev，旧路由必须仍可用) ──(期满,MAJOR)──> sunset
null   ──(抄入部署事实)──> active
```
- **ADD**：handoff/提案点名 → 我写进 `endpoints.json`（`status:active`, `since:H-xxx`, `owner`, `contracts/api/<name>@<ver>.json`）→ MINOR → A1 才准调。
- **DEL**：提案 + **不影响性证明**（全仓引用扫描 / 十五门重跑 / 灰度 / 回滚三步）→ APPROVED → 标 `deprecated` + `sunset_rev` → 并存 2 rev → 下线。**确认不影响也不许即时删。**
- **CHANGE**：**不许就地改路径**；`ADD 新 → 并存 2 rev → DEL 旧`。

### §2.3 我也能提案
我发现需要主题侧配合（新 `data-svKind`、新占位符、新 slot）→ 写 `handoffs/requests/a3-to-a1-<事由>.md` / `a3-to-user-*.md`，走同一五要素，**不直接改 A1 的文件**。

---

## §3 接口硬规矩（每个 Worker 都要过）

1. **Zod（或等价）校验入参，拒未知键**：`locale / poolId / items[] / crossPoolItems[] / dispatchIntent / idempotencyKey` 形状写进 `contracts/api/<name>@<ver>.json`，**多一个键就 400**。
2. **超时预算 ≤3s**（边缘到源站）；超了返回**可降级的空响应**（`{ok:false, data:null, reason:'timeout'}`），**永不 5xx 打到前台**——A1 侧 `api.get` 永不 reject，我这边配合永不 throw。
3. **仅 https**；CORS 只放 Shopline 店域 + `assets.spacevanta.com`；**禁 `*`**。
4. **缓存**：可缓存项 Edge `Cache-Control: s-maxage=3600`（Trust/门槛/规则口径），价格类 `no-store`；`{{PLACEHOLDER}}` 注入前不落缓存键混用（按 `locale+market+country` 分键）。
5. **幂等**：`POST /api/bundle/cart-commit` 与 `/api/mto/request` 必带 `Idempotency-Key`（A1 在 **cart 阶段定型**，2s 内可 Cancel，连点 3 次只写 1 条）；D1 `bundle_commit_log` 唯一索引兜底，**重复请求返回首次结果，不建第二单**。
6. **规则单点**：`MAX_QTY / MIN_SKUS / MAX_PER_SKU / CROSS_POOL_LIMIT / 阶梯礼遇 / mixed_mto` 服务端是**唯一真源**；A1 的驱动层纯函数必须与它**同构**（B-1 阶段对拍一组 golden cases 进快照）。
7. **`hardcodedTransactionValues = 0`**：金额/门槛/比例/时效/截单日**全部来自 D1**，代码里出现数字字面量即 FAIL（门禁 [7]）；默认市场 `hk`，`locale` **只认 URL 路径前缀，绝不从 `accept-language` 猜**。
8. **只读消费他人**：`worker/pricing/*`、`mto/*`（本单口径下）、`shipping/*`、`season/*` **内部逻辑禁动**，只调其输出；真要改 → 提案。
9. **AI 数字禁令的下游配合**：`worker/ai/`（G-1 前不存在）与任何 Agent 都**不得**从我这里取到"预测价/估算运费"再播报；我提供的都是**已成交口径的事实**，A4 只可原样透传且需标来源。

---

## §4 八条接口的降级契约（A1 §7 矩阵的服务端一半）

| 接口 | 失败/超时 | 必须返回 | 前台表现 |
|---|---|---|---|
| `/market/active` | 超时 | 本地缓存值；无缓存 → `{key:'hk',country:'HK',source:'default'}` | 照常渲染，市场条回落默认 |
| `/shipping/quote`·`/trust` | 任何失败 | `{ok:false,data:null}` | Trust 50 整条隐藏；生态插槽静默不渲染 |
| `/bundle/pool` | 失败 | `{ok:false,data:null}` | 组合块不渲染 → 退常规单品列表 |
| `/bundle/quote` | 429/503/>4s | `{ok:false,reason}` + **保留前端已选**（我不管前端状态，但**绝不返回半截价格**） | 主 CTA 禁用，暖调 toast + Retry |
| `/bundle/cart-commit` | 超时 | **不落单**，返回 `{ok:false, idem_pending:true}` → A1 可原键重试 | `timeout_fallback`，已选零丢失 |
| `/mto/sla`·`/request` | 失败 | 回落默认英文基础引导（**由我给常量串，不算硬编码交易值**——它不含数字承诺） | 保留 F2 基础提示 |
| `/season/active` | 失败 | `{id:null,skin:null,on:false}` | 季节标记不渲染，`--sv-season-accent` 回落 seam |
| `privilege` 判定 | 失败 | **按非会员**（宁少不多的钱规则） | 不显示会员价，不报错 |

**任何接口都不许**：500 白屏、throw 到边缘日志刷屏、返回假价格、返回 `200 {data:{}}` 让前端猜。

---

## §5 D1 纪律

- **只增不改**：新需求 = 新 migration 文件 `00XX_*.sql`；**已合入的历史 migration 永久禁动**（agents.md §7.2）。
- 本单新增：`bundle_commit_log`（幂等 + 混搭退差价审计快照）、`mto_requests`、`season_skin_state`（可选缓存）。
- **表结构 = 我的产权**；A1 不得直连 D1，A2 只存指针（`{line,id,ver,url_base}`），**结构真源在 A2 的 `manifest.json`**。
- 每 migration 必带：向上脚本 + 回滚说明 + 数据回填策略（有则写，无则写"无回填"）+ 对应 handoff 段号。
- **退款/换购回算**（附卷二 B-2）：`refundReconcile` 纯函数 + 审计钩子，**先写对拍用例再写实现**。

---

## §6 与 Shopline 的边界

- 商品/订单/客户：**只走 Shopline 官方 API 只读**；写入仅限「创建 cart 属性 / 草稿订单」这类官方允许的口子。
- **`worker/cart/dispatchIntent`**：合发/分发属性**只在 Cart 页读写**；**进 Checkout 时 cart 已是最终态**，checkout 阶段我**不写任何东西**（`checkout.lock §3`）。
- `sv_ship_to` **底层形状由我适配**（兼容 `localStorage["US"]` 与 `{country:"US"}` 两种历史写法），对外**只经 `SpaceVanta.market.get().country` 暴露**——换形状不改模板。这条封死 Base 说明里那个待确认坑。

---

## §7 交付物（每 rev）

- [ ] `contracts/endpoints.json` diff + 版本号（active/deprecated/null 三态标注齐全）
- [ ] 新增/变更接口的 `contracts/api/<name>@<ver>.json`（请求/响应/错误码/降级/幂等/缓存）
- [ ] Zod schema + **拒未知键**用例输出
- [ ] 八接口降级对拍结果（超时/429/503 各一例，返回体进快照）
- [ ] 规则同构 golden cases（服务端 ⟷ A1 驱动层纯函数，逐例 PASS/FAIL）
- [ ] D1 新 migration 文件 + 回滚说明 + 对应 handoff 段号
- [ ] 幂等实测：连点 3 次 → D1 只有 1 条 `commit_log`（截图/查询输出）
- [ ] **`checkout_touched = false`** 断言（若 true → 必须挂 `checkout.lock` APPROVED 链接）
- [ ] 本 rev 是否提出/执行了路由提案？有 → 附 `requests/cursor-to-user-*.md` + APPROVED 痕迹
- [ ] **零硬编码交易值**扫描输出（门禁 [7]）+ **零数字播报**断言（不给 A4 任何预测值）
