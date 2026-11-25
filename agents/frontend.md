# A1 · frontend — 前端职责卡

> **放置位置**：`protocol/agents/frontend.md`
> 上位：`PROTOCOL.md` / `STACK.md` / `agents.md` / `checkout.lock`。本卡只讲 A1 的活法。
> **开工前必读**：当次 handoff → `contracts/routes.json` → `contracts/endpoints.json`（只读键名）→ 最新快照 `assets-lock.json`。

---

## §1 我拥有 / 我禁动

**拥有（写权，仅限本 rev handoff 点名的子集）**
`sections/**` · `blocks/**` · `components/**` · `layout/**` · `public/**` · `i18n/**` · `templates/pages/*.json`

**禁动**：`worker/*`、`d1/*`、R2 结构与版本、模型几何/锚点、任何端点 URL、`checkout*`、`contracts/*.json` 字段形状。

**路径没给 → `BLOCKED_BY_HANDOFF`，问用户。禁止自造目录。**

---

## §2 写法三条（违反即门禁 FAIL）

1. **模板语法只用白名单**（`STACK.md §B`）：`{{ }}` `{{{ }}}` + 5 过滤器 + `if/for/var/set/component/section/sections/content/schema`。
   ❌ `{%` ❌ `{{!--` ❌ `<style>`/`<script>` 内联 ❌ 自造 helper ❌ 在模板里算业务规则。
2. **schema 内联 + 必带 presets**（`STACK.md §C`）；只放展示开关 / `model_slot` 三值 / `color_scheme` / `style.*` / i18n `t:` 键。
   ❌ `https` ❌ `.glb` ❌ `M-[A-Z]` ❌ 裸 hex ❌ 金额百分比。
3. **i18n 键先行**：先写 `i18n/en.json` → 再 `zh-hans-cn` / `zh-hant-tw`；`options_N` `presets_N` 从 0 连续。

---

## §3 一个 section 的标准骨架（示例，**非规范路径**）

```text
sections/sv-bundle-hero/
├─ sv-bundle-hero.html        ← 同名双段；末尾 {{#schema}}…{{/schema}}（含 presets）
├─ sv-bundle-hero.css         ← 区块私有，html 内写 ./sv-bundle-hero.css
├─ sv-bundle-hero.js          ← 只做 DOM/事件/渲染，不含规则与端点
└─ blocks/
   ├─ motion.html  (+ .css)   ← 类型名 $motion
   ├─ tray-slot.html          ← $tray-slot
   ├─ cross-pool-card.html    ← $cross-pool-card
   └─ fallback-list.html      ← $fallback-list（降级兜底，必给）
```
三处齐：`{{#content "blocks" /}}` ⟺ schema `blocks[].type: "$motion"` ⟺ `blocks/motion.html`。

**CSS 只允许**：`var(--svd-*)` / `var(--sv-*)` 令牌 + `color-{{ section.settings.color_scheme.id }}` + `{{ section.settings | class_list() }}`。
**JS 只允许**：监听 `sv:data / sv:market / sv:season`、调 `SpaceVanta.api.get(key,path,params)`、写 `data-sv-state`、渲染 3D（R3F/three 由构建打包进 `public/`）。
**JS 禁止**：`fetch('https://…')`、读 `localStorage['sv_ship_to']`、拼 `/pages/`、算价格/运费/门槛/件数上限（→ 读 `{{MAX_QTY}}` 等占位符，占位符缺失 → 主 CTA 禁用，**不渲染假价格**）。

---

## §4 取数：唯一姿势（数据槽）

```html
<div data-sv-slot data-sv-kind="bundle" data-sv-key="bundle" data-sv-path="/pool"
     data-sv-params="market, country, locale" data-sv-refresh-on="market">
  {{#component "blocks/fallback-list" /}}        ← 兜底，必给
  <div data-sv-live id="sv-bundle-root"></div>   ← 仅 ready 显示
</div>
```
- 3s 超时 / 永不 reject / 60s 缓存 / 仅 https；`data-sv-state` 四态都要有 UI。
- 端点为 `null`（未登记）→ 停 `idle` + 兜底可见，**静默**，不 Toast 不闪。
- 规则校验（MAX_QTY / MIN_SKUS / MAX_PER_SKU / CROSS_POOL_LIMIT / mixed_mto）**全部来自 Worker 注入的占位符**，前端只做**同源驱动层纯函数**的本地预校验，**不许另写一份规则**。

### §4.1 Bundle 同源驱动层（F-03 硬要求）
- 唯一状态根 `BundleDriverStore`：`masterSlots / auxSlots / flowState / promoteState / cartDispatchIntent / idempotencyKey`
- 唯一入口 `dispatch(intent, payload, mode)`，`mode ∈ desktop_stage | right_panel_inline | drag_drop | mobile_m1 | mobile_s1_flip | promote_pipeline | cart_handoff | ecosystem_slot`
- **禁止**为 Desktop / Mobile / 拖拽 / 内联面板 / 3D 舞台各写一份状态机或重复校验。
- 幂等键在 **cart 阶段定型**，连点 3 次只写 1 条；2s 内可 `Cancel`；`>4s` → `timeout_fallback` 暖调 toast + `Retry`，**已选零丢失**。

---

## §5 升维管线（Promote，S0→S5，逐字时限）

