# docs/models.md — 模型资产与三业务树（人读版）

> **放置位置**：`protocol/docs/models.md`
> **机器真源**：`protocol/contracts/model-registry.schema.json`（形状）+ A2 交付的 `model-registry.json` / `assets-lock.json`（实例）
> **一句话**：**母只有一个，子是她的影子；子不挑颜色，季节只给母换衣服。**

---

## §1 三条业务线（并列，无主次；代号冻结）

| 线 | 独立页 | 母模型 | 谁有母 |
|---|---|---|---|
| **bundle** 预搭配 | `/pages/bundles` | `Bundle_MOTHER` | 该业务线恰好 1 个母 |
| **mto** Made to Order | `/pages/made-to-order` | `MTO_MOTHER` | 恰好 1 个母 |
| **scene** Scene 枢纽 | `/pages/scene` | `SKIN_MOTHER` | **仅 `is_flagship` 主推商品有母**；非主推 = 商品卡 + poster，无母 |

> 代号 `scene`。`skin` 只是**已定资产名残留**（`sv-skin-showcase` / `SKIN_MOTHER` / `--sv-*`），**不再作为路线图词使用**；任何新命名用 `scene`。

---

## §2 母模型五条（MOTHER · 唯一真源）

1. **唯一**：每线恰好 1 个，只在独立页 Hero（`model_slot: hero_master`）出现一次。
2. **0 面**：纯 `THREE.Group` 装配根，**自身永不打材质、永不打高光、永不投接触阴影**；仅 `Mother Rig: ON` 调试显示虚线框 + 空心锚点球。
3. **形状 + 颜色唯一真源**：所有子的几何 pivot、材质基色、比例都从母派生。
4. **独占 `recolor` 与 `reskin_season`**：这两位权限**只有母是 true**，子恒 false。
5. **独占季节换肤**：`worker/season` 说 `on` → A2 在母上挂 `_derived/season/<id>/` 皮肤 → **所有子同步展开**（派生重算，不是各改各的）；`?sv_season=off` 一键回默认，不动母本体。

### 锚点契约（Bundle 线，逐字冻结）
`anchor_A → anchor_B → anchor_C → anchor_A`，`seam_rail` 闭环；snap 容差 **6° / 3mm**。
`anchor_A:[tray_carrier,bay_1,bay_2]` · `anchor_B:[bay_3,bay_4]` · `anchor_C:[bay_5,bay_6,eco_slot]`

### 顶盖 `SV` 零穿模四坐标（Bundle 线，改 = MAJOR + 设计复核）
```
lid 主板厚 0.08      lid 局部顶面      local Y = +0.0400
micro-plinth 底面    local Y = +0.0405      高 0.0035（顶面 +0.0440）
SV 折纸标组挂 lidPivot 下 local Y = +0.0440
每个分片旋转平置后 boundingBox.min.y 归一化至 y ≥ 0
开盖 0° / 12° / 78° 与 Top SV Close-Up 全程零穿模
```
色调：原色亮金属（`--sv-specular/--sv-silver/--sv-pewter`）+ 暖棚 IBL；内折缝 3 层青蓝校准光晕，最外缘银端由 `--sv-steel` 缓冲（`metalRampGuard`）。

---

## §3 子模型六条（CHILD · 全部同级，无大小）

1. **同级**：活跃子与沉睡子**没有主从关系**，只有"此刻是 3D 还是贴片"的**状态差异**；都 100% 派生母。
2. **零独立换色**：`perm.recolor = perm.reskin_season = false`，**任何情况下不给子开这两个口子**（包括"客户想要个专属色"→ 走 MTO 流程，不是给子换色权）。
3. **活跃子（active）**：`model_slot: active_child`，3D 直接业务，独享 Hot Canvas 预算，`lod0/1/2` 齐备。
4. **沉睡子（dormant）**：`model_slot: dormant_poster`，**近 2D poster（≤90KB）+ 虚线 silhouette（lod2）**；`S0` 阶段 **0 个 GLB 请求**、零旋转、零高光、零阴影。
5. **同源律 Law 1**：`M-Proto` 每 SKU **恰好 1 份源几何**；Hot 3D 与 Cold 轮廓必须映射同一份，**禁止为贴片另建几何**。
6. **必须有回家的路**：活跃子 3D 内、沉睡子升维到 `S3` 后的 3D 内，**都强制挂「查看完整配置 / View full model」CTA** → `resolve().master_page_url` → 母页 Hero。**前端禁拼 URL**（`routes.json` / 门禁[14]）。跳过去是**公开查看权限**，不等于子拿到配置权。

