# VERIFY_bundle.md（Antigravity 施工验证报告 · L5@v02 · 对齐 L3 r2）

- **覆盖模块：** `sv_flow_bundle_v01`（Bundle Mother 母模型）+ `sv_flow_child_promote_v01`（Bundle Hot 活跃子模型 & Cold 沉睡子模型方案 P2）
- **唯一施工依据：** Drive `sv-model/bundle/L5/v02/L5_bundle_v02_手册.md`（`L5@v02`，已获「批准施工」）+ `AGENT_ASSET_REGISTRY_bundle.md`
- **施工方：** Antigravity（分支 `ag/bundle-L5v02`）
- **验证日期：** 2026-11-28
- **验证环境：** Google Chrome + SwiftShader WebGL2 (Playwright) `1440×900` / `1280×800` / `375×812` + `GLTFLoader` 往返解析核验 + `STRICT_HEX=1 scripts/check_gates.sh` + `scripts/code_checklist.py check`

---

## 一、五道硬闸汇总（`Antigravity_施工协议_v2.4` §7）

| 硬闸 | 结论 | 实测证据摘要 |
|---|---|---|
| **0. 清单闸（v2.4）** | **PASS** | 施工前 `pull`、完工 `submit` 全覆盖（`code-checklist/CODE_CHECKLIST.md` + `bundle-mother` / `bundle-child-hot` / `bundle-child-cold` / `bundle-statement` / `page` 共 6 份清单）；修改的 3 个全局文件均于 `code-checklist/source-keep/20261128-033039_ag-bundle-L5v02/` 保留源实现（`KEPT`，`0` HOLD），`code_checklist.py check` 全绿 |
| **1. L5 一致** | **PASS** | `L5@v02` §1–§9 与 §8 `V-01..V-12` 全部逐条实测通过（Cursor 归属配置项按契约只读消费，未越界修改） |
| **2. 令牌与色相** | **PASS** | `STRICT_HEX=1 scripts/check_gates.sh` 通过；除令牌定义文件 `web/public/sv-dna/dna.css` 外，全部 `sections / components / sv-bundle` `.html/.css/.js` 裸 hex = `0`；深金属父级均叠 `[data-sv-seam-aura="true"]`（`11.72:1` AAA）；`W/C = 2.64 ≥ 1.60`（Hot）/ `4.35 ≥ 1.60`（Cold P2） |
| **3. 稳定性** | **PASS** | 断网/接口缺席/4s 超时/超大 GLB（>300MB）/关闭季节 `?sv_season=off`/减少动效 `?sv_motion=off`/关闭 3D `?sv_3d=off`/关闭 JS `noscript` 全部场景控制台报错 = `0`，零白屏、零死循环、零阻塞首屏 |
| **4. 资产预算** | **PASS** | `Bundle_MOTHER.glb` = `0 tris / 0 mats / 0 shadows`（`428 B`）；`Child_Tray.glb` `LOD0 = 1,716 tris ≤ 120k`（`154,996 B ≤ 300MB`）、`LOD1 = 1,320 tris ≤ 45k`、`LOD2 = 1,200 tris ≤ 12k`；9 个 `SV_MP_SKU_01..09_v01` 各含 `LOD0..2` + `poster1600.png ≤ 90KB`；Cold P2 6 张平面图最大 `32,771 B ≤ 90KB`；单屏 Hot `= 1 ≤ 1`，Cold P2 `S0` 下 `Active WebGL = 0 · GLB Requests = 0` |

---

## 二、L5 §8 验收清单逐条核验（`V-01 .. V-12`）