| 态 | 屏上 | 时限/门槛 | 失败去哪 |
|---|---|---|---|
| `S0_COLD_IDLE` | poster + 虚线 silhouette，**0 个 GLB 请求** | 常驻 | — |
| `S1_PROMOTE_ARM` | 卡片 `scale(1.02)` + 左缘 seam 竖线 β0.3→0.6 | **≤80ms 必须给反馈** | 无 JS → 开静态大图页 |
| `S2_CROSSFADE` | poster 1→0 / 3D 0→1，同机位同光比 **ΔE≤2** | **240ms**（`motion=off` → 0ms） | 取模失败 → 停本地 poster + `[View Full Poster]`，保留已选 |
| `S3_HOT_LIVE` | 3D 可环绕/开盖/点槽位，携带已选配置 | 首帧 暖 ≤600ms / 冷 ≤1200ms | WebGL 不可用 → 静态 SVG 托盘 poster，**不白屏** |
| `S4_DEMOTE` | 回 poster，Canvas 保活不卸载，降 LOD1 停 rAF | 120ms（Esc/关闭/滚出） | 焦点还给触发 Promote 的原 Cold 卡按钮 |
| `S5_COLD_PARK` | 显式 `dispose(geometry/material/texture)` | 闲置 60s / 内存告警 | 渲染内存回基线 **±2** |

- 全站 **Hot Canvas ≤ 4**；超限按 LRU 降 `S4`。
- 沉睡卡转录为 **`M-Proto` LOD2 + poster(≤90KB) + `--svd-line` 1px 虚线 silhouette**；**禁新几何、禁旋转、禁高光、禁阴影、禁 GLB 请求**。
- **回母页 CTA 强制**：活跃子 3D 内一个、沉睡子升维后 3D 内一个；URL **只能** `A2 resolve().master_page_url`（→ `routes.json`），**禁拼 `/pages/`**（门禁 [14]）。跳转只给**公开查看权**，不给配置权。

---

## §6 状态机（用 handoff 里的名字，禁自造模糊态）

Bundle 主流程 9 态：`master_intro_peek / master_ready / aux_editing / mobile_flip_compare / boundary_nudge / mixed_mto_hint / submitting_cart / added_to_cart / timeout_fallback`
Promote 6 态：`S0_COLD_IDLE … S5_COLD_PARK`（上表）
**禁止**出现 `loading / error / success / done / init` 当状态名。叠加态（`boundary_nudge` / `mixed_mto_hint`）**不抢占主态**，3.5s 或有效操作自动收起，**无红框、无模态、无促销词**。

---

## §7 降级矩阵（门禁 [12] 会真的掐 Worker 跑一遍）

| 断什么 | 页面必须 |
|---|---|
| `worker/bundle` | 整条组合块**不渲染** → 退常规单品列表；主 CTA 禁用，**不渲染假价格** |
| `worker/shipping` | Trust 50 信任带整条隐藏；生态插槽整条静默隐藏（**禁灰置"即将上线"**） |
| `worker/mto` | 保留英文基础 F2 引导语；MTO 卡照常可点，提交走 `pending` |
| `worker/season` | 季节截单标记不渲染，`--sv-season-accent` 回落到 seam |
| WebGL 不可用 | 静态暖纸 SVG 托盘 poster + 槽位信息卡，可加购 |
| 端点未登记（null） | 槽 `idle` + 兜底 private block 可见，静默 |
| JS 全关 | 商品/价格/加购走 Shopline 原生路径可用（渐进增强） |

**总闸必须真生效**：`?sv_motion=off`（动效 0ms 淡切，已选零丢失）· `?sv_season=off`（持久关闭，`?sv_season=on` 恢复）· `?sv_agent=off`（G-0 圈整条熔断，**不留空位**）。

---

## §8 性能与 a11y 硬指标

LCP ≤2.5s（4G 冷）· 375px 零横向滚动 · 底部吸附栏留 `safe-area` · 焦点环 `--svd-focus` 可见 · `Esc` 归还焦点 · `prefers-reduced-motion` 全链路 · W/C ≥1.60 · 信息不靠纯色承载。

---

## §9 体积与静态件

- 区块私有 css/js 放同目录，`./x.css` 引用；**禁内联**。
- `public/` 单文件上限以 `docs/shopline.md §limits` 实测表为准；**未填前 ≤60KB**，超限 FAIL。
- section `.html` ≤80KB；poster ≤90KB；整包 ≤10MB（Base 1.9MB/745 文件作参照）。
- **3D 绝不进 `public/`**，一律 `assets.spacevanta.com/<line>/<id>/<ver>/...`（A2 给 URL）。
- 版本路径不可变 → **改版换路径不覆盖**；缓存 `immutable` 长缓存。

---

## §10 收工 Checklist（每条都要在 SUMMARY 里能对上）

- [ ] `sections/<A>/<A>.html` 同名双段成立
- [ ] 每个 schema 都有 `presets`；`options_N`/`presets_N` 连续
- [ ] private block 三处齐；有 `$fallback-*` 兜底块
- [ ] schema / css / js 里零 `https`、零 `/api/`、零 `/pages/`、零 `M-`、零裸 hex、零金额
- [ ] 所有 `| t()` 键在 `en.json` 存在，zh 已补
- [ ] `data-sv-state` 四态都有 UI；断 Worker 实测截图已存快照
- [ ] 沉睡卡确认 **0 个 GLB 请求**（Network 面板截图进快照）
- [ ] 活跃子 + 沉睡子升维后**都有回母页 CTA**，URL 来自 `resolve()`
- [ ] 三个总闸实测生效；`reduced-motion` 实测
- [ ] 375px 无横滚；LCP 实测数写进 SUMMARY §4
- [ ] 新增/删除了哪些骨架文件，一句一行（§0 骨架豁免）
- [ ] `checkout_touched = false`（若 true → 必须挂 APPROVED 链接）
- [ ] 十五门日志贴进 MANIFEST；SUMMARY ≤40 行六段写完并落 `handoffs/outgoing/`
