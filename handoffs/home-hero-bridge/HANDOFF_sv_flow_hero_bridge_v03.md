HANDOFF_sv_flow_hero_bridge_v03.md（多市场版）

移交固定声明： 本单全部业务与交易数据来自段 4 占位符表，const MOCK 仅存在于设计样机 artifacts/design/L25_sv_flow_hero_bridge_v03.html。严禁在任何已交付 HTML 基础上继续修改，严禁将任何 MOCK 数据带入 src/；请严格依照段 2 状态表、段 2.5 资产冻结面与段 6 验收表重新实现。
段 0 · 抬头与多市场路径前缀表

text
HANDOFF_sv_flow_hero_bridge_v03.md
FLOW_ID      : sv_flow_hero_bridge_v03（合入跨页升维子流 sv_flow_promote_v01）
FREEZE_ID    : sv_home_herobridge_asset_v01
动态页面路由  : /{market}/（首页 Hero-Bridge 融合区）
业务出口路由  : /{market}/pages/product-collection-scene-showcase
              /{market}/pages/bundles
              /{market}/pages/made-to-order
市场判定铁律  : 只认 URL 市场路径前缀 /{market}/ 与 sv_ship_to，绝不从 accept-language 猜测
DNA 强度档    : 高（home_scene_season：α 28% [28~45%] / β 0.60 [0.6~1.0] / δ=0 [上限 2] / γ 0.35 · W/C = 1.06 / 0.568 = 1.87 ≥ 1.60 ✅）
交易层归属    : 纯只读消费（按 F-ID 单一归属 worker/shipping · worker/bundle · worker/pricing · worker/mto · worker/season · worker/config），本单不写交易库、不改价格/库存/可购买性
本单批次      : A 组（呈现骨架 + 静态占位图 + Promote 六态 + 无障碍，预估 2 会话/60 分钟）
              → B 组（多市场 Worker 只读接入 + 超时/熔断 + GLB 实模联调，开工前须口头放行）
              → C 组（Remember 非 PII 意图埋点 + G-0 静默验证）
多市场路径前缀冻结表（/{market}/）

组件内严禁硬编码 /en-us/，所有站内跳转链接与只读 Worker 请求必须统一读取当前路由 market 参数并透传。

市场路径前缀	对应市场	交易与分池特殊分支	路由与接口透传规则
/en-us/	United States（美国）	常规海/空运双门槛，全部由 worker/shipping 动态注入	透传 market=/en-us/
/en-gb/	United Kingdom（英国）	按 UK 市场规则注入 {{DUTY}}、{{LEADTIME}}、{{THRESHOLD}}	透传 market=/en-gb/
/en-au/	Australia（澳大利亚）	按 AU 市场规则注入免运门槛与时效	透传 market=/en-au/
/en-ca/	Canada（加拿大）	按 CA 市场规则注入免运门槛与时效	透传 market=/en-ca/
/en-sg/	Singapore（新加坡）	按 SG 市场规则注入免运门槛与时效	透传 market=/en-sg/
/en-hk/	Hong Kong SAR（香港）	混合车分池在 HK 市场下执行「一律不拦」分支；自提/送上门门槛由 worker/shipping 动态注入	透传 market=/en-hk/
/{lang}-{region}/（扩展位）	国家选择器其余支持地区（如 CN / MO 及多语变体）	遵循同一 /{market}/ + sv_ship_to 契约；未命中配置时动态块静默落 timeout_hidden	动态读取并透传当前 /{market}/
段 1 · 交互功能清单（FUNCTION INVENTORY）

