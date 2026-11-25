# STACK.md — Shopline 语言规则 / 语法白名单 / 十五门禁细则

> **放置位置**：`protocol/STACK.md`
> **上位**：`PROTOCOL.md`（宪法）。本文件是 L0 平台层 + 门禁的可执行细则。
> **原则**：所有 Shopline 语法以**官方 OS 3.0 文档 + `SpaceVanta Base 0.1.0` 源码实证**为唯一判据；**探明前不写、不猜**。实测结论回填 `docs/shopline.md`。

---

## §A 目录相对位置与静态资源（L0 实证）

| 位置 | 职责 | 引用写法 |
|---|---|---|
| `layout/theme.html` | 全站外壳：head / header-group / `{{#content "layout" /}}` / footer-group | 唯一可用 `{{#content "layout" /}}` 的文件 |
| `templates/<page>.json` | 页面模板：`{ "sections": {...}, "order": [...] }` | `sections` 键 = 注册名；`order` 决定顺序 |
| `templates/*-group.json` | `header-group` / `footer-group` 分组 | 由 `{{#sections "header-group" /}}` 渲染 |
| `sections/<A>/<A>.html` | 区块主文件（**同名双段才注册**） | `{{#section "<A>" /}}` |
| `sections/<A>/blocks/<b>.html` | private block，仅此区块可用 | 主文件 `{{#content "blocks" /}}` 渲染 |
| `blocks/<B>/<B>.html` | 全局共用块 | `type: "<B>"`（**不带 `$`**） |
| `components/<path>` | 可复用片段 | `{{#component "icons/close" 属性=值 /}}` |
| `public/` | `asset_url()` 的根 | `{{ 'x.css' \| asset_url() }}` |
| `sections/<A>/x.css` | 区块私有静态件 | **区块内写相对路径 `./x.css`**；其余一律相对 `public/` |
| `i18n/xx.json` | 前台文案 | `{{ "a.b.c" \| t() }}` |
| `i18n/xx.schema.json` | 编辑器文案 | schema 里 `"t:sections.<A>.settings.<id>.label"` |
| `theme.schema.json` / `theme.config.json` | 全局设置定义 / 默认取值 | 主题设置 →「Space Vanta DNA」 |

**三条硬规**
1. `public/` **禁 `.glb` / `.liquid` / `.json` 当资产**；3D 一律 `assets.spacevanta.com`（版本路径不可变）。
2. **区块私有 css/js 不许内联**：`<style>` / `<script>` 代码块出现即 FAIL（门禁 [6] 附带检查）；必须落同目录文件 + 相对引用，否则体积与缓存双输。
3. `public/` 引用路径**不带 `$`**；`$` 只属于 private block 类型名。

---

## §B 模板语法白名单（出现白名单外构造 = FAIL）

### §B.1 输出
```
{{ x }}         HTML 转义输出
{{{ x }}}       不转义输出（仅用于已信任的 SVG / JSON-LD）
```

### §B.2 过滤器（**仅这 5 个内置 + 已登记自定义**）
```
| t()          多语言取值，键必须在 i18n/en.json 存在
| asset_url()  public/ 或区块相对路径 → 绝对 URL
| class_list() 把 section.settings 转成 class 串（间距/布局唯一合法出口）
| default()    兜底值
| plus()       数值加
```
**自定义过滤器必须登记进 `contracts/filters.json` 才可用**，未登记即用 → 门禁 [6] FAIL。
登记格式：`{ "name": "sv_market", "why": "...", "owner": "A3", "since": "H-001", "pure": true }`。

### §B.3 控制流
```
{{#if}} … {{#else/}} … {{/if}}
{{#for item in list}} … {{/for}}
{{#var x = … /}}      声明
{{#set x = … /}}      赋值
```
**禁止**：`{{!-- --}}` 注释（源码里根本不存在此写法 → 用 HTML 注释或不写）、`{% ... %}` 任何 Liquid 残余、`{{log}}`、自造 helper、在模板里写 JS 计算业务规则（规则归 Worker / 驱动层纯函数）。

### §B.4 引用
```
{{#component "名" 属性=值 /}}     components/
{{#section "名" /}}               单区块
{{#sections "分组名" /}}           分组（header-group / footer-group）
{{#content "blocks" /}}            渲染 private block 区（仅 section 主文件）
{{#content "layout" /}}            布局放页面（仅 layout/theme.html）
```

