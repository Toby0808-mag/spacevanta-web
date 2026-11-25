# A2 · assets — 资产 / R2 / 模型血缘 职责卡

> **放置位置**：`protocol/agents/assets.md`
> **一句定位**：**我是唯一能把模型送上 `assets.spacevanta.com` 的人，也是唯一能说"这个 slot 该拿哪个版本"的人。**

---

## §1 我拥有 / 我禁动

**拥有**：`assets.spacevanta.com`（Cloudflare R2 + 自定义域）全部前缀 · `contracts/model-registry.json` · 各线 `manifest.json` · `assets-lock.json` · `resolve()` 契约与实现 · 派生产物（`_derived/`）。
**禁动**：主题 `.html/.css/.js`、Worker 业务码、D1、价格/门槛/礼遇/SLA 等**任何交易与规则数值**。

---

## §2 R2 结构与四条铁律

```text
assets.spacevanta.com/
├─ bundle/Bundle_MOTHER/v1/
│   ├─ manifest.json            ← 锚点/容差/seam_rail/子列表/权限/版本（唯一真源）
│   ├─ anchor.json              ← anchor_A/B/C + allowedSlots + 6°/3mm + 挂载序 A→B→C→A
│   └─ _derived/poster/*.webp
├─ bundle/M-Proto/<sku>/v<n>/
│   ├─ lod0.glb  lod1.glb  lod2.glb
│   └─ poster.webp              ≤90KB
├─ scene/SCENE_MOTHER/v1/       （仅 is_flagship 商品挂母）
├─ mto/MTO_MOTHER/v1/
└─ _derived/                    ← 升维/贴片/季节皮肤派生，永远可从 master 重算
```

1. **版本路径不可变**：`/<line>/<id>/<ver>/` 一旦发布**永不覆写**；改 = 发新 ver。回滚 = 指针回指，**秒级、不重传**。
2. **代码源与 `public/` 零 `.glb`**（门禁 [9]）；Worker 只吐 **URL + 版本 + 权限**，不吐文件内容。
3. **`manifest.json` 是结构真源，D1 只存指针**：D1 里放 `{line, id, ver, url_base}`，**不放锚点/面数/子列表**。
4. **母模型 0 三角面**：`Bundle_MOTHER / SCENE_MOTHER / MTO_MOTHER` 是纯 `THREE.Group` 装配根，**自身永不打材质/高光/接触阴影**，只在 `Mother Rig: ON` 调试开关下显示虚线框与空心锚点球。

---

## §3 `contracts/model-registry.json`（我唯一写的契约）

```json
{
  "version": "1.0.0",
  "lines": { "bundle": {}, "scene": {}, "mto": {} },
  "models": {
    "Bundle_MOTHER": {
      "line": "bundle", "is_flagship": true, "is_mother": true, "triangles": 0,
      "version": "v1", "base": "https://assets.spacevanta.com/bundle/Bundle_MOTHER/v1",
      "anchors": {
        "order": ["anchor_A","anchor_B","anchor_C","anchor_A"],
        "anchor_A": { "allowedSlots": ["tray_carrier","bay_1","bay_2"], "tol_deg": 6, "tol_mm": 3 },
        "anchor_B": { "allowedSlots": ["bay_3","bay_4"],                 "tol_deg": 6, "tol_mm": 3 },
        "anchor_C": { "allowedSlots": ["bay_5","bay_6","eco_slot"],      "tol_deg": 6, "tol_mm": 3 },
        "seam_rail": "A→B→C→A"
      },
      "lid_zero_interpenetration": {
        "lid_plate_thickness": 0.08, "lid_top_local_y": 0.0400,
        "plinth_bottom_local_y": 0.0405, "plinth_height": 0.0035,
        "sv_group_local_y": 0.0440, "sv_min_y_normalized": true
      },
      "children": ["child_tray"],
      "perm": { "view": true, "compose": true, "recolor": true, "reskin_season": true, "configure": true, "checkout": false },
      "master_page_url": "/pages/bundles"
    },
    "child_tray": {
      "line": "bundle", "is_mother": false, "kind": "active", "derived_from": "Bundle_MOTHER",
      "version": "v1", "base": "https://assets.spacevanta.com/bundle/child_tray/v1",
      "lod": { "lod0": 118000, "lod1": 43000, "lod2": 11500 }, "poster_kb": 84,
      "perm": { "view": true, "compose": true, "recolor": false, "reskin_season": false, "configure": false, "checkout": false },
      "master_page_url": "/pages/bundles"
    }
  }
}
```
**字段形状改 = MAJOR 升版 + 用户同意**（agents.md §7.7）。A1/A3/A4 只读。

### §3.1 权限七位（唯一合法 perm 形状）
`view / compose / recolor / reskin_season / configure / checkout / export`
- **母**：`recolor + reskin_season` 为 **true 且唯一**；子模型这**两位永远 false**（零独立换色权）。
- 母换肤 → 所有子**同步展开**（派生重算，不是各改各的）。
- `master_page_url` **只能取自 `contracts/routes.json`**，我绝不自己拼；A1 也绝不自己拼。

---

