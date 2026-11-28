# DELIVERY_MANIFEST_bundle_v02.md（Bundle 全生态基准线交付清单 · L5@v02）

- **模块：** `bundle`（`sv_flow_bundle_v01` + `sv_flow_child_promote_v01`）
- **依据手稿：** Drive `sv-model/bundle/L5/v02/L5_bundle_v02_手册.md`（`L5@v02`）
- **分支：** `ag/bundle-L5v02`

---

## 一、全局/驱动层与共用组件变更（纳入 `code-checklist/CODE_CHECKLIST.md`）

| 操作 | 路径 | 说明 |
|---|---|---|
| **新增 (ADD)** | `web/public/sv-dna/dna.css` | PALETTE v1.2.1 双命名令牌（`--svd-*` / `--sv-*` 五阶金属、暖纸双阶、锁死光芯）、季节/动效总闸与 `[hidden]` / `[data-action]` 守卫 |
| **新增 (ADD)** | `web/public/sv-dna/sv-core.js` | `window.SpaceVanta` 核心总线（六大运行总闸、`/{market}/` 路由解析、3s 超时契约消费） |
| **新增 (ADD)** | `web/public/sv-bundle/BundleDriver.js` | 全局唯一 `BundleDriver`（内置 `AssetAdapter`、单实例持久 Hot Canvas 守卫、Mother 9 态 + Child/Promote 12 态、F2 三直通、幂等锁） |
| **新增 (ADD)** | `web/public/sv-bundle/BundleScene3D.js` | 4000–4200K 五面柔光箱 `PMREMGenerator` IBL、2 组核心热点、4 条 C1 动效（含闭盖自动开盖防穿模联动）、三组双端相机预设 |
| **新增 (ADD)** | `web/public/sv-bundle/bundle-geometry.js` | 唯一同源 3D 几何构建器（五阶拉丝金属 + 暖纸内腔 + 无底座 78×72mm 折纸 SV + 9 款自然物性 M-Proto） |
| **新增 (ADD)** | `web/public/sv-bundle/motherRig.js` | `Bundle_MOTHER` 冻结锚点、SV 尺寸/缝宽表、热点表、C1 动效表与双端相机表 |
| **新增 (ADD)** | `web/public/sv-bundle/glbMount.js` | `≤300MB` 有界 GLB 加载器（保留动画轨元信息） |
| **新增 (ADD)** | `web/public/sv-bundle/PromoteController.js` | `S0..S5` 升维/退维/60s 静默释放状态机 |
| **新增 (ADD)** | `web/public/sv-vendor/three/**` | SpaceVanta-Base 同源 Three.js 本地 ESM 运行时（`three.core.js`、`three.module.js`、`GLTFLoader.js` 等） |
| **新增 (ADD)** | `web/components/sv-agent-slot-g0/sv-agent-slot-g0.{html,css}` | 右下安全区 `⌀24mm`（`90px`）空心纯虚线圈占位与 `?sv_agent=off` 折叠 |
| **新增 (ADD)** | `web/components/sv-promote-portal/sv-promote-portal.{css,js}` | `document.body` 根级 `PromoteOverlayPortal`（`S1→S5`、`Esc` 焦点归还触发冷卡、SR 三段播报、60s `dispose()`） |
| **替换 (REPLACE)** | `web/components/sv-seam/sv-seam.css` | 新增深金属强制 `[data-sv-seam-aura="true"]` 复合接缝原语（修改前源实现已存入 `code-checklist/source-keep/`） |
| **替换 (REPLACE)** | `web/i18n/en.json`、`web/i18n/zh.json` | 新增 `bundle.*` 双语完整键集（共 104/104 键零差异；修改前源实现已存入 `code-checklist/source-keep/`） |

---

## 二、模板区块与页面配置（各自纳入 `code-checklist/templates/<模板>/CODE_CHECKLIST.md`）

| 模板 | 路径 | 说明 |
|---|---|---|
| **`bundle-mother`** | `web/sections/bundle-mother/bundle-mother.{html,css,js}` + `web/public/bundle-mother/poster-tray-1600.png` | Mother 独立页主区块（D-09 顺序、6 格内联编排 + 双向拖拽、跨池冷卡区、Mobile 375px D1 + `<head>` JSON-LD） |
| **`bundle-child-hot`** | `web/sections/bundle-child-hot/bundle-child-hot.{html,css,js}` | Direct-Related 模板单池 Hot 子模型区块（严锁单池、跨池带参无损移交 Mother） |
| **`bundle-child-cold`** | `web/sections/bundle-child-cold/bundle-child-cold.{html,css,js}` + `web/public/bundle-child-cold/cold-p2-01..06.png` | Indirect 模板方案 P2 90° 正交 2D 平面卡阵（`S0` 0 WebGL / 0 GLB、三热区 `≥44px`） |
| **`bundle-statement`** | `web/sections/bundle-statement/bundle-statement.{html,css}` | 规则说明 Target 页区块（`/{market}/pages/mechanism-bundles-statement`） |
| **`page`** | `web/templates/page.bundles.json`、`web/templates/page.mechanism-bundles-statement.json` | Shopline OS 3.0 页面模板 JSON |

---

## 三、3D 生态与商品模型资产（`owner = Antigravity`）

- `assets/3d/ecosystem/ag/Bundle_MOTHER/`：`Bundle_MOTHER.glb`（0 三角/0 材质/0 阴影）+ `poster_mother_1600.png` + `asset.json`
- `assets/3d/ecosystem/ag/Child_Tray/`：`lod0/Child_Tray.glb`、`lod1/Child_Tray_lod1.glb`、`lod2/Child_Tray_lod2.glb`（含 4 条 C1 动画轨）+ `poster_child_tray_1600.png` + `asset.json`
- `assets/3d/ecosystem/ag/SV_CHILD_COLD_P2/`：`SV_CHILD_COLD_P2_01..06_v01.{png,svg}` + `asset.json`
- `assets/3d/products/SV_MP_SKU_01..09/`：9 款自然物性商品模型（各含 `LOD0/1/2 .glb` + `poster1600.png` + `asset.json`）
