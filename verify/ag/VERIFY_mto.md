# VERIFY_mto.md（Antigravity 施工验证报告 · L5@v01 · 对齐 L3 r2）

- **覆盖模块：** `sv_flow_mto_ecosystem_v02`（MTO 母模型独立页 `made-to-order` + 实时追踪页 `mto-status` + Hot 活跃子模型 + Cold 沉睡子模型 `01` 样式 2D 平面映射 ×5）
- **唯一施工依据：** Drive `sv-model/mto/L5/v01/L5_mto_ecosystem_v01_手册.md`（`L5@v01`，已获「批准施工」）+ `AGENT_ASSET_REGISTRY_mto.md`（L3/L4 仅作参照，未复制任何 L3 预演 HTML 或代理体进主干）
- **施工方：** Antigravity（分支 `ag/mto-L5v01`）
- **验证日期：** 2026-11-28
- **验证环境：** Google Chrome + SwiftShader WebGL2 (Playwright 1.65.1) `1440×900` / `375×812` + `GLTFLoader` 二进制解析核验 + `scripts/chain_check.py` + `STRICT_HEX=1 scripts/check_gates.sh` + `scripts/code_checklist.py check`

---

## 一、五道硬闸汇总（`Antigravity_施工协议_v2.4` §7）

| 硬闸 | 结论 | 实测证据摘要 |
|---|---|---|
| **0. 清单闸（v2.4）** | **PASS** | 开工前 `pull`、完工 `submit` 全覆盖（`code-checklist/CODE_CHECKLIST.md` + `mto-mother` / `mto-status` / `mto-child-hot` / `mto-child-cold` / `page` 共 6 份清单）；修改的全局文件（`dna.css`、`sv-core.js`、`BundleDriver.js`、`sv-promote-portal.js`、`en.json`、`zh.json`）均于 `code-checklist/source-keep/` 完整保留修改前源实现（`KEPT`，`0` HOLD），`code_checklist.py check` 全绿 |
| **1. L5 一致** | **PASS** | 对照 `L5@v01` §1–§9 与 §8 `V-01..V-10` 逐条实测通过；严格按 §6 `ASSET_MAP` 中 `owner = Antigravity` 边界施工，Cursor 归属的 `MTO_WORKER_API_V01`、`SV_MOTHER_MTO_v01`、`AGENT_SLOT_MTO_G0` 均按只读契约接入，零越界写入 |
| **2. 令牌与色相** | **PASS** | `STRICT_HEX=1 scripts/check_gates.sh` 零裸 hex 通过；除全局令牌定义文件 `web/public/sv-dna/dna.css` 外，全部 `sections / components / sv-bundle` 裸 hex = `0`；原位确认轻提示采用 `var(--sv-sage-tint)`（实测 `rgb(232, 244, 240)`，`ink/sage-tint = 13.89:1` AAA，`ink-muted/sage-tint = 5.12:1` AA）+ 左侧 `2px var(--sv-seam)`；深金属态均叠 `[data-sv-seam-aura="true"]`（`11.72:1` AAA）；`W/C`：Track 01/02 常态 `2.68`（脉冲瞬态 `2.35 ≥ 1.60`）、Track 03 常态 `3.44`（脉冲瞬态 `2.90 ≥ 1.60`）、Cold S0 `6.19 ≥ 1.60` |
| **3. 稳定性** | **PASS** | 断网/接口缺席/`?sv_sim_timeout=1` 超时回退/`?sv_vp5=1` LOD 失败回退/六大总闸（`?sv_kv=off`、`?sv_season=off`、`?sv_3d=off`、`?sv_motion=off`、`?sv_agent=off`、`?sv_mock=1`）/`<noscript>` 全场景控制台与页面报错 = `0`，零白屏、零死循环、零阻塞首屏 |
| **4. 资产预算** | **PASS** | `SV_MOTHER_MTO_v01` 运行时实测 `triangles = 0, meshes = 0, materials = 0, shadows = 0`；5 款跨品类商品模型 `SV_MTO_SKU_01..05_v01.glb` 单文件 `4,212–11,392 B ≪ 300MB`（`LOD0 = 36–288 tris ≤ 120k`，`poster1600.png = 8,069–11,565 B ≤ 90KB`）；`SV_CHILD_COLD_MTO_01MAP_v01` 5 张平面映射图单图 `5,119–5,923 B ≤ 90KB`、屏宽占比 `9.17% vw ≤ 10% vw`；全页 Active Hot Canvas `= 1 ≤ 3`，Cold `S0` 下 `Active WebGL = 0 · GLB Requests = 0` |

