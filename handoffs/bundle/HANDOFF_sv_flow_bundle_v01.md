归档目标路径（Drive）：sv/model/bundle/HANDOFF_sv_flow_bundle_v01.md
交付性质：纯 Markdown 施工名单（依据 Appendix B v1.0 + Appendix C v1.0 + Appendix A v1.1 + PALETTE v1.2.1）
固定接缝声明：本单全部数据来自段 4 占位符表，const MOCK 仅存在于设计样机。不要在任何已交付 HTML（artifacts/design/L25_sv_flow_bundle_v03.html）基础上改；请严格照段 2 状态表、段 2.5 冻结锚点与段 6 验收表重新实现。
段 0 · 抬头（30 秒速览）

text
HANDOFF_sv_flow_bundle_v01.md
FLOW_ID      : sv_flow_bundle_v01（联动跨页升维流：sv_flow_promote_v01）
FREEZE_ID    : sv_bundle_mother_v01_0（基于 L2.5 v03 母模型 1.0 预演定版）
页面路由      : /en-us/pages/bundles（Bundle 主页）· /en-us/pages/mechanism-bundles-statement（规则 Target）
市场路径前缀   : /en-us/  ← 默认语言为 English；交易层只认路径前缀，绝不从 accept-language 猜
DNA 强度档     : 中（bundle_mto：α 12~20% / β 0.3~0.5 / δ=0..1 / γ 0.35 / W/C ≥ 1.60）
交易层归属     : worker/bundle（唯一主归属；仅只读消费 worker/shipping、worker/mto、worker/season 注入）
本单批次       : A 组（纯呈现与 3D 装配壳，预估 3 会话）→ B 组（交易与回算，需口头放行）→ C 组（Remember 埋点）
前置闸门与 L2.5 VERIFY 走查摘要（B.1 四项全过）

 FLOWCONTRACT_sv_flow_bundle_v01.md 八段已评审通过（用户已回「批准」）。
 VERIFY_sv_flow_bundle_v01 走查全过：V-01..V-10、V-P5（模拟 LOD 失败留本地 poster + 保留已选）、V-P6（连升 5 次内存回到基线 ±2）、?sv_motion=off、?sv_season=off、?sv_agent=off、顶盖亮金属原色 SV 零穿模、右侧直接增删换与 HTML5 拖拽均已验证。
 W/C 配平实测 2.52 ≥ 1.60 ✅（α=15% 常规 / 13% 翻转态，β=0.40 / Peek 0.45，δ=0，ρ=0.18 暖纸纹）。
 hardcodedTransactionValues = 0：本清单与呈现层契约中全部金额、礼遇比例、门槛、时效、日期均为 {{PLACEHOLDER}}。
段 1 · 交互功能清单（FUNCTION INVENTORY）

