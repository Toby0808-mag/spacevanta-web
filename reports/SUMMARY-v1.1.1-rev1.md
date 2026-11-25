# SUMMARY · protocol/v1.1.1 · rev 1

> handoff `PROTOCOL-v1.1.1`（设计/协议侧） × rev `1`（施工侧） · 2026-11-25
> 本文件双写：Git `reports/SUMMARY-v1.1.1-rev1.md`（本份） ＋ Drive `handoffs/snapshots/PROTOCOL-v1.1.1/v1/`

## 1. 这轮推进了什么
- 协议 v1.0 → **v1.1.1** 定稿：骨架豁免 / 四层宪法 / 十五门禁 / 提案制 / 闭环
- 门禁 **12 → 15**：新增 G13 Worker 路由冻结、G14 页面路由冻结、G15 Fallback 可达性
- 修掉 3 个会**假绿/误杀**的脚本 bug：G8 计数隔层丢失、G8 presets 去重、G13 计数隔层丢失
- 6 个真实 Worker 域名登记入 `endpoints.json`（bundle/catalog/market-festival/shipping-intelligence/mto-status/promotion）
- 三条页路由冻结：`/pages/bundles` · `/pages/made-to-order` · **`/pages/scene`**（原 `skin` 口误已清）
- **PROP-001（worker/scene）、PROP-002（AE 打点 + KV 非交易缓存）经用户批准**，留痕落 `handoffs/requests/`
- 新增 §3.5 边缘能力池（鼓励首次使用）+ §3.6 **Fallback 六级阶梯 L0→L5**（回退是交付物）

## 2. 相对上一轮的变化
- Agent 命名：**A2 由 assets 改为 model**（资产归并入 A2 职责，避免与 A3 的 R2 运维重叠）
- 协议文件**从 `protocol/` 提升到仓库根**，`.cursor/` 单独提根（Cursor 只自动加载根层）
- season **复用 `space-vanta-market-festival`，不另建 worker/season**（省一个部署单元）
- scene 线归 PROP-001 的 `worker/scene`；mto 写路径仍 `pending_proposal`
- skill 口误全局清除：`skin`（业务线名保留）≠ `scene`（页面路由名），新命名一律 scene

## 3. BLOCKED / DEFERRED（原样上浮，不许藏）
- `BLOCKED_BY_APPROVAL`：无（PROP-001/002 已批）
- `BLOCKED_BY_CONTRACT`：`scene.url` = null（等 A3 部署回填）；`mto_write` 未提案
- `BLOCKED_BY_DESIGN`：MTO 独立页 加载/空/满 三态图纸未给；Scene 枢纽空态未给
- `BLOCKED_BY_HANDOFF`：无
- `BLOCKED_BY_CHECKOUT`：无
- `DEFERRED_TO_A3`：`worker/scene` 部署 + `endpoints.json` 回填 url
- `DEFERRED_TO_A1`：探针 **P0**（本地化 URL 过滤器真名）未探明 ⇒ 全站跳转先留 href 占位
- `DEFERRED_TO_A1`：**P1–P6 体积/耗时探针**未跑 ⇒ `docs/shopline.md#limits` 仍 TBD，按保守值卡

## 4. 降级表（G15-a 必需：每项 async 取数写清 L0→L? 落点）
| 取数点 | key | L0 | 失败掉到 | 终态(L4/L5) | 总闸 |
|---|---|---|---|---|---|
| Bundle 组合池 | `bundle` `/pool` | Worker | L1 D1 → L2 R2 快照 → L3 theme.config | 整块不渲染，退常规单品列表 | — |
| Bundle 试算 | `bundle` `/quote` | Worker | L1 同步重试 → L3 禁用 CTA（**不渲染假价**） | 主 CTA disabled + `$fallback-list` | — |
| 加购提交 | `bundle` `/cart-commit` | Worker | 幂等键复用 → L3 D1 草稿 → toast+Retry | 刷新后 localStorage 静默复原 | — |
| 运费/时效/门槛 | `shipping` | Worker(edge 1h) | L2 R2 快照 → L3 | **整条 Trust 50 信任带隐藏** | — |
| 季节 skin | `market_festival` `/season` | **L0 KV(300s)** | L1 D1 → L2 R2 → L3 last_known_good → L4 | 退默认纸底墨字，季节入口消失 | `?sv_kv=off` |
| 促销文案 | `promotion` | **L0 KV(300s)** | 同上 → L5 静默不渲染 | 促销条消失，页面可购 | `?sv_kv=off` |
| 市场/送达国 | `market` | edge Cache 1h（**不进 KV**） | L1 D1 → L3 默认 `hk` | 按默认市场渲染 | — |
| MTO 回复 SLA | `mto_status` | Worker | L2 → L3 | 保留英文基础引导语 | — |
| 模型解析/母页URL | `scene` `/resolve`（PROP-001） | ⏸ 未部署 | L4 `$fallback-poster` + `View Full Poster` | 静态海报可看不可转，CTA 隐 | 部署前恒 L4 |
| Promote 埋点 | AE `SV_PROMOTE` | 旁路写 | **写 throw 即吞**（不参与响应） | 无观测，功能零影响 | `?sv_ae=off` |
| KV 写失败 | KV→Queues | 异步重试×3 | 死信 → D1 `dead_letter` 待人工 | **禁止 catch{} 吞**（G15-b 抓） | `?sv_kv=off` |

**四态对齐**：`data-sv-state` = `idle | loading | ready | error`；`[data-sv-live]` 仅 `ready` 显示；
`error` 必须已落到上表某一级终态，**不允许停在 loading**。

## 5. 下一轮建议 Gemini 做的（Cursors 不自行决定）
- 补 **MTO 独立页三态图纸**（loading / 空 / 满）+ 活跃/沉睡子模型归属
- 补 **Scene 枢纽空态与降级态**图纸（scene worker 未部署期间访客看到什么）
- 定 **季节换肤切换入口与过渡规范**（母独占换肤 → 子同步展开的视觉规格）
- 确认 Skin 3D 商品卡 A/B 选型决议（你方发起、Drive 留痕，Cursors 不自动生成）

## 6. 锁定态（一行）
`endpoints@v1.1.1`（7 真实域 + scene pending） · `routes@v1.1.1`（3 页冻结） ·
`model-registry@v1.0.0` · `caps: kv/ae=approved_pending_impl, d1/r2=base_layer` ·
`gates@15 (FAIL=0 WARN=4)` · `PROP-001,002 APPROVED` · `sha: 待首次 commit 回填`
