# GROK_BUILD_CONTRACT.md (v1.3.0)
🔒 唯一真源：本文件定义 SpaceVanta Web 全局契约

## 1. 技术栈与事实源
- 3D 电商前端：Cloudflare Workers + Shopline 事实源
- 呈现层：3D 场景渲染 / 页面模块 / 状态交互（可变）
- 后端协同：Worker 层（事实提取与迁移）
- 资产存储：Cloudflare R2（自定义域名：assets.spacevanta.com）

## 2. 资产与 R2 存储（新增）
- R2 用途：托管 3D 模型（.glb/.blend）、贴图（.ktx2）、图像（.avif）等静态资产
- 公开访问域名：https://assets.spacevanta.com（需在 Cloudflare 控制台绑定 R2 存储桶并配置 CNAME/域名前置）
- 前端引用：所有资产 URL 统一走 assets.spacevanta.com，禁止硬编码其他源
- 本地忽略：.gitignore 已排除 *.glb / *.blend / *.avif / *.ktx2（本地不提交，以 R2 为真源）
- 迁移与同步：R2 资产路径需登记至 MIGRATION_LEDGER（三把锁之一）

## 3. 三把锁（核心治理）
- 迁移号归 MIGRATION_LEDGER
- 共享层归 Build
- PLACEHOLDERS 总表单一

## 4. 禁碰层（Cursor / Agent 严禁修改）
- worker/fact
- worker/shopline
- d1/migrations
- PLACEHOLDERS.md
- PALETTE.json

## 5. 协作路由
- 入门：读 AGENTS.md → 本契约 → .cursor/rules
- 设计预览与 UI 校验：遵循 .cursor/rules/design-preview.mdc
- 忽略项：.ref/, *.glb, *.blend, *.avif, *.ktx2, node_modules/, dist/, .env（见 .gitignore）
- R2 配置：域名 assets.spacevanta.com 绑定由运维/构建层处理，代码层仅消费 URL