---

## §4 升维管线 Promote S0→S5（`sv_flow_promote_v01`）

| 态 | 屏上 | 门槛/时长 | 失败去哪 |
|---|---|---|---|
| `S0_COLD_IDLE` | poster + 虚线 silhouette，**0 GLB 请求** | 常驻 | — |
| `S1_PROMOTE_ARM` | 卡片 `scale(1.02)` + 左缘 seam 竖线 β0.3→0.6 | **≤80ms 必须给反馈** | 无 JS → 开静态大图页 |
| `S2_CROSSFADE` | poster 1→0 / 3D 0→1，**同机位同光比 ΔE≤2** | 240ms（`motion=off` → 0ms） | 取模失败 → 停本地 poster + `View Full Poster`，保留已选 |
| `S3_HOT_LIVE` | 可环绕/开盖/点槽位，携带已选配置 | 首帧 暖≤600ms / 冷≤1200ms | WebGL 不可用 → 静态 SVG 托盘 poster |
| `S4_DEMOTE` | 回 poster，Canvas 保活不卸载，降 LOD1 停 rAF | 120ms（Esc / 关闭 / 滚出） | 焦点**还给触发 Promote 的那颗 Cold 卡按钮** |
| `S5_COLD_PARK` | 显式 `dispose(geometry/material/texture)` | 闲置 60s / 内存告警 | 渲染内存回基线 **±2** |

**四条不准**：零转圈、零白屏、零丢已选、零把 `error` 当状态名（`data-sv-state` 只许 `idle|loading|ready|error`，业务状态用上表枚举）。

---

## §5 面数 / 体积 / 并发预算

| 项 | 上限 |
|---|---|
| `M-Proto` LOD0 / LOD1 / LOD2 | 120k / 45k / 12k 三角面 |
| poster | 90 KB（webp/avif） |
| 母模型 | **0 面** |
| 全站 Hot Canvas 并发 | **≤4**（第 5 个请求把最久未交互的降到 `S5`） |
| 贴片/`public/` 进 3D | **0**（`.glb` 永不进 `public/`） |
| 压缩 | glb + Draco/Meshopt；贴图 KTX2/Basis；`immutable` 长缓存 |

---

## §6 判定速查（Cursor 拿不准时照这 7 问答）

1. 它是**这条线的唯一 Hero** 吗？→ 是 = `hero_master`；否 → 2
2. 它此刻要**真 3D 交互**吗？→ 是 = `active_child`；否 → `dormant_poster`
3. 我要给它换个颜色？→ **停**。只有母能换；这是 MTO 需求就走 MTO，别改子。
4. 季节来了？→ 只问 A2 要 `season_skin`，**别自己改材质**；`?sv_season=off` 就全回默认。
5. 我要跳母页？→ 问 `resolve().master_page_url`，**不许拼字符串**。
6. 我要在沉睡卡上直接挂 GLB？→ **不准**（门禁[10]）。poster + silhouette，等 Promote。
7. 我要在 schema 里写模型地址 / SKU / `M-` 编号？→ **不准**（门禁[5]）。只写 `model_slot` 枚举 + 展示开关。

---

## §7 三个恒真断言（提交前自问）

- **A-1** 任意子模型改一次颜色而母没变 → 实现有 bug。
- **A-2** 任意 `S0` 沉睡卡在 Network 面板里出现 `.glb` 请求 → 实现有 bug。
- **A-3** 任意活跃/沉睡（S3 后）3D 视图里找不到回母页的 CTA → 实现有 bug（门禁[14] + SUMMARY 必记）。
