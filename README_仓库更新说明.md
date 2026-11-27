# 仓库更新说明

GitHub 当前没有关联账号，所以这里是**可直接提交的文件包**。把本目录内容复制到仓库根目录即可。

## 目录结构（建议；与你现有仓库不同处请告诉我）
```
design/            L3/ L4/ L5/ PRESENT_LOG/ PALETTE.json   ← 仅 design/* 分支改；L5 只能新增
web/               Shopline 主题                          ← ag/*
assets/3d/products/        商品模型                        ← ag/*
assets/3d/ecosystem/ag/    生态模型(owner=ag)              ← ag/*
assets/3d/ecosystem/cu/    生态模型(owner=cu)              ← cu/*
workers/ agent/ contracts/                                 ← cu/*
verify/ag/ verify/cu/      各自的 VERIFY 报告
change/            CR-*.md 变更单                          ← 任何分支
docs/protocols/ docs/brand/  协议与品牌（本包 protocols/ brand/ 复制进来）
```
## 提交步骤
1. 新建分支 `gov/protocol-v2`，复制本目录文件，再把 `../protocols/*` → `docs/protocols/`，`../brand/*` → `docs/brand/`。
2. 把 `.github/CODEOWNERS` 里的 `@your-handle` 换成你的用户名。
3. 提交、合并；仓库设置里对主分支开启"必须通过 status check: gates"与"必须 CODEOWNERS 审批"。
4. 旧协议文件（生产协议、Antigravity v1.0/v1.1、Gemini v1.1/附录）移到 `docs/_ARCHIVE/`，不要删。
5. Antigravity 若用自己的规则文件，把 `.cursor/rules/ownership.mdc` 改写成它的版本（把 ag/cu 对调，职责按其协议）。

## 说明
- `check_gates.sh` 做三件事：分支前缀决定角色→只能改自己的路径；`design/L5/` 已有文件不可改/删；施工方不得改设计侧受保护文件。
- hex 检查默认只警告；`STRICT_HEX=1` 才失败（因为现有 hero-bridge 是否含 hex 我未核对）。
- 我没能连接真实仓库，脚本只在本地临时仓库里测过。
