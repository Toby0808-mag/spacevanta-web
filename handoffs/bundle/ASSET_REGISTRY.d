ASSET_REGISTRY.md · 全站模型资产唯一登记表

🔒 由 Agent B（模型装配与谱系）唯一维护；Agent A / C / D 只读消费。 改状态 = 走《变更申请》（见 handoffs/README.md 第 2 节），确认后先标 proposed，验收通过转 locked。 本表是「有没有模型、能不能请求 GLB」的唯一判据——Agent A 只看这里，不看聊天记录。
L-Mother · 母模型层（✅ 规范就绪，0 三角面，纯逻辑装配根）

Mother ID	三角面	锚点（逐字冻结，大小写敏感）	挂载顺序	snap 容差	seam_rail	状态
Bundle_MOTHER	0	anchor_A / anchor_B / anchor_C	A→B→C→A	6° / 3mm	环绕三锚点底部闭合虚线导轨	✅ locked
MTO_MOTHER	0	slot_base / slot_lid / slot_ring	base→lid→ring	6° / 3mm	沿容器主中轴垂直导轨	✅ locked
Bundle_MOTHER allowedSlots

anchor_A：tray_carrier | bay_1 | bay_2
anchor_B：bay_3 | bay_4
anchor_C：bay_5 | bay_6 | eco_slot
MTO_MOTHER allowedSlots

slot_base：vessel_body
slot_lid：cap | stopper
slot_ring：label_band | collar
渲染禁令：母模型自身永不上材质、永不打高光、永不投射接触阴影；仅调试开关 Mother Rig: ON 时显虚线外框 + 空心锚点球。
L-Hot · 活跃子模型层（全站 Hot 舞台 ≤ 4）

页面	Hot 槽位	当前挂载	额度	状态
首页 Hero-Bridge	Hot #1	聚焦 SKU（热区驱动）	1/1	⏳ 等 A 组壳 + 首模
Bundle 配置页	Hot #2	Child_Tray + 6 格 M-Proto	1/1	⏳ 母模型就绪，子模型待补
MTO 工作台	Hot #3	vessel_body + lid/ring	1/1	⏳ 母模型就绪，子模型待补
PDP（他页）	Hot #4	单件 SKU	1/1	⏳ 未开工
Child_Tray 零穿模硬坐标（v1.0 定版 · 禁改）

铰链顶盖主板厚 0.08，局部顶面 local Y = +0.0400；外框倒角严禁覆盖顶盖中心区。
暗色 Micro-Plinth 底面 local Y = +0.0405，高 0.0035（顶面 +0.0440）。
SV 折纸标体组刚性挂于 lidPivot 下 local Y = +0.0440；每分片平置后 boundingBox.min.y ≥ 0。
开盖 0° / 12° / 78° 及 Top SV Close-Up 全程零穿模；SV 用原色亮金属 + 3 层青蓝校准光晕，外缘以 --sv-steel 缓冲（metalRampGuard）。
L-Cold · 沉睡子模型层（0 次 GLB 请求）

位置	卡型	渲染内容	交互	状态
Hero 流层 2	Bundle Cold 卡	poster1600 + 虚线 silhouette	[升维] [Open Bundle Builder]	⏳ placeholder
Hero 流层 3	MTO Cold 卡	poster1600 + 虚线 silhouette	[升维] [Start a Request]	⏳ placeholder
Bundle 底部	Cross-Pool Cold 卡 ×6	同上 + HTML5 拖拽源	+ Add / ⇄ Swap / 拖入托盘	⏳ placeholder
Bundle 右侧	当前池芯片 ×6	thumb640 + silhouette	⇄ / × / Drop 移除区	⏳ placeholder
Cold 卡零旋转、零高光、零阴影、零 rAF；role="COLD"，lodHint="poster+silhouette"。

  L-Proto · 商品原型层 M-Proto（每 SKU 恰好 1 份源几何 · Law 1 同源派生）

