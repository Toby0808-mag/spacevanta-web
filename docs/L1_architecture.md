flowchart TB
    %% ==================== 样式定义 ====================
    classDef gov fill:#EEF2FF,stroke:#4F46E5,stroke-width:2px,color:#1E1B4B
    classDef mutable fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#064E3B
    classDef locked fill:#FEF2F2,stroke:#DC2626,stroke-width:2px,stroke-dasharray:5 5,color:#7F1D1D
    classDef sot fill:#FFFBEB,stroke:#D97706,stroke-width:2px,color:#78350F
    classDef ignored fill:#F3F4F6,stroke:#6B7280,stroke-width:1.5px,stroke-dasharray:4 4,color:#374151

    %% ==================== 1. 契约与治理层 ====================
    subgraph GOV["契约与工程治理层 (Governance & Contract)"]
        direction LR
        CONTRACT["GROK_BUILD_CONTRACT.md<br/>(v1.3.0 唯一真源)"]:::gov
        AGENTS["AGENTS.md<br/>(Agent 协作与改码红线)"]:::gov
        CURSOR_RULE[".cursor/rules/design-preview.mdc<br/>(设计预览与 UI 校验规则)"]:::gov

        CONTRACT -.->|"定义全局契约"| AGENTS
        CONTRACT -.->|"定义视觉规范"| CURSOR_RULE
    end

    %% ==================== 2. 呈现层 ====================
    subgraph PRES["呈现层 (3D 电商前端 / Presentation Layer)"]
        direction TB
        UI["3D 电商前端与交互视图<br/>(场景渲染 / 页面模块 / 状态交互)"]:::mutable

        subgraph PRES_LOCK["🔒 前端只读契约 (禁碰层)"]
            direction LR
            PLACEHOLDERS["🔒 PLACEHOLDERS.md<br/>(占位与文案契约)"]:::locked
            PALETTE["🔒 PALETTE.json<br/>(主题色板与视觉令牌)"]:::locked
        end

        PLACEHOLDERS -.->|"锁定占位槽位"| UI
        PALETTE -.->|"锁定色彩令牌"| UI
    end

    %% ==================== 3. 忽略项边界 ====================
    subgraph ASSET_BOUNDARY["非入库资产边界 (.gitignore)"]
        GIT_IGNORE[".ref/ · *.glb · *.blend 等<br/>(本地参考与 3D 源模型，不入 Git)"]:::ignored
    end

    %% ==================== 4. Worker 层 ====================
    subgraph WORKER["Worker 层 (Cloudflare Workers Edge)"]
        direction TB
        EDGE_BFF["Worker 路由与边缘编排<br/>(页面路由 / 缓存策略 / 响应组装)"]:::mutable

        subgraph WORKER_LOCK["🔒 Worker 核心适配层 (禁碰层)"]
            direction LR
            W_FACT["🔒 worker/fact<br/>(事实聚合与校验契约)"]:::locked
            W_SHOPLINE["🔒 worker/shopline<br/>(Shopline 接口桥接契约)"]:::locked
        end

        EDGE_BFF -->|"读取聚合事实"| W_FACT
        EDGE_BFF -->|"电商数据透传"| W_SHOPLINE
        W_FACT -->|"同步/核验业务事实"| W_SHOPLINE
    end

    %% ==================== 5. 事实源与 D1 迁移锁 ====================
    subgraph DATA["事实源与数据持久层 (Sources of Truth & Locks)"]
        direction LR
        SHOPLINE[("Shopline 事实源<br/>(商品 / SKU / 价格 / 库存 / 结账)")]:::sot

        subgraph D1_ZONE["D1 迁移锁与边缘数据库"]
            direction TB
            D1_LOCK["🔒 d1/migrations<br/>(D1 迁移锁 / 严禁修改)"]:::locked
            D1_DB[("Cloudflare D1<br/>(边缘结构化状态与事实缓存)")]:::sot
            D1_LOCK -.->|"锁定表结构与版本"| D1_DB
        end
    end

    %% ==================== 跨层交互连线 ====================
    CURSOR_RULE -.->|"约束前端预览"| UI
    AGENTS -.->|"约束目录禁碰边界"| EDGE_BFF
    GIT_IGNORE -.->|"运行时经 CDN/外部加载 3D 资源"| UI

    UI -->|"HTTPS / JSON 请求"| EDGE_BFF
    W_SHOPLINE <-->|"Shopline API (唯一电商事实源)"| SHOPLINE
    W_FACT <-->|"受控 SQL 读写"| D1_DB
