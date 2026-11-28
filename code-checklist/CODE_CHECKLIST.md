# Antigravity 代码清单：全局/驱动层共用代码

PULLED_SHA: 892cacf021247b51f50512022a0e6e13ad1b7625
UPDATED_AT: 2026-11-28 03:34
UPDATED_BY: ag/global-header-L5v01-sline-fix

规则：开工前 pull、完工后 submit，随 PR 提交。其他模板要调用本模板内部组件，请先读本清单，并用 `dep` 登记依赖。

## 1. 在途施工锁
<!-- LOCKS -->
LOCK|ag/global-header-L5v01-sline-fix|web/public/sv-header/|892cacf021|2026-11-28 02:23|DONE
<!-- /LOCKS -->

## 2. 文件台账
<!-- FILES -->
FILE|web/components/sv-root-portal/sv-root-portal.css|f10dd6dcef05|8e9c7b0|L5@v01|ag
FILE|web/components/sv-root-portal/sv-root-portal.js|8a7d748afe60|8e9c7b0|L5@v01|ag
FILE|web/components/sv-seam/sv-seam.css|117f7198e25e|8e9c7b0|L5@v01|ag
FILE|web/i18n/en.json|1664a26830f8|8e9c7b0|L5@v01|ag
FILE|web/i18n/zh.json|b2264475141e|8e9c7b0|L5@v01|ag
<!-- /FILES -->

## 3. 变更记录
<!-- CHANGES -->
CHG|2026-11-28 01:55|ag/global-header-L5v01-sline-fix|L5@v01|D:web/public/sv-header/sv-logo-wordmark.svg D:web/public/sv-header/sv-scene-card-thumb.webp D:web/public/sv-header/sv-season-icon.svg D:web/public/sv-header/sv-ui-icons.svg
CHG|2026-11-28 02:23|ag/global-header-L5v01-sline-fix|L5@v01|无文件变动
CHG|2026-11-28 02:28|ag/global-header-L5v01-sline-fix|L5@v01|无文件变动
CHG|2026-11-28 03:34|ag/global-header-L5v01-sline-fix|L5@v01|无文件变动
<!-- /CHANGES -->

## 4. 拉取记录
<!-- PULLS -->
PULL|ag/global-header-L5v01-sline-fix|892cacf021|2026-11-28 01:52|无重叠
PULL|ag/global-header-L5v01-sline-fix|892cacf021|2026-11-28 02:23|无重叠
<!-- /PULLS -->

## 5. 依赖其他模板内部组件（DEP|被依赖模板|路径|被依赖方基线SHA|时间）
<!-- DEPS -->
<!-- /DEPS -->

## 6. 已保留的源实现（SRC|批次|分支|路径|修改前基线SHA|KEPT/HOLD；仅全局/驱动层）
<!-- SOURCES -->
SRC|20261128-015507_ag-global-header-L5v01-sline-fix|ag/global-header-L5v01-sline-fix|web/public/sv-header/sv-logo-wordmark.svg|892cacf021|KEPT
SRC|20261128-015507_ag-global-header-L5v01-sline-fix|ag/global-header-L5v01-sline-fix|web/public/sv-header/sv-scene-card-thumb.webp|892cacf021|KEPT
SRC|20261128-015507_ag-global-header-L5v01-sline-fix|ag/global-header-L5v01-sline-fix|web/public/sv-header/sv-season-icon.svg|892cacf021|KEPT
SRC|20261128-015507_ag-global-header-L5v01-sline-fix|ag/global-header-L5v01-sline-fix|web/public/sv-header/sv-ui-icons.svg|892cacf021|KEPT
<!-- /SOURCES -->

## 7. 异常与人工备注