每行对应一个可验收单元，8 列齐全；完整验收命令见段 6。
F-ID	功能名	触发条件	状态迁移	空/错/超时降级	可见反馈	DNA(α/β/δ)	交易层归属
F-01	预搭配首屏与 Mobile 微开盒冒泡	进 /en-us/pages/bundles（Mobile 首次触发微开盒）	master_intro_peek → master_ready	读不到 worker/bundle → 整条组合块不渲染，退常规单品列表；开 reduced-motion 跳过开盒动效	顶盖轻启 12° + 暖纸气泡停留 2.8s 或触控即收起；首屏唯一一行 Trust 50	15% / 0.45 / 0	只读 worker/bundle + worker/shipping
F-02	3D 托盘舞台与顶盖 SV 检视	点 Tray View / Top SV Close-Up / Peek 12° / Open / Close / 点击槽内物品	S3_HOT_LIVE 内镜位与盖态平滑插值	WebGL 不可用 → 静态暖纸 SVG 托盘 poster，不白屏	Child_Tray 暖纸内底 + 深金属外框 + 亮金属原色 SV 零穿模顶盖；点击单品抬起展示 M-Proto 信息	15% / 0.40 / 0	无（纯呈现）
F-03	同源全局驱动层多端切换与 S1 翻转	Desktop 双栏联动；Mobile 点 M1 胶囊或横滑 3D 托盘触发 180° 翻转	master_ready ↔ mobile_flip_compare ↔ aux_editing	动效关闭时即时淡切，内存已选零丢失	统一经 BundleDriver.dispatch(intent, payload, mode) 派发；Mobile 双列对比条同步锁定差值	13~15% / 0.40 / 0	无（客户端单源驱动）
F-04	右侧工作区直接编排与 HTML5 拖拽	在右侧 6 格点 ⇄ 内联快换、× 移除、当前池芯片 + Add，或将卡片拖入 3D 托盘 / 指定槽位 / 移除区	master_ready → aux_editing（越界触发叠加态 boundary_nudge）	拖拽取消或落点无效 → 原位静默复原，不丢已选	拖入 3D 托盘出现双层 <Seam aura/> 落点环；拖出已占格位时底部浮现 × Drag here to remove	12% / 0.40 / 0	无（本地草稿；算价走 F-09）
F-05	底部 Cross-Bundle Pool 跨池选品与边界引导	点击底部跨池冷卡 + Add to Tray / ⇄ Swap In 或拖入托盘	aux_editing + boundary_nudge（超件数/同款超限/跨池满额/少于最低款数）	无跨池数据时隐藏底部区，保留右侧当前池编排	触发源旁浮现单行暖调引导语（无红框、无模态窗、无促销词），3.5s 或有效操作自动收起	8% / 0.30 / 0	worker/bundle（规则口径注入）
F-06	Cold → Hot 升维/降维与内存回收	点 Cold 卡 Promote 3D / 按 Esc / 点 Demote / 闲置 60s 或点 Park (S5)	S0_COLD_IDLE → S1_PROMOTE_ARM → S2_CROSSFADE → S3_HOT_LIVE → S4_DEMOTE → S5_COLD_PARK	LOD 拉取超时/失败 → 停本地 poster + View Full Poster 按钮，保留已选，零转圈零白屏	S1 ≤80ms 卡片 scale(1.02) + 左缘 seam 竖线；S2 240ms 同机位淡切；Esc 将焦点还给原 Cold 卡按钮	15% / 0.50 / 0	无（纯呈现，受全站 Hot ≤4 约束）
F-07	生态附加插槽（Ecosystem Slot）	随主舞台自动加载 Space Express；Life / Tech / Capital 留契约占位	与主流程同生命周期	读不到或超时 → 整条插槽静默不渲染，禁灰置「即将上线」占位	托盘下方单行暖纸条展示 Space Express · One parcel · {{ONE_PARCEL_NOTE}}	4% / 0.20 / 0	只读 worker/shipping（未来插槽只读扩展）
F-08	F2 混搭 MTO 轻提示与 Cart 发运引导	托盘内放入任意 ≥1 件 MTO 商品	叠加态 mixed_mto_hint（移出全部 MTO 自动收起）	读不到 {{MTO_REPLY_SLA}} → 保留英文基础引导语；绝不触碰 Checkout	生态插槽下平滑展开单行暖框提示，说明去 Cart 页选 Ship Together（免海运）或 Ship Separately	4% / 0.15 / 0	只读 worker/mto + Cart 属性透传
F-09	组合试算、幂等加购与草稿复原	增删换品实时重算；点 Take This Set / Take My Custom Set；刷新/重进页面	master_ready/aux_editing → submitting_cart → added_to_cart（超时 → timeout_fallback）	429/503 或超时 >4s → 非阻塞暖调 toast + Retry，保留已选；刷新后从 localStorage 静默复原草稿	按钮转 --sv-gunmetal + 进度点；2s 内可 Cancel；连点 3 次显幂等防重提示且仅 1 条写入	14% / 0.50 / 0	worker/bundle（唯一交易写入）
F-10	双端 SEO 收录与 D1 移动快捷 Target	桌面渲染底部 3 行 Vital Info；移动端渲染零视觉信息区 + Bundle & Shipping Guide ↗	静态渲染 / 点击跳 /en-us/pages/mechanism-bundles-statement	跳转目标维护时保持页内可购，不阻断主流程	桌面与移动 <head> 均输出占位符安全的 JSON-LD；375px 零横向滚动，底部吸附栏留 safe-area	4% / 0.10 / 0	无（SSR 元数据）
F-11	季节皮肤 opt-in 与智能体 G-0 熔断开关	URL 或配置项传入 ?sv_season=on/off、?sv_agent=off、?sv_motion=off	常规态 ↔ 季节接缝覆盖；G-0 虚线圈显示 ↔ 整条熔断	参数缺失或非法 → 默认 season=off、motion=on；agent=off 不留空位	季节仅改 --sv-seam-active（锁定 --sv-paper / --sv-paper-subtle / --sv-seam-aura）；G-0 仅 ⌀24mm 虚线圈	0% / 0.30 / 0..1	只读 worker/season（季节配置）
段 2 · 状态 × 视图矩阵（STATE MATRIX）

严格禁止出现 loading、error、success 等模糊状态名；Grok 建组件必须严格按本矩阵开分支，不许自造未登记状态。
2.1 Bundle 主流程 9 态矩阵（sv_flow_bundle_v01）