### §B.5 配色 / 间距 / 布局（**唯一合法出口**）
```html
<section class="color-{{ section.settings.color_scheme.id }} {{ section.settings | class_list() }}">
```
- **禁裸 hex**（门禁 [7]）；颜色只能来自 `color_scheme` 设置 + `--svd-*` / `--sv-*` 令牌。
- 令牌层唯一来源：`public/sv-dna/dna.css`；`--sv-paper` / `--sv-paper-subtle` / `--sv-ink` / `--sv-seam-aura` **冻结只读**。
- 季节皮肤**只覆盖 `--sv-season-accent`**，且只用于图形/线，不用于正文。

---

## §C 区块 schema：**内联 + 必带 presets**（L0 实证，踩过坑）

```html
{{#schema}}
{
  "name": "SV Bundle Hero",
  "icon": "cube",
  "settings": [
    { "id": "enable_3d_viewer", "type": "checkbox", "default": true },
    { "id": "model_slot", "type": "select",
      "options_0": "hero_master", "options_1": "active_child", "options_2": "dormant_poster",
      "default": "hero_master" },
    { "id": "color_scheme", "type": "color_scheme" },
    { "id": "spacing", "type": "style.spacing" }
  ],
  "blocks": [
    { "type": "$motion",     "limit": 1 },
    { "type": "$tray_slot",  "limit": 6 },
    { "type": "$cross_pool", "limit": 8 }
  ],
  "presets": [
    { "presets_0.category": "Space Vanta", "presets_0.name": "Bundle Hero" }
  ]
}
{{/schema}}
```

### §C.1 六条硬规
1. **schema 内联在区块文件末尾**，用 `{{#schema}} … {{/schema}}` 包裹。**不建外部 `.schema.json` 文件**（早期草案写过外部文件，已作废）。
2. **无 `presets` = 区块不出现在编辑器「添加区块」** → presets **强制**，缺即门禁 [4] FAIL。（doc 08 踩过：区块写好了编辑器里找不到。）
3. schema 里**只允许**出现：展示开关、`model_slot` 三值枚举、`color_scheme`、`style.spacing` / `style.layout`、`image` / `url` / `text` 版式字段、i18n `t:` 键。
4. schema 里出现 **`https` / `.glb` / `M-[A-Z]` / 裸 hex / 金额 / 百分比 / 截单日** → 门禁 [5] FAIL。（资产与交易值一律 Worker 注入 `{{PLACEHOLDER}}`。）
5. `model_slot` 的**唯一合法声明写法**就是上面那段 select（枚举三值），见 `contracts/model-slot.schema.json`。**任何 model/id/url 字段都是违例。**
6. `options_N` 与 `presets_N` **从 0 起连续编号，断档即 FAIL**（门禁 [8]）。

### §C.2 设置项类型白名单（**仅这 14 种**）
```
text  textarea  select  checkbox  range  color  color_scheme
image  url  font  style.spacing  style.layout
```
（`color` 只用于令牌选取器，不得直接产出裸 hex 落进 CSS。）

### §C.3 private block 三处齐（门禁 [3]）
| 处 | 写法 |
|---|---|
| 磁盘 | `sections/sv-bundle-hero/blocks/motion.html`（+ 可选 `motion.css`） |
| 主文件 | `{{#content "blocks" /}}` 在正确位置渲染子块区 |
| schema | `"blocks": [{ "type": "$motion", "limit": 1 }]` —— **类型名带 `$`** |

三处任一缺 → FAIL。磁盘有 `blocks/x.html` 但既没被 `{{#content}}` 覆盖也没进 schema → WARN，连续 2 个 rev 提示删除。
**`$` 只用于 private block 类型名**；全局 `blocks/<B>` 引用**不带 `$`**。
**private block 允许再套一层 private block，禁递归**（构建期检环）。

---

## §D 多语言（最容易炸，单列）

1. 任何**可见文案** → `{{ "a.b.c" | t() }}`；**键必须先写进 `i18n/en.json`**，再补 `zh-hans-cn.json` / `zh-hant-tw.json`；`id/ja/ms/th/vi` 可暂英。**缺键前台直接露键名** → 门禁 [8] FAIL。
2. schema 标签/说明写 `"t:sections.<A>.settings.<id>.label"`，键落 **`i18n/<locale>.schema.json`**。
3. 选项文案键：`t:sections.<A>.settings.<id>.options_0` …；预设：`t:sections.<A>.presets.presets_0.name`。
4. 编号 `options_N` / `presets_N` **连续无断档**。
5. **DNA 新组件尽量不渲染可见文案**（Base 骨架已这么做），从根上免 i18n 债；需要文案时先加 en 再补 zh。
6. 键命名：`<业务>.<区块>.<用途>`，例 `bundle.hero.cta_take_this_set`。**禁用中文键、禁空格键。**

