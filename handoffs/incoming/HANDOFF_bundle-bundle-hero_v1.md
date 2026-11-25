# HANDOFF_bundle_bundle-hero_v1.md
> 放置位置：`protocol/handoffs/incoming/HANDOFF_bundle_bundle-hero_v1.md`
> 依据：`HANDOFF_TEMPLATE.md` 八段 · Appendix B v1.0 / C v1.0 / A v1.1 / PALETTE v1.2.1 / L2.5 v03 母模型 1.0
> 状态：**APPROVED（用户已批准）→ 可开工**。施工方 Cursor（A1 主导，A2/A3 借调）。
> 这是 **H-001**：目的不是铺全站，是**验证协议本身**（十五门 + 快照回传闭环跑通一次）。

---

## 段 0 · 抬头
```text
HANDOFF_ID    : H-20261125-bundle-hero
LINE          : bundle
MODEL_LINE    : Bundle_MOTHER
IS_FLAGSHIP   : yes（bundle 线不适用 flagship 判定，母恒存）
PAGE_ROUTE    : /pages/bundles                     ← contracts/routes.json 已冻结
TEMPLATE_FILE : templates/pages/bundles.json
SECTION       : sections/sv-bundle-hero/sv-bundle-hero.html
MODEL_SLOT    : hero_master（页内 Cold 卡阵用 active_child / dormant_poster）
DNA 强度档     : 中（α 12~20% / β 0.3~0.5 / δ=0..1 / γ 0.35 / W/C ≥ 1.60）
交易层归属     : worker/bundle（唯一写入）+ 只读 worker/shipping、worker/mto、worker/season
本单批次       : **仅 A 组**（纯呈现与 3D 装配壳）。B 组（quote / cart-commit 交易回算）与 C 组（埋点）另行 handoff，本单不做。
FREEZE_ID     : sv_bundle_mother_v1_0
依赖 handoff   : 无（本单是 H-001）
本单不含       : ① 任何 checkout 改动 ② 真实加购与算价写入 ③ MTO 提交 ④ 季节皮肤内容 ⑤ G-1 智能体化身
```

前置闸门
- [x] 无上一 rev（首单）；`docs/changelog.md` v1.0.1 已读
- [x] 母模型冻结面未变（§2.5 逐字照抄 Appendix C v1.0）
- [x] worker key 登记核查：`market`✅active、`shipping`✅active、`bundle`⏸null、`mto`⏸null、`season`⏸null
     → 本单所有交易/礼遇/跨池数值走 `{{PLACEHOLDER}}` + `$fallback-list` 兜底；`bundle/mto/season` 三处**预期** `BLOCKED_BY_CONTRACT`，**不阻塞 A 组呈现**，写进段 7
- [x] hardcodedTransactionValues = 0（段 4 全占位符）

---

## 段 1 · 功能清单（本单只开 3 个 F-ID，其余留给后续 handoff）
| F-ID | 功能名 | 触发条件 | 状态迁移 | 空/错/超时降级 | 可见反馈 | DNA(α/β/δ) | 交易层归属 |
|:--|:--|:--|:--|:--|:--|:--|:--|
| **F-01** | 预搭配首屏 + Mobile 微开盒冒泡 | 进 `/pages/bundles`（Mobile 首次） | `master_intro_peek`→`master_ready` | 读不到 bundle → **整条组合块不渲染，退常规单品列表**；`reduced-motion` 跳过开盒 | 顶盖轻启 12° + 暖纸气泡 2.8s 或触控即收；首屏唯一一行 Trust 50 | 15%/0.45/0 | 只读 bundle + shipping（本单 → 兜底隐藏 Trust） |
| **F-02** | 3D 托盘舞台 + 顶盖 `SV` 检视 | 点 `Tray View` / `Top SV Close-Up` / `Peek 12°` / `Open` / `Close` / 点槽内物品 | `S3_HOT_LIVE` 内镜位与盖态插值 | WebGL 不可用 → **静态暖纸 SVG 托盘 poster，不白屏** | `Child_Tray` 暖纸内底 + 深枪灰外框 + 亮金属原色 `SV` 零穿模；点单品抬起显示 `M-Proto` 信息卡 | 15%/0.40/0 | 无（纯呈现） |
| **F-06** | Cold → Hot 升维 / 降维 + 内存回收 | 点 Cold 卡 `Promote 3D` / `Esc` / `Demote` / 闲置 60s / `Park(S5)` | `S0→S1→S2→S3→S4→S5` | LOD 超时/失败 → **停本地 poster + `View Full Poster` 按钮，保留已选，零转圈零白屏** | S1 ≤80ms `scale(1.02)`+左缘 seam；S2 240ms 同机位淡切；Esc 焦点还给原 Cold 卡按钮 | 15%/0.50/0 | 无（受全站 Hot ≤4 约束，本页 Hot=1） |