| 编号 | 责任方 | 结果 | 实测数值与证据 |
|---|---|---|---|
| **V-01（首屏与信任带）** | Antigravity | **PASS** | 首屏 3s 清晰区分 Mother/Hot Child 实时 3D 舞台与 Cold P2 90° 正交 2D 平面图；无 Worker 数据时 `[data-sv-slot="bundle-hero-trust"]` 实测 `trustHiddenInitially === true`（`display: none`，零 `· ·` 残缺分隔符）；注入 `sv:data` 后字段顺序严格为 `["duty", "leadtime", "threshold"]`；全仓写死交易数字 = `0`。 |
| **V-02（3D DNA 与零穿模）** | Antigravity | **PASS** | 实装 §3.3 四层配色：① 五阶拉丝金属外盒（`metal-recess` 底槽 → `gunmetal` 侧壁 → `slate` 顶盖主面与腰线 → `steel` 45° 外倒角与分隔棱 → `pewter` 铰链轴筒）；② 暖纸双阶内腔与盖底内衬（`paper` / `paper-subtle`，`roughness 0.89–0.92, metalness 0`）；③ 无底座亮银折纸 `SV`（实测 `widthMm = 78.0, heightMm = 72.0, aspectRatio = 1.08, thicknessMm = 4.0, logoLocalY = +0.0062m, localBboxMinY = 0.00000m, hasPlinth = false`，S 断裂口 `2.5mm`、S-V 间距 `3.2mm`、蓝缝 `1.35mm`、锁死光芯 `0.60mm`、光晕衰减 `0.85mm ≤ 1.0mm`）；④ 6 格自然物性商品色 + `4000–4200K` 五面柔光箱 `PMREMGenerator` IBL。实机画布 9,600 采样像素 `pureBlackPct = 0.00%`（`warmLightPct = 73.63%`, `midToneSubjectPct = 26.38%`），`0°/12°/72°` 全角零穿模零悬空。 |
| **V-03（Mother 冻结面）** | Antigravity | **PASS** | `Bundle_MOTHER.glb`（SHA-256 `e69ccea493b8`）与运行时 `getMotherInspection()` 实测：`triangles = 0, materials = 0, shadows = 0`；锚点严格为 `["anchor_A", "anchor_B", "anchor_C"]`，挂载序 `anchor_A → anchor_B → anchor_C → anchor_A`，`anchor_B.hasRotor === false`；深金属父级（Promote 枪灰顶栏、Submitting 枪灰主按钮）均叠 `[data-sv-seam-aura="true"]`。 |
| **V-04（单源架构纯净度）** | Antigravity | **PASS** | 全站唯一全局驱动 `web/public/sv-bundle/BundleDriver.js`（内置 `AssetAdapter`，零 `GlobalBundleDriver`），唯一同源几何构建器 `web/public/sv-bundle/bundle-geometry.js`（GLB 烘焙与 L1 降级同源共用）；`web/public/` 零 `.ts`、零 `MOCK`、零 G16 设计原件；`code_checklist.py` 对齐 v2.4 保留源实现且 `_backup/` 仅留最近 2 份。 |
| **V-05（编排与权限锁）** | Antigravity | **PASS** | Mother 右侧支持 6 格内联 `⇄ Swap` / `× Clear` / `+ Add`、HTML5 双向拖拽（槽位互换、跨池卡拖入托盘/槽位、槽位拖至底部移除区）及跨池余量计数（`crossLeft/crossLimit`）；Hot Child 实测 `crossPoolControlsCount === 0`（严锁单池定制），点击跨池入口生成 `/en-au/pages/bundles?poolId=scene_assigned_01&activeSlotSkus=...` 无损移交母模型；Cold P2 实测 `formsInCards === 0`。 |
| **V-06（Cold 0 WebGL · V-P4）** | Antigravity | **PASS** | Cold-Only 页面（`/en-us/pages/cold`）在 `S0_COLD_IDLE` 初始态实测：`canvasCountInS0 = 0`、`bundleDriverLoadedInS0 = false`、`Active WebGL = 0`、`glbCountInS0 = 0`（零 `.glb` 网络请求）。 |
| **V-07（Promote 六态与 L3 r2 热点/动效）** | Antigravity | **PASS** | ① Promote `S0 → S1(armElapsedMs = 0ms ≤ 80ms) → S2(240ms) → S3(geoSource: "glb", activeWebGLCount = 1) → S4(120ms Esc) → S5(parkNow 5 轮循环 geometriesAfter = 0, baselineDelta = 0 ≤ ±2)`；② 2 组核心热点 `HS_BAY_GRID`（含 `Bay 1..6` 子焦点）+ `HS_SV_CREST`（含舞台 ≥44px 浮标与右侧键盘可达替代列表）；③ 4 条 C1 动效（均内嵌于 `Child_Tray.glb` 动画轨且在 WebGL 驱动执行），实测闭盖（`0°`）点 `Swap Bay 1` 触发 `sv_bundle_slot_edit { clipId: "clip_slot_swap", autoOpenedLid: true }`，盒盖先自动开至 `72°` 再落位商品；④ 三组双端相机坐标分毫不差（见第三节表），`?sv_motion=off` 下 `0ms` 直切。 |
| **V-08（无障碍与点击零失灵 · V-13）** | Antigravity | **PASS** | 在 Card 2（`pool_pour_over_02`）点升维进入 `S3` 后按 `Esc`，实测 `document.activeElement` 为 `<button data-action="cold-promote">`（所属 `pool_pour_over_02`，`isBody === false`）；SR `aria-live="polite"` 完整播报 `S1` 载入中、`S3` 就绪可拖拽、`V-P5` 平面图回退三段且关闭时静默；同步 SSR DOM 骨架 + `textContent` 更新 + `[data-action] * { pointer-events: none; }` 实测点击响应率 `100%`。 |
| **V-09（幂等与超时降级）** | Antigravity | **PASS** | 对主按钮连续快速点击 3 次，实测 `commitCount === 1`、`duplicateBlockedCount === 2`，弹出非阻塞防重提示 `"Set already queued — duplicate click ignored."`；模拟 `>4s` 超时进入 `timeout_fallback`（暖调提示 + `Retry`），内存与 `sessionStorage` 已选 6 格完整保留。 |
| **V-10（交易禁区与 F2）** | Antigravity | **PASS** | 全仓写死价格/货币/折扣/日期 = `0`；`checkout*` 改动文件数 = `0`；加入 MTO 单品（`SV_MP_SKU_07_v01`）在 `en-us` 下实测 `f2InUs === true`（浮现 F2 轻提示引导去 Cart 页决断），切换 `en-hk`（以及空节日池 / 开关关闭三分支）实测 `f2InHk === false` 直通不拦；前端仅传递 `?sv_kv=off` 不触碰 Cloudflare KV 写入。 |
| **V-11（PALETTE 与总闸）** | Antigravity | **PASS** | `STRICT_HEX=1 scripts/check_gates.sh` 零裸 hex 通过；`W/C = 2.64 ≥ 1.60`；六大总闸（`?sv_kv=off` / `?sv_season=off` / `?sv_3d=off` / `?sv_motion=off` / `?sv_agent=off` / `?sv_mock=1` 生产剥离）在 `search` 与 `hash` 下均生效；`?sv_agent=off` 下 `[data-sv-agent-slot="g0"]` 实测 `display: none` 静默消失。 |
| **V-12（Mobile 375px D1、D-08 与 D-09）** | Antigravity | **PASS** | `375×812` 实测 `overflowX === 0`；底部吸附主行动栏带 `calc(var(--svd-s3) + env(safe-area-inset-bottom, 0px))`；右下 G-0 标注 `right = 359px ≤ 375px` 零裁切；方案 D1 实测 `schemeD1ProseHidden === true` + Target 按钮动态指向 `/en-gb/pages/mechanism-bundles-statement` + `<head>` `application/ld+json` 数量 = `1`；Desktop 单一 `<h1>`（`h1Count === 1`）+ 有序 `H2/H3`；页面段落纵坐标严格满足 `trustTop < motivateTop < rememberTop`（`Trust → Motivate → Remember` 零倒置）；模板严格采用 Shopline OS 3.0 双引号 Sline 语法与 `{{#schema}}`（零 `| default:` 过滤器）。 |

