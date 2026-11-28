# VERIFY_global-header_v01.md（Antigravity 施工验证报告 · L5@v01）

- **模块：** `global-header`（`sv_flow_global_header_v01`）
- **依据手册：** `L5_global-header_v01_手册.md`（`L5@v01`，已获「批准施工」）
- **施工方：** Antigravity（分支 `ag/global-header-L5v01`）
- **验证日期：** 2026-11-27
- **验证环境：** Chromium (Playwright) 1440×900 / 1024×800 / 375×812 + `STRICT_HEX=1 scripts/check_gates.sh` + 静态扫描

---

## 一、四道硬闸汇总（Antigravity 施工协议 v2.1 §7）

| 硬闸 | 结论 | 证据摘要 |
|---|---|---|
| **1. L5 一致** | **PASS** | V-01..V-11 逐条实测通过（V-12 归属 Cursor，见下表） |
| **2. 令牌与色相** | **PASS** | `web/sections/global-header/` 与 `web/components/` 裸 hex = `0`；抽屉主按钮 `ink (#252321)` 底 + `paper (#FBF7F0)` 反白；无 `seam` 蓝小号文字 |
| **3. 稳定性** | **PASS** | 断网/5xx/3s 超时/关闭季节/减动效五场景控制台 `0` 报错，无跳转、无刷新、无阻塞 |
| **4. 资产预算** | **PASS** | `M-Proto=0 / Mother=0 / Child=0 / Hot=0/4`；Logo `757B ≤ 6KB`、UI SVG `1.5KB ≤ 4KB`、季标 `345B ≤ 2KB`、Scene Cold 图 `2.5KB ≤ 90KB`（640×400 WebP） |

---

## 二、L5 §8 验收清单逐条核验（V-01..V-12）

| 编号 | 责任方 | 结果 | 实测数值与证据 |
|---|---|---|---|
| **V-01** | Antigravity | **PASS** | Desktop 1440px 总高 `96px`（公告条 `32px` + 主栏 `64px`，`≤96px`）；Mobile 375px 总高 `86px`（公告条 `30px` + 主栏 `56px`，`≤86px`）；公告条字段顺序严格 `["duty", "leadtime", "threshold"]`；代码内写死交易数字 = `0`。 |
| **V-02** | Antigravity | **PASS** | 滚动 `scrollY=300` 后进入 `header_sticky_scrolled`，主栏 `backdropFilter: "none"`、`boxShadow: "none"`，底边 `R-02` 激活 `.sv-seam-rail--active`（1px `var(--sv-seam)`）；`#sv-root-portal` 为 `document.body` 直属子节点，A1..A4 四覆层互斥展开无裁切。 |
| **V-03** | Antigravity + Cursor | **PASS（前端侧）** | 模拟 `sv:data` 超时/缺字段后：公告条高度 `0px`（`hidden`，零 CLS），市场抽屉切换至只读降级卡片（`market_config_degraded`），搜索覆层保留原生 `<form>` 提交（`search_suggest_degraded`），控制台报错数 `0`。后端接口快失败由 Cursor 侧 V-12 联调复核。 |
| **V-04** | Antigravity | **PASS** | 2.5s 内连续点击 `Bundles`（`ROUTE_BUNDLE_MASTER`）3 次：`sv.header.nav_intent` 均携带 `prefixedPath: "/en-us/route_bundle_master"`，`idempotentBlocked` 依次为 `false → true → true`，并展示非阻塞幂等轻提示。14 项 `DEFERRED` 路由按许可保留占位。 |
| **V-05** | Antigravity + Cursor | **PASS（前端侧）** | 切换市场至 `en-gb` 后派发 `sv:market` 与 `sv.header.market_switched { fromMarket: "en-us", toMarket: "en-gb", lang: "en" }`，主栏同步更新为 `GB · £`（不读 `accept-language`）；A1..A4 展开后按 `Esc`，`document.activeElement` 精确归还 `A1` / `A2` / `A3` / `A4`（非 `body`）。 |
| **V-06** | Antigravity | **PASS** | 375px 视口实测 `documentElement.scrollWidth = 375`（`overflowX === 0`）；主栏 4 个可点按钮（A2、A3、A4、Bag）均为 `44×44px`（`≥44×44px`）；移动 DOM 完整保留 `#sv-hdr-menu-drawer nav` 全部 `12` 个 SEO 链接，抽屉底栏含 `env(safe-area-inset-bottom)`。 |
| **V-07** | Antigravity | **PASS** | 静态扫描 + `STRICT_HEX=1 scripts/check_gates.sh` 零裸 hex；小号正文/链接零 `seam` 蓝；抽屉主按钮实测 `backgroundColor: rgb(37, 35, 33)`（`ink`）、`color: rgb(251, 247, 240)`（`paper`）。 |
| **V-08** | Antigravity + Cursor | **PASS（前端侧）** | 实测 `?sv_season=off&sv_agent=off&sv_kv=off&sv_3d=off#?sv_motion=off`：`documentElement` 正确挂载全部 5 个 `data-sv-*` 属性（同时支持 `search` 与 `hash`），`[data-sv-agent-slot="g0"]` 计算样式为 `display: none` 无留白。 |
| **V-09** | Antigravity | **PASS** | `1024px` 下对全部导航项追加 1.4× 长字符压力测试：`overflowX = 0`、单行最大高度 `44px`（无折行、无重叠）；`web/i18n/en.json` 与 `zh.json` 各 `49` 键，`diff = ∅`；`{{#schema}}` 含 8 项必配开关与 `presets`。 |
| **V-10** | Antigravity | **PASS** | 互斥焦点链 `Menu (A2) → Change → (P4 Market) → Esc`：切换后激活槽位 `market`，按 `Esc` 后背景 `inert` 完整解除且焦点安全归还 `A2`；Chromium 禁用 JS（L5）下 SSR `<nav>` 保留 `12` 个 `<a>`、原生搜索 `<form>` 可用、`application/ld+json` 数量 = `1`。 |
| **V-11** | Antigravity + Cursor | **PASS（前端侧）** | `sv-logo-wordmark.svg` = `757 B`（≤6KB）；`sv-ui-icons.svg` = `1,536 B`（≤4KB）；`sv-season-icon.svg` = `345 B`（≤2KB）；`sv-scene-card-thumb.webp` = `2,526 B`（640×400，≤90KB）；`.glb` 网络请求 = `0`；Header 内 AI 入口 = `0`。 |
| **V-12** | Cursor | **N/A（Cursor 负责）** | 后端接口契约向后兼容与五场景快失败测试归属 Cursor（`workers/`、`contracts/`），Antigravity 未越界修改。 |

