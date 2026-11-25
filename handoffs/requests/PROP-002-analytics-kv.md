# PROP-002 · Analytics Engine 打点 + KV 缓存（非交易配置）—— ✅ APPROVED（范围已收窄）

| 字段 | 内容 |
|---|---|
| 提议方 | A3 Backend |
| **用户批准** | **2026-11-25（口头「批准」）→ 本文件落盘即 Drive 留痕** |
| 状态 | `APPROVED_PENDING_IMPL` |
| 原则依据 | 协议 §3.5「**「没做过」不是否决理由，「说不清回退」才是**」 |

## 为什么逻辑上成立
1. **Analytics Engine（AE）**：Promote S0→S1 要 ≤80ms、S2 ≤240ms（§4 升维时限），
   但当前**边缘段耗时零实测**——浏览器探针 P6 只看得到客户端段。AE 是纯旁路写，
   写入 throw 即吞、不参与响应判定 ⇒ **炸了也没人感知**，是最安全的"首次用新能力"。
2. **Workers KV（命名空间 `SV_CONFIG`，TTL 300s）**：季节/促销文案属**读多写少、日更级别**，
   现每次请求打 D1。命中 KV 后 D1 QPS 可降一个数量级；可容忍 60s 陈旧 ⇒ 逻辑成立。

## ⚠️ 批准时的范围收窄（重要，防止后世误读）
- ✅ KV **只放**：季节 skin 标识、促销文案、主题开关类配置
- ❌ KV **不放**：`price` / `stock` / `shipping_quote` / `idempotency_key` / `order_status`（§3.6 硬规 3 强一致红线）
- ❌ **市场地域判定仍走 D1 + edge Cache 1h，不进 KV**（`sv_ship_to` 解析链不动，避免双源）
- ❌ **bundle 试算 / 幂等 / 运费 一律 D1**，KV 碰都不碰

## ADD
- AE dataset `SV_PROMOTE`，metrics：`stage, t_ms, result, fallback_level`；命名 `sv_promote_<stage>`
- KV namespace `SV_CONFIG`，TTL 300s，key 形如 `season:active:{market}` / `promo:banner:{market}:{locale}`
- 总闸：`?sv_ae=off`（停写）、`?sv_kv=off`（强制回 D1），**无需重新部署即生效**

## FALLBACK（六级阶梯落点，G15 会校）
| 能力 | L0 | 掉到 | 终态 |
|---|---|---|---|
| AE | 旁路写 | 写 throw 即吞 | 响应完全不受影响（不计入阶梯，纯观测） |
| KV 读 | L0 KV hit | miss/异常 → **L1** D1 现算 → **L2** R2 日快照 → **L3** `theme.config.last_known_good` → **L4** 区块兜底子块 → **L5** 静默不渲染 | 绝不白屏/转圈 |
| KV 写 | 写 KV | 失败 → Queues 重试(幂等) → 3 次死信 **D1 `dead_letter`** | **禁止 `catch{}` 吞掉**（G15-b 会抓） |

## DEL / 并存期 / 回滚
- DEL 无；并存期不适用（新增）
- 回滚：`?sv_kv=off` + `?sv_ae=off` 即时生效 → 观察 7 天 → 再决定清 namespace
- KV namespace 保留 7 天观察期，不即刻删

## 验收（进 H-001 或下一张 handoff 的验收表）
1. `?sv_kv=off` 时 D1 QPS 回到基线、页面无差异（A/B 目视 + 耗时对比）
2. 人为让 KV `get` throw → 页面仍出季节文案（走 L1），`data-sv-state` 终态为 `ready`
3. AE 写入 throw（故意填错 dataset）→ 响应码/内容零变化
4. 十五门 G15(a/b/d/e) 全绿；G15-c 人工：断网跑一遍无白屏
5. 静态扫描确认 `price|stock|shipping|idempotency|order_status` 未出现在任何 KV 读写 key 中