> **回母页 CTA（A-3 恒真断言，本单强制）**：本页 Hero 自身即母页，故 F-02/F-06 的 3D 视图内 CTA 指向**本页锚点 `#bundle-hero-stage`**（文案 `View full set`）；**同一套 private block `$model-cta` 必须写成可接任意 `master_page_url` 的通用件**——H-002 做 scene/mto 商品卡时直接复用，不许到时再改。

---

## 段 2 · 状态矩阵
### 2.1 本单 5 态（A 组范围；`submitting_cart`/`added_to_cart`/`timeout_fallback` 属 B 组，本单不出现）
```text
状态               渲染块                          数据来自                    可点控件                              降级目标
master_intro_peek  Mobile 顶盖12°+暖纸气泡          registry(bundle)           [View full set][横滑翻面][Got it]      2.8s/触控→master_ready
master_ready       桌面双栏 / Mobile 满装预搭配      registry+shipping(兜底)    [Tray View][Top SV Close-Up][Open]    registry 缺→块不渲染退单品列表
aux_peek_only      仅 poster 舞台（WebGL✗）         local poster               [View Full Poster][继续浏览]          保持可购入口不外溢到 checkout
promoted_hot       S3 单 Hot Canvas 可环绕            A2 resolve(active/dormant) [Demote][Park][Esc][View full set]   取模失败→停 poster+按钮，已选不丢
timeout_fallback   非阻塞暖调 toast                   —                          [Retry][继续浏览]                    回上一有效态，绝不白屏
```
### 2.2 Promote 6 态：**逐字照抄 HANDOFF_TEMPLATE 段 2.2**，时限不得改（S1≤80ms / S2 240ms(off=0) / S3 暖600冷1200 / S4 120ms / S5 闲置60s，内存回基线±2）
### 2.3 同源驱动层
唯一状态根 `BundleDriverStore{ masterSlots(6), auxSlots, flowState, promoteState, idempotencyKey }`
唯一入口 `dispatch(intent, payload, mode)`；本单 mode 仅用 `desktop_stage | mobile_m1 | promote_pipeline | right_panel_inline`
校验纯函数 `MAX_QTY/MIN_SKUS/MAX_PER_SKU/CROSS_POOL_LIMIT` **本单从 `{{PLACEHOLDER}}` 读，B 组接 worker 后同构替换**，UI 不动。

---

## 段 2.5 · 母模型锚点冻结面 & 资产谱系（**逐字冻结，本单不改**）
- `Bundle_MOTHER` 纯 `THREE.Group`；**永不上材质/高光/接触阴影**（仅 `Mother Rig: ON` 显虚线框+空心锚点球）
- `anchor_A:[tray_carrier,bay_1,bay_2]` · `anchor_B:[bay_3,bay_4]` · `anchor_C:[bay_5,bay_6,eco_slot]`；snap **6°/3mm**；序 **A→B→C→A**；`seam_rail` 闭环
- 零穿模：`lid 厚 0.08` / `lid 顶 +0.0400` / `plinth 底 +0.0405 高 0.0035` / `SV 组 +0.0440` / 分片 `min.y` 归一化 `y≥0`；开盖 0°/12°/78° + Top SV Close-Up 全程零穿模；`metalRampGuard` 生效
- 托盘材质：内床哑光暖纸 `--sv-paper-subtle` + 暖色 6 格隔板 `--sv-border-warm`；外框 `--sv-gunmetal-dark→gunmetal→slate`(217–224°)，内缘双层 `<Seam aura={true}/>`（2px `--sv-seam-active` + 1px `--sv-seam-aura`）
- 谱系：`M-Proto` 基线 **12 SKU**（LOD0≤120k/LOD1≤45k/LOD2≤12k/poster≤90KB）· Mother **0 面**· Hot 本页 **1**（全站≤4）· Cold 6+6 **0 GLB 请求**
- [x] 本单改动冻结面？ **否**