text
状态                  渲染块                         数据来自                     可点控件                            降级目标
master_intro_peek    Mobile 3D顶盖12°微开+暖纸气泡    worker/bundle + shipping     [Take This Set][横滑翻面][Got it]    2.8s/触控→master_ready
master_ready         桌面双栏 / Mobile 满装预搭配      worker/bundle + shipping     [Take This Set][编辑右侧][翻转]      无数据→退单品列表，块不渲染
aux_editing          右侧6格工作区+3D同步+跨池冷卡     BundleDriver + worker/bundle [Take My Custom Set][⇄][×][Reset]   算价超时→保留草稿禁用价格
mobile_flip_compare  Mobile 180°翻转舞台+双列对比条    BundleDriver + worker/bundle [Take Active Set][翻回另一面]        动效关→0ms淡切，草稿不丢
boundary_nudge       触发源旁单行暖调引导条(叠加态)    worker/bundle 规则边界        [Swap a Slot][替换已有格位]          3.5s/有效操作→自动收起
mixed_mto_hint       生态槽下F2轻提示条(叠加态)        worker/mto SLA               [继续搭配][去Cart选发运]             无SLA→显默认英文基础引导
submitting_cart      按钮转gunmetal+进度点+幂等锁      worker/bundle                [Cancel 仅2s内]                     超时>4s→timeout_fallback
added_to_cart        轻量确认条+直达Cart入口           worker/bundle                [Go to Cart / Choose Shipping][继续] master_ready / aux_editing
timeout_fallback     非阻塞暖调toast(保留全部已选)     —                            [Retry][继续浏览]                    回上一有效态，绝不白屏
2.2 Promote 跨区升维 6 态矩阵（sv_flow_promote_v01 · Appendix C.4.1）

text
态   名字            屏上是什么                                       时长/门槛                    失败去哪
S0   COLD_IDLE      Flat poster + 虚线 silhouette，0 个 GLB 请求      常驻                         —
S1   PROMOTE_ARM    卡片 scale(1.02) + 左缘 seam 竖线 β0.3→0.6        ≤80ms 必须给反馈             无JS→开静态大图页
S2   CROSSFADE      poster 1→0 / 3D 0→1，同机位同光比 ΔE≤2            240ms（motion=off 时 0ms）    取模失败→停本地poster+[View Full Poster]
S3   HOT_LIVE       3D 托盘可环绕/开盖/点槽位，携带用户已选配置         首帧 ≤600ms 暖 / ≤1200ms 冷   WebGL不可用→静态SVG托盘poster
S4   DEMOTE         回本地 poster，Canvas 保活不卸载，降 LOD1 停 rAF   120ms（Esc/关闭/滚出）        焦点还给触发Promote的原Cold卡按钮
S5   COLD_PARK      显式 dispose(geometry/material/texture)，回 S0     60s 闲置 / 内存告警           渲染内存回落至基线 ±2
2.3 全局驱动层同源调用契约（Single Source, Different Dispatch Modes）

铁律：全站 Bundle 交互禁止为 Desktop、Mobile、拖拽、内联面板、3D 舞台各自维护独立状态机或重复写规则校验。所有端侧与交互入口必须同源调用唯一驱动层：
唯一状态根：BundleDriverStore（持有 masterSlots、auxSlots、flowState、promoteState、cartDispatchIntent、idempotencyKey）。
唯一派发入口：dispatch(intent, payload, mode)，其中 mode 仅作来源适配器与埋点标识：desktop_stage | right_panel_inline | drag_drop | mobile_m1 | mobile_s1_flip | promote_pipeline | cart_handoff | ecosystem_slot。
校验单点归口：MAX_QTY、MIN_SKUS、MAX_PER_SKU、CROSS_POOL_LIMIT 与 mixed_mto_hint 的本地试算校验全部收敛于驱动层纯函数，并在 B-1 阶段与 worker/bundle 服务端校验保持同构。
段 2.5 · 母模型锚点冻结面 & 资产谱系登记（Appendix C §0 冻结面）

本节等同 Schema，锚点命名大小写逐字冻结；Grok 侧 CI 必须按此校验。
2.5.1 Bundle_MOTHER 装配根与锚点契约（Mother Model v1.0）

对象名：Bundle_MOTHER（纯 THREE.Group / 逻辑装配根）。
渲染禁令：自身永不上材质、永不打高光、永不投射接触阴影；仅在调试开关 Mother Rig: ON 时展示虚线外框与空心锚点球。
冻结锚点与挂载顺序：
anchor_A：allowedSlots = ["tray_carrier", "bay_1", "bay_2"]，snap 容差 6° / 3mm
anchor_B：allowedSlots = ["bay_3", "bay_4"]，snap 容差 6° / 3mm
anchor_C：allowedSlots = ["bay_5", "bay_6", "eco_slot"]，snap 容差 6° / 3mm
挂载顺序：A → B → C → A（冻结不可改）
接缝导轨：seam_rail（闭环导轨路径 A→B→C→A）
