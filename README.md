# Paipa Gallery

**English** · [中文](#中文)

**Image galleries for Obsidian that make working with pictures easy.** Put many images and videos in one tidy block, find any of them by its caption, point to them from your text, and open them full size with a click.

![A gallery block with a main image, caption and thumbnail strip](https://raw.githubusercontent.com/Paipa03/obsidian-paipa-gallery/main/docs/demo.png)

## Why Paipa Gallery

- **Image galleries**: a large main image with a thumbnail strip instead of a long column of pictures. Step through with the arrows or ← / →, drag thumbnails to reorder, drag images in from the note or your file manager, drag them back out.
- **Easy to use**: select some image links → right-click → **Gallery**. Everything else is clicking and dragging; nothing to configure first.
- **Search box** (desktop): the search icon in a gallery's top-left corner finds images by caption across every gallery in the note and takes you to the one you pick. Galleries already on screen don't jump.
- **References in your text**: images are numbered `Figure 1, 2…` with captions. Right-click a thumbnail → **Insert reference** puts a button in your text that jumps to that image, and the numbers follow when you reorder.
- **Enlarge any image**: click for a full-size viewer with Ctrl + scroll zoom and drag to pan; on phones, swipe and pinch. On desktop, drag the viewer's top strip like a tab to keep the image open in its own tab, split or window. Optionally, ordinary images in your notes open the same way.
- **Nothing extra in your vault (sync friendly)**: your images stay ordinary files and the originals are never changed. Thumbnails and previews are kept in the app's own storage outside the vault, so your sync tool never copies them, and they are removed when you uninstall.
- **Fast with large photos**: galleries show the kept previews at once; the viewer shows one immediately and switches to the original as soon as it is loaded.
- **Videos too** (mp4, webm, mov…): play / pause, seek, volume, speed.
- **Safe**: changes made to the note by another app, a script or Sync show up while it is open, and accidentally deleting a whole gallery in the editor is blocked.

## Quick start

1. Select some image or video links in a note.
2. Right-click → **Gallery**, or run the command **Create gallery**.
3. Drag thumbnails to reorder; double-click `Figure 1` to add a caption.

Coming from Lite Gallery? Put the cursor in a `litegal` block and run **Convert Lite Gallery at cursor**.

## Settings

| Setting | What it does |
|---|---|
| **Gallery behaviour for note images** (off by default) | Images outside galleries open in the same viewer when clicked (tap on phones), show a magnifier pointer, and drag like a tab. When off, they behave exactly as in Obsidian. |
| **Fill the viewer frame** (off by default) | The full-size viewer fills its frame with every image, enlarging small ones. Display only. |
| **Shrink large images when adding** (off by default) | Replaces files: large images dropped into a gallery are saved at the size the viewer needs on your largest screen, and only the smaller copy is kept. |
| **Keep previews on this device** (on by default) | Where thumbnails and previews are kept (outside the vault, never synced), with a size limit and a Clear button. |
| **Language** | Follow Obsidian, English or 中文. |

## Your data

A gallery is a fenced code block holding a small JSON list:

````markdown
```gallery-view
{"v":1,"id":"gal-hike","images":[{"id":"a","link":"![[ridge.jpg]]","caption":"Sunset ridge"}]}
```
````

Without the plugin you just see the code block; your images are untouched.

## Works on

Desktop, iPhone / iPad and Android. On touch screens: tap a thumbnail to select, long-press to drag; in the viewer, swipe and pinch.

## Works well with (optional)

- [Editor Enhancer](https://github.com/Paipa03/obsidian-editor-enhancer): drag the whole gallery like any other block.
- [Section Blocks](https://github.com/Paipa03/obsidian-section-blocks): dropped files go to a `<note name> media` folder next to the note.

## Install

**Settings → Community plugins → Browse**, search **Paipa Gallery**, Install, Enable.

---

## 中文

**让 Obsidian 里用图片变得轻松的图集插件。** 把许多图片和视频放进一个整齐的块里，按图注搜到任意一张，在正文里引用它，一点就能看大图。

### 为什么用 Paipa Gallery

- **图集**：一张大图加一排缩略图，不再是一长列图片。用箭头或 ← / → 翻看，拖缩略图排序，从笔记或文件管理器把图拖进来，也能拖回笔记。
- **好上手**：选中几条图片链接 → 右键 → **Gallery**。其余全是点和拖，不用先做任何设置。
- **搜索框**（电脑）：图集左上角的搜索图标按图注搜索本笔记所有图集里的图片，选中就跳到那张。已经在屏幕上的图集不会跳动。
- **在正文里引用图片**：图片自动编号「图 1、2…」并可写图注。右键缩略图 → **插入引用**，在正文里放一个按钮，点它跳到那张图；重新排序后编号自动跟着变。
- **放大任何图片**：点开就是原图窗口，Ctrl + 滚轮缩放、拖动平移；手机上滑动翻页、双指缩放。电脑上按住窗口顶部的拖动条，可以像拖标签页一样把图片拖成独立标签页、分屏或新窗口。也可以在设置里让笔记里的普通图片用同样的方式打开。
- **不往库里多放东西（对同步友好）**：图片仍是普通文件，原图永远不改。缩略图和预览存在应用自己的存储里，在库外，同步工具不会复制它们；卸载插件时一并删除。
- **大照片也快**：图集直接显示存好的预览；原图窗口先立刻显示预览，原图读完马上换上。
- **也能放视频**（mp4、webm、mov…）：播放 / 暂停、拖进度、音量、倍速。
- **安全**：笔记被其他应用、脚本或同步改动时，打开着也会更新；在编辑器里误删整个图集会被拦下。

### 快速上手

1. 在笔记里选中几条图片或视频链接。
2. 右键 → **Gallery**，或运行命令 **Create gallery**。
3. 拖缩略图排序；双击「图 1」写图注。

从 Lite Gallery 迁移：把光标放进 `litegal` 块，运行 **Convert Lite Gallery at cursor**。

### 设置

| 设置 | 作用 |
|---|---|
| **笔记图片使用 Gallery 交互**（默认关） | 图集外的普通图片点击（手机轻点）后用同一个原图窗口打开，鼠标悬停显示放大镜，可像标签页一样拖动。关闭时完全按 Obsidian 原本的方式。 |
| **原图窗口铺满画框**（默认关） | 原图窗口里每张图都铺满画框，小图会被放大。只影响显示。 |
| **加图时缩小大图**（默认关） | 会替换文件：拖进图集的大图按你最大屏幕所需的尺寸保存，只留缩小后的那份。 |
| **在本机保留预览图**（默认开） | 缩略图和预览存放的位置（库外，不会被同步），可设大小上限，也可一键清空。 |
| **语言** | 跟随 Obsidian、English 或中文。 |

### 你的数据

图集是一个代码块，里面是一小段 JSON 列表（格式见上方英文部分）。不装插件时只会看到这个代码块，图片本身不受影响。

### 支持平台

电脑、iPhone / iPad 和 Android。触屏上：轻点缩略图选中，长按拖动；原图窗口里滑动和双指缩放。

### 搭配使用（可选）

- [Editor Enhancer](https://github.com/Paipa03/obsidian-editor-enhancer)：像拖其他块一样拖动整个图集。
- [Section Blocks](https://github.com/Paipa03/obsidian-section-blocks)：拖进来的文件放到笔记旁边的 `<笔记名> media` 文件夹。

### 安装

**设置 → 第三方插件 → 浏览**，搜索 **Paipa Gallery**，安装并启用。

---

[Changelog](CHANGELOG.md) · MIT License · UI inspired by Lite Gallery.
