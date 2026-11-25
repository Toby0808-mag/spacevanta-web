# 怎么把这包放进 GitHub（3 分钟）+ 每份文件放置位置总表

## 一、放置位置总表（★回答"每个文件放哪"）

> 约定：协议整体住仓库根的 `protocol/`。**唯一例外**是 `.cursor/rules/`——Cursor 只自动加载**仓库根**的 `.cursor/rules/`，所以要提到根（见第二步）。

| # | 文件（本包内路径） | **最终放置位置（仓库根起）** | 谁读 | 何时读 |
|:-:|:--|:--|:--|:--|
| 1 | `README.md` | `protocol/README.md` | 你 / 所有 Agent | 第一次，30 秒 |
| 2 | `PROTOCOL.md` | `protocol/PROTOCOL.md` | 全部 | **开工必读**（宪法） |
| 3 | `STACK.md` | `protocol/STACK.md` | A1 主读，A2/A3 参读 | 写模板前 / 出包前（§F 十五门） |
| 4 | `checkout.lock` | `protocol/checkout.lock` | 全部 | 任何触及 cart→checkout 的改动前 |
| 5 | `agents.md` | `protocol/agents.md` | 全部 | 跨产权协作 / 写借调单 / 提案前 |
| 6 | `HANDOFF_TEMPLATE.md` | `protocol/HANDOFF_TEMPLATE.md` | **Gemini** / 你 | 出图填单时（八段） |
| 7 | `agents/frontend.md` | `protocol/agents/frontend.md` | A1 | 每个前端 rev 开工 |
| 8 | `agents/assets.md` | `protocol/agents/assets.md` | A2 | 每次出/升模型版本、写 resolve |
| 9 | `agents/backend.md` | `protocol/agents/backend.md` | A3 | 每次改 worker / 端点登记 |
| 10 | `agents/ai.md` | `protocol/agents/ai.md` | A4 | 每次编排；G-1 口令前只读不建 |
| 11 | `contracts/routes.json` | `protocol/contracts/routes.json` | A1 / A2 / A4 | 任何页面跳转、CTA 生成前 |
| 12 | `contracts/endpoints.json` | `protocol/contracts/endpoints.json` | A3 写 / A1·A4 只读 | 取数前查 key；提案落 `proposal_log` |
| 13 | `contracts/filters.json` | `protocol/contracts/filters.json` | A1 | 写模板过滤器时（白名单 5 个） |
| 14 | `contracts/model-slot.schema.json` | `protocol/contracts/model-slot.schema.json` | A1 / A2 | section 声明 `model_slot` 时 |
| 15 | `contracts/model-registry.schema.json` | `protocol/contracts/model-registry.schema.json` | **A2 写** / A1·A3 只读 | 建/升模型、校验锚点与 perm |
| 16 | `docs/shopline.md` | `protocol/docs/shopline.md` | 全部（**L0 唯一判据**） | 语法存疑 / 上传报错 / 填 limits |
| 17 | `docs/models.md` | `protocol/docs/models.md` | 全部 | 判断母/子、沉睡/活跃、能不能换色 |
| 18 | `docs/changelog.md` | `protocol/docs/changelog.md` | 全部 | 开工扫一眼最新两条 + 作废表 |
| 19 | `scripts/check_gates.sh` | `protocol/scripts/check_gates.sh` | 出包前的人/CI | `bash protocol/scripts/check_gates.sh .`（`.` = **主题根**） |
| 20 | `handoffs/README.md` | `protocol/handoffs/README.md` | 全部 | 收发件前 |
| 21 | `handoffs/incoming/HANDOFF_bundle_bundle-hero_v1.md` | `protocol/handoffs/incoming/…` | A1/A2/A3 | **H-001 施工图，已批准可开工** |
| 22 | `handoffs/requests/.gitkeep` | `protocol/handoffs/requests/` | 全部 | 借调单 / 要路径 / 提风险分析 |
| 23 | `handoffs/outgoing/.gitkeep` | `protocol/handoffs/outgoing/` | A4 归集，**你点发送** | 每 rev 的 SUMMARY 回传 Gemini |
| 24 | `handoffs/snapshots/.gitkeep_example_SUMMARY.md` | `protocol/handoffs/snapshots/<ID>/v<rev>/SUMMARY.md` | Gemini（第一读者） | 每 rev 必出，≤40 行六段 |
| 25 | `.cursor/rules/execution.mdc` | **`.cursor/rules/execution.mdc`（仓库根！）** | Cursor | 每次会话自动加载 |
| 26 | `.cursor/rules/ownership.mdc` | **`.cursor/rules/ownership.mdc`（仓库根！）** | Cursor | 每次会话自动加载 |
| 27 | `.cursor/rules/models.mdc` | **`.cursor/rules/models.mdc`（仓库根！）** | Cursor | 碰 `sv-*` / 模型 / contracts 时 |