F-ID	功能名	触发条件	状态迁移	空/错/超时降级	可见反馈	DNA(α/β/δ)	交易层归属
F-01	首屏方案 B 暖调静物热区与 SKU 信息泡	点击/悬停静物舞台内 3 枚接缝锚点	idle → hotspot_inspect → idle	价格占位缺失→隐藏价格字段，保留品名与 /{market}/products/[handle] 直达链接；无 JS→直跳商品页	锚点外圈显现 var(--sv-seam) 焦点环，静物底栏平滑切换对应 SKU 信息泡	28%/0.60/0	worker/pricing（只读）
F-02	首屏主按钮下单行信任点注入	进入 /{market}/ 或切换 sv_ship_to	idle → idle / timeout_hidden	Worker 超时（3–4s）或任一必填字段缺失→整行动态信任条不渲染，不显示半截句、不白屏	固定顺序呈现单行：{{DUTY}} · {{LEADTIME}} · {{THRESHOLD}}	0%/0.00/0	worker/shipping（只读）
F-03	Hero / Bundle / MTO 子模型升维与无实模占位图兜底	点击 Inspect in 3D 或 Bundle/MTO Cold 卡 [升维]（含 Enter/Space）	S0 COLD_IDLE → S1 PROMOTE_ARM → S2 CROSSFADE → S3 HOT_LIVE → S4 DEMOTE → S5 COLD_PARK	无实际 GLB 资产产物（assetStatus=placeholder_only）时锁定 S0 仅渲 poster1600 占位图，0 次 GLB 请求；升维期 LOD 失败/超时/无实模→停在静态 poster 占位图、完整保留已选配置并出现「查看大图」，不转圈不白屏；WebGL 不可用→静态 poster 序列	≤80ms 卡片轻缩放与左缘接缝线强化，240ms 同机位同暖底 crossfade；?sv_motion=off 下 0ms 直切；顶层根级弹层开启	28%/0.60/0（Hot 舞台） / ≤10%/0.30/0（Cold 卡）	无（纯呈现，消费只读资产清单）
F-04	流层 1 · 主推品实拍微距与 Scene 出口	点击实拍静音卡 Tap for sound 或右侧 Explore Scenes	idle → layer_focus → exit_handoff	视频未就绪或解码失败→停驻静态高质感首帧封面，隐藏音频开关；仍保留商品与 Scene 出口	切换静音/有声态并保留 Filmed in-house 透明注脚；出口修正为 /{market}/pages/product-collection-scene-showcase	14%/0.35/0	无（纯呈现）
F-05	流层 2 · 无人物流静物 + 动态履约条 + Bundle 沉睡卡与阶梯入口	浏览 #layer-bundle、切换市场、勾选 Bundle 预设槽位或点击 Open Bundle Builder	idle → layer_focus → S1..S3（携带已选槽位）或 exit_handoff	worker/shipping 超时→隐藏动态履约条仅留政策链接；worker/bundle 超时→隐藏阶梯数字条与省额预览，不改写购物车真实计价；无 GLB 产物→Cold 卡仅渲静态占位图	展示洁净无人物流静物；Desktop 显示单行 Key Trust 条，Mobile 375px 自动隐藏该条并切换为 86vw 横滑卡	18%/0.45/0	worker/bundle（阶梯规则，只读）
F-06	流层 3 · 检测报告双语预览 + MTO 沉睡卡与请求入口	点击 Preview report、切换 MTO 宿主槽位或点击 Start a Request	idle → cert_preview / layer_focus → S1..S3（携带宿主与槽位）或 exit_handoff	报告预览图不可达→显示 Request CN original 客服直达入口，不弹红屏；worker/mto 超时→隐藏 SLA 天数占位，保留「批准前不扣款」原则；无 GLB 产物→Cold 卡仅渲静态占位图	报告于 <body> 顶层独立弹层打开；Desktop 显示单行 Key Trust 条（Mobile 隐藏）；出口为请求心智，严禁付款字样	16%/0.40/0	worker/mto（SLA 与原则元数据，只读）
F-07	Close Hero-Bridge 品牌长视频收口条	点击底部金属收口条 Watch Film	idle → film_modal → idle	默认零预加载；媒体加载失败→回 idle 并出非阻塞静态轻提示，不阻断向下逛品	顶层独立弹层懒加载播放，深金属收口条顶部接缝强制带 var(--sv-seam-aura) 1px 光芯	28%/0.60/0	无（纯呈现）
F-08	业务出口幂等防连点与返回状态保留	连续快速点击同一出口 CTA，或关闭弹层/刷新返回首页	layer_focus → exit_handoff（锁重入） / any → 复原	连续点击重复触发→仅执行首次导航/意图并提示忽略重复；刷新或关闭弹层→静默复原流层位置与已选槽位（内存/session 草稿），不弹阻断框	屏角非阻塞单行提示幂等拦截；关闭弹层后滚动与已选配置不丢失	0%/0.15/0	无（客户端幂等键与草稿）
F-09	季节皮肤 opt-in 与 ?sv_season=off 熔断	URL 带 ?sv_season=off 或手动切换季节视角	idle → season_off / idle	worker/season 超时、reviewed=false 或 ?sv_season=off→季节接缝色、强调色、线性图标与 {{ORDER_BY}} 整条不渲染，100% 回常规暖纸态；混合车分池在 /en-hk/（HK）/ 节日池空 / 开关关三分支下一律不拦	仅覆写 --sv-seam、--sv-accent、--sv-season-icon 三令牌，绝不改动 --sv-paper 与 --sv-paper-subtle	28%/0.60/0（常规）· 季节申诉上限 δ≤2	worker/season（只读）
F-10	键盘焦点管理、?sv_motion=off 直切与 G-0 智能体插座	键盘 Tab / Enter / Space / Esc、系统 prefers-reduced-motion、?sv_motion=off 或 ?sv_agent=off	任意态 → 聚焦/归位/0ms 直切/插座隐藏	?sv_agent=off→右下角 ⌀24mm 虚线圆圈整条消失不留空位、不白屏；?sv_motion=off→取消全部补间与 crossfade，状态机与焦点序不变	Cold 卡 1 tab stop → [升维] [入口]；升维进 Hot 舞台带规范 aria-label；Esc 焦点精确归还原 Cold 卡；三段 SR aria-live="polite" 播报；G-0 仅画 ⌀24mm 无色虚线圆圈	0%/0.00/0	worker/config（只读开关）