📌 当前全部 placeholder_only，glbLod0Url = null → Agent A 锁 S0，0 次 GLB 请求。 Agent C 每交付 1 个 SKU（三件套齐 + 自检过），Agent B 在此把该行改 ready 并填 URL，A 无需改码自动升维。
SKU ID	商品	首选锚点	LOD0	LOD1	LOD2	poster	assetStatus	glbLod0Url
SV_MP_MATCHA_CRISPS	Matcha Nut Crisps	anchor_A/B/C	≤120k	≤45k	≤12k	≤90KB	placeholder_only	null
SV_MP_OLIVE_OIL_250	Organic EVOO 250ml	anchor_B	≤120k	≤45k	≤12k	≤90KB	placeholder_only	null
SV_MP_OAT_CLUSTERS	Multi-Fruit Oat Clusters	anchor_A/C	≤120k	≤45k	≤12k	≤90KB	placeholder_only	null
SV_MP_COD_SAUSAGE	DHA Cod Fish Sausages	anchor_A/B	≤120k	≤45k	≤12k	≤90KB	placeholder_only	null
SV_MP_??（基线至 12 SKU，待 B 补齐）	—	—	≤120k	≤45k	≤12k	≤90KB	placeholder_only	null
MTO 宿主 / 槽位件（另有独立谱系，待 B 提交细则）

部件 ID	类型	挂点	assetStatus	备注
SV_MTO_VESSEL_BASE_*	vessel_body	slot_base	placeholder_only	宿主 SKU，决定中轴与尺寸包络
SV_MTO_CAP_* / SV_MTO_STOPPER_*	cap / stopper	slot_lid	placeholder_only	须与宿主口径匹配
SV_MTO_LABELBAND_* / SV_MTO_COLLAR_*	label_band / collar	slot_ring	placeholder_only	贴附容差 6°/3mm
L-Deriv · 派生图层（Agent C 产出 → B 登记）

派生	规格	命名	用途	当前
poster1600	≤90KB，WebP，1600px 长边，同机位同暖底	SV_MP_<SKU>_poster1600.webp	Cold 卡 / S2 crossfade 起点 / fallback_poster	⏳ 全缺
thumb640	WebP，640px	SV_MP_<SKU>_thumb640.webp	右侧芯片 / 移动端横滑	⏳ 全缺
silhouette	SVG 虚线轮廓，单色 var(--sv-seam)	SV_MP_<SKU>_silhouette.svg	Cold 卡占位轮廓（非位图、非 3D）	⏳ 全缺
R2 布局（桶 sv-models，域 https://assets.spacevanta.com）

text
bundle/<SKU_ID>/SV_MP_<SKU>_lod0.glb
bundle/<SKU_ID>/SV_MP_<SKU>_lod1.glb
bundle/<SKU_ID>/SV_MP_<SKU>_lod2.glb
bundle/<SKU_ID>/SV_MP_<SKU>_poster1600.webp
bundle/<SKU_ID>/SV_MP_<SKU>_thumb640.webp
bundle/<SKU_ID>/SV_MP_<SKU>_silhouette.svg
mto/<PART_ID>/SV_MTO_<PART>_lod0.glb …
bundle/test.glb.html      ← 仅连通性测试文件，非资产，正式上线前删除
状态流转与门禁（唯一判据）

text
placeholder_only  ──①C三件套齐+自检报告──>  ready_proposed
ready_proposed    ──②B核验命名/面数/体积/min.y≥0──>  ready
ready             ──③B填glbLod0Url+commit──>  A 自动激活 S1..S5
ready             ──④LOD拉取连续失败/内存告警──>  fallback_poster（不回滚状态，仅运行时降级）
①三件套 = lod0.glb + poster1600.webp(≤90KB) + silhouette.svg，缺一不许报 ready。 Agent A 读取规则：assetStatus !== "ready" 或 glbLod0Url === null → 锁 S0，0 次 fetch(.glb)，点升维直落 fallback_poster。

变更日志

日期	变更	提出	状态
初始化	母模型双层冻结 + 12 SKU 基线登记（全 placeholder_only）	Agent B	locked
—	Bundle 活跃/沉睡子模型细则	Agent B	⏳ proposed
—	MTO 活跃/沉睡子模型细则 + slot 参数域	Agent B	⏳ proposed
—	首批试点 SKU（建议 SV_MP_OLIVE_OIL_250，几何最简、锚点单一）	Agent C	⏳ 待派单