---

## §E Worker 路由与集成面：**冻结 + 提案制**（对应 PROTOCOL §3）

### §E.1 冻结
- 已上线路由 / 端点 = 常量，随代码源走。**增量开发不改。**
- 前端唯一入口：`SpaceVanta.api.get(key, path, params, {timeout,ttl})`；`key ∈ contracts/endpoints.json`。
- **硬禁**（门禁 [13]）：主题源码出现 `https://` `http://` `/api/` `workers.dev`；`api.get()` 的 key 未登记。
- 默认值：`3s` 超时、**永不 reject**（返回 `null`）、`60s` 内存缓存、**仅 https**。

### §E.2 Cursor 提案权（**须用户同意才生效**）
提案文件：`handoffs/requests/cursor-to-user-<动作>-<事由>.md`，五要素（动作 / 为什么 / 影响面 / 不影响性证明 / 回滚）。
| 动作 | 流程 |
|---|---|
| `ADD` 新 worker 或新店面-后台 API | 提案 → **用户 APPROVED** → A3 写进 `endpoints.json`（`status:active`）→ MINOR 升版 → 才准调用 |
| `DEL` 废弃 worker / 路由 | 提案 + **不影响性证明**（全仓引用扫描 + 十五门重跑 + 灰度 + 回滚三步）→ APPROVED → 标 `deprecated` + `sunset_rev` → **并存 2 个 rev** → 期满 MAJOR 下线 |
| `CHANGE` 改路由 / 改端点路径 | **不许就地改**；一律 `ADD 新 → 并存 2 rev → DEL 旧` 两段式 |

- 未获同意就动手 = `BLOCKED_BY_APPROVAL`，且该次交付判无效。
- `endpoints.json` 的 `url` = **A3 从部署清单抄入的事实**；为 `null` 时该功能**静默关闭** + `BLOCKED_BY_CONTRACT`，**Cursor 永不猜域名**。

### §E.3 页面路由（门禁 [14]）
真源 `contracts/routes.json`：
```
bundle /pages/bundles                 → templates/pages/bundles.json        → sv-bundle-hero   → Bundle_MOTHER
mto    /pages/made-to-order           → templates/pages/made-to-order.json  → sv-mto-stage     → MTO_MOTHER
scene  /pages/scene                   → templates/pages/scene.json          → sv-scene-showcase→ SCENE_MOTHER（仅 is_flagship）
```
- 规范写法**不带 locale 前缀**（平台注入 `/en-us/...`）；模板内跳转过滤器名**以 `docs/shopline.md` 实测 P0 为准**。
- 前端**禁 `/pages/` 字面量**；回母页 CTA 一律 `A2 resolve().master_page_url`。
- 业务线代号统一 **`scene`**；`skin` / `Product collection sceneshowcase` 等旧写法全部作废。

---

## §F 十五门禁：可执行细则（`scripts/check_gates.sh`）

