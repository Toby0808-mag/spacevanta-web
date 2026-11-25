# PROP-001 · 新增 worker/scene —— ✅ APPROVED

| 字段 | 内容 |
|---|---|
| 提议方 | A3 Backend（协议 §3 提案权） |
| 提出 | v1.1.0 草案 |
| **用户批准** | **2026-11-25（口头「批准」）→ 本文件落盘即 Drive 留痕** |
| 状态 | `APPROVED_PENDING_DEPLOY` |

## 动机
Scene 枢纽独立页 `/pages/scene` 需经 `resolve()` 取母页 URL 与模型版本，但现有 7 个 Worker 无一归属 Scene 线
（catalog 只做商品解析、market-festival 只做季节/市场）。无归属 ⇒ 前端只能拼 URL ⇒ 违反 G13。

## ADD
- `worker/scene` → `https://space-vanta-scene.huzetao.workers.dev`（**待 A3 部署后回填 endpoints.json，此刻 url=null 属正常**）
- 路由：`GET /resolve?slot=hero_master&scene_id=…` → `{ model_url, asset_ver, master_page_url, perm }`
- `master_page_url` 唯一值来源 = `contracts/routes.json` 的 `scene.path`，**禁止worker内硬拼**

## DEL
无。

## 并存期 / 回滚
首次部署，无旧路由。回滚 = 下线 worker + `endpoints.json` 置 `status: pending` ⇒ 前端走 `$fallback-poster` 静默隐藏（L4）。

## 影响面
- A1：零改动（只经 `SpaceVanta.api.get('scene','/resolve',…)`）
- A2：model-registry 增 `scene` 线血缘条目
- A4：无
- 门禁：G12/G13 不变；G15 要求 scene 条目填 `fallback_to` 后方可置 active

## 验收
1. 部署后回填 url，`status: active` → 跑十五门须仍 FAIL=0
2. 掐掉 scene worker → `/pages/scene` 不白屏、走 L4 兜底子块
3. `master_page_url` 返回值 === `/pages/scene`（含 locale 前缀由平台加）