---

## 三、L3 r1 / r2 模型维度专项证据（`Gemini_模型交付协议_v1.1` §3 / §7 / §8）

### 3.1 `r1` 命名细节清单与 100% / 200% 可辨性核验

| 命名细节项 | 对应节点 / 令牌映射 | 100% 视距核验 | 200% 放大核验 | 二值判定 |
|---|---|---|---|---|
| **五阶拉丝金属外盒与 45° 外倒角** | `tray_foot_recess` (`--sv-metal-recess`) → `tray_wall_*` (`--sv-gunmetal`) → `lid_panel` (`--sv-slate`) → `tray_chamfer_*` (`--sv-steel`) | 清晰可辨 | 清晰可辨 | **看得清（PASS）** |
| **后上沿铰链轴筒（`[0, 0.036, -0.105]`）** | `hinge_barrel` + `lid_hinge` (`--sv-pewter`) | 清晰可辨 | 清晰可辨 | **看得清（PASS）** |
| **腰线与 SV 断裂处 2px 蓝缝 + 1px 光芯** | `tray_waist_seam` / `sv_seam_*` (`--sv-seam` `1.35mm` + 锁死 `--sv-seam-aura` `0.60mm`) | 清晰可辨 | 清晰可辨 | **看得清（PASS）** |
| **无底座 78×72mm 亮银折纸 SV 徽标** | `svLogoGroup` (`--sv-specular` + 末 18% `--sv-silver`，`local Y = +0.0062m`，`bbox.min.y = 0`) | 清晰可辨 | 清晰可辨 | **看得清（PASS）** |
| **暖纸双阶内腔与 6 格分隔棱** | `tray_inner_paper_floor` (`--svd-paper`) + `lid_inner_paper_liner` (`--svd-paper-2`) + `bay_rib_*` | 清晰可辨 | 清晰可辨 | **看得清（PASS）** |
| **6 格自然物性商品原型（`M-Proto`）** | `SV_MP_SKU_01..06_v01`（棉白巧克力盒、抹茶绿脆片袋、可可棕礼盒、暖奶油陶瓷香槟金底环杯、燕麦茶罐、榛果盒） | 清晰可辨 | 清晰可辨 | **看得清（PASS）** |

