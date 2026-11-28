# Antigravity 学习记录

用途：每次新尝试的失败点与通过点；每次施工前先过一遍；"基本盘"是已验证可用的写法/语言，新路线跑不通时的最后保底。
标签用英文小写、逗号分隔（如 shopline-syntax,hotspot,glb）。行内不要写 `|`。

## 1. 基本盘 BASELINE（BASE|id|标签|可用写法/语言|验证证据|来源）
<!-- BASELINE -->
BASE|B001|shopline-syntax|输出 {{ x }} 转义 / {{{ x }}} 不转义；引用 {{#component "名" /}}、{{#section "名" /}}、{{#sections "组" /}}；文案 {{ "a.b" ／ t() }}|来源：官方 Fashion 1.1.14 源码（Treat5）通读|种子
BASE|B002|shopline-schema|区块必须在末尾 {{#schema}}…{{/schema}} 里声明 presets，否则不出现在编辑器"添加区块"|来源：官方源码 + 项目 doc 08|种子
BASE|B003|shopline-comment|源码里没有 {{!-- --}} 注释写法：新文件不用模板注释|来源：官方源码全文检索未出现|种子
BASE|B004|shopline-asset|public/ 是 asset_url() 的根；区块里 ./x.css 相对该文件所在目录|来源：官方源码|种子
BASE|B005|sv-core|window.SpaceVanta：market/season/api/slots；失败静默回退；3 秒超时；仅 https|来源：SpaceVanta-Base 0.1.0，真实浏览器测过|种子
<!-- /BASELINE -->

## 2. 施工前已读 REVIEWS（REVIEW|时间|分支|标签|看到的失败条数）
<!-- REVIEWS -->
<!-- /REVIEWS -->

## 3. 尝试 TRIES（TRY|id|时间|分支|结果|标签|目标|要点（失败点/通过点）|与已失败路线的不同）
<!-- TRIES -->
<!-- /TRIES -->

## 4. 成功记录 SUCCESS（SUCC|id|时间|标签|下轮/其他方向可走）
<!-- SUCCESS -->
<!-- /SUCCESS -->
