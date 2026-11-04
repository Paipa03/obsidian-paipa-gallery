# Paipa Gallery 更新记录（原 Gallery View）

## 1.3.0 — 2026-11-04

- **改名**：插件 id `gallery-view` → `paipa-gallery`、名称 Gallery View → Paipa Gallery（社区目录里 `gallery-view` 已被其他插件占用）。文件夹随之改为 `.obsidian/plugins/paipa-gallery/`，data.json 原样迁移。笔记里的 ```` ```gallery-view ```` 代码块语法不变，旧笔记无需修改。
- manifest 描述改为英文，准备上架社区插件。无行为变化。
- 备份：库外 `Desktop/Peanut2/backups/2026-11-04-publish/gallery-view-1.2.1/`。

## 1.2.1 — 2026-10-15

- **性能**：JPEG 改走 WebCodecs `ImageDecoder` 带尺寸提示解码（24MP 照片约 50 ms，原先全幅解码约 300 ms，EXIF 旋转自动处理），缩略图从主图副本再缩；副本编码改为 JPEG（2048 px 编码约 35 ms，WebP 需 300 ms 以上；png / webp / avif 来源仍用 WebP 保留透明）。15 张 24MP 照片的缩略条从约 10 s 降到约 2.7 s 全部就绪。
- **性能**：解码改为限流队列（同时 2 个，主图 / 邻图优先请求可多占 1 个），当前主图与左右邻图优先；主图切到尚未解码完的图时先用已解码的缩略图顶上（半透明提示），解码好即替换。此前打开页面后 15 张照片同时解码，用箭头切到还没轮到的图要等它解码完才换图，表现为「卡一下再切」；点缩略图不卡是因为能点到的都已解码。
- 备份：`main.js.bak-1.2.0` / `manifest.json.bak-1.2.0` / `styles.css.bak-1.2.0`。

## 1.2.0 — 2026-10-15

- **性能**：缩略图与主图改用按需生成的缩小副本（缩略 192 px、主图 2048 px，WebP，每个文件每次会话只解码一次，blob URL 缓存 400 条 LRU）。此前 24MP 照片在缩略条里按原图解码，Gallery 每次滚回视口都会卡 150–2000 ms；现在长页面滚动帧时间 p95 8.5 ms、无长任务。点击主图看原图仍是原文件。svg / gif 等矢量或动图不缩放。
- **性能**：在 Gallery 上方打字不再重建缩略条（只有 Gallery 数据本身变化才重渲染）；整篇扫描结果按文档快照缓存，一次按键不再反复 `toString()` + 扫描。
- **性能**：Gallery 渲染后改为请求 Editor Enhancer 1.2.1 的 `scheduleHierarchyLayout()`，不再每个 Gallery 各跑一遍全页层级布局；EE 低于 1.2.1 时退回旧调用。
- 备份：`main.js.bak-1.1.1` / `manifest.json.bak-1.1.1`。

## 1.1.1 — 2026-10-14

- **附件落点**：拖进 Gallery 的新文件先问 Section Blocks（≥ 1.2.0 的 `mediaPathFor(name, sourcePath)`），存进该页面同级的 `<页面名> media/` 文件夹；未装 Section Blocks 或其「Organize media」关闭时，仍按 Obsidian 自己的附件设置落盘（`nativeDrop` → `attachmentPath`）。
- 备份：`main.js.bak-1.1.0` / `manifest.json.bak-1.1.0`。

## 1.1.0 — 2026-10-14

- **Figure 编号与标题**：主图下方显示 `Figure N`（N 为该 Gallery 内的序号）。双击 `Figure N` 字样（或右键缩略图 → Edit title）进入命名，光标落在编号后的空格之后；Enter / 失焦保存，Esc 取消。标题写入 Gallery 数据（`caption` 字段，为空时不写），编号始终保留。
- **视频**：Gallery 可放入 mp4 / m4v / webm / mov / ogv。视频默认不自动播放，点中央播放键开始；自带进度条（可拖动）、播放 / 暂停、静音与音量条、倍速（0.25 / 0.5 / 1.0 / 1.5 / 2.0 / 3.0）。缩略图带播放角标；拖入、排序、拖出与图片一致。空 Gallery 提示改为「拖入图片或视频」。
- **Figure 引用**：右键缩略图 → **Insert reference**，在该 Gallery 所属区末尾（下一个 Gallery 之前，或正文末尾）插入一个 `Figure N` 引用按钮（正文里是 `[Figure N](gv-ref:<gallery>/<item>)`，未装插件时显示为普通链接文字）。点按钮：Gallery 可见度不足 90% 时滚到 Gallery 置顶，否则只切换到对应 figure。按钮可直接按住拖动到所属区内任意文字位置，拖动时显示插入光标与行高亮，左侧细线标出所属区；拖出所属区（另一个 Gallery 之下）会被拒绝。Gallery 排序 / 删除后，正文里引用的编号自动更新。阅读视图同样可点。
- 视频控制条只在鼠标悬浮播放器时出现，极简白色图标 + 细进度线；每次切到视频都从 0 开始，倍速、音量、静音会记住。
- 引用按钮文字 0.8em、两侧 padding 4px，按墨迹居中（默认上移 2px，设置 › Developer mode 里有滑块可微调）；按钮外自带前后各一个空格的间距（不写进正文，光标进不去，行尾光标也落在间距之后）；悬浮时左缘出现一条主题色刻度表示可拖；拖动插入 / 移走不改动正文的任何空格或空行，可放进单词中间或空行再原样取走。
- Insert reference 优先把按钮放到正文后方已有的空行上；没有空行才在正文末尾新起一行（拖走后这行会一并收回）。
- 缩略图右键菜单精简为 Insert reference 与 Remove image / video；图注改名只保留双击。
- 新增设置页：Developer mode 开关 → Figure label vertical offset 滑块（-3 到 3 px）。
- 修复：拖动若错过 mouseup，自动滚动循环会永久运行并把同一标签页里打开的所有页面推到底部。
- 兼容：Gallery 数据仍是 `v: 1`，旧笔记无需迁移；NSB 七个 provider 钩子签名未变。
- 源码：`plugin.js` / `core.js` / `build.cjs` 已不在插件目录，本版起直接维护 `main.js`（改前备份 `main.js.bak-<旧版本>`）。

## 1.0.3 — 2026-09-19

- 按新 id `editor-enhancer` 查找 Editor Enhancer；构建依赖改取 `Tools/plugin-toolchain`。

## 1.0.2 — 2026-09-17

- 菜单项改为英文并入 `editor-enhancer` 组；配合 NSB 的 provider 鸭子接口。

## 1.0.1 — 2026-09-17

- 手机触控：长按提起缩略图、轻触不抢编辑焦点；接管原生拖放后主动收尾，避免抓取光标与文件名气泡残留。

## 1.0.0 — 2026-09-17

- 首版：图片内容块、缩略图排序、拖入 / 拖出、原图预览、删除保护、Lite Gallery 转换。