---

## 二、L5 §8 验收清单逐条核验（`V-01 .. V-10`）

| 编号 | 责任方 | 结果 | 实测数值与证据 |
|---|---|---|---|
| **V-01（D-09 顺序 & Trust 50）** | Antigravity | **PASS** | `1440×900` 实测纵坐标：`trustTop (0px) <= motivateTop (1px) < rememberTop (860px)`，严格遵循 `[data-d09="Trust"] → [data-d09="Motivate"] → [data-d09="Remember"]` 无倒置；无 Worker 数据时 `[data-sv-slot="mto-key-trust-bar"]` 实测 `trustHiddenInitially === true`（零 `· ·` 残缺分隔符）；注入 `sv:data` 后固定顺序渲染 `["Duties & taxes included", "5-7 business days", "Complimentary Space Express tier"]` + `Details & Track ↗`；全仓写死交易数字 = `0`。 |
| **V-02（01 磁吸与弧线换位）** | Antigravity | **PASS** | Track 01 居中主块 + 4 卫星块（`HS_MTO_01_SAT_01..04`）支持 `4.5s` 自动轮播与舞台悬停暂停；悬停卫星触发 `+14px` 抬升 + `4°/6px` 向心磁吸 + `1px` 虚线桥，`#mto-whisper-i1`（实测位于舞台壳下方精确 `whisperGapPx = 16px`）原地切句延迟 `whisperLatencyMs = 0ms ≤ 80ms`；点击卫星触发 `320ms` `clip_sat_arc_swap` 弧线换位零穿模；点击 `Customize This (02) →` 携带 `SV_MTO_SKU_02`（`Woven Linen Desk Folio`）无损移交 Track 02 且 `Active WebGL` 保持 `1`。 |
| **V-03（02 左轨与分层阻尼）** | Antigravity | **PASS** | 左轨 `[data-sv-left-sku-dock]` 实测 `dockCanvasCount === 0`（Cold 2D `0 WebGL`）；选定 `form = "body_tapered"`, `finish = "surface_satin_slate"`, `spec = "label_monogram_tag"`, `note = "Custom 18mm recessed lip"` 后切换左轨至 `SV_MTO_SKU_05`（`Honed Travertine Valet Tray`），实测四项配置 `100%` 保留未重置；点击 `HS_MTO_02_FINISH` 触发 `clip_layer_part`（目标层 `+12px` 抬升、邻层 `+3.5px` 阻尼）并展开锚点浮层，按 `Esc` 收起且焦点精准归还 `HS_MTO_02_FINISH`；从 Hot Child（`/en-gb/pages/spotlight`）Mode A2 预填后点击 `Continue & Submit in MTO Studio →`（URL Query + `sessionStorage` 30m 双写），自动打开 `/en-gb/pages/made-to-order` Track 02 并完整还原 `Brushed Thermal Carafe` 与全部预填项（Zero Reset）。 |
| **V-04（03 暖调低门槛与合规预检）** | Antigravity | **PASS** | Track 03 暖调亚麻折页脊扣金属占比 `α ≤ 9%`；悬停 4 张场景卡或 `HS_MTO_03_FOLIO_COVER` 时折页微开 `25%` 并拉出虚线导引；点击展开三翼暖纸 DOM 表单（`clip_folio_unfold` `320ms`），切换目标市场至 `en-au` 并输入 `"lithium battery module"` 实时刷新 `[data-sv-import-text]` 为 `"Restricted air-freight item detected for EN-AU..."`；`targetMarket` / `budgetBand` / `qtyBand` 三项轻意图门槛齐全且零硬编码价格。 |
| **V-05（★ `clip_submit_in_place_ack` 原地停留验收）** | Antigravity | **PASS** | 在 Track 02（预滚至 `scrollY = 90`）与 Track 03 点击提交后实测：① **页面零跳转**（`hrefAfter === hrefBefore`）、**视口零滚动**（`scrollYAfter === 90`, `CLS = 0`）、**模型与表单翼原地不折叠**（`canvasStillVisible === true`, `folioStillOpen === true`）；② 触发单次不循环 `clip_submit_in_place_ack` 接缝轻脉冲（`durationMs = 420ms`，Track 02 `betaPeak = 0.45, auraPct = 2.4%, wcMin = 2.35 ≥ 1.60`；Track 03 `betaPeak = 0.42, auraPct = 1.8%, wcMin = 2.90 ≥ 1.60`）；③ 提交按钮原位展开 `--sv-sage-tint`（`rgb(232, 244, 240)`）动态轻提示条，清晰展示 `{{MTO_REQ_ID}}` 与工作日 Reply 说明（Track 02：`"Reply in 1-2 business days · Includes up to 1 free revision before you confirm · Zero charge until approved."`；Track 03：`"Free sourcing research (Max 3-5 business days) · EN-AU import compliance verified before confirmation."`），焦点保持在原位确认条内（`focusInAck === true`）并由 `aria-live="polite"` 播报，同步刷新 `#mto-whisper-i1` 与底部 `[data-sv-remember-req]`；④ `?sv_motion=off` 下实测 `motionOffAckDurationMs === 0`（`0ms` 静态直出）。 |
| **V-06（幂等、1 次修改与 Magic Link TTL）** | Antigravity | **PASS** | 对主提交按钮连续快速点击 3 次，实测 `requestedEventCount === 1`，第 2/3 次拦截并显英文防重提示 `"Request already submitted — duplicate click ignored."`；在 `/en-us/pages/mto-status` 未 `approved` 前实测 `priceBefore === ""` 且 `quoteHiddenBefore === true`（全页 `zeroPriceInDom === true`）；第 1 次点击 `Request Revision` 成功（`1/1`）并废止旧报价链，第 2 次点击明确拦截（`"Complimentary revision allowance reached (1/1) — second revision blocked (409)."`）；注入 `approved` Magic Link 数据后解锁 `"USD 185.00"` + `"Quote validity: 72h window"` 并启用加购按钮；模拟超过 72h TTL 后切入 `quote_expired`，价格清空隐藏、`approveDisabledOnExpire === true`，并开放保留原规格一键重审。 |
| **V-07（D-08a Desktop SEO）** | Antigravity | **PASS** | Desktop 实测 `h1Count === 1`（单一 `<h1>`），Remember 区下方 `[data-sv-desktop-seo]` 含 `1` 个 `<h2>` 与 `3` 行有序 `<h3>` 可抓取语义要点（两段式履约接力 / 核准前零扣款与免费微调 / 目标市场进口合规预检）；`<head>` 含完整 `application/ld+json`（`headJsonLdCount === 1`，零写死价格）、`<link rel="canonical">` 及 `7` 条 `hreflang`（`en-us`、`en-gb`、`en-au`、`en-ca`、`en-sg`、`en-hk`、`x-default`）；Cold 5 卡 `<img>` 100% 具描述性 `alt`（`allAltsPresent === true`）。 |
| **V-08（D-08b Mobile 375px）** | Antigravity | **PASS** | `375×812` 实测 `overflowX === 0`；3D 舞台上方严格仅 `linesAboveStage = 2` 小行（Trust 单行 + `MtoMobileGlanceL2` 单行，`stageTopPx = 82px`），指针视差已禁用；方案 D1 实测 `schemeD1SeoHidden === true`（视觉零长文区）+ 底部吸附栏含 `Details & Track ↗` 与主行动按钮（`stickyCtaHeightPx = 44px`，带 `env(safe-area-inset-bottom)`）+ 右下 G-0 虚线圈 `g0RightPx = 365px ≤ 375px` 零裁切；弱网自动降档实测：`?sv_net=3g` 自动切 `tier = "r1"`（剥离热点与自动轮播），`?sv_net=2g` 自动切 `tier = "poster"`（`Active WebGL = 0`，直显本地 2D 海报）。 |
| **V-09（Cold Promote & 性能压测）** | Antigravity | **PASS** | Cold 独立页（`/en-us/pages/cold`）渲染 5 张 `01` 样式 2D 平面方块映射卡（`cardCount === 5`，单图屏宽占比 `maxFramePctVw = 9.17% ≤ 10%`，卡内表单数 `formsInCards === 0`）；`S0_COLD_IDLE` 下实测 `canvasCountInS0 === 0`、`bundleDriverLoadedInS0 === false`、`glbCountInS0 === 0`；点击 Card 3（`SV_MTO_SKU_03`）升维实测 `S0 → S1(≤80ms) → S2(240ms, ΔE≤2) → S3(geoSource: "glb", activeWebGL: 1)` 且 `aria-live="polite"` 播报就绪；按 `Esc` 走 `S4(120ms)` 后 `document.activeElement` 精准归还 Card 3 的 `<button data-action="mto-cold-promote">`（`isBody === false`）；`V-P5`（`?sv_vp5=1`）零等待停本地 2D 平面图 + `View Full Poster`；`V-P6` 连续 5 轮升维/退维/`S5 dispose()` 实测 `deltas = [0, 0, 0, 0, 0]`（严格落在 `±2` 内，`activeAfter = 0`）。 |
| **V-10（GLB、六大总闸与零违规扫描）** | Antigravity | **PASS** | 全部 `.glb` 实文件 `≤ 11.4 KB ≪ 300MB` 且实测面数已回填下表；六大总闸（`?sv_kv=off`、`?sv_season=off`、`?sv_3d=off`、`?sv_motion=off`、`?sv_agent=off`、`?sv_mock=1`）全数生效，其中 `?sv_agent=off` 下 `[data-sv-agent-slot="g0"]` 整条 DOM 移除（`agentDomCount === 0`）；`web/public/` 与 `web/sections/` 零 `.ts`、零 G16 设计原件、零 `MOCK`、零裸 hex、零 `{{!--` 模板注释、零 `| default:` 过滤器，`checkout*` 改动文件数 = `0`。 |