### 3.2 `r2` 核心热点表（`hotspot_min = 2`，满足生态 `≤5` / 移动 `≤3`）

| 热点 ID | 分组 & 子焦点 | 挂载节点 | 触发方式 | 实测联动与回落表现 | 键盘无障碍替代入口 |
|---|---|---|---|---|---|
| **`HS_BAY_GRID`** | `slot_grid`（含 `bay_1..bay_6`） | `Child_Tray/bay_divider_rim/HS_BAY_GRID` | 点击 / `Enter` / `Space` | 若闭盖先自动开盖至 `72°`，`380ms` 缓动切至 `bay_grid` 检视机位并点亮目标卡槽口圈；`Esc` 回落 `tray_view` | 右侧面板 `6-Bay Slot Grid` 按钮 + `Bay 1..Bay 6` 独立聚焦按钮组（`≥44px`） |
| **`HS_SV_CREST`** | `brand_crest` | `Child_Tray/lid_hinge/lidPivot/svLogoGroup/HS_SV_CREST` | 点击 / `Enter` / `Space` | 若开盖先自动闭合至 `0°`，`380ms` 缓动切至约 `70°` 斜俯角 `sv_crest` 特写展示金属折面与断裂蓝缝；`Esc` 回落 `tray_view` | 右侧面板 `SV Origami Crest` 按钮 + 舞台右上 `≥44px` 浮标 |

### 3.3 `r2` 4 条 C1 触发型动效与防穿模联动核验（不循环、零发光粒子）

| Clip 名称 | 梯度 | 规格时长 | 触发条件 | 实测表现与防穿模联动 | `?sv_motion=off` / `reduce` |
|---|---|---|---|---|---|
| **`clip_lid_toggle`** | `C1` | `400ms` | 点 `Open / Close Lid` 或热点联动 | 绕 `[0.0, 0.036, -0.105]` 在 `0° ↔ 12° ↔ 72°` 平滑旋转，`svLogoGroup` 刚性同步零穿模 | `0ms` 一步定格 |
| **`clip_slot_add`** | `C1` | `280ms` | 空槽点 `+ Add` / 跨池加入 / 拖入空槽 | 闭盖（`0°/12°`）触发时先自动执行 `clip_lid_toggle` 开至 `72°`，空槽口圈微亮后商品沿 `+Y` 轻落入槽 | `0ms` 直达开盖 `72°` + 落位终态 |
| **`clip_slot_swap`** | `C1` | `320ms` | 点 `⇄ Swap` / 跨池替换 / 拖入满槽 | 闭盖触发实测 `autoOpenedLid === true` 先开至 `72°`；旧商品前半程 `+Y` 抬起移除、新商品后半程落入，错峰零穿模 | `0ms` 直达开盖 `72°` + 替换终态 |
| **`clip_slot_remove`** | `C1` | `220ms` | 点 `× Clear` / 拖出至移除区 | 闭盖触发先自动开至 `72°`；商品沿 `+Y` 抬起淡出，露出暖纸底垫与虚线空槽框 | `0ms` 直达开盖 `72°` + 空槽终态 |

### 3.4 三组双端相机坐标冻结实测对照表（原点 `Bundle_MOTHER [0, 0, 0]`）

