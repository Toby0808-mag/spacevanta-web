# SpaceVanta

暖纸之上，一条冷色接缝。本仓库是 SpaceVanta 的工程仓库：Shopline 主题、3D 资产、Cloudflare Workers、智能体，以及三方协作协议。

## 三方分工
| 角色 | 职责 |
|---|---|
| Gemini | 设计"大脑"：L1 概念图 → L2 初步稿 → L3 实体交互预演 → L4 多维评审 → L5 施工对齐手稿。不碰建造 |
| Antigravity | 网页搭建 + 商品 3D + 分配给它的生态 3D；基准线之外跑受控变体 |
| Cursor | Cloudflare + 智能体 + 分配给它的生态 3D |

施工只按 `design/<类别>/<事项>/L5/vNN`。L5 只能新增，不可改删。

## 目录
```
design/<类别>/<事项>/{L3,L4,L5}/    设计交付镜像（施工方只读）
design/PALETTE.json                 唯一允许出现 hex 的地方
web/                                Shopline 主题（Antigravity）
assets/3d/products/                 商品模型（Antigravity）
assets/3d/ecosystem/{ag,cu}/        生态模型（按 L5 ASSET_MAP 的 owner）
workers/  agent/  contracts/        Cloudflare 与智能体（Cursor）
track/                              Cursor 算力不足时的续作记录
verify/{ag,cu}/                     施工方验证报告
change/                             变更单 CR-*.md
learning/{antigravity,cursor}/      学习记录（基本盘/尝试/成功）
delivery/                           每次交付的新增/删除/修改清单与链路验证
u-runs/{ag,cu}/                     U 系列自动探索产出（沙箱，不进主干代码）
code-checklist/                     Antigravity 代码清单
docs/                               协议全文与品牌规范
```
类别：`theme` · `model-product` · `model-ecosystem` · `cloudflare` · `agent`。

## 工作方式
- 分支前缀决定角色：`ag/*` `cu/*` `ag-u/*` `cu-u/*`（U 沙箱）`design/*` `gov/*`；PR 标题写 `L5@vNN`。
- CI（`scripts/check_gates.sh`）强制路径所有权与 L5 不可变。
- 有疑问：开工前一次问完；开工后只提交 `change/CR-*.md`。
- 合入需用户"批准合入"。

## 文档
从 [`docs/README.md`](docs/README.md) 开始。