---

## 三、L3 `r1` / `r2` 热点表与 6 条 C1 动效专项核验（`r_target = r2`，严禁越界 `r3`）

### 3.1 `r2` 热点核验表（单屏活跃热点 `≤ 5` Desktop / `≤ 3` Mobile，`r1` 档全剥离）

| 热点 ID | 所属轨道 | 触发与联动表现 | 键盘 / 回落行为 | `?sv_motion=off` | 结果 |
|---|---|---|---|---|---|
| **`HS_MTO_01_SAT_01..04`** | Track 01（4 卫星块） | 悬停 `+14px` 抬升 + `4°/6px` 向心磁吸 + `1px` 虚线桥 + `≤80ms` 刷新 `#mto-whisper-i1`；点击触发 `320ms` 弧线换位 | `Tab` / `Enter` / `Space` 可达；移出平滑归位 | `0ms` 直切 | **PASS** |
| **`HS_MTO_02_FORM / FINISH / SPEC`** | Track 02（3 锚点层） | 悬停/点击目标层 `+12px` 抬升、相邻层 `+3.5px` 阻尼并点亮 `SV_MOTHER_MTO_v01` 虚线导轨；点击展开锚点浮层 | 点 `Done` 或按 `Esc` 收起且焦点归还原热点按钮 | `0ms` 定格分离态 | **PASS** |
| **`HS_MTO_03_FOLIO_COVER`** | Track 03（亚麻折页） | 悬停封面或 4 张场景卡时折页缝微开 `25%` 并拉出虚线导引；点击展开三翼暖纸表单 | 点 `Fold Back` 收合且保留已填草稿 | `0ms` 静态展平 | **PASS** |