---

## 段 3 · 组件树与文件落点（**路径已授权，见段 6**）
```text
【新】sections/sv-bundle-hero/sv-bundle-hero.html        ← 内联 schema（含 presets）+ model_slot 三枚举
【新】sections/sv-bundle-hero/sv-bundle-hero.css         ← 只写 --svd-* / color_scheme，禁裸 hex
【新】sections/sv-bundle-hero/sv-bundle-hero.js          ← 只监听 sv:data/sv:market/sv:season；驱动层 + Promote 管线
【新】sections/sv-bundle-hero/blocks/tray-slot.html       ← $tray-slot：单格 6 槽位之一（Cold poster + silhouette）
【新】sections/sv-bundle-hero/blocks/tray-slot.schema 等价声明（内联/同目录，按探针 P3 结论）
【新】sections/sv-bundle-hero/blocks/cross-pool-card.html ← $cross-pool-card：跨池 Cold 卡（drag source）
【新】sections/sv-bundle-hero/blocks/model-cta.html       ← $model-cta：回母页 CTA 通用件（读 master_page_url，禁拼 URL）★H-002 复用
【新】sections/sv-bundle-hero/blocks/seam.html            ← $seam：接缝线 + aura（aura=true 于 gunmetal 父级强制）
【新】templates/pages/bundles.json                        ← {sections:[{type:"sv-bundle-hero"}], order:[…]}
【改】components/product-card/card.html                    ← SV 版：poster + 虚线 silhouette，沉睡 0 GLB
【改】components/styles/color-scheme.css → 并入 dna.css 令牌层
【禁动】checkout*（全路由/样式/JS 注入/中途重定向）
【禁动】worker/{pricing,mto,shipping,season}/*
【禁动】d1/migrations/ 历史迁移；PALETTE 四令牌；artifacts/design/L25_sv_flow_bundle_v03.html（仅留档）
```

---

## 段 4 · 占位符注入表（本单全部只做"缺则隐藏/禁用"，不渲染假值）
| `{{KEY}}` | 位置(F-ID) | 注入方 | 类型 | 缺失/超时 | 缓存 |
|:--|:--|:--|:--|:--|:--|
| `{{POOL_NAME}}` | F-01 | bundle | string | 回落默认英文池名 | Edge 1h |
| `{{DUTY}}` `{{LEADTIME}}` `{{THRESHOLD}}` | F-01 Trust 50 | shipping | 本地化串 | **整条 Trust 带隐藏** | Edge 1h |
| `{{LOCALE_PRICE}}` `{{AUX_LOCALE_PRICE}}` | F-01/F-02 小计 | bundle | 价格串 | **CTA 保持禁用，不渲染假价** | 否 |
| `{{SET_SAVING}}` `{{TIERS_SUMMARY}}` | F-01 | bundle | 礼遇串 | 隐藏礼遇条，保留基础装盒 | 否/1h |
| `{{MIN_SKUS}}` `{{MAX_QTY}}` `{{MAX_PER_SKU}}` `{{CROSS_POOL_LIMIT}}` `{{CROSS_LEFT}}` | F-02 槽位校验 | bundle | int | 禁用添加 + 回落规则页跳链 | 1h/否 |
| `{{ONE_PARCEL_NOTE}}` | F-02 生态槽 | shipping | 串 | **生态槽整条静默隐藏**（禁"即将上线"灰置） | 1h |
| `{{MTO_REPLY_SLA}}` `{{MTO_CART_HINT}}` | F-02 F2 轻提示 | mto | 串 | 回落默认英文引导语 | 1h |
| `{{ORDER_BY}}` | 季节标记 | season | ISO Date | 标记不渲染 | 到点失效 |

---