---

## 三、边界合规自检（L5 §9.1）
- 复制 L3 预演 HTML 进主干：**无**（全部自 `L5@v01` 重写）
- 直读 `sv_ship_to` / 拼接 Worker URL：**0 命中**
- 12 显式状态黑名单（`loading`/`error`/`success`/`processing`）：**0 命中**
- 越界修改 `workers/`、`contracts/`、`design/`：**0 变更**
- 变更单状态：无未决 T2/T3 变更单（14 项 `DEFERRED` 路由经用户明确许可保留至 `L5@v02`）。

---

## 四、变体 V11 合入复测记录（2026-11-27 · 已获「批准合入 V11，B0 备份」）

- **B0 备份指针：** GitHub 标签 `backup/global-header-L5v01-B0`（commit `5545023`）+ Drive `build/global-header-L5v01.zip`（SHA-256 `4106fbd5ea29`）。
- **V11 实测增量指标：**
  - Desktop 1440px 总高：`96px`（≤96px）；Shop 面板 Cold Scene 缩略图占比从 B0 `4.88%` 降至 **`1.07%`**（严格满足 L5 §6 `≤4.0%`），面板高度 `327px`（`-80px`）。
  - Mobile 375px 总高：**`80px`**（28+52，≤86px，较 B0 多释放 `6px` 首屏空间），`scrollWidth = 375`（`overflowX = 0`），主栏按钮与搜索胶囊均 `≥44×44px`。
  - 令牌与门禁：`STRICT_HEX=1 scripts/check_gates.sh` 通过，0 裸 hex，0 JS 改动，0 E0 越界，0 控制台报错。

---

## 五、r2 修复复测（2026-11-28 · Shopline Sline 语法 & `public/` 格式合规）

- **问题 1 修复（`InvalidSyntaxInSline`）：** 将 `web/sections/global-header/global-header.html` 中全部 8 处 Liquid 风格 `| default:` 过滤器替换为纯 Sline/Handlebars `{{#if ...}}...{{else}}...{{/if}}`（静态扫描管道过滤表达式 = `0`）。
- **问题 2 修复（`public/` 不支持 `.svg` 与 `.webp`）：**
  - 删除 `web/public/sv-header/` 下 3 个 `.svg` 与 1 个 `.webp` 文件；
  - UI 图标雪碧图（1.5 KB）、Logo（757 B）、季节图标（345 B）全部内联进 `global-header.html`（`currentColor`，0 外部 `.svg`）；
  - Cold Scene 缩略图转码为 `web/public/global-header/sv-scene-card-thumb.png`（640×400，**5.5 KB ≤ 90 KB**，归入模板内部目录，100% 兼容 Shopline `public/`）。
- **Chromium 实测与五道硬闸（含 v2.4 第 0 道清单闸）：** `dt_h = 96px`、`mb_h = 80px`、`scrollW = 375`、`sv-scene-card-thumb.png` `complete = true / naturalW = 640 / 占比 = 1.07%`、`0` 404、`0` 控制台报错；`STRICT_HEX=1 scripts/check_gates.sh`（含 `code_checklist.py check`）全绿。

- **r3 补充（Shopline `public/` 不支持 `.png`）：** 移除 `web/public/global-header/sv-scene-card-thumb.png`（`web/public/` 下 0 图片文件）；Cold Scene 卡改为 `{{#schema}}` 内 `scene_card_image`（`image_picker`，走 Shopline 媒体库上传）+ 默认内联纯令牌建筑线框 `<svg>`（0 裸 hex，0 外部图片请求，占比仍 `1.07% ≤ 4.0%`）。