### 3.2 `r2` 6 条 C1 触发型动效核验表（零循环光污染，含 `v02` 新增 `clip_submit_in_place_ack`）

| Clip 名称 | 梯度 | 规格时长 | 触发条件 | 实测表现 | `?sv_motion=off` / `reduce` | 结果 |
|---|---|---|---|---|---|---|
| **`clip_track_morph`** | `C1` | `360ms` | 切换 `01 / 02 / 03` 或带参移交 | 唯一持久 Canvas 内平滑过渡模型与相机预设，`Active WebGL` 恒为 `1` | `0ms` 直切 | **PASS** |
| **`clip_sat_arc_swap`** | `C1` | `320ms` | 点击 Track 01 卫星块或轮播 | 卫星与中心主块沿上下错峰弧线互换，零穿模 | `0ms` 直切 | **PASS** |
| **`clip_magnetic_levitate`** | `C1` | `4.2s` | 活跃舞台微浮空 | `±2.5px` 正弦微呼吸耦合接触阴影（半径 `+3%` / 不透明度 `-6%`）；Mobile 375px 严格禁用指针视差 | 静止锁定 `0` 位 | **PASS** |
| **`clip_layer_part`** | `C1` | `260ms` | 悬停/点选 Track 02 锚点或改规格 | 目标层 `+12px` 抬升 + 相邻层 `+3.5px` 弹性阻尼 | `0ms` 定格 | **PASS** |
| **`clip_folio_unfold`** | `C1` | `320ms` | 点击 Track 03 封面或场景卡 | 暖调亚麻左右翼沿中脊平滑展开，衔接三翼暖纸 DOM 表单 | `0ms` 直展 | **PASS** |
| **`clip_submit_in_place_ack`** | `C1` | `420ms` | Track 02 / 03 提交请求成功 | **零跳转、零视口滚动（`CLS = 0`）、零模型折叠**；触发单次接缝轻脉冲（Track 02 `β=0.45, W/C=2.35`；Track 03 `β=0.42, W/C=2.90`）并原位展开 `--sv-sage-tint` 确认条显示 `{{MTO_REQ_ID}}` 与工作日 Reply 说明 | `0ms` 跳过脉冲静态直出 | **PASS** |