## 段 5 · 接口与事件契约（本单只用读口）
```text
GET /model/resolve?slot=hero_master&line=bundle&id=Bundle_MOTHER&locale=en-us
 → { url, poster, silhouette, version, perm:{view,compose,recolor:false,reskin_season:false,configure,checkout:false,export},
     master_page_url:"/pages/bundles", budget:{lod:1,hot:true}, ttl:3600 }
GET /model/resolve?slot=dormant_poster&…  → url 必须 null（I：沉睡零 GLB），poster≤90KB + silhouette=lod2
GET /bundle/pool?locale=&cursor=           → {name, items[], crossLeft, next}     （本单 null ⇒ $fallback-list 12 SKU 静态兜底）
GET /market/active → {key,country,source}  ✅active    GET /shipping/quote ✅active（缺 ⇒ Trust 隐藏）
```
- 唯一取数口 `SpaceVanta.api.get(key,path,params,{timeout:3000,ttl})`，**永不 reject**；`data-sv-state = idle|loading|ready|error`
- 事件只监听：`sv:data` / `sv:market{key,country,source}` / `sv:season{id,skin,on}`；**禁读 localStorage `sv_ship_to`、禁拼 worker 地址**
- 总闸：`?sv_motion=off` ⇒ S2=0ms；`?sv_season=off` 持久关；`?sv_agent=off` ⇒ ⌀24mm 圈**不留位**
- 埋点（C 组才接，本单先把调用点留空函数）：`bundle.stage.view` / `bundle.promote.{arm,crossfade,hot,demote,park}` / `bundle.slot.change`，必带 `flow_id=H-20261125-bundle-hero, rev, slot, line=bundle, model_version, locale, duration_ms, outcome`

---

## 段 6 · 路径授权（★本次已指定，Cursor 不得自造；要加路径走 requests/）
```text
SECTION_DIR    : sections/sv-bundle-hero/
MAIN           : sv-bundle-hero.html / .css / .js
PRIVATE_BLOCKS : blocks/tray-slot.html · blocks/cross-pool-card.html · blocks/model-cta.html · blocks/seam.html
CSS/JS 引用    : 区块内 ./sv-bundle-hero.css 、./sv-bundle-hero.js   （禁内联 <style>/<script>）
跨区块共用件    : public/sv/bundle/seam-aura.svg（≤60KB，仅装饰，非 3D）
TEMPLATE       : templates/pages/bundles.json
I18N 键（先落 en.json，再 zh-hans-cn / zh-hant-tw）
  sv.bundle.hero.title / .trust.duty / .trust.leadtime / .trust.threshold
  sv.bundle.hero.tray_view / .top_sv / .peek / .open / .close / .view_full_set / .view_full_poster
  sv.bundle.hero.slot_empty / .slot_add / .swap / .remove / .drag_here_to_remove
  sv.bundle.hero.cross_add / .cross_swap / .boundary_max_qty / .boundary_min_skus / .boundary_cross_limit
  sv.bundle.hero.eco_one_parcel / .mto_hint / .retry / .degraded_notice
  sv.common.view_master_model   ← 回母页 CTA 通用键（$model-cta 必用）
SCHEMA_T       : t:sections.sv-bundle-hero.settings.{enable_3d_viewer,promote_on_hover,model_slot,color_scheme,padding}.label
                + options_0/1/2（model_slot 三枚举）+ presets_0.category="Space Vanta" / presets_0.name="Bundle Hero"
MODEL_REGISTRY : A2 产出 model-registry.json（Bundle_MOTHER + 12×M-Proto + Child_Tray），快照写 assets-lock.json
ENDPOINTS      : 只读 contracts/endpoints.json；bundle/mto/season 为 null ⇒ 不猜域名
```
> 需要段 6 之外的任何路径（例如要新建 `components/bundle-driver/`）→ 发 `handoffs/requests/cursor-to-user-need-components-dir.md` 等用户给，**不许自己 mkdir**。

---

## 段 7 · 已知 blocker 与待裁决（SUMMARY §3 原样回显）
- **BLOCKED_BY_CONTRACT** ×3：`endpoints.json` 中 `bundle.url` / `mto.url` / `season.url` = null
  → 处置：A 组呈现**照做**，走 `$fallback-list`（12 SKU 静态兜底）+ 相应区块静默隐藏；**不猜 `*.workers.dev`**。A3 从部署事实抄入后自动解除，无需改模板。
- **BLOCKED_BY_APPROVAL** ×1：`PROP-001 新增 worker/scene`（为 H-002 的 Scene 枢纽页准备）状态 `PROPOSED_PENDING_USER`，本单不依赖。
- **TBD_PROBE** ×6：`docs/shopline.md §C` 的 P1–P6 未实测
  → 处置：A1 本 rev **第一件事跑 P0(多语言 url 过滤器名)+P1+P2+P3+P4**，回填后按实测值卡；填表前按 public 60KB / section 80KB 保守卡。