| 相机预设 | 端 | L5@v02 §6.3 冻结坐标（`pos / target / fov`） | Chromium WebGL 实测读数（`getCameraState()`） | 结果 |
|---|---|---|---|---|
| **`tray_view`（默认 3/4）** | Desktop `1440px` | `[0.33, 0.30, 0.37]` / `[0.0, 0.026, -0.008]` / `34°` | `[0.33, 0.3, 0.37]` / `[0, 0.026, -0.008]` / `34°` | **PASS** |
| **`tray_view`（默认 3/4）** | Mobile `375px` | `[0.38, 0.34, 0.43]` / `[0.0, 0.026, -0.008]` / `38°` | `[0.38, 0.34, 0.43]` / `[0, 0.026, -0.008]` / `38°` | **PASS** |
| **`sv_crest`（`HS_SV_CREST`）** | Desktop `1440px` | `[0.045, 0.245, 0.085]` / `[0.0, 0.043, 0.000]` / `28°` | `[0.045, 0.245, 0.085]` / `[0, 0.043, 0]` / `28°`（`lidDeg = 0°`） | **PASS** |
| **`sv_crest`（`HS_SV_CREST`）** | Mobile `375px` | `[0.050, 0.275, 0.095]` / `[0.0, 0.043, 0.000]` / `30°` | `[0.05, 0.275, 0.095]` / `[0, 0.043, 0]` / `30°`（`lidDeg = 0°`） | **PASS** |
| **`bay_grid`（`HS_BAY_GRID`）** | Desktop `1440px` | `[0.18, 0.34, 0.24]` / `[0.0, 0.018, 0.010]` / `32°` | `[0.18, 0.34, 0.24]` / `[0, 0.018, 0.01]` / `32°`（`lidDeg = 72°`） | **PASS** |
| **`bay_grid`（`HS_BAY_GRID`）** | Mobile `375px` | `[0.22, 0.38, 0.28]` / `[0.0, 0.018, 0.010]` / `36°` | `[0.22, 0.38, 0.28]` / `[0, 0.018, 0.01]` / `36°`（`lidDeg = 72°`） | **PASS** |

---

## 四、`owner = Antigravity` 资产清单与 SHA-256 对账（`L5@v02` §6 `ASSET_MAP`）

| 资产 ID | 仓库落盘路径 | 实测面数 / 体积 | 协议预算上限 | SHA-256（前 12 位） | 状态 |
|---|---|---|---|---|---|
| **`Bundle_MOTHER`** | `assets/3d/ecosystem/ag/Bundle_MOTHER/Bundle_MOTHER.glb` + `poster_mother_1600.png` + `asset.json` | `0 tris` · `428 B` / 海报 `9,378 B` | `0 tris` / 海报 `≤ 90KB` | `e69ccea493b8` / `3b7f7e9991bd` | **PASS** |
| **`Child_Tray.glb`** | `assets/3d/ecosystem/ag/Child_Tray/lod0..2/` + `poster_child_tray_1600.png` + `asset.json` | `LOD0 1,716 tris (154,996 B)` · `LOD1 1,320 tris` · `LOD2 1,200 tris` · 海报 `16,921 B` | `LOD0 ≤ 120k / LOD1 ≤ 45k / LOD2 ≤ 12k` · `≤ 300MB` · 海报 `≤ 90KB` | `abd72e8e6cfe` / `bb4c9ff9a3a6` | **PASS** |
| **`SV_MP_SKU_01..09_v01`** | `assets/3d/products/SV_MP_SKU_01..09/`（各含 `LOD0/1/2 .glb` + `poster1600.png` + `asset.json`） | 单件 `36–180 tris` · 海报 `9–12 KB` | 继承 `LOD0–2` · `poster1600 ≤ 90KB` | 见各目录 `asset.json` | **PASS** |
| **`bundle-geometry.js`** | `web/public/sv-bundle/bundle-geometry.js` | `34,079 B`（纯 ESM，0 `.ts`，0 `MOCK`） | 同源降级模块 | `33d4e40e2b2a` | **PASS** |
| **`SV_CHILD_COLD_P2_01..06_v01`** | `assets/3d/ecosystem/ag/SV_CHILD_COLD_P2/` + `web/public/bundle-child-cold/cold-p2-01..06.png` | 单图 `25.6–32.7 KB` · 屏宽占比 `9.17% vw` | `≤ 90KB` · 单卡 `≤ 10% vw` · `0 WebGL` | `2c74bbe4c9a4` 等见 `asset.json` | **PASS** |

---

## 五、边界与变更单核查（`L5@v02` §9）

- **复制 L3 预演 HTML 或 `PROXY_*` 代理体进主干：** `0`（全部生产代码与 3D 资产均按 `L5@v02` 全新构建）。
- **越界修改 `workers/`、`contracts/`、`agent/`、`assets/3d/ecosystem/cu/`、`design/`、`checkout*`：** `0` 变更。
- **变体状态：** 严格遵守「基准线过闸前不跑变体」，本 PR 仅交付 `L5@v02` 纯净基准线，待基准线获批过闸后再按需启动 E1 受控变体。
- **未决变更单（`change/CR-*.md`）：** `0`（`L5@v02` 手稿定义完备，无未定义阻塞项）。
