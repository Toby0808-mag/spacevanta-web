# handoffs/ — 四目录职责（Gemini 出图 → 你派单 → Cursor 施工 → 回传）

> **协议不定义开发目标和顺序。** 开发哪个模板、先做哪一步，**100% 由你决定**：你跟 Agent 说 Drive 里有什么文件就开发哪个。
> 遇到关联部分还没就绪（要调别的 Agent 但它还没产出）→ **标 `DEFERRED_TO_<AGENT>` 记账，继续手上的活，不停工**。
> `DEFERRED_TO_*` 是记账标记，**不是停工码**；五个停工码见 `../PROTOCOL.md` §8。

```
incoming/     Gemini 出的 handoff 图纸落这里。Cursor 只读，永不修改。
              命名：HANDOFF_<LINE>-<SECTION>_v<N>.md    例 HANDOFF_bundle-bundle-hero_v1.md
              八段格式见 ../HANDOFF_TEMPLATE.md；段 6 必须写「路径授权」，
              没写路径 → BLOCKED_BY_HANDOFF，问你，禁止自造目录。

requests/     Agent 间借调单。跨产权一律落盘才算数，口头不算。
              命名：<from>-to-<to>-<事由>.md            例 a1-to-a2-resolve-slot.md
              必含：要什么 / 依据 handoff 哪一段 / 要到什么程度 / 期限。
              被借调方回 ACK 或 BLOCKED_BY_*。

outgoing/     Cursor 完工后把 SUMMARY.md 写这里，**等你点发送**。
              你没点之前状态 = delivered_pending_feedback，不算 done。
              发送后 Gemini 据此出 handoff vN+1，闭环成立。

snapshots/    每 rev 一个目录，Drive 侧全量真源（Git 只放 SUMMARY 摘要）。
              <HANDOFF_ID>/v<rev>/
                MANIFEST.json        与 zip 内同一份，sha256 互验
                SUMMARY.md           ≤40 行六段，第1段=这轮推进了什么，第3段=blockers 原样上浮
                theme@<id>@v<rev>.zip
                assets-lock.json     R2 版本指针（回滚靠它，秒级不重传）
                contracts-lock.json  endpoints / routes / model-slot 版本
                blockers.md          无则写 none
                rollback.md          回 v(rev-1) 的精确三步
              样例见 .gitkeep_example_SUMMARY.md
              ⚠️ snapshots/ 整个目录 .gitignore，zip 不进 Git。
```

## 双套号，别混

| 号 | 谁加 | 含义 |
|---|---|---|
| `handoff vN` | Gemini / 你 | **设计侧**图纸版本 |
| `rev` | Cursor | **施工侧**同一张图纸下第几次交付 |

SUMMARY 标题行两个号并列写：`# v3 · H-20261125-bundle-hero（handoff v1）`。

## 开工第一动作（A1 铁律）

1. 拉最新 `snapshots/<id>/v<rev>/assets-lock.json`，**按锁定的 R2 版本施工，不自动追最新**。
2. 读 `contracts/routes.json` + `contracts/endpoints.json` 拿路由；**禁拼 URL、禁写 worker 地址**。
3. 读 `../STACK.md` §F 十五门，跑 `bash protocol/scripts/check_gates.sh .` → 全绿才出包。
4. 出包 = `theme@..zip` + MANIFEST + SUMMARY 双写（Drive 全量 / `protocol/snapshots/<id>/v<rev>.md` 仅 SUMMARY）。
5. SUMMARY 落 `outgoing/` → 标 `delivered_pending_feedback`。

## 停工码速查（5 个，停工不许先做后报）

| 码 | 触发 | 找谁 |
|---|---|---|
| `BLOCKED_BY_APPROVAL` | 要改/增删路由或 Worker、废除端点、出 G-1 —— Cursor 只有**提案权** | **你**（"你决定就行"不算 APPROVED，要明说批准 PROP-xxx） |
| `BLOCKED_BY_CONTRACT` | `endpoints.json` 里 key 为 `url:null` 却要调用 | A3 抄部署事实 |
| `BLOCKED_BY_DESIGN` | handoff 缺图/缺状态/缺占位符 | Gemini → 你 → 新版 handoff |
| `BLOCKED_BY_HANDOFF` | 没给路径、没给命名 | **你当场口述** |
| `BLOCKED_BY_CHECKOUT` | 需求必然触碰结账区 | 你 + 六问风险分析 + Drive 留痕 |

## 提案制（Cursor 有权提，但无权自行执行）

Cursor 发现该加/删店面或后台集成 API、该废掉某个不再用的 Worker、该为新主题能力建新 Worker →
写提案进 `../contracts/endpoints.json` 的 `proposal_log`：`PROP-NNN / 动机 / ADD 什么 / DEL 什么 / 并存期 / 回滚 / 影响面`。
**一律 ADD 新 → 并存 2 个 rev → DEL 旧**；**即便是"确认不影响"也不许即时删**。
状态 `PROPOSED_PENDING_USER` → 你回「批准 PROP-NNN」→ `APPROVED` → A3 执行 → `ACTIVE`。