- BLOCKED_BY_DESIGN：**none**（本单图纸齐）
- BLOCKED_BY_HANDOFF：**none**（段 6 已授权）
- 遗留假设 3 条（来自 Base 说明 §7）：`sv_ship_to` 形状已定（唯一读法 `SpaceVanta.market.get().country`，A3 适配）；market/country 查询参数名以 A3 实测 worker 为准；`worker/season` 皮肤契约本单不接。

---

## 段 8 · 验收表（逐条可判；`bash protocol/scripts/check_gates.sh .` 必须 FAIL=0）
**机器**
- [ ] 十五门 FAIL=0；WARN 逐条在 SUMMARY §3 解释
- [ ] `.liquid` 计数 0；`{%` 计数 0；`{{!--` 计数 0
- [ ] `sv-bundle-hero.html` 内联 schema **含 presets**（否则编辑器看不见，E-01）
- [ ] schema 段内 `grep -E 'https?://|\.glb|"M-[A-Z]|#[0-9A-Fa-f]{6}|[0-9]+%'` → 空
- [ ] `model_slot` 声明三枚举；`options_0/1/2` 与 `presets_0.*` 编号连续
- [ ] 4 个 private block 三处齐（`{{#content "blocks"}}` ⟺ `"$tray-slot|$cross-pool-card|$model-cta|$seam"` ⟺ 磁盘文件）
- [ ] 模板/JS 内 `grep -nE 'workers\.dev|/api/|/pages/'` → 空（门禁[12][13]）
- [ ] `templates/pages/bundles.json` 文件名命中 `routes.json` 白名单
- [ ] 所有 `| t()` 键与 `t:sections.*` 键在 en / en.schema 存在（zh 两版同步）
- [ ] 区块 `.css/.js` 零裸 hex（只用 `--svd-*` / `color-{{…color_scheme.id}}` / `| class_list()`）
**运行期**
- [ ] Network：`S0` 6 张 Cold 卡 **0 个 .glb 请求**；Promote 后仅 **1** 个 Hot Canvas
- [ ] 连升 5 次不同 Cold 卡 → 内存回基线 **±2**（第 5 个把最久未交互的挤到 S5）
- [ ] `S1` ≤80ms 有视觉反馈；`S2` 240ms；`?sv_motion=off` 时 S2=0ms 且已选不丢
- [ ] 掐掉全部 worker：页面渲染、Trust 带与生态槽静默隐藏、**无白屏 / 无 console error / 无 toast 风暴**
- [ ] WebGL 强制禁用（`--disable-webgl`）：静态 SVG 托盘 poster，`View Full Poster` 可见，主流程不阻断
- [ ] 375px 零横向滚动；底部吸附栏留 `safe-area`；`prefers-reduced-motion` 生效
- [ ] 焦点序：Cold 卡按钮 → 升维后 CTA → `$model-cta`（View full set）→ 继续浏览；`Esc` 焦点回原 Cold 卡
- [ ] **A-3 断言**：S3 视图内找得到 `$model-cta`，`href` 来自 `resolve().master_page_url`（非拼接）
- [ ] 顶盖 0°/12°/78° + Top SV Close-Up 目视零穿模，`SV` 为原色亮金属且 `metalRampGuard` 未报警
- [ ] `?sv_season=off` / `?sv_agent=off`（⌀24mm 圈消失不留位）实测生效
**交付**
- [ ] zip 根层直出 `layout/ sections/ templates/ blocks/ components/ public/ i18n/ theme.schema.json theme.config.json`，≤10MB
- [ ] `MANIFEST.json` 字段齐（含 `checkout_touched:false`、`blockers` 非空数组、model_refs、contracts 版本）
- [ ] `handoffs/snapshots/H-20261125-bundle-hero/v1/` 六件齐 + `handoffs/outgoing/…/v1/SUMMARY.md` ≤40 行六段
- [ ] SUMMARY 第 1 段能被 Gemini 扫 10 行读懂"这轮推进了什么"；第 3 段原样含上面 4 条 blocker
- [ ] **用户点发送**回 Gemini → 才算 done；否则标 `delivered_pending_feedback`
- [ ] 上传 Shopline 后台按 `docs/shopline.md §E` 14 项过一遍，报错原文进 `requests/`，**不猜着改**