| # | 检查 | 实现要点 | 豁免 |
|---|---|---|---|
| 1 | 模块名禁点号 | `find sections blocks components -name '*.*'` 去掉已知扩展名后仍含 `.` → FAIL | 版本号 `@1.2.0` 只在 contracts 内 |
| 2 | section 同名双段 | 对每个 `sections/*/` 目录 `D`，断言 `D/$(basename D).html` 存在 | `blocks/` 子目录不参与 |
| 3 | private block 三处齐 | 主文件含 `{{#content "blocks"`；schema `blocks[].type` 逐个去 `$` 对 `blocks/<b>.html`；反向扫描未登记 block → WARN | 全局 `blocks/` 不带 `$` |
| 4 | presets 必带 | 每个 `{{#schema}}…{{/schema}}` 段 JSON 解析后必须有非空 `presets` | `layout/` `templates/` 无 schema |
| 5 | schema 纯净 | schema 段 grep `https?://\|\.glb\|M-[A-Z]\|#[0-9A-Fa-f]{6}\|¥\|＄\|[0-9]+%` | 无 |
| 6 | 语法白名单 | grep `{%\|{{!--` → FAIL；过滤器逐个比对 `contracts/filters.json`；`<style>`/`<script>` 块在 sections/blocks → FAIL | `public/sv-dna/sv-core.js` 本身 |
| 7 | 零裸 hex / 零裸交易值 | `#[0-9A-Fa-f]{6}` 全仓扫；`¥\|＄\|HK\$\|[0-9]+% off\|满[0-9]\|order by [A-Z][a-z]+ [0-9]` | `dna.css`、`PALETTE*.json`、`docs/`、`handoffs/` |
| 8 | i18n 闭合 | 收集所有 `\| t()` 键 ↔ `i18n/en.json`；收集 `t:sections.*` ↔ `en.schema.json`；`options_N`/`presets_N` 连续性 | DNA 零文案组件 |
| 9 | 后缀与体积 | 后缀白名单表；`public/` 单文件 ≤ 实测值（未测 60KB）；section ≤80KB；poster ≤90KB；`du -sb` 包体 ≤10MB；zip 根层必须直出 `layout/` | 实测表填完后以表为准 |
| 10 | Cold 零 GLB | 沉睡路径（`dormant` / `silhouette` / `poster` 相关模板分支）静态扫到 `.glb` → FAIL；运行期断言 `performance` 无 glb 请求 | `S3_HOT_LIVE` 分支 |
| 11 | Checkout 触碰 | `MANIFEST.checkout_touched` 为 true 且 `blockers.md` 无用户 APPROVED 链接 → FAIL | 无 |
| 12 | 降级可达 | 关掉全部 Worker（mock `api.get→null`）跑一遍：无白屏、无 throw、兜底子块可见、`data-sv-state=error` 有 UI | 无 |
| 13 | Worker 路由冻结 | 主题源码 grep `https?://\|/api/\|workers.dev` → FAIL；`api.get(key)` 的 key ∈ endpoints.json | `contracts/`、`sv-core.js` 内部 endpoint 表 |
| 14 | 页面路由冻结 | 主题源码 grep `/pages/` 字面量 → FAIL；`templates/pages/*.json` ⊆ routes.json 白名单；缺文件 → FAIL | `routes.json` 本身、`docs/` |

**退出码**：任一 FAIL → `exit 1`，**不出 zip、不上传 Drive、SUMMARY 只记 blockers**。
**WARN 不拦包**，但必须进 SUMMARY §3（连续 2 rev 未清 → 升 FAIL）。

---

## §G MANIFEST.json 字段（zip 内 + 快照内同一份，哈希互验）

```json
{
  "handoff_id": "H-001-sv-bundle-hero",
  "handoff_version": "v1",
  "rev": 1,
  "protocol_version": "1.1.0",
  "built_from": "git sha",
  "built_at": "ISO8601",
  "theme_limits_profile": "limits@unprobed",
  "routes": { "bundle": "/pages/bundles" },
  "files": [ { "path": "sections/sv-bundle-hero/sv-bundle-hero.html", "sha256": "…", "bytes": 12345 } ],
  "model_refs": [ { "slot": "hero_master", "model_id": "Bundle_MOTHER", "asset_ver": "v1" } ],
  "endpoints_used": [ "bundle", "shipping", "season" ],
  "gates": { "passed": 14, "warn": 1, "failed": 0 },
  "checkout_touched": false,
  "deferred": [ { "to": "A3", "what": "POST /api/bundle/quote 未登记", "blocks_fid": ["F-09"] } ],
  "blockers": []
}
```

---

## §H 性能与可访问性硬指标（进 §F[12] 与验收表）

- Hero 首屏 **LCP ≤ 2.5s**（冷启动 4G）；`master_ready` 内 **不阻塞首屏**。
- `S1` 反馈 **≤80ms**；`S2` 淡切 **240ms**（`motion=off` 时 0ms）；`S3` 首帧 暖 ≤600ms / 冷 ≤1200ms。
- **Hot Canvas ≤4**；`S5` 后渲染内存回基线 **±2**。
- 375px **零横向滚动**；底部吸附栏留 `safe-area`。
- 焦点环 `--svd-focus` 可见；`Esc` 把焦点还给触发 Promote 的原 Cold 卡按钮；`prefers-reduced-motion` 全链路生效。
- W/C 对比 ≥ **1.60**（Bundle/MTO 档）；**禁纯色块承载信息**，接缝/线用 `--sv-seam-active`。
