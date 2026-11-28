# Antigravity 代码清单：全局/驱动层共用代码

PULLED_SHA: 892cacf021247b51f50512022a0e6e13ad1b7625
UPDATED_AT: 2026-11-28 03:30
UPDATED_BY: ag/bundle-L5v02

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
<!-- /LOCKS -->

## 2. 文件台账
<!-- FILES -->
FILE|web/components/sv-agent-slot-g0/sv-agent-slot-g0.css|458a4006b52c|-|L5@v02|ag
FILE|web/components/sv-agent-slot-g0/sv-agent-slot-g0.html|0b57150ecaad|-|L5@v02|ag
FILE|web/components/sv-promote-portal/sv-promote-portal.css|110926c1c373|-|L5@v02|ag
FILE|web/components/sv-promote-portal/sv-promote-portal.js|8cd5f631d5ca|-|L5@v02|ag
FILE|web/components/sv-root-portal/sv-root-portal.css|f10dd6dcef05|8e9c7b0|L5@v02|ag
FILE|web/components/sv-root-portal/sv-root-portal.js|8a7d748afe60|8e9c7b0|L5@v02|ag
FILE|web/components/sv-seam/sv-seam.css|b6d0ecf843f0|8e9c7b0|L5@v02|ag
FILE|web/i18n/en.json|be0d71b719b3|8e9c7b0|L5@v02|ag
FILE|web/i18n/zh.json|66391bae333f|8e9c7b0|L5@v02|ag
FILE|web/public/sv-bundle/BundleDriver.js|7ce5d366ef37|-|L5@v02|ag
FILE|web/public/sv-bundle/BundleScene3D.js|1a07e6daf984|-|L5@v02|ag
FILE|web/public/sv-bundle/PromoteController.js|8ecc85d4c382|-|L5@v02|ag
FILE|web/public/sv-bundle/bundle-geometry.js|33d4e40e2b2a|-|L5@v02|ag
FILE|web/public/sv-bundle/glbMount.js|c9e9f98b651f|-|L5@v02|ag
FILE|web/public/sv-bundle/motherRig.js|24cb949622db|-|L5@v02|ag
FILE|web/public/sv-dna/dna.css|8cb6933c49a4|-|L5@v02|ag
FILE|web/public/sv-dna/sv-core.js|92625907bd1f|-|L5@v02|ag
FILE|web/public/sv-header/sv-logo-wordmark.svg|d6dbf130b208|8e9c7b0|L5@v02|ag
FILE|web/public/sv-header/sv-scene-card-thumb.webp|8e2adc8be8af|8e9c7b0|L5@v02|ag
FILE|web/public/sv-header/sv-season-icon.svg|48f4eadf6493|8e9c7b0|L5@v02|ag
FILE|web/public/sv-header/sv-ui-icons.svg|2261c7a72861|8e9c7b0|L5@v02|ag
FILE|web/public/sv-vendor/three/build/three.core.js|613e370f7663|-|L5@v02|ag
FILE|web/public/sv-vendor/three/build/three.module.js|104f56145899|-|L5@v02|ag
FILE|web/public/sv-vendor/three/examples/jsm/loaders/GLTFLoader.js|532ac726e120|-|L5@v02|ag
FILE|web/public/sv-vendor/three/examples/jsm/utils/BufferGeometryUtils.js|7bda2a8ba836|-|L5@v02|ag
FILE|web/public/sv-vendor/three/examples/jsm/utils/SkeletonUtils.js|b1632a703206|-|L5@v02|ag
FILE|web/public/sv-vendor/three/package.json|87f2c99a8718|-|L5@v02|ag
<!-- /FILES -->

## 3. 变更记录
<!-- CHANGES -->
CHG|2026-11-28 03:30|ag/bundle-L5v02|L5@v02|M:web/components/sv-seam/sv-seam.css M:web/i18n/en.json M:web/i18n/zh.json
<!-- /CHANGES -->

## 4. 拉取记录
<!-- PULLS -->
PULL|ag/bundle-L5v02|892cacf021|2026-11-28 02:44|无重叠
<!-- /PULLS -->

## 5. 依赖其他模板内部组件（DEP|被依赖模板|路径|被依赖方基线SHA|时间）
<!-- DEPS -->
<!-- /DEPS -->

## 6. 已保留的源实现（SRC|批次|分支|路径|修改前基线SHA|KEPT/HOLD；仅全局/驱动层）
<!-- SOURCES -->
SRC|20261128-033039_ag-bundle-L5v02|ag/bundle-L5v02|web/components/sv-seam/sv-seam.css|892cacf021|KEPT
SRC|20261128-033039_ag-bundle-L5v02|ag/bundle-L5v02|web/i18n/en.json|892cacf021|KEPT
SRC|20261128-033039_ag-bundle-L5v02|ag/bundle-L5v02|web/i18n/zh.json|892cacf021|KEPT
<!-- /SOURCES -->

## 7. 异常与人工备注