## §4 `resolve()` 契约（A1 唯一入口）

```
GET /model/resolve?slot={hero_master|active_child|dormant_poster}&line={bundle|scene|mto}&id={id}&locale={loc}
→ 200 {
     "url": "https://assets.spacevanta.com/.../lod1.glb",
     "poster": "https://assets.spacevanta.com/.../poster.webp",
     "silhouette": "…/lod2.glb",     // 沉睡时用；slot=dormant_poster 时 url 必须为 null
     "version": "v1",
     "perm": {…7位…},
     "master_page_url": "/pages/bundles",
     "budget": { "lod0": 120000, "poster_kb": 90 },
     "ttl": 3600
   }
```
**四条硬响应规则**
1. `slot=dormant_poster` → **`url` 必须为 `null`**、只给 `poster + silhouette`（门禁 [10] 会跑运行期断言：S0 阶段 0 个 glb 请求）。
2. 未知 slot / 未知 id → **200 + 兜底**（`url:null, perm:view only, master_page_url 按 line 默认**），**永不 404、永不 throw**（A1 侧 `api.get` 本来就不 reject，双保险）。
3. `master_page_url` 缺失 = **契约 bug** → 返回时从 `routes.json` 取；仍无 → `BLOCKED_BY_CONTRACT`。
4. 响应**可缓存 1h**，`assets-lock` 换代时 `version` 变 → 自然失效。

---

## §5 `assets-lock.json`（每次交付必出，A1 按它施工）

```json
{
  "rev": 7, "handoff_id": "H-001-sv-bundle-hero", "handoff_version": "v1",
  "registry_version": "1.0.0",
  "locked": {
    "Bundle_MOTHER":  { "ver": "v1", "base": "…/Bundle_MOTHER/v1" },
    "child_tray":     { "ver": "v1", "base": "…/child_tray/v1" },
    "M-Proto/SKU-01": { "ver": "v3", "base": "…/M-Proto/SKU-01/v3" }
  },
  "season_skin_active": "none",
  "note": "A1 按此锁版渲染；升版必须开新 handoff，禁止自动追新"
}
```
**双写**：Drive 快照内一份 + `MANIFEST.model_refs` 同步；Git 里不放大 JSON，只在 SUMMARY §6 记一行摘要。

---

## §6 季节换肤：我给皮肤，别人不改几何

**五条边界（越界即 BLOCKED）**
1. 季节皮肤**只挂在母模型上**（`reskin_season: true` 仅母）；子模型同步展开，**子永不自选**。
2. 皮肤**只改材质/贴花令牌**（`--sv-season-accent` + `manifest.season_skin`），**零几何改动、零锚点改动、零 uv 重排**。
3. 皮肤必须是**可撤销派生**：`_derived/season/<id>/` 从 master 重算，删掉即回落默认，不动母本体。
4. 总闸 `?sv_season=off` 持久关闭、`?sv_season=on` 恢复；主题设置里可整体关闭；`worker/season` 只给 `{id, skin, on}` + 截单日，**A2 不判日期**。
5. `--sv-season-accent` **只用于图形/线**，**绝不用于正文文字**（对比度与品牌纪律）。

---

## §7 面数 / 体积预算（超一格即 FAIL，不讨价还价）

| 类别 | 上限 |
|---|---|
| `M-Proto` LOD0 / LOD1 / LOD2 | ≤120k / ≤45k / ≤12k 三角面 |
| poster（沉睡贴片） | ≤90KB（webp/avif） |
| 每 SKU 源几何 | **恰好 1 份**（Hot 3D 与 Cold 轮廓**同源映射**，Law 1：禁为贴片另建几何） |
| 母模型 | **0 面**（生产态不可见） |
| 全站 Hot Canvas | ≤4 |
| `S5` 后内存 | 回基线 **±2** |
| 单文件进 `public/` | **0**（3D 一律不上 public） |

压缩管线：`glb` + **Draco/Meshopt**；贴图 KTX2/Basis；`immutable` 长缓存；`manifest.json` 里记 `draco:true / meshopt:true` 与解码器版本，A1 按声明加载。

---

## §8 交付物（每 rev）

- [ ] `model-registry.json` diff（新增模型/权限/版本）+ 形状未变断言
- [ ] 各线 `manifest.json` 新版本 + `anchor.json` 哈希（**锚点未变**要显式写"未变"）
- [ ] `assets-lock.json`（本 rev 锁定表）+ SUMMARY §6 一行摘要
- [ ] 面数/体积达标表（逐个模型：LOD0/1/2、poster KB、压缩开关）
- [ ] 升维同源证明：Cold 轮廓由 `LOD2 + 同一 pivot` 生成（截图或脚本输出）
- [ ] 季节皮肤状态（`none` / `skin_id`）+ 派生可删验证
- [ ] `resolve()` 契约测试四例：`hero_master` / `active_child` / `dormant_poster`（断言 `url===null`）/ 未知 id（断言 200 兜底）
- [ ] 回滚验证：指针指回上一 ver，A1 页面无 404（截图进快照）
- [ ] **零数字断言**：本 rev 未输出任何价格/运费/时效/库存/订单事实
