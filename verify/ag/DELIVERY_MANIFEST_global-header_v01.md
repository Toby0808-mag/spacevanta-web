# DELIVERY_MANIFEST_global-header_v01.md（增量交付清单 · 仅模块内文件）

- **模块：** `global-header`（`L5@v01`）
- **分支：** `ag/global-header-L5v01`
- **交付原则：** 仅交付 `global-header` 模块所需文件，**不做全局文件（如 `dna.css`、`PALETTE.json`、`docs/` 等）的重复交付**；逐项标注 `新增 / 替换 / 删除`。

---

## 一、仓库内文件变更清单（GitHub `Toby0808-mag/spacevanta-web`）

| 操作 | 仓库路径 | 归类 | 大小 | SHA-256（前12位） | 说明 |
|---|---|---|---|---|---|
| **新增 (ADD)** | `web/sections/global-header/global-header.html` | 主题区块模板 | — | `a12de7d78668` | 6 槽位结构、SSR `<nav>`、单份 JSON-LD、`{{#schema}}` 与 `presets` |
| **新增 (ADD)** | `web/sections/global-header/global-header.css` | 主题区块样式 | — | `16243002c147` | 纯 `--sv-*`/`--svd-*` 令牌，0 裸 hex，双端高度与 WCAG AA 焦点环 |
| **新增 (ADD)** | `web/sections/global-header/global-header.js` | 主题区块脚本 | — | `8b03d4cc5805` | 监听 `sv:data`/`sv:market`/`sv:season`，12 状态、3s 超时、2.5s 幂等锁、URL 总闸 |
| **新增 (ADD)** | `web/components/sv-seam/sv-seam.css` | 复用组件 | — | `117f7198e25e` | ≤1px 品牌接缝原语（0 裸 hex） |
| **新增 (ADD)** | `web/components/sv-root-portal/sv-root-portal.css` | 复用组件 | — | `f10dd6dcef05` | `<body>` 根级覆层宿主样式（0 裸 hex） |
| **新增 (ADD)** | `web/components/sv-root-portal/sv-root-portal.js` | 复用组件 | — | `8a7d748afe60` | 物理隔离 `clip-path`/3D 祖先，背景 `inert` 与精确焦点归还 |
| **新增 (ADD)** | `web/i18n/en.json` | 多语言（主） | — | `1664a26830f8` | L5 §5.2 英文主干配置键（49 键） |
| **新增 (ADD)** | `web/i18n/zh.json` | 多语言（补） | — | `b2264475141e` | 与 `en.json` 100% 对齐的中文配置键（49 键） |
| **新增 (ADD)** | `web/public/sv-header/sv-logo-wordmark.svg` | 2D 资产 | 757 B | `d6dbf130b208` | `SV_HDR_LOGO_WORDMARK_v01`（≤6KB，`currentColor`） |
| **新增 (ADD)** | `web/public/sv-header/sv-ui-icons.svg` | 2D 资产 | 1.5 KB | `2261c7a72861` | `SV_HDR_UI_ICONS_v01`（≤4KB，1.5px 描边，0 国旗 Emoji） |
| **新增 (ADD)** | `web/public/sv-header/sv-season-icon.svg` | 2D 资产 | 345 B | `48f4eadf6493` | `SV_HDR_SEASON_ICON_v01`（≤2KB，16×16 线性 SVG） |
| **新增 (ADD)** | `web/public/sv-header/sv-scene-card-thumb.webp` | Cold 资产 | 2.5 KB | `8e2adc8be8af` | `SV_HDR_SCENE_CARD_THUMB_v01`（640×400 WebP，≤90KB，永久 S0） |
| **新增 (ADD)** | `verify/ag/VERIFY_global-header_v01.md` | 验证报告 | — | （本次随 PR 提交） | L5 §8 V-01..V-12 逐条实测证据 |
| **新增 (ADD)** | `verify/ag/DELIVERY_MANIFEST_global-header_v01.md` | 交付清单 | — | （本文件） | 增量文件路由与增/替/删标注 |

- **替换 (REPLACE)：** 本次无（`global-header` 为首次基线落盘）。
- **删除 (DELETE)：** 本次无（未删除任何仓库已有文件；Drive 侧历史 `[TO_DELETE]` 目录属设计侧整理范畴，Antigravity 不越界删除）。

---

## 二、Google Drive 归档路由（`/theme/global-header/antigravity/`）

依据 `Antigravity_施工协议_v2.1` §7A，仅收纳本模块增量交付物，不重复打包全局文件：

- `theme/global-header/antigravity/VERIFY_global-header_v01.md`（**新增**）
- `theme/global-header/antigravity/DELIVERY_MANIFEST_global-header_v01.md`（**新增**）
- `theme/global-header/antigravity/build/global-header-L5v01.tar.gz`（**新增**，仅含上表 `web/` 下 12 个模块文件）
- `theme/global-header/antigravity/build/global-header-L5v01.tar.gz.sha256`（**新增**）

