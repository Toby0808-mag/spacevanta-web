# Antigravity 代码清单：全局/驱动层共用代码

PULLED_SHA: ec7bdb823bf57eef1fa729e65026b9e4095670cd
UPDATED_AT: 2026-11-28 11:24
UPDATED_BY: ag/mto-L5v01

规则：开工前 pull、完工后 submit，随 PR 提交。其他模板要调用本模板内部组件，请先读本清单，并用 `dep` 登记依赖。

## 1. 在途施工锁
<!-- LOCKS -->
LOCK|ag/bundle-L5v02|web/public/sv-dna/|892cacf021|2026-11-28 02:44|DONE
LOCK|ag/bundle-L5v02|web/public/sv-vendor/|892cacf021|2026-11-28 02:44|DONE
LOCK|ag/bundle-L5v02|web/public/sv-bundle/|892cacf021|2026-11-28 02:44|DONE
LOCK|ag/bundle-L5v02|web/components/sv-seam/|892cacf021|2026-11-28 02:44|DONE
LOCK|ag/bundle-L5v02|web/components/sv-agent-slot-g0/|892cacf021|2026-11-28 02:44|DONE
LOCK|ag/bundle-L5v02|web/components/sv-promote-portal/|892cacf021|2026-11-28 02:44|DONE
LOCK|ag/bundle-L5v02|web/i18n/|892cacf021|2026-11-28 02:44|DONE
LOCK|ag/mto-L5v01|web/public/sv-dna/|ec7bdb823b|2026-11-28 07:18|DONE
LOCK|ag/mto-L5v01|web/public/sv-bundle/|ec7bdb823b|2026-11-28 07:18|DONE
LOCK|ag/mto-L5v01|web/components/sv-promote-portal/|ec7bdb823b|2026-11-28 07:18|DONE
LOCK|ag/mto-L5v01|web/i18n/|ec7bdb823b|2026-11-28 07:18|DONE
<!-- /LOCKS -->

## 2. 文件台账
<!-- FILES -->
FILE|web/components/sv-agent-slot-g0/sv-agent-slot-g0.css|458a4006b52c|0f7ea8e|L5@v01|ag
FILE|web/components/sv-agent-slot-g0/sv-agent-slot-g0.html|0b57150ecaad|0f7ea8e|L5@v01|ag
FILE|web/components/sv-promote-portal/sv-promote-portal.css|110926c1c373|0f7ea8e|L5@v01|ag
FILE|web/components/sv-promote-portal/sv-promote-portal.js|11f056534e99|0f7ea8e|L5@v01|ag
FILE|web/components/sv-root-portal/sv-root-portal.css|f10dd6dcef05|8e9c7b0|L5@v01|ag
FILE|web/components/sv-root-portal/sv-root-portal.js|8a7d748afe60|8e9c7b0|L5@v01|ag
FILE|web/components/sv-seam/sv-seam.css|b6d0ecf843f0|0f7ea8e|L5@v01|ag
FILE|web/i18n/en.json|e996a883a138|0f7ea8e|L5@v01|ag
FILE|web/i18n/zh.json|bd0584faf328|0f7ea8e|L5@v01|ag
FILE|web/public/sv-bundle/BundleDriver.js|f5011c241166|0f7ea8e|L5@v01|ag
FILE|web/public/sv-bundle/BundleScene3D.js|1a07e6daf984|0f7ea8e|L5@v01|ag
FILE|web/public/sv-bundle/MtoScene3D.js|c91abc0bc7fd|-|L5@v01|ag
FILE|web/public/sv-bundle/PromoteController.js|8ecc85d4c382|0f7ea8e|L5@v01|ag
FILE|web/public/sv-bundle/bundle-geometry.js|33d4e40e2b2a|0f7ea8e|L5@v01|ag
FILE|web/public/sv-bundle/glbMount.js|c9e9f98b651f|0f7ea8e|L5@v01|ag
FILE|web/public/sv-bundle/motherRig.js|24cb949622db|0f7ea8e|L5@v01|ag
FILE|web/public/sv-bundle/mto-geometry.js|19b3eef3d4f4|-|L5@v01|ag
FILE|web/public/sv-bundle/mtoRig.js|d65a4dcf4b2d|-|L5@v01|ag
FILE|web/public/sv-dna/dna.css|e1c86323364d|0f7ea8e|L5@v01|ag
FILE|web/public/sv-dna/sv-core.js|bc56343ddd0d|0f7ea8e|L5@v01|ag
FILE|web/public/sv-header/sv-logo-wordmark.svg|d6dbf130b208|8e9c7b0|L5@v01|ag
FILE|web/public/sv-header/sv-scene-card-thumb.webp|8e2adc8be8af|8e9c7b0|L5@v01|ag
FILE|web/public/sv-header/sv-season-icon.svg|48f4eadf6493|8e9c7b0|L5@v01|ag
FILE|web/public/sv-header/sv-ui-icons.svg|2261c7a72861|8e9c7b0|L5@v01|ag
FILE|web/public/sv-vendor/three/build/three.core.js|613e370f7663|0f7ea8e|L5@v01|ag
FILE|web/public/sv-vendor/three/build/three.module.js|104f56145899|0f7ea8e|L5@v01|ag
FILE|web/public/sv-vendor/three/examples/jsm/loaders/GLTFLoader.js|532ac726e120|0f7ea8e|L5@v01|ag
FILE|web/public/sv-vendor/three/examples/jsm/utils/BufferGeometryUtils.js|7bda2a8ba836|0f7ea8e|L5@v01|ag
FILE|web/public/sv-vendor/three/examples/jsm/utils/SkeletonUtils.js|b1632a703206|0f7ea8e|L5@v01|ag
FILE|web/public/sv-vendor/three/package.json|87f2c99a8718|0f7ea8e|L5@v01|ag
<!-- /FILES -->