---

## 四、资产对账与实测面数 / 体积 / SHA-256（`L5@v01` §6 `ASSET_MAP`）

| 资产 ID | 归属 (`owner`) | 仓库落盘路径 | 实测面数 / 体积 | 协议预算上限 | SHA-256（前 12 位） | 状态 |
|---|---|---|---|---|---|---|
| **`SV_CHILD_COLD_MTO_01MAP_v01`** | **Antigravity** | `assets/3d/ecosystem/ag/SV_CHILD_COLD_MTO_01MAP_v01/` + `web/public/mto-child-cold/cold-01map-01..05.png` | `0 WebGL · 0 GLB`；5 卡单图 `5,119–5,923 B`；屏宽占比 `9.17% vw` | `0 WebGL · 0 GLB` · `≤ 90KB` · 单卡 `≤ 10%` | `d60f1528d3e4` / `1cd2be35c656` / `29fe5fa7d935` / `fad61579e4c9` / `2fd766c90a7b` | **PASS** |
| **`MTO_THEME_SECTIONS_V01`** | **Antigravity** | `web/sections/mto-{mother,status,child-hot,child-cold}/` + `web/templates/page.{made-to-order,mto-status}.json` + `web/public/mto-mother/` | `0 WebGL` DOM 层；4000K 海报 `8.0–12.6 KB`；`#mto-whisper-i1` `0ms ≤ 80ms` | 375px 首屏零大 GLB 阻塞；海报 `≤ 90KB`；零裸 hex | 见 `code-checklist/` 各清单台账 | **PASS** |
| **`SV_MTO_SKU_01..05_v01`**（跨品类商品模型） | **Antigravity** | `assets/3d/products/SV_MTO_SKU_01..05/` + `web/public/mto-mother/mto-sku-01..05.glb` | `SKU_01`: `288/168/96 tris` (`11,380 B`) · `SKU_02`: `36 tris` (`4,212 B`) · `SKU_03`: `288/168/96 tris` (`11,392 B`) · `SKU_04`: `36 tris` (`4,228 B`) · `SKU_05`: `36 tris` (`4,272 B`) · 海报 `8.1–11.6 KB` | `.glb ≤ 300MB`；`LOD0≤120k / LOD1≤45k / LOD2≤12k`；`poster1600 ≤ 90KB` | `1d6e943461ae` / `371b99e5f721` / `b2ac86686ad7` / `6335dd8892b1` / `b0ba350556ac` | **PASS** |
| **`mtoRig.js` / `mto-geometry.js` / `MtoScene3D.js`** | **Antigravity**（全局 `BundleDriver` MTO 扩展） | `web/public/sv-bundle/{mtoRig,mto-geometry,MtoScene3D}.js` | `7,856 B` / `18,548 B` / `27,067 B`（纯浏览器 ESM，0 `.ts`，0 `MOCK`） | 复用唯一 `BundleDriver.mountStage` | `d65a4dcf4b2d` / `19b3eef3d4f4` / `c91abc0bc7fd` | **PASS** |
| **`SV_MOTHER_MTO_v01` & `SV_MP_MTO_BLOCK/PRISM/FOLIO_v01` & `MTO_WORKER_API_V01` & `AGENT_SLOT_MTO_G0`** | **Cursor**（生态根/主体 GLB 包/Workers/G-0 登记） | Antigravity 仅在主题壳、左轨壳、三翼表单壳与 `BundleDriver.AssetAdapter` 按契约只读挂载消费，严禁写入 `ecosystem/cu/`、`workers/`、`contracts/`、`agent/` | `SV_MOTHER_MTO_v01` 实测 `0 tris / 0 meshes / 0 shadows`；G-0 槽位 `⌀24mm (90px)` 无色虚线圈 | 严格守单一 `owner` 边界 | — | **PASS（按契约接入）** |

---

## 五、边界、变体与变更单核查（`L5@v01` §9）

- **复制 L3 预演 HTML 或代理体进主干：** `0`（全部 Shopline Sline 区块、样式、驱动与 3D/2D 资产均按 `L5@v01` 全新构建）。
- **越界修改 `workers/`、`contracts/`、`agent/`、`assets/3d/ecosystem/cu/`、`design/`、`checkout*`：** `0` 变更。
- **T0 级微调说明：** 将右侧表单面板内边距由 `24px` 紧凑微调至 `16px/24px`、行距收紧并令确认条起始不透明度设为 `0.92`，确保 `1440×900` 视口零滚动下 `clip_submit_in_place_ack` 原位轻提示完整落入首屏可见区。
- **变体状态：** 严格遵守「基准线过闸前不跑变体」，本 PR 仅交付 `L5@v01` 纯净基准线，待基准线获批过闸后再按需启动 E1 受控变体。
- **未决变更单（`change/CR-*.md`）：** `0`（`L5@v01` 手稿定义完备，无未定义阻塞项）。