---

## 三、V11 晋升变更记录（2026-11-27 · 已获「批准合入 V11，B0 备份」）

- **B0 备份（只读留存，未删除）：**
  - GitHub 标签：`backup/global-header-L5v01-B0`（指向 `5545023`）
  - Drive 备份包：`theme/global-header/antigravity/build/global-header-L5v01.zip`（SHA-256 前 12 位 `4106fbd5ea29`）
- **本次 V11 合入文件变更标注（仅模块内文件，0 全局文件）：**
  - **替换 (REPLACE)：**
    - `web/sections/global-header/global-header.css`（新 SHA-256 前 12 位 `78da16940a62`；合入 V11 E1 样式）
    - `verify/ag/VERIFY_global-header_v01.md`（追加第四节 V11 复测记录）
    - `verify/ag/DELIVERY_MANIFEST_global-header_v01.md`（追加本节 V11 晋升与 B0 备份记录）
  - **新增 (ADD)：**
    - Drive `theme/global-header/antigravity/build/global-header-L5v01-V11.zip` + `.sha256`（SHA-256 前 12 位 `acb6f593e711`）
  - **删除 (DELETE)：** 无（0 删除）

---

## 四、r2 修正交付清单（2026-11-28 · 其余已上传文件无需重传）

针对 Shopline 校验报错（`InvalidSyntaxInSline` + `public/` 不支持 `.svg`/`.webp`），**仅需按以下增/替/删操作补齐即可**（其余已上传的 `.css`、`.js`、`components/`、`i18n/` 均无需重传）：

| 操作 | 路径 | 说明 |
|---|---|---|
| **替换 (REPLACE)** | `web/sections/global-header/global-header.html` | 清除全部 `| default:` 改用 `{{#if}}...{{else}}...{{/if}}`；内联 UI/Logo/季节 SVG；Cold 图指向 `.png` |
| **新增 (ADD)** | `web/public/global-header/sv-scene-card-thumb.png` | 640×400 优化 PNG（5.5 KB ≤ 90 KB，替代原 `.webp`） |
| **删除 (DELETE)** | `web/public/sv-header/sv-logo-wordmark.svg` | Shopline `public/` 不支持 `.svg`（已内联进 `global-header.html`） |
| **删除 (DELETE)** | `web/public/sv-header/sv-ui-icons.svg` | Shopline `public/` 不支持 `.svg`（已内联进 `global-header.html`） |
| **删除 (DELETE)** | `web/public/sv-header/sv-season-icon.svg` | Shopline `public/` 不支持 `.svg`（已内联进 `global-header.html`） |
| **删除 (DELETE)** | `web/public/sv-header/sv-scene-card-thumb.webp` | Shopline `public/` 不支持 `.webp`（已由上方 `.png` 替代） |

- **Drive 归档包（`theme/global-header/antigravity/build/`）：**
  - `global-header-L5v01-V11-r2-delta.zip`（**增量补丁包**，仅含上面 2 个需上传的文件：`global-header.html` + `sv-scene-card-thumb.png`）
  - `global-header-L5v01-V11-r2.zip`（**完整模块包**，9 个模块文件，0 `.svg`/`.webp` 在 `public/`）

---

## 五、r3 最终修正（Shopline `public/` 不支持 `.png` · 仅需替换 1 个文件）

- **替换 (REPLACE)：** `web/sections/global-header/global-header.html`（新增 `scene_card_image` `image_picker` 供 Shopline 媒体库选图；未选图时默认渲染内联纯令牌 Cold 建筑线框 `<svg>`，0 外部图片请求、0 裸 hex）。
- **新增 (ADD)：** 无（`public/` 下 **0 个图片文件**）。
- **删除 (DELETE)：** `web/public/sv-header/*` 与 `web/public/global-header/*`（全部移除）。
- **Drive 归档：**
  - `build/global-header-L5v01-V11-r3-delta.zip`（**仅含 1 个文件：`web/sections/global-header/global-header.html`**）
  - `build/global-header-L5v01-V11-r3.zip`（完整 8 文件模块包，0 图片文件在 `public/`）

---

## 六、r4 修正（Shopline OS 3.0 渲染 & 编辑器控件对齐 · 仅替换 1 个文件）

- **替换 (REPLACE)：** `web/sections/global-header/global-header.html`（自包含纯令牌 `<style>` + `<script>` 解决 Shopline 无法自动加载同目录/组件资源导致的无样式平铺问题；`{{#schema}}` 控件对齐 Shopline OS 3.0：`checkbox → switch`、`link_list → menu_picker`、补 `"icon": "header"`，解决右侧面板「暂无可编辑的内容」）。
- **Drive 归档：**
  - `build/global-header-L5v01-V11-r4-delta.zip`（**仅含 1 个文件：`web/sections/global-header/global-header.html`**）
  - `build/global-header-L5v01-V11-r4.zip`（完整 8 文件模块包）