## 3. 变更记录
<!-- CHANGES -->
CHG|2026-11-28 03:30|ag/bundle-L5v02|L5@v02|M:web/components/sv-seam/sv-seam.css M:web/i18n/en.json M:web/i18n/zh.json
CHG|2026-11-28 11:24|ag/mto-L5v01|L5@v01|M:web/components/sv-promote-portal/sv-promote-portal.js M:web/i18n/en.json M:web/i18n/zh.json M:web/public/sv-bundle/BundleDriver.js M:web/public/sv-dna/dna.css M:web/public/sv-dna/sv-core.js
<!-- /CHANGES -->

## 4. 拉取记录
<!-- PULLS -->
PULL|ag/bundle-L5v02|892cacf021|2026-11-28 02:44|无重叠
PULL|ag/mto-L5v01|ec7bdb823b|2026-11-28 07:18|重叠12个文件
<!-- /PULLS -->

## 5. 依赖其他模板内部组件（DEP|被依赖模板|路径|被依赖方基线SHA|时间）
<!-- DEPS -->
<!-- /DEPS -->

## 6. 已保留的源实现（SRC|批次|分支|路径|修改前基线SHA|KEPT/HOLD；仅全局/驱动层）
<!-- SOURCES -->
SRC|20261128-033039_ag-bundle-L5v02|ag/bundle-L5v02|web/components/sv-seam/sv-seam.css|892cacf021|KEPT
SRC|20261128-033039_ag-bundle-L5v02|ag/bundle-L5v02|web/i18n/en.json|892cacf021|KEPT
SRC|20261128-033039_ag-bundle-L5v02|ag/bundle-L5v02|web/i18n/zh.json|892cacf021|KEPT
SRC|20261128-112443_ag-mto-L5v01|ag/mto-L5v01|web/components/sv-promote-portal/sv-promote-portal.js|ec7bdb823b|KEPT
SRC|20261128-112443_ag-mto-L5v01|ag/mto-L5v01|web/i18n/en.json|ec7bdb823b|KEPT
SRC|20261128-112443_ag-mto-L5v01|ag/mto-L5v01|web/i18n/zh.json|ec7bdb823b|KEPT
SRC|20261128-112443_ag-mto-L5v01|ag/mto-L5v01|web/public/sv-bundle/BundleDriver.js|ec7bdb823b|KEPT
SRC|20261128-112443_ag-mto-L5v01|ag/mto-L5v01|web/public/sv-dna/dna.css|ec7bdb823b|KEPT
SRC|20261128-112443_ag-mto-L5v01|ag/mto-L5v01|web/public/sv-dna/sv-core.js|ec7bdb823b|KEPT
<!-- /SOURCES -->

## 7. 异常与人工备注