**主题本体**（`layout/ sections/ templates/ blocks/ components/ public/ i18n/ theme.schema.json theme.config.json`）**根层直出，不进 `protocol/`**，也**不进协议 zip**。协议与主题同仓不同目录，互不干扰。

---

## 二、三步落地

```bash
# 1) 开分支
git checkout -b protocol/v1.1

# 2) 摆放（注意 .cursor 提到根）
cp -r spacevanta-protocol/.  <你的仓库>/protocol/
cd <你的仓库>
mv protocol/.cursor .cursor
# 若根已有 .cursor/rules，别覆盖：把三份 .mdc 并进去，重名的先 diff

# 3) 确认没误伤业务码，再提交
git status --short | head -40
mv <你的仓库>/protocol/.cursor <你的仓库>/.cursor   # ★唯一提到根的目录
git add protocol/ .cursor/ .cursor/
git commit -m "protocol: SpaceVanta v1.1 — 十五门禁 / 路由冻结+提案制 / 四Agent产权 / 三业务线(scene) / handoff闭环 / Checkout冻结

- 开发目标与顺序不进协议，100% 由用户决定（§7）
- Worker 路由=常量，废除制：提案→APPROVED→ADD新→并存2rev→DEL旧
- 页面路由冻结 /pages/bundles · /pages/made-to-order · /pages/scene（skin→scene）
- §0 骨架豁免：Base 0.1.0 的 745 文件皆可增删改名，判据=十五门
- 新增 BLOCKED_BY_APPROVAL / BLOCKED_BY_CONTRACT 两个停工码"
git push -u origin protocol/v1.1
```
→ 开 PR，**你本人 review 后 squash merge**。合入前协议不生效，Cursor 不许按它施工。

## 三、跑一次门禁自检（H-001 开工前）
```bash
bash protocol/scripts/check_gates.sh <主题根目录>
# FAIL=0 才可出 zip；WARN 必须逐条写进 SUMMARY §3
```

## 四、H-001 怎么起跑
1. 你只说一句：**"做 H-001，A 组"** → Cursor 按 `PROTOCOL §11` 五步走。
2. **开工前唯一要你补的**：`protocol/contracts/endpoints.json` 里 `bundle.url` / `mto.url` / `season.url`
   —— **A3 从 worker 部署清单抄进去（登记事实，不是设计决策）**；填之前 A1 走 `$fallback-list` 兜底 + 标 `BLOCKED_BY_CONTRACT`，**不猜 `*.workers.dev`**。
3. A1 第一个动作不是写模板，是跑 **P0–P4 探针**回填 `protocol/docs/shopline.md §C`（尤其 P0：多语言 url 过滤器真名，没探明前不写跳转）。
4. 出包 → SUMMARY 落 `protocol/handoffs/outgoing/H-20261125-bundle-hero/v1/SUMMARY.md` → **你点发送** → Gemini 出 handoff v2。

## 五、回滚
```bash
git revert <merge-commit>        # 协议层整体撤回；主题业务码零影响
```
主题侧回滚走 `handoffs/snapshots/<id>/v<rev-1>/rollback.md` 三步（Drive 取旧 zip → 上传覆盖 → `assets-lock` 指回旧 R2 版本），**不依赖 Git**，因为 R2 版本路径不可变。

## 六、三条最容易犯的错（贴在显示器上）
1. **自己 mkdir 新目录** → 先发 `handoffs/requests/cursor-to-user-*.md` 等用户给路径（§2.1 + 门禁）。
2. **在模板里写 `https://…workers.dev` 或 `/pages/…`** → 门禁 [12][13] 直接 FAIL。
3. **"确认不影响，我先删了这个旧 worker 路由"** → 违废除制。必须提案 → APPROVED → 并存 2 rev。**即时删一律违规**，哪怕真没影响。
