/*
 * Paipa Gallery 1.4.0 - by paipa, MIT License
 * https://github.com/Paipa03/obsidian-paipa-gallery
 *
 * UI inspired by the Lite Gallery plugin.
 */

"use strict";
// ---- i18n ----
// UI text only. Keys are the English strings; values are Simplified Chinese.
// Never used for document syntax (gallery-view JSON, gv-ref tokens, "Figure N" written into notes).
var PAIPA_I18N_ZH = {
  "Language": "语言",
  "Follow Obsidian's language, or choose one for this plugin.": "跟随 Obsidian 的语言，或为本插件单独选择。",
  "Follow Obsidian": "跟随 Obsidian",
  "Close original image": "关闭原图",
  "Gallery": "Gallery",
  "Previous": "上一张",
  "Next": "下一张",
  "View original image": "查看原图",
  "Drop images or videos here": "拖入图片或视频",
  "Double-click to add a title": "双击添加标题",
  "Double-click to name this figure": "双击为此图命名",
  "Figure": "图",
  "Figure {n}": "图 {n}",
  "Media list": "媒体列表",
  "Image can't be loaded": "图片无法读取",
  "Insert reference": "插入引用",
  "Remove video": "移除视频",
  "Remove image": "移除图片",
  "Couldn't add media: {error}": "无法加入媒体：{error}",
  "Video": "视频",
  "Play": "播放",
  "Pause": "暂停",
  "Play / pause": "播放 / 暂停",
  "Progress": "进度",
  "Mute": "静音",
  "Unmute": "取消静音",
  "Volume": "音量",
  "Playback speed": "播放速度",
  "Video can't be loaded": "视频无法读取",
  "Item {n} of {total}": "第 {n} 张，共 {total} 张",
  "Empty gallery": "空 Gallery",
  "Can't read the gallery data. Check the source.": "Gallery 数据无法读取；请检查源代码。",
  "Create gallery": "创建 Gallery",
  "Convert Lite Gallery at cursor": "转换光标处的 Lite Gallery",
  "Image": "图片",
  "Place the cursor inside a Lite Gallery code block.": "请把光标放在 Lite Gallery 源码块中。",
  "Some images weren't recognized. The original gallery was kept.": "有无法识别的图片，原 Gallery 已保留。",
  "Reference to {label} added at the end of the text. Drag it anywhere.": "{label} 的引用已加到正文末尾，可拖到任意位置。",
  "Figure not found. It may have been deleted.": "找不到这张图，它可能已被删除。",
  "Can't find the gallery that contains this figure.": "找不到这张图所在的 Gallery。",
  "Figure not found": "找不到此图",
  "Show {label} \xB7 drag to move": "跳转到{label} \xB7 拖动可移动",
  "Show {label}": "跳转到{label}",
  "The content changed. Move canceled.": "内容已变化，移动已取消。",
  "A reference can only be placed within its own gallery's section.": "引用只能放在它所属 Gallery 的区域内。",
  "Move images within the same editor.": "请在同一编辑器中移动图片。",
  "The editor changed. Drop again; imported attachments stay in the vault.": "编辑器已变化，请重新拖入；导入的附件仍保留在库中。",
  "Developer mode": "开发者模式",
  "Show fine-tuning controls.": "显示微调选项。",
  "Figure label vertical offset": "图引用文字垂直偏移",
  "Nudges the text inside figure reference buttons. Positive moves it down. Unit: px.": "微调图引用按钮内文字的上下位置。正值向下移。单位：px。",
  "Reset": "重置"
};
var paipaLang = "auto";
function paipaObsidianLang() {
  try {
    const o = require("obsidian");
    const l = (typeof o.getLanguage === "function" && o.getLanguage()) || window.localStorage.getItem("language") || "en";
    return /^zh/i.test(String(l)) ? "zh" : "en";
  } catch (e) {
    return "en";
  }
}
function t(en, vars) {
  const lang = paipaLang === "auto" ? paipaObsidianLang() : paipaLang;
  let text = lang === "zh" && Object.prototype.hasOwnProperty.call(PAIPA_I18N_ZH, en) ? PAIPA_I18N_ZH[en] : en;
  if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m);
  return text;
}
// On-screen form of a figure label. The note keeps "Figure N"; only the display is translated.
function figureText(label) {
  const m = /^Figure (\d+)$/.exec(String(label));
  if (m) return t("Figure {n}", { n: m[1] });
  return label === "Figure" ? t("Figure") : label;
}
// ---- end i18n ----
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// core.js
var require_core = __commonJS({
  "core.js"(exports2, module2) {
    "use strict";
    var imageExtension = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
    var videoExtension = /\.(?:mp4|m4v|webm|mov|ogv)(?:[?#].*)?$/i;
    var mediaExtension = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp|mp4|m4v|webm|mov|ogv)(?:[?#].*)?$/i;
    var refPattern = /\[([^\[\]\n]*)\]\(gv-ref:([A-Za-z0-9-]+)\/([A-Za-z0-9-]+)\)/g;
    var uid = () => globalThis.crypto.randomUUID();
    function destination(markdown) {
      if (markdown.startsWith("![[")) return markdown.slice(3, -2).split("|")[0].trim();
      const start = markdown.indexOf("](");
      if (start < 0) return null;
      let value = markdown.slice(start + 2, -1).trim();
      if (value.startsWith("<")) return value.slice(1, value.indexOf(">"));
      return value.replace(/\s+["'][\s\S]*$/, "").replace(/\\([() ])/g, "$1");
    }
    function isVideo(link) {
      const dest = destination(link);
      return !!dest && videoExtension.test(dest.split("|")[0]);
    }
    function imageMatches(text, offset = 0) {
      const result = [];
      for (let at = 0; at < text.length; at++) {
        if (text[at] !== "!" || text[at + 1] !== "[" || text[at - 1] === "\\") continue;
        let end;
        if (text[at + 2] === "[") {
          end = text.indexOf("]]", at + 3);
          if (end < 0) continue;
          end += 2;
        } else {
          let close = at + 2;
          while (close < text.length && (text[close] !== "]" || text[close - 1] === "\\")) close++;
          if (text[close + 1] !== "(") continue;
          let depth = 1;
          end = close + 2;
          let angle = false;
          for (; end < text.length && depth; end++) {
            if (text[end] === "\\") {
              end++;
              continue;
            }
            if (text[end] === "<") angle = true;
            else if (text[end] === ">") angle = false;
            else if (!angle && text[end] === "(") depth++;
            else if (!angle && text[end] === ")") depth--;
          }
          if (depth) continue;
        }
        const link = text.slice(at, end), dest = destination(link);
        if (dest && (mediaExtension.test(dest) || !link.startsWith("![[") && /^https?:\/\//i.test(dest))) {
          result.push({ from: offset + at, to: offset + end, link });
        }
        at = end - 1;
      }
      return result;
    }
    function parse(source) {
      try {
        const model = JSON.parse(source);
        if (model.v !== 1 || typeof model.id !== "string" || !model.id || !Array.isArray(model.images)) return null;
        const ids = /* @__PURE__ */ new Set();
        for (const item of model.images) {
          if (!item || typeof item.id !== "string" || ids.has(item.id) || typeof item.link !== "string") return null;
          if (item.caption !== void 0 && typeof item.caption !== "string") return null;
          const matches = imageMatches(item.link);
          if (matches.length !== 1 || matches[0].link !== item.link) return null;
          ids.add(item.id);
        }
        return model;
      } catch (_) {
        return null;
      }
    }
    function serialize(model, indent = "") {
      return ["```gallery-view", JSON.stringify(model), "```"].map((line) => indent + line).join("\n");
    }
    function scan(text) {
      const lines = text.split("\n"), result = [];
      let offset = 0, fence = null;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i], match = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
        if (match && !fence) {
          fence = {
            character: match[2][0],
            length: match[2].length,
            gallery: match[3].trim() === "gallery-view",
            startLine: i,
            from: offset,
            indent: match[1]
          };
        } else if (match && fence && match[2][0] === fence.character && match[2].length >= fence.length && !match[3].trim()) {
          if (fence.gallery) {
            const source = lines.slice(fence.startLine + 1, i).join("\n");
            const model = parse(source);
            if (model) result.push({
              ...fence,
              to: offset + line.length,
              endLine: i,
              model,
              raw: text.slice(fence.from, offset + line.length)
            });
          }
          fence = null;
        }
        offset += line.length + 1;
      }
      return result;
    }
    function create(links = [], id = uid) {
      return { v: 1, id: id(), images: links.map((link) => ({ id: id(), link })) };
    }
    function remove(model, itemId, activeId) {
      const index = model.images.findIndex((item) => item.id === itemId);
      const images = model.images.filter((item) => item.id !== itemId);
      const active = activeId === itemId ? (images[index] || images[index - 1])?.id : activeId;
      return { model: { ...model, images }, active };
    }
    function reorder(model, itemId, index) {
      const images = [...model.images], old = images.findIndex((item2) => item2.id === itemId);
      if (old < 0) return model;
      const [item] = images.splice(old, 1);
      images.splice(Math.max(0, Math.min(images.length, index - (old < index ? 1 : 0))), 0, item);
      return { ...model, images };
    }
    function insert(model, links, index = model.images.length, id = uid) {
      const images = [...model.images];
      images.splice(Math.max(0, Math.min(images.length, index)), 0, ...links.map((link) => ({ id: id(), link })));
      return { ...model, images };
    }
    function caption(model, itemId, text) {
      const value = (text || "").replace(/\s+/g, " ").trim();
      return { ...model, images: model.images.map((item) => {
        if (item.id !== itemId) return item;
        const { caption: _, ...rest } = item;
        return value ? { ...rest, caption: value } : rest;
      }) };
    }
    function figureLabel(model, itemId) {
      const index = model.images.findIndex((item) => item.id === itemId);
      return index < 0 ? null : "Figure " + (index + 1);
    }
    function refToken(galleryId, itemId, label) {
      return "[" + label + "](gv-ref:" + galleryId + "/" + itemId + ")";
    }
    function refMatches(text, offset = 0) {
      const result = [];
      for (const match of text.matchAll(refPattern)) {
        result.push({ from: offset + match.index, to: offset + match.index + match[0].length, text: match[0], label: match[1], galleryId: match[2], itemId: match[3] });
      }
      return result;
    }
    function refFixes(text) {
      const blocks = scan(text), changes = [];
      for (const ref of refMatches(text)) {
        const block = blocks.find((b) => b.model.id === ref.galleryId);
        const label = block && figureLabel(block.model, ref.itemId);
        if (label && label !== ref.label) changes.push({ from: ref.from + 1, to: ref.from + 1 + ref.label.length, insert: label });
      }
      return changes;
    }
    function territory(text, galleryId, blocks = scan(text)) {
      const index = blocks.findIndex((b) => b.model.id === galleryId);
      if (index < 0) return null;
      const previous = blocks[index - 1], next = blocks[index + 1];
      return { from: previous ? previous.to : 0, to: next ? next.from : text.length, block: blocks[index], next };
    }
    function release(model, indent = "") {
      return model.images.map((item) => indent + item.link).join("\n\n");
    }
    function preserved(before, after) {
      const remaining = /* @__PURE__ */ new Map();
      for (const block of scan(after)) {
        const key = JSON.stringify(block.model);
        remaining.set(key, (remaining.get(key) || 0) + 1);
      }
      return scan(before).every((block) => {
        const key = JSON.stringify(block.model), count = remaining.get(key) || 0;
        if (!count) return false;
        remaining.set(key, count - 1);
        return true;
      });
    }
    module2.exports = { imageExtension, videoExtension, mediaExtension, uid, destination, isVideo, imageMatches, parse, serialize, scan, create, remove, reorder, insert, caption, figureLabel, refToken, refMatches, refFixes, territory, release, preserved };
  }
});

// plugin.js
var obsidian = require("obsidian");
var { Plugin, MarkdownRenderChild, Menu, Modal, Notice, setIcon, editorInfoField, editorLivePreviewField, PluginSettingTab, Setting } = obsidian;
var DEFAULT_SETTINGS = { devMode: false, refOffset: -2, language: "auto" };
var { EditorState, StateField, StateEffect, Annotation, Transaction, Prec, ChangeSet } = require("@codemirror/state");
var { EditorView, WidgetType, Decoration } = require("@codemirror/view");
var core = require_core();
var authorized = Annotation.define();
var refresh = StateEffect.define();
var SPEEDS = [0.25, 0.5, 1, 1.5, 2, 3];
var make = (doc, tag, cls, parent) => {
  const el = doc.createElement(tag);
  el.className = cls;
  if (parent) parent.appendChild(el);
  return el;
};
var stop = (event) => {
  event.preventDefault();
  event.stopPropagation();
};
var tooltip = (el, text) => {
  if (typeof obsidian.setTooltip === "function") obsidian.setTooltip(el, text);
  else el.setAttribute("aria-label", text);
};
var clock = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const whole = Math.floor(seconds), m = Math.floor(whole / 60), s = whole % 60;
  const h = Math.floor(m / 60);
  return (h ? h + ":" + String(m % 60).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
};
var OriginalImageModal = class extends Modal {
  constructor(plugin, src, label) {
    super(plugin.app);
    this.plugin = plugin;
    this.src = src;
    this.label = label;
  }
  onOpen() {
    this.plugin.modals.add(this);
    this.containerEl.classList.add("gv-modal-container");
    this.modalEl.classList.add("gv-modal");
    this.modalEl.setAttribute("aria-label", this.label);
    const close = this.modalEl.querySelector(".modal-close-button, .modal-header-button");
    close?.setAttribute("aria-label", t("Close original image"));
    const img = make(this.contentEl.ownerDocument, "img", "gv-original", this.contentEl);
    img.src = this.src;
    img.alt = this.label;
    img.draggable = false;
    img.addEventListener("dragstart", stop);
  }
  onClose() {
    this.contentEl.empty();
    this.plugin.modals.delete(this);
  }
};
var GalleryWidget = class extends WidgetType {
  constructor(plugin, block) {
    super();
    this.plugin = plugin;
    this.block = block;
  }
  eq(other) {
    return other.plugin === this.plugin && other.block.raw === this.block.raw && other.block.from === this.block.from;
  }
  toDOM(view) {
    return new GalleryUI(this.plugin, this.block, view).root;
  }
  updateDOM(dom, view) {
    const ui = dom.galleryUI;
    if (!ui || ui.block.model.id !== this.block.model.id) return false;
    const changed = ui.block.raw !== this.block.raw;
    ui.block = this.block;
    ui.cm = view;
    if (changed) ui.render();
    return true;
  }
  destroy(dom) {
    dom.galleryUI?.destroy();
  }
  ignoreEvent() {
    return true;
  }
  get estimatedHeight() {
    return 460;
  }
};
var RefWidget = class extends WidgetType {
  constructor(plugin, ref, label, missing, flash) {
    super();
    this.plugin = plugin;
    this.ref = ref;
    this.label = label;
    this.missing = missing;
    this.flash = flash;
  }
  eq(other) {
    return other.plugin === this.plugin && other.ref.galleryId === this.ref.galleryId && other.ref.itemId === this.ref.itemId && other.label === this.label && other.missing === this.missing && other.flash === this.flash;
  }
  toDOM(view) {
    return this.plugin.refElement(view.dom.ownerDocument, this.ref, this.label, this.missing, this.flash, view);
  }
  ignoreEvent() {
    return true;
  }
};
var GalleryUI = class {
  constructor(plugin, block, cm, sourcePath = "") {
    this.plugin = plugin;
    this.block = block;
    this.cm = cm;
    this.sourcePath = sourcePath || plugin.pathFor(cm);
    this.doc = cm?.dom.ownerDocument || document;
    this.speed = 1;
    this.shownKey = null;
    this.root = make(this.doc, "div", "gv-block");
    this.root.galleryUI = this;
    this.root.contentEditable = "false";
    this.frame = make(this.doc, "section", "gv", this.root);
    this.frame.setAttribute("aria-label", t("Gallery"));
    this.frame.setAttribute("role", "region");
    const stage = make(this.doc, "div", "gv-stage", this.frame);
    this.previous = this.button(stage, "chevron-left", t("Previous"), () => this.navigate(-1));
    const center = make(this.doc, "div", "gv-center", stage);
    this.hero = make(this.doc, "button", "gv-hero", center);
    this.hero.type = "button";
    this.hero.setAttribute("aria-label", t("View original image"));
    this.heroImage = make(this.doc, "img", "gv-hero-image", this.hero);
    this.heroImage.draggable = false;
    this.heroImage.decoding = "async";
    this.empty = make(this.doc, "span", "gv-empty", this.hero);
    const emptyIcon = make(this.doc, "span", "gv-empty-icon", this.empty);
    setIcon(emptyIcon, "images");
    make(this.doc, "span", "", this.empty).textContent = t("Drop images or videos here");
    this.buildPlayer(center);
    this.next = this.button(stage, "chevron-right", t("Next"), () => this.navigate(1));
    this.captionRow = make(this.doc, "div", "gv-caption", this.frame);
    this.figure = make(this.doc, "span", "gv-figure", this.captionRow);
    this.captionText = make(this.doc, "span", "gv-caption-text", this.captionRow);
    this.captionText.dataset.placeholder = cm ? t("Double-click to add a title") : "";
    tooltip(this.figure, cm ? t("Double-click to name this figure") : t("Figure"));
    this.status = make(this.doc, "span", "gv-sr-only", this.frame);
    this.status.setAttribute("aria-live", "polite");
    this.strip = make(this.doc, "div", "gv-strip", this.frame);
    this.feedback = make(this.doc, "span", "gv-feedback", this.frame);
    this.feedback.setAttribute("aria-hidden", "true");
    this.strip.setAttribute("aria-label", t("Media list"));
    this.strip.setAttribute("role", "list");
    this.hero.addEventListener("click", () => {
      const item = this.current();
      if (item && !core.isVideo(item.link)) new OriginalImageModal(plugin, plugin.imageURL(item.link, this.sourcePath), plugin.label(item.link)).open();
    });
    this.hero.addEventListener("dragstart", stop);
    this.heroImage.addEventListener("error", () => {
      this.hero.classList.add("is-missing");
      this.heroImage.alt = t("Image can't be loaded");
    });
    this.captionRow.addEventListener("dblclick", (event) => {
      if (!this.cm) return;
      stop(event);
      this.editCaption();
    });
    for (const type of ["keydown", "keyup", "keypress", "beforeinput", "input", "paste", "cut", "copy", "compositionstart", "compositionupdate", "compositionend"]) {
      this.captionText.addEventListener(type, (event) => {
        if (!this.editing) return;
        event.stopPropagation();
        if (type !== "keydown") return;
        if (event.key === "Enter") {
          event.preventDefault();
          this.finishCaption(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          this.finishCaption(false);
        }
      });
    }
    this.captionText.addEventListener("blur", () => {
      if (this.editing) this.finishCaption(true);
    });
    this.strip.addEventListener("wheel", (event) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      stop(event);
      this.strip.scrollLeft += delta * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? this.strip.clientWidth : 1);
    }, { passive: false });
    this.frame.addEventListener("contextmenu", (event) => {
      if (this.editing) return;
      stop(event);
      const button = event.target.closest(".gv-thumb");
      if (!button || !this.cm) return;
      const itemId = button.dataset.id;
      const item = this.block.model.images.find((entry) => entry.id === itemId);
      const video = item && core.isVideo(item.link);
      const menu = new Menu();
      menu.addItem((i) => i.setTitle(t("Insert reference")).setIcon("link").onClick(() => this.plugin.createReference(this, itemId)));
      menu.addItem((i) => i.setTitle(video ? t("Remove video") : t("Remove image")).setIcon("trash-2").onClick(() => this.plugin.removeImage(this, itemId)));
      menu.showAtMouseEvent(event);
    });
    this.frame.addEventListener("dragover", (event) => {
      if (!this.cm || !plugin.acceptsDrop(event)) return;
      stop(event);
      event.dataTransfer.dropEffect = plugin.nativeOrigin ? "move" : "copy";
      plugin.showGalleryDrop(this, event);
    });
    this.frame.addEventListener("dragleave", (event) => {
      if (!this.frame.contains(event.relatedTarget)) plugin.clearDrop();
    });
    this.frame.addEventListener("drop", (event) => {
      if (!this.cm || !plugin.acceptsDrop(event)) return;
      stop(event);
      plugin.nativeDrop(this, event).catch((error) => new Notice(t("Couldn't add media: {error}", { error: error.message })));
    });
    this.frame.addEventListener("keydown", (event) => {
      if (this.editing) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        stop(event);
        this.navigate(event.key === "ArrowLeft" ? -1 : 1);
      }
      if (event.key === " " && !this.player.hidden) {
        stop(event);
        this.togglePlay();
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        stop(event);
        this.breathe();
      }
    });
    plugin.uis.add(this);
    this.render();
    this.observer = new this.doc.defaultView.ResizeObserver(() => {
      this.fillSlots();
      this.cm?.requestMeasure();
    });
    this.observer.observe(this.frame);
  }
  button(parent, icon, title, action) {
    const b = make(this.doc, "button", "gv-arrow clickable-icon", parent);
    b.type = "button";
    b.setAttribute("aria-label", title);
    b.setAttribute("title", title);
    setIcon(b, icon);
    b.addEventListener("click", () => {
      b.getAnimations().forEach((a) => a.cancel());
      const reduced = this.doc.defaultView.matchMedia("(prefers-reduced-motion: reduce)").matches;
      b.animate(
        reduced ? [{ backgroundColor: "var(--background-modifier-hover)" }, {}] : [{ transform: "scale(.88)", backgroundColor: "var(--background-modifier-hover)" }, { transform: "scale(1)" }],
        { duration: 140, easing: "ease-out" }
      );
      action();
    });
    return b;
  }
  // ---- video player -------------------------------------------------------
  buildPlayer(parent) {
    const doc = this.doc;
    this.player = make(doc, "div", "gv-video", parent);
    this.player.hidden = true;
    this.video = make(doc, "video", "gv-video-el", this.player);
    this.video.playsInline = true;
    this.video.preload = "metadata";
    this.video.disablePictureInPicture = true;
    this.video.draggable = false;
    this.video.setAttribute("aria-label", t("Video"));
    this.bigPlay = make(doc, "button", "gv-video-big", this.player);
    this.bigPlay.type = "button";
    this.bigPlay.setAttribute("aria-label", t("Play"));
    setIcon(this.bigPlay, "play");
    const bar = make(doc, "div", "gv-video-bar", this.player);
    this.playButton = make(doc, "button", "gv-video-btn clickable-icon", bar);
    this.playButton.type = "button";
    this.playButton.setAttribute("aria-label", t("Play / pause"));
    setIcon(this.playButton, "play");
    this.timeLabel = make(doc, "span", "gv-video-time", bar);
    this.timeLabel.textContent = "0:00 / 0:00";
    this.track = make(doc, "div", "gv-video-track", bar);
    this.track.setAttribute("role", "slider");
    this.track.setAttribute("aria-label", t("Progress"));
    const rail = make(doc, "div", "gv-video-rail", this.track);
    this.fill = make(doc, "div", "gv-video-fill", rail);
    this.knob = make(doc, "div", "gv-video-knob", rail);
    this.muteButton = make(doc, "button", "gv-video-btn gv-video-mute clickable-icon", bar);
    this.muteButton.type = "button";
    this.muteButton.setAttribute("aria-label", t("Mute"));
    setIcon(this.muteButton, "volume-2");
    this.volumeTrack = make(doc, "div", "gv-video-track gv-video-volume", bar);
    this.volumeTrack.setAttribute("role", "slider");
    this.volumeTrack.setAttribute("aria-label", t("Volume"));
    const volumeRail = make(doc, "div", "gv-video-rail", this.volumeTrack);
    this.volumeFill = make(doc, "div", "gv-video-fill", volumeRail);
    this.volumeKnob = make(doc, "div", "gv-video-knob", volumeRail);
    this.speedButton = make(doc, "button", "gv-video-speed", bar);
    this.speedButton.type = "button";
    this.speedButton.setAttribute("aria-label", t("Playback speed"));
    this.speedButton.textContent = "1\xD7";
    this.video.addEventListener("click", (event) => {
      stop(event);
      this.togglePlay();
    });
    this.video.addEventListener("dragstart", stop);
    this.bigPlay.addEventListener("click", (event) => {
      stop(event);
      this.togglePlay();
    });
    this.playButton.addEventListener("click", (event) => {
      stop(event);
      this.togglePlay();
    });
    for (const type of ["play", "pause", "ended", "emptied"]) this.video.addEventListener(type, () => this.syncPlayState());
    for (const type of ["timeupdate", "loadedmetadata", "durationchange", "seeking", "seeked"]) this.video.addEventListener(type, () => this.syncProgress());
    for (const type of ["timeupdate", "pause", "seeked", "volumechange", "ratechange"]) this.video.addEventListener(type, () => this.saveVideoState());

    this.video.addEventListener("error", () => {
      this.player.classList.add("is-missing");
      this.timeLabel.textContent = t("Video can't be loaded");
    });
    this.track.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      stop(event);
      this.track.setPointerCapture(event.pointerId);
      this.player.classList.add("is-scrubbing");
      this.seekTo(event);
    });
    this.track.addEventListener("pointermove", (event) => {
      if (this.player.classList.contains("is-scrubbing") && this.track.hasPointerCapture(event.pointerId)) this.seekTo(event);
    });
    const release = (event) => {
      if (!this.player.classList.contains("is-scrubbing")) return;
      this.player.classList.remove("is-scrubbing");
      if (this.track.hasPointerCapture(event.pointerId)) this.track.releasePointerCapture(event.pointerId);
    };
    this.track.addEventListener("pointerup", release);
    this.track.addEventListener("pointercancel", release);
    this.muteButton.addEventListener("click", (event) => {
      stop(event);
      this.video.muted = !this.video.muted;
      if (!this.video.muted && this.video.volume === 0) this.video.volume = 0.5;
      this.syncVolume();
    });
    this.video.addEventListener("volumechange", () => this.syncVolume());
    const scrubVolume = (event) => {
      const r = this.volumeTrack.getBoundingClientRect();
      if (!r.width) return;
      const ratio = Math.max(0, Math.min(1, (event.clientX - r.left) / r.width));
      this.video.volume = ratio;
      this.video.muted = ratio === 0;
      this.syncVolume();
    };
    this.volumeTrack.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      stop(event);
      this.volumeTrack.setPointerCapture(event.pointerId);
      this.player.classList.add("is-scrubbing");
      scrubVolume(event);
    });
    this.volumeTrack.addEventListener("pointermove", (event) => {
      if (this.volumeTrack.hasPointerCapture(event.pointerId)) scrubVolume(event);
    });
    const releaseVolume = (event) => {
      if (this.volumeTrack.hasPointerCapture(event.pointerId)) this.volumeTrack.releasePointerCapture(event.pointerId);
      this.player.classList.remove("is-scrubbing");
    };
    this.volumeTrack.addEventListener("pointerup", releaseVolume);
    this.volumeTrack.addEventListener("pointercancel", releaseVolume);
    this.syncVolume();
    this.speedButton.addEventListener("click", (event) => {
      stop(event);
      const menu = new Menu();
      for (const speed of SPEEDS) menu.addItem((i) => i.setTitle(speed.toFixed(2).replace(/0+$/, "").replace(/\.$/, ".0") + "\xD7").setChecked(speed === this.speed).onClick(() => this.setSpeed(speed)));
      const r = this.speedButton.getBoundingClientRect();
      menu.showAtPosition({ x: r.left, y: r.top - 4 });
    });
  }
  togglePlay() {
    if (this.player.hidden) return;
    if (this.video.paused || this.video.ended) {
      this.video.playbackRate = this.speed;
      this.video.play().catch(() => {
      });
    } else this.video.pause();
  }
  setSpeed(speed) {
    this.speed = speed;
    this.video.playbackRate = speed;
    this.speedButton.textContent = (speed === 1 ? "1" : String(speed)) + "\xD7";
    this.saveVideoState();
  }
  seekTo(event) {
    const r = this.track.getBoundingClientRect();
    if (!r.width || !Number.isFinite(this.video.duration)) return;
    const ratio = Math.max(0, Math.min(1, (event.clientX - r.left) / r.width));
    this.video.currentTime = ratio * this.video.duration;
    this.syncProgress();
  }
  syncPlayState() {
    const playing = !this.video.paused && !this.video.ended;
    this.player.classList.toggle("is-playing", playing);
    setIcon(this.playButton, playing ? "pause" : "play");
    this.bigPlay.setAttribute("aria-label", playing ? t("Pause") : t("Play"));
  }
  syncVolume() {
    const muted = this.video.muted || this.video.volume === 0, level = muted ? 0 : this.video.volume;
    setIcon(this.muteButton, muted ? "volume-x" : level < 0.5 ? "volume-1" : "volume-2");
    this.muteButton.setAttribute("aria-label", muted ? t("Unmute") : t("Mute"));
    this.player.classList.toggle("is-muted", muted);
    this.volumeFill.style.width = level * 100 + "%";
    this.volumeKnob.style.left = level * 100 + "%";
    this.volumeTrack.setAttribute("aria-valuenow", String(Math.round(level * 100)));
  }
  syncProgress() {
    const duration = this.video.duration, time = this.video.currentTime;
    const ratio = Number.isFinite(duration) && duration > 0 ? time / duration : 0;
    this.fill.style.width = ratio * 100 + "%";
    this.knob.style.left = ratio * 100 + "%";
    this.track.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    this.timeLabel.textContent = clock(time) + " / " + clock(duration);
  }
  videoKey() {
    const current = this.current();
    return current ? this.key() + ":" + current.id : null;
  }
  saveVideoState() {
    const key = this.video.dataset.key;
    if (!key || !this.video.dataset.src) return;
    this.plugin.videoState.set(key, { speed: this.speed, volume: this.video.volume, muted: this.video.muted });
  }
  loadVideo(url) {
    const key = this.videoKey();
    if (this.video.dataset.src === url && this.video.dataset.key === key) return;
    this.saveVideoState();
    this.video.pause();
    this.player.classList.remove("is-missing", "is-playing");
    const saved = this.plugin.videoState.get(key);
    if (saved) {
      this.speed = saved.speed || 1;
      this.video.volume = saved.volume ?? 1;
      this.video.muted = !!saved.muted;
      this.speedButton.textContent = (this.speed === 1 ? "1" : String(this.speed)) + "\xD7";
    }
    this.video.dataset.src = url;
    this.video.dataset.key = key;
    this.video.src = url;
    this.video.playbackRate = this.speed;
    this.syncProgress();
    this.syncPlayState();
    this.syncVolume();
  }
  // ---- figure caption -----------------------------------------------------
  renderCaption() {
    const current = this.current();
    this.captionRow.hidden = !current;
    if (!current) return;
    this.figure.textContent = figureText(core.figureLabel(this.block.model, current.id));
    if (this.editing && this.editing === current.id) return;
    if (this.editing) this.finishCaption(false);
    this.captionText.textContent = current.caption || "";
    this.captionRow.classList.toggle("has-title", !!current.caption);
  }
  editCaption() {
    const item = this.current();
    if (!this.cm || !item || this.editing) return;
    this.editing = item.id;
    this.captionRow.classList.add("is-editing");
    const el = this.captionText;
    el.textContent = item.caption || "";
    try {
      el.contentEditable = "plaintext-only";
    } catch (_) {
      el.contentEditable = "true";
    }
    if (el.contentEditable !== "plaintext-only") el.contentEditable = "true";
    el.spellcheck = false;
    el.focus();
    const win = this.doc.defaultView, range = this.doc.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = win.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
  finishCaption(save) {
    const id = this.editing;
    if (!id) return;
    this.editing = null;
    const el = this.captionText, text = el.textContent;
    el.contentEditable = "false";
    el.removeAttribute("contenteditable");
    this.captionRow.classList.remove("is-editing");
    if (this.doc.activeElement === el) el.blur();
    const item = this.block.model.images.find((entry) => entry.id === id);
    const value = text.replace(/\s+/g, " ").trim();
    if (save && item && value !== (item.caption || "")) {
      if (!this.plugin.update(this, core.caption(this.block.model, id, value))) this.renderCaption();
      return;
    }
    this.renderCaption();
  }
  // ---- rendering ----------------------------------------------------------
  current() {
    const id = this.plugin.active.get(this.key());
    return this.block.model.images.find((item) => item.id === id) || this.block.model.images[0];
  }
  key() {
    return this.sourcePath + ":" + this.block.model.id;
  }
  render() {
    const scroll = this.strip.scrollLeft;
    this.strip.replaceChildren();
    for (const item of this.block.model.images) {
      const button = make(this.doc, "button", "gv-thumb", this.strip);
      button.type = "button";
      button.dataset.id = item.id;
      button.setAttribute("role", "listitem");
      button.setAttribute("aria-label", this.plugin.label(item.link));
      button.draggable = false;
      const url = this.plugin.imageURL(item.link, this.sourcePath);
      if (core.isVideo(item.link)) {
        button.classList.add("is-video");
        const video = make(this.doc, "video", "", button);
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.tabIndex = -1;
        video.draggable = false;
        video.src = url;
        video.addEventListener("error", () => button.classList.add("is-missing"));
        const badge = make(this.doc, "span", "gv-thumb-badge", button);
        badge.setAttribute("aria-hidden", "true");
        setIcon(badge, "play");
      } else {
        const img = make(this.doc, "img", "", button);
        img.alt = this.plugin.label(item.link);
        img.loading = "lazy";
        img.decoding = "async";
        img.draggable = false;
        img.addEventListener("error", () => button.classList.add("is-missing"));
        this.plugin.setImage(img, item.link, this.sourcePath, "thumb");
      }
      button.addEventListener("click", (event) => {
        if (Date.now() < (this.plugin.suppressClickUntil || 0)) {
          stop(event);
          return;
        }
        this.select(item.id);
      });
      button.addEventListener("mousedown", (event) => {
        if (event.button === 0 && this.cm) this.plugin.startThumbnailDrag(event, this, item.id, button);
      });
      button.addEventListener("dragstart", stop);
    }
    this.updateCurrent();
    this.fillSlots();
    this.strip.scrollLeft = scroll;
    this.doc.defaultView.clearTimeout(this.slotTimer);
    this.slotTimer = this.doc.defaultView.setTimeout(() => {
      this.fillSlots();
      if (this.cm && this.root.isConnected) {
        const engine = this.plugin.engine(), overlay = engine?.overlayMap?.get(this.cm);
        if (overlay?.scheduleHierarchyLayout) overlay.scheduleHierarchyLayout();
        else overlay?.applyHierarchyVisualLayout(engine.toggleApi.scan(this.cm.state.doc));
      }
    }, 0);
  }
  updateCurrent() {
    const current = this.current(), images = this.block.model.images;
    const video = !!current && core.isVideo(current.link);
    this.heroImage.hidden = !current || video;
    this.empty.hidden = !!current;
    this.hero.hidden = video;
    this.hero.disabled = !current;
    this.hero.classList.remove("is-missing");
    this.player.hidden = !video;
    const shown = current ? this.key() + ":" + current.id : null;
    if (video) {
      this.loadVideo(this.plugin.imageURL(current.link, this.sourcePath));
      if (this.shownKey !== shown) {
        this.video.pause();
        try {
          this.video.currentTime = 0;
        } catch (_) {
        }
        this.syncProgress();
        this.syncPlayState();
      }
    } else {
      if (!this.video.paused) this.video.pause();
      if (current) {
        this.plugin.setImage(this.heroImage, current.link, this.sourcePath, "hero");
        this.heroImage.alt = this.plugin.label(current.link);
      } else this.heroImage.removeAttribute("src");
    }
    for (const button of this.strip.querySelectorAll(".gv-thumb")) {
      const selected = button.dataset.id === current?.id;
      button.classList.toggle("is-current", selected);
      button.setAttribute("aria-current", String(selected));
    }
    const index = current ? images.indexOf(current) : -1;
    this.previous.setAttribute("aria-disabled", String(index <= 0));
    this.next.setAttribute("aria-disabled", String(index >= images.length - 1));
    this.status.textContent = current ? t("Item {n} of {total}", { n: index + 1, total: images.length }) : t("Empty gallery");
    this.shownKey = shown;
    this.renderCaption();
    this.prefetchNeighbors(current);
  }
  // The hero of the previous / next item is decoded ahead of time (front of the
  // queue), so the arrows never wait on a cold decode.
  prefetchNeighbors(current) {
    const images = this.block.model.images, index = current ? images.indexOf(current) : -1;
    if (index < 0) return;
    for (const item of [images[index + 1], images[index - 1]]) {
      if (!item || core.isVideo(item.link)) continue;
      const file = this.plugin.imageFile(item.link, this.sourcePath);
      if (file) this.plugin.scaledURL(file, "hero", true);
    }
  }
  select(id) {
    if (!this.block.model.images.some((item2) => item2.id === id)) return;
    if (this.editing && this.editing !== id) this.finishCaption(true);
    this.plugin.active.set(this.key(), id);
    this.updateCurrent();
    const item = [...this.strip.children].find((el) => el.dataset.id === id);
    if (item) {
      const a = item.getBoundingClientRect(), b = this.strip.getBoundingClientRect();
      if (a.left < b.left + 4) this.strip.scrollLeft -= b.left + 4 - a.left;
      else if (a.right > b.right - 4) this.strip.scrollLeft += a.right - b.right + 4;
    }
  }
  navigate(delta) {
    const images = this.block.model.images, index = images.indexOf(this.current());
    const next = index + delta;
    if (index < 0 || next < 0 || next >= images.length) {
      this.breathe();
      return;
    }
    this.select(images[next].id);
  }
  breathe() {
    this.feedback.getAnimations().forEach((animation) => animation.cancel());
    if (this.doc.defaultView.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.feedback.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 560, easing: "ease-in-out" });
  }
  fillSlots() {
    for (const el of this.strip.querySelectorAll(".gv-placeholder")) el.remove();
    const slots = Math.max(1, Math.floor((this.strip.clientWidth - 12) / 76));
    for (let i = this.block.model.images.length; i < slots; i++) {
      const blank = make(this.doc, "span", "gv-placeholder", this.strip);
      blank.setAttribute("aria-hidden", "true");
    }
  }
  destroy() {
    this.doc.defaultView.clearTimeout(this.slotTimer);
    this.observer?.disconnect();
    if (this.editing) this.finishCaption(false);
    try {
      this.saveVideoState();
      this.video.pause();
      this.video.removeAttribute("src");
      delete this.video.dataset.src;
      this.video.load();
    } catch (_) {
    }
    this.plugin.uis.delete(this);
    if (this.plugin.dropUI === this) this.plugin.clearDrop();
  }
};
var GalleryView = class extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    paipaLang = this.settings.language || "auto";
    this.addSettingTab(new GallerySettingTab(this.app, this));
    this.uis = /* @__PURE__ */ new Set();
    this.textCache = /* @__PURE__ */ new WeakMap();
    this.scanCache = /* @__PURE__ */ new WeakMap();
    this.scaled = /* @__PURE__ */ new Map();
    this.decodeQueue = [];
    this.decodeActive = 0;
    this.modals = /* @__PURE__ */ new Set();
    this.active = /* @__PURE__ */ new Map();
    this.videoState = /* @__PURE__ */ new Map();
    this.nativeOrigin = null;
    this.flashRef = null;
    const plugin = this;
    this.field = StateField.define({
      create: (state) => plugin.decorations(state),
      update(value, tr) {
        return tr.docChanged || tr.effects.some((e) => e.is(refresh)) || tr.startState.field(editorLivePreviewField, false) !== tr.state.field(editorLivePreviewField, false) ? plugin.decorations(tr.state) : value;
      },
      provide: (field) => [EditorView.decorations.from(field), EditorView.atomicRanges.of((view) => view.state.field(field))]
    });
    this.registerEditorExtension([
      Prec.highest(this.field),
      Prec.highest(EditorState.transactionFilter.of((tr) => this.guard(tr)))
    ]);
    this.registerMarkdownCodeBlockProcessor("gallery-view", (source, el, ctx) => {
      if (el.closest(".cm-editor")) return;
      const model = core.parse(source);
      if (!model) {
        el.textContent = t("Can't read the gallery data. Check the source.");
        return;
      }
      const child = new MarkdownRenderChild(el);
      child.onload = () => {
        const info = ctx.getSectionInfo(el);
        const block = { model, from: 0, startLine: info?.lineStart || 0 };
        child.ui = new GalleryUI(this, block, null, ctx.sourcePath);
        el.appendChild(child.ui.root);
      };
      child.onunload = () => child.ui?.destroy();
      ctx.addChild(child);
    });
    this.registerMarkdownPostProcessor((el, ctx) => {
      if (el.closest(".cm-editor")) return;
      for (const anchor of el.querySelectorAll('a[href^="gv-ref:"]')) {
        const match = /^gv-ref:([A-Za-z0-9-]+)\/([A-Za-z0-9-]+)$/.exec(anchor.getAttribute("href") || "");
        if (!match) continue;
        const ref = { galleryId: match[1], itemId: match[2], label: anchor.textContent };
        const button = this.refElement(el.ownerDocument, ref, ref.label, false, false, null, ctx.sourcePath);
        anchor.replaceWith(button);
      }
    });
    this.registerEvent(this.app.workspace.on("editor-menu", (menu, editor) => {
      menu.addItem((item) => item.setTitle(t("Gallery")).setIcon("images").setSection("editor-enhancer").setDisabled(!this.canCreate(editor.cm)).onClick(() => this.createGallery(editor.cm)));
    }));
    this.addCommand({ id: "create-gallery", name: t("Create gallery"), editorCallback: (editor) => this.createGallery(editor.cm) });
    this.addCommand({ id: "convert-lite-gallery", name: t("Convert Lite Gallery at cursor"), editorCallback: (editor) => this.convertLite(editor.cm) });
    this.registerEvent(this.app.workspace.on("nsb:engine-ready", () => this.refreshEditors()));
    this.registerEvent(this.app.workspace.on("layout-change", () => this.attachDocuments()));
    this.docs = /* @__PURE__ */ new WeakSet();
    this.attachDocuments();
    this.applyRefOffset();
    this.app.workspace.onLayoutReady(() => {
      this.attachDocuments();
      this.refreshEditors();
    });
  }
  applyRefOffset(doc) {
    const docs = doc ? [doc] : [document];
    if (!doc) this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view.containerEl) docs.push(leaf.view.containerEl.ownerDocument);
    });
    const value = Number(this.settings?.refOffset) || 0;
    for (const d of new Set(docs)) d.body?.style.setProperty("--gv-ref-offset", value + "px");
  }
  async saveSettings() {
    paipaLang = this.settings.language || "auto";
    await this.saveData(this.settings);
    this.applyRefOffset();
  }
  // After a language change: re-render figure references and the per-item text of open galleries.
  refreshLanguage() {
    this.refreshEditors();
    for (const ui of this.uis) ui.updateCurrent();
  }
  onunload() {
    for (const entry of this.scaled.values()) for (const url of Object.values(entry.urls)) if (String(url).startsWith("blob:")) URL.revokeObjectURL(url);
    this.scaled.clear();
    for (const d of this.docs instanceof WeakSet ? [document] : []) d.body?.style.removeProperty("--gv-ref-offset");
    for (const modal of this.modals) modal.close();
    this.cancelTouch?.();
    this.cancelDrag?.();
    this.endNativeDrag();
    this.clearDrop();
    for (const ui of [...this.uis]) ui.destroy();
  }
  engine() {
    return this.app.__nsbToggleEngine || this.app.plugins.plugins["editor-enhancer"] || this.app.plugins.plugins["expiring-blocks"]?.engine;
  }
  pathFor(cm) {
    return cm?.state.field(editorInfoField, false)?.file?.path || "";
  }
  refreshEditors() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      const cm = leaf.view?.editor?.cm;
      if (cm?.state.field(this.field, false)) cm.dispatch({ effects: refresh.of(null) });
    });
  }
  attachDocuments() {
    const docs = /* @__PURE__ */ new Set([document]);
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view.containerEl) docs.add(leaf.view.containerEl.ownerDocument);
    });
    for (const doc of docs) {
      if (this.docs.has(doc)) continue;
      this.docs.add(doc);
      this.applyRefOffset(doc);
      this.registerDomEvent(doc, "dragstart", (event) => this.captureNativeOrigin(event), true);
      this.registerDomEvent(doc, "dragend", () => this.endNativeDrag(), true);
      this.registerDomEvent(doc, "drop", () => {
        if (this.nativeOrigin) doc.defaultView.setTimeout(() => this.endNativeDrag(), 0);
      }, true);
      this.registerDomEvent(doc.defaultView, "blur", () => {
        this.cancelTouch?.();
        this.cancelDrag?.();
        this.endNativeDrag();
      });
      this.registerDomEvent(doc, "visibilitychange", () => {
        if (doc.visibilityState === "hidden") {
          this.cancelTouch?.();
          this.cancelDrag?.();
          this.endNativeDrag();
        }
      });
      this.registerDomEvent(doc, "pointerdown", (event) => {
        if (event.pointerType === "touch" && this.touchTarget(event.target)) stop(event);
      }, true);
      this.registerDomEvent(doc, "touchstart", (event) => this.startTouch(event), { capture: true, passive: false });
    }
  }
  endNativeDrag(force = false) {
    if (this.nativeOrigin || force) {
      const manager = this.app.dragManager;
      if (manager?.dragStart) manager.dragStart.moved = true;
      manager?.onDragEnd?.();
    }
    this.nativeOrigin = null;
    this.clearDrop();
  }
  touchTarget(target) {
    if (!target.closest) return null;
    const ref = target.closest(".gv-ref");
    if (ref) {
      const cmEl = ref.closest(".cm-editor"), cm = cmEl && EditorView.findFromDOM(cmEl);
      return { ref, cm: cm || null, element: ref };
    }
    const root = target.closest(".gv-block");
    if (root) {
      const ui = root.galleryUI;
      if (ui?.editing && target.closest(".gv-caption")) return null;
      if (target.closest(".gv-video-track")) return null;
      return { ui, element: target.closest(".gv-thumb") || target.closest("button") || target.closest(".gv-caption") || target.closest(".gv-video-el") || root };
    }
    const embed = target.closest(".internal-embed.image-embed, .internal-embed.video-embed, .internal-embed.media-embed");
    if (!embed || !embed.closest(".cm-editor")) return null;
    const cm = EditorView.findFromDOM(embed.closest(".cm-editor"));
    if (![...this.uis].some((ui) => ui.cm === cm)) return null;
    const origin = this.imageOrigin(embed);
    return origin ? { origin, element: embed } : null;
  }
  startTouch(event) {
    if (event.touches.length !== 1) {
      this.cancelTouch?.();
      this.cancelDrag?.();
      return;
    }
    const target = this.touchTarget(event.target);
    if (!target) return;
    stop(event);
    this.cancelTouch?.();
    this.cancelDrag?.();
    const { ui, origin, ref, element } = target, doc = element.ownerDocument, win = doc.defaultView;
    const cm = ui?.cm || origin?.cm || target.cm, point = event.touches[0], id = point.identifier;
    const x = point.clientX, y = point.clientY;
    const thumb = element.matches(".gv-thumb"), canDrag = cm && (thumb || origin || ref);
    const strip = event.target.closest(".gv-strip");
    const scroller = cm?.scrollDOM || element.closest(".markdown-preview-view");
    const left = strip?.scrollLeft || 0, top = scroller?.scrollTop || 0;
    let moved = false, axis, timer;
    const cleanup = () => {
      win.clearTimeout(timer);
      doc.removeEventListener("touchmove", move, true);
      doc.removeEventListener("touchend", up, true);
      doc.removeEventListener("touchcancel", cleanup, true);
      if (this.cancelTouch === cleanup) this.cancelTouch = null;
    };
    const move = (e) => {
      const p = [...e.touches].find((t) => t.identifier === id);
      if (!p || e.touches.length !== 1) {
        cleanup();
        return;
      }
      stop(e);
      const dx = p.clientX - x, dy = p.clientY - y;
      if (!moved && Math.hypot(dx, dy) > 8) {
        moved = true;
        win.clearTimeout(timer);
        axis = strip && Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis === "x") strip.scrollLeft = left - dx;
      if (axis === "y" && scroller) scroller.scrollTop = top - dy;
    };
    const up = (e) => {
      if (![...e.changedTouches].some((t) => t.identifier === id)) return;
      stop(e);
      cleanup();
      if (moved) return;
      const now = Date.now(), last = this.lastTap;
      if (last && last.element === element && now - last.at < 350) {
        this.lastTap = null;
        element.dispatchEvent(new win.MouseEvent("dblclick", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
        return;
      }
      this.lastTap = { element, at: now };
      element.click();
    };
    if (canDrag) timer = win.setTimeout(() => {
      cleanup();
      doc.activeElement?.blur?.();
      const synthetic = { clientX: x, clientY: y, preventDefault() {
      }, stopPropagation() {
      } };
      if (ref) this.startRefDrag(synthetic, cm, ref, id);
      else this.startThumbnailDrag(synthetic, ui, element.dataset.id, element, origin, id);
    }, 360);
    doc.addEventListener("touchmove", move, { capture: true, passive: false });
    doc.addEventListener("touchend", up, { capture: true, passive: false });
    doc.addEventListener("touchcancel", cleanup, true);
    this.cancelTouch = cleanup;
  }
  // Whole-document scans are cached per immutable Text: one keystroke used to
  // re-stringify and re-scan the note three or four times (guard, field, widgets).
  textOf(doc) {
    let text = this.textCache.get(doc);
    if (text === void 0) {
      text = doc.toString();
      this.textCache.set(doc, text);
    }
    return text;
  }
  scanDoc(doc) {
    let blocks = this.scanCache.get(doc);
    if (!blocks) {
      blocks = core.scan(this.textOf(doc));
      this.scanCache.set(doc, blocks);
    }
    return blocks;
  }
  decorations(state) {
    if (state.field(editorLivePreviewField, false) === false) return Decoration.none;
    const toggles = this.engine()?.toggleApi?.scan(state.doc) || [];
    const text = this.textOf(state.doc), blocks = this.scanDoc(state.doc);
    const hidden = (startLine, endLine) => toggles.some((t) => !t.open && startLine > t.titleLine && endLine <= t.endLine);
    const ranges = blocks.filter((block) => !hidden(block.startLine, block.endLine)).map((block) => Decoration.replace({ widget: new GalleryWidget(this, block), block: true }).range(block.from, block.to));
    const flash = this.flashRef && Date.now() - this.flashRef.at < 2e3 ? this.flashRef.key : null;
    for (const ref of core.refMatches(text)) {
      if (blocks.some((b) => ref.from >= b.from && ref.to <= b.to)) continue;
      const line = state.doc.lineAt(ref.from).number - 1;
      if (hidden(line, line)) continue;
      const block = blocks.find((b) => b.model.id === ref.galleryId);
      const label = block && core.figureLabel(block.model, ref.itemId);
      const key = ref.galleryId + "/" + ref.itemId;
      ranges.push(Decoration.replace({ widget: new RefWidget(this, ref, figureText(label || ref.label || "Figure"), !label, flash === key) }).range(ref.from, ref.to));
    }
    return Decoration.set(ranges, true);
  }
  guard(tr) {
    if (!tr.docChanged || tr.annotation(authorized)) return tr;
    const event = tr.annotation(Transaction.userEvent) || "";
    if (/^(undo|redo)(\.|$)/.test(event)) return tr;
    if (!core.preserved(this.textOf(tr.startState.doc), this.textOf(tr.newDoc))) return [];
    return tr;
  }
  blockFor(ui) {
    if (!ui.cm || ui.sourcePath && this.pathFor(ui.cm) !== ui.sourcePath) return null;
    const all = this.scanDoc(ui.cm.state.doc).filter((b) => b.model.id === ui.block.model.id);
    return all.find((b) => b.from === ui.block.from) || (all.length === 1 ? all[0] : null);
  }
  commit(cm, changes, label = "edit") {
    let set = ChangeSet.of(changes, cm.state.doc.length);
    const after = set.apply(cm.state.doc);
    const fixes = core.refFixes(after.toString());
    if (fixes.length) set = set.compose(ChangeSet.of(fixes, after.length));
    cm.dispatch({ changes: set, annotations: authorized.of(true), userEvent: "input.nsb.gallery." + label });
  }
  update(ui, model) {
    const block = this.blockFor(ui);
    if (!block) return false;
    this.commit(ui.cm, { from: block.from, to: block.to, insert: core.serialize(model, block.indent) });
    return true;
  }
  label(link) {
    return core.destination(link)?.split("/").pop() || t("Image");
  }
  imagePath(link) {
    let path = core.destination(link);
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    try {
      path = decodeURIComponent(path);
    } catch (_) {
    }
    return path.split("#")[0];
  }
  imageFile(link, sourcePath) {
    const path = this.imagePath(link);
    if (!path || /^https?:\/\//i.test(path)) return null;
    let file = this.app.metadataCache.getFirstLinkpathDest(path, sourcePath);
    if (!file) {
      const folders = this.app.plugins.plugins.litegallery?.settings?.image_folders || [];
      for (const folder of folders) {
        file = this.app.vault.getAbstractFileByPath((folder.replace(/^\/|\/$/g, "") + "/" + path).replace(/^\//, ""));
        if (file) break;
      }
    }
    return file && typeof file.extension === "string" ? file : null;
  }
  imageURL(link, sourcePath) {
    const path = this.imagePath(link);
    if (/^https?:\/\//i.test(path)) return path;
    const file = this.imageFile(link, sourcePath);
    return file ? this.app.vault.getResourcePath(file) : "";
  }
  // ---- Scaled image cache ---------------------------------------------------
  // Thumbnails (192 px) and the hero image (2048 px) come from a downscaled copy
  // decoded once per file and kept as a blob URL: a strip of 24-megapixel photos
  // otherwise re-decodes every photo at full size each time the gallery scrolls
  // back into view (150-2000 ms long tasks). The original is still what the
  // "view original" modal opens. Vector / animated formats are left alone.
  scalable(file) {
    return !!file && /^(avif|bmp|jpe?g|png|webp)$/i.test(file.extension) && typeof createImageBitmap === "function" && typeof OffscreenCanvas === "function";
  }
  // Decodes run through a small queue (two at a time): a 15-photo strip used to
  // start 15 full-size decodes at once. `priority` puts the file at the front
  // (hero requests and neighbour prefetch), so what the user is looking at wins.
  scaledURL(file, kind, priority = false) {
    if (!this.scalable(file)) return null;
    const stamp = file.path + "|" + (file.stat?.mtime || 0) + "|" + (file.stat?.size || 0);
    let entry = this.scaled.get(stamp);
    if (entry) {
      this.scaled.delete(stamp);
      if (priority && entry.queued) {
        entry.priority = true;
        this.decodeQueue.splice(this.decodeQueue.indexOf(entry), 1);
        this.decodeQueue.unshift(entry);
        this.pumpDecodes();
      }
    } else {
      entry = { file, urls: {}, queued: true, priority, promise: null, settle: null };
      entry.promise = new Promise((resolve) => {
        entry.settle = resolve;
      });
      if (priority) this.decodeQueue.unshift(entry);
      else this.decodeQueue.push(entry);
      this.pumpDecodes();
    }
    this.scaled.set(stamp, entry);
    this.trimScaled();
    return entry.urls[kind] || entry.promise.then(() => entry.urls[kind] || null);
  }
  // Cached URL only; never starts a decode.
  scaledNow(file, kind) {
    if (!this.scalable(file)) return null;
    const entry = this.scaled.get(file.path + "|" + (file.stat?.mtime || 0) + "|" + (file.stat?.size || 0));
    return entry?.urls[kind] || null;
  }
  pumpDecodes() {
    // A priority entry (hero / neighbour) may use one slot beyond the limit, so
    // it never waits behind a strip full of thumbnails.
    while (this.decodeQueue.length && this.decodeActive < GalleryView.DECODE_CONCURRENCY + (this.decodeQueue[0].priority ? 1 : 0)) {
      const entry = this.decodeQueue.shift();
      entry.queued = false;
      this.decodeActive++;
      this.decodeScaled(entry.file, entry).catch((error) => {
        console.warn("Paipa Gallery: scaled image failed, using the original", entry.file.path, error);
      }).then(() => {
        this.decodeActive--;
        entry.settle();
        this.pumpDecodes();
      });
    }
  }
  // JPEG photos decode through WebCodecs ImageDecoder with a size hint: libjpeg
  // then decodes at 1/2 .. 1/8 scale (about 50 ms for a 24-megapixel photo
  // instead of 300 ms for the full frame) and EXIF orientation is applied.
  // Other formats take the plain full decode. The hero is resized from that
  // frame, the thumbnail from the hero; both are encoded as JPEG (WebP encoding
  // of a 2048 px frame costs ~300 ms, JPEG ~35 ms) unless the source may carry
  // alpha (png / webp / avif → WebP).
  async decodeScaled(file, entry) {
    const data = await this.app.vault.readBinary(file);
    const { thumb: THUMB, hero: HERO } = GalleryView.SCALED;
    let source = null, original = null;
    if (/^jpe?g$/i.test(file.extension) && typeof ImageDecoder === "function") {
      original = jpegDimensions(data);
      try {
        const decoder = new ImageDecoder({ data, type: "image/jpeg", desiredWidth: HERO, desiredHeight: HERO });
        const { image } = await decoder.decode();
        try {
          source = await createImageBitmap(image);
        } finally {
          image.close();
          decoder.close();
        }
      } catch (_) {
        source = null;
      }
    }
    if (!source) {
      source = await createImageBitmap(new Blob([data]));
      original = [source.width, source.height];
    }
    if (!original) original = [source.width, source.height];
    const longest = Math.max(original[0], original[1]);
    const type = /^(png|webp|avif)$/i.test(file.extension) ? "image/webp" : "image/jpeg";
    const fit = async (bitmap, max, quality) => {
      const scale = max / Math.max(bitmap.width, bitmap.height);
      if (scale >= 1) return bitmap;
      return createImageBitmap(bitmap, { resizeWidth: Math.max(1, Math.round(bitmap.width * scale)), resizeHeight: Math.max(1, Math.round(bitmap.height * scale)), resizeQuality: quality });
    };
    let hero = source, thumb = null;
    try {
      if (longest <= HERO) entry.urls.hero = this.app.vault.getResourcePath(file);
      else {
        hero = await fit(source, HERO, "medium");
        entry.urls.hero = await this.encodeBitmap(hero, type);
      }
      if (longest <= THUMB) entry.urls.thumb = this.app.vault.getResourcePath(file);
      else {
        thumb = await fit(hero, THUMB, "high");
        entry.urls.thumb = await this.encodeBitmap(thumb, type);
      }
    } finally {
      if (thumb && thumb !== hero) thumb.close();
      if (hero !== source) hero.close();
      source.close();
    }
  }
  async encodeBitmap(bitmap, type) {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    const blob = await canvas.convertToBlob({ type, quality: 0.86 });
    return URL.createObjectURL(blob);
  }
  trimScaled() {
    while (this.scaled.size > GalleryView.SCALED_CACHE) {
      const [stamp, entry] = this.scaled.entries().next().value;
      this.scaled.delete(stamp);
      if (entry.queued) {
        this.decodeQueue.splice(this.decodeQueue.indexOf(entry), 1);
        entry.queued = false;
        entry.settle();
      }
      entry.promise.then(() => {
        for (const url of Object.values(entry.urls)) if (String(url).startsWith("blob:")) URL.revokeObjectURL(url);
      });
    }
  }
  // Point `img` at the scaled copy of `link` (sync when cached, otherwise once
  // decoded); falls back to the original URL. A later call on the same element
  // wins over an earlier pending decode.
  setImage(img, link, sourcePath, kind) {
    const file = this.imageFile(link, sourcePath), fallback = this.imageURL(link, sourcePath);
    const token = kind + ":" + (file ? file.path : fallback);
    img.dataset.gvPending = token;
    const apply = (url) => {
      if (img.dataset.gvPending !== token) return;
      delete img.dataset.gvPending;
      img.classList.remove("is-loading");
      img.src = url || fallback;
    };
    const hit = file ? this.scaledURL(file, kind, kind === "hero") : null;
    if (typeof hit === "string") apply(hit);
    else if (hit) {
      if (kind === "thumb") img.removeAttribute("src");
      else {
        // Switch at once: show the small copy (if decoded) until the hero is ready.
        const low = this.scaledNow(file, "thumb");
        if (low) img.src = low;
        img.classList.add("is-loading");
      }
      hit.then(apply);
    } else apply(fallback);
  }
  selectionImages(cm, target) {
    if (!cm) return [];
    const doc = cm.state.doc, sel = cm.state.selection.main;
    let from = sel.from, to = sel.to;
    const targetOnly = target && (sel.empty || doc.lineAt(sel.from).number - 1 > target.endLine || doc.lineAt(sel.to).number - 1 < target.startLine);
    if (targetOnly) {
      from = doc.line(target.startLine + 1).from;
      to = doc.line(target.endLine + 1).to;
    }
    const blocks = this.scanDoc(doc);
    const matches = core.imageMatches(doc.sliceString(from, to), from).filter((item) => !blocks.some((b) => item.from >= b.from && item.to <= b.to));
    const source = targetOnly && target.el?.getAttribute?.("src");
    if (source) {
      const image = matches.find((item) => core.destination(item.link) === source);
      return image ? [image] : matches;
    }
    return matches;
  }
  canCreate(cm) {
    if (!cm) return false;
    const sel = cm.state.selection.main;
    return !this.scanDoc(cm.state.doc).some((b) => sel.from < b.to && sel.to > b.from || sel.empty && sel.from >= b.from && sel.from <= b.to);
  }
  createGallery(cm, target) {
    if (!cm || !target && !this.canCreate(cm)) return;
    const matches = this.selectionImages(cm, target), model = core.create(matches.map((item) => item.link));
    const doc = cm.state.doc;
    if (matches.length) {
      this.commit(cm, matches.map((item, i) => ({
        from: item.from,
        to: item.to,
        insert: i ? "" : "\n\n" + core.serialize(model) + "\n\n"
      })), "create");
      return model.id;
    }
    let at = target ? doc.line(target.endLine + 1).to : cm.state.selection.main.head;
    const line = doc.lineAt(at), toggles = this.engine()?.toggleApi?.scan(doc) || [];
    const header = toggles.find((t) => t.titleLine === line.number - 1);
    if (header) at = doc.line(header.titleLine + 2).from;
    else if (line.text.trim() === "%% /nsb-toggle %%") at = line.from;
    const prefix = at && doc.sliceString(at - 1, at) !== "\n" ? "\n\n" : "";
    const suffix = at < doc.length && doc.sliceString(at, at + 1) !== "\n" ? "\n\n" : "\n";
    this.commit(cm, { from: at, insert: prefix + core.serialize(model) + suffix }, "create");
    return model.id;
  }
  convertLite(cm) {
    const doc = cm.state.doc, line = doc.lineAt(cm.state.selection.main.head).number;
    let start = line;
    while (start > 1 && !/^\s*```litegal\s*$/.test(doc.line(start).text)) start--;
    if (!/^\s*```litegal\s*$/.test(doc.line(start).text)) {
      new Notice(t("Place the cursor inside a Lite Gallery code block."));
      return;
    }
    let end = start + 1;
    while (end <= doc.lines && !/^\s*```\s*$/.test(doc.line(end).text)) end++;
    if (end > doc.lines || line > end) return;
    const links = [];
    for (let n = start + 1; n < end; n++) {
      const text = doc.line(n).text.trim();
      if (!text) continue;
      const link = text.startsWith("!") ? text : text.startsWith("[[") ? "!" + text : /^https?:/.test(text) ? "![](" + text + ")" : "![[" + text + "]]";
      if (!core.imageMatches(link).length) {
        new Notice(t("Some images weren't recognized. The original gallery was kept."));
        return;
      }
      links.push(link);
    }
    this.commit(cm, { from: doc.line(start).from, to: doc.line(end).to, insert: core.serialize(core.create(links)) }, "convert");
  }
  removeImage(ui, id) {
    const block = this.blockFor(ui);
    if (!block) return;
    const result = core.remove(block.model, id, ui.current()?.id);
    this.active.set(ui.key(), result.active);
    this.update(ui, result.model);
  }
  // ---- figure references --------------------------------------------------
  refElement(doc, ref, label, missing, flash, cm, sourcePath = "") {
    label = figureText(label);
    const wrap = make(doc, "span", "gv-ref-wrap");
    const el = make(doc, "span", "gv-ref", wrap);
    make(doc, "span", "gv-ref-text", el).textContent = label;
    el.setAttribute("role", "button");
    el.dataset.gallery = ref.galleryId;
    el.dataset.item = ref.itemId;
    el.classList.toggle("is-missing", missing);
    if (flash) el.classList.add("is-new");
    tooltip(el, missing ? t("Figure not found") : cm ? t("Show {label} \xB7 drag to move", { label }) : t("Show {label}", { label }));
    el.addEventListener("click", (event) => {
      stop(event);
      if (Date.now() < (this.suppressClickUntil || 0)) return;
      if (cm) this.goToFigure(cm, ref.galleryId, ref.itemId);
      else this.goToFigureInPreview(el, ref.galleryId, ref.itemId, sourcePath);
    });
    if (cm) el.addEventListener("mousedown", (event) => {
      if (event.button === 0) this.startRefDrag(event, cm, el);
    });
    el.addEventListener("dragstart", stop);
    wrap.addEventListener("dragstart", stop);
    return wrap;
  }
  createReference(ui, itemId) {
    const block = this.blockFor(ui);
    if (!block) return;
    const label = core.figureLabel(block.model, itemId);
    if (!label) return;
    const cm = ui.cm, text = this.textOf(cm.state.doc);
    const zone = core.territory(text, block.model.id);
    if (!zone) return;
    const token = core.refToken(block.model.id, itemId, label);
    const doc = cm.state.doc;
    const end = zone.next ? zone.next.startLine : doc.lines;
    let content = block.endLine;
    for (let n = end - 1; n > block.endLine; n--) if (doc.line(n + 1).text.trim()) {
      content = n;
      break;
    }
    let at, insert;
    const after = content + 1 < end ? doc.line(content + 2) : null;
    if (after && after.text === "") {
      at = after.from;
      insert = token;
    } else {
      at = doc.line(content + 1).to;
      insert = "\n" + token;
    }
    this.flashRef = { key: block.model.id + "/" + itemId, at: Date.now() };
    this.commit(cm, { from: at, insert }, "reference");
    const pos = at + insert.length;
    cm.dispatch({ effects: EditorView.scrollIntoView(pos, { y: "center" }) });
    new Notice(t("Reference to {label} added at the end of the text. Drag it anywhere.", { label: figureText(label) }), 2500);
  }
  goToFigure(cm, galleryId, itemId) {
    const block = this.scanDoc(cm.state.doc).find((b) => b.model.id === galleryId);
    const item = block?.model.images.find((entry) => entry.id === itemId);
    if (!block || !item) {
      new Notice(t("Figure not found. It may have been deleted."));
      return;
    }
    this.active.set(this.pathFor(cm) + ":" + galleryId, itemId);
    const ui = [...this.uis].find((entry) => entry.cm === cm && entry.block.model.id === galleryId && entry.root.isConnected);
    if (!ui || !this.mostlyVisible(ui.frame, cm.scrollDOM)) cm.dispatch({ effects: EditorView.scrollIntoView(block.from, { y: "start", yMargin: 12 }) });
    ui?.select(itemId);
  }
  goToFigureInPreview(el, galleryId, itemId, sourcePath) {
    const container = el.closest(".workspace-leaf-content, .markdown-preview-view, .modal, .popover");
    const candidates = [...this.uis].filter((entry) => !entry.cm && entry.root.isConnected && entry.block.model.id === galleryId && (!sourcePath || entry.sourcePath === sourcePath) && entry.root.ownerDocument === el.ownerDocument);
    const ui = candidates.find((entry) => container && container.contains(entry.root)) || candidates[0];
    if (!ui) {
      new Notice(t("Can't find the gallery that contains this figure."));
      return;
    }
    if (!ui.block.model.images.some((entry) => entry.id === itemId)) {
      new Notice(t("Figure not found. It may have been deleted."));
      return;
    }
    const scroller = ui.root.closest(".markdown-preview-view") || ui.root.closest(".markdown-reading-view");
    if (!scroller || !this.mostlyVisible(ui.frame, scroller)) ui.frame.scrollIntoView({ block: "start", behavior: "smooth" });
    ui.select(itemId);
  }
  mostlyVisible(el, scroller) {
    const r = el.getBoundingClientRect(), s = scroller.getBoundingClientRect();
    if (r.height <= 0) return false;
    const visible = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
    return visible / r.height >= 0.9;
  }
  refAt(text, pos) {
    return core.refMatches(text).find((ref) => ref.from === pos) || core.refMatches(text).find((ref) => pos >= ref.from && pos <= ref.to) || null;
  }
  refDropTarget(cm, x, y, token, zone, blocks) {
    const doc = cm.dom.ownerDocument;
    if (!cm.dom.contains(doc.elementFromPoint(x, y))) return null;
    let pos = cm.posAtCoords({ x, y }, false);
    if (pos == null) return null;
    const text = this.textOf(cm.state.doc);
    let mode = "inline";
    for (const b of blocks) {
      if (pos >= b.from && pos <= b.to) {
        if (pos - b.from < b.to - pos) {
          pos = b.from;
          mode = "before-block";
        } else {
          pos = b.to;
          mode = "after-line";
        }
        break;
      }
    }
    if (mode === "inline") {
      for (const ref of core.refMatches(text)) {
        if (pos > ref.from && pos < ref.to) {
          pos = pos - ref.from < ref.to - pos ? ref.from : ref.to;
          break;
        }
      }
      const line = cm.state.doc.lineAt(pos);
      if (/^\s*%%\s*\/?nsb-toggle\b/.test(line.text) || /%%\s*nsb-toggle\b[^%]*%%\s*$/.test(line.text)) {
        pos = line.to;
        mode = "after-line";
      } else if (/^---\s*$/.test(cm.state.doc.line(1).text)) {
        for (let n = 2; n <= cm.state.doc.lines; n++) {
          const l = cm.state.doc.line(n);
          if (/^(---|\.\.\.)\s*$/.test(l.text)) {
            if (pos <= l.to) {
              pos = l.to;
              mode = "after-line";
            }
            break;
          }
        }
      }
    }
    if (pos < zone.from || pos > zone.to) return { pos, mode, blocked: true };
    if (pos >= token.from && pos <= token.to) return { pos, mode, same: true };
    return { pos, mode, blocked: false };
  }
  startRefDrag(event, cm, el, touchId = null) {
    event.preventDefault();
    event.stopPropagation();
    this.cancelDrag?.();
    const doc = el.ownerDocument, win = doc.defaultView, snapshot = cm.state.doc, sourcePath = this.pathFor(cm), touch = touchId !== null;
    const text = this.textOf(snapshot);
    const start = cm.posAtDOM(el), token = this.refAt(text, start);
    if (!token) return;
    const blocks = core.scan(text), zone = core.territory(text, token.galleryId, blocks);
    const x = event.clientX, y = event.clientY;
    let active = false, moved = false, ghost, caret, band, rail, target = null, last = event, frame, stopped = false;
    const cleanup = () => {
      stopped = true;
      doc.removeEventListener("mousemove", move, true);
      doc.removeEventListener("mouseup", up, true);
      doc.removeEventListener("keydown", key, true);
      win.removeEventListener("blur", cleanup);
      doc.removeEventListener("touchmove", touchMove, true);
      doc.removeEventListener("touchend", touchUp, true);
      doc.removeEventListener("touchcancel", cleanup, true);
      doc.removeEventListener("visibilitychange", visibility);
      doc.removeEventListener("dragstart", preventNative, true);
      win.cancelAnimationFrame(frame);
      ghost?.remove();
      caret?.remove();
      band?.remove();
      rail?.remove();
      el.classList.remove("is-dragging");
      doc.body.classList.remove("gv-dragging", "gv-ref-blocked");
      this.cancelDrag = null;
      if (active) this.suppressClickUntil = Date.now() + 250;
    };
    const place = () => {
      caret.hidden = band.hidden = true;
      doc.body.classList.toggle("gv-ref-blocked", !!target?.blocked);
      ghost?.classList.toggle("is-blocked", !!target?.blocked);
      if (!target || target.blocked || target.same) return;
      const content = cm.contentDOM.getBoundingClientRect();
      if (target.mode === "inline") {
        const c = cm.coordsAtPos(target.pos);
        if (!c) return;
        caret.hidden = false;
        Object.assign(caret.style, { left: c.left - 1 + "px", top: c.top + "px", height: c.bottom - c.top + "px", width: "2px" });
        const lb = cm.lineBlockAt(target.pos);
        band.hidden = false;
        Object.assign(band.style, { left: content.left - 4 + "px", width: content.width + 8 + "px", top: lb.top + cm.documentTop + "px", height: lb.height + "px" });
      } else {
        const lb = cm.lineBlockAt(target.pos);
        const yy = target.mode === "before-block" ? lb.top : lb.bottom;
        caret.hidden = false;
        Object.assign(caret.style, { left: content.left + "px", top: yy + cm.documentTop - 1 + "px", height: "2px", width: content.width + "px" });
      }
    };
    const showRail = () => {
      if (!zone) return;
      const content = cm.contentDOM.getBoundingClientRect();
      const top = cm.lineBlockAt(Math.min(zone.from, snapshot.length)).top + cm.documentTop;
      const bottom = cm.lineBlockAt(Math.min(zone.to, snapshot.length)).bottom + cm.documentTop;
      Object.assign(rail.style, { left: content.left - 14 + "px", top: top + "px", height: Math.max(0, bottom - top) + "px" });
    };
    const move = (e) => {
      if (stopped) return;
      last = e;
      if (!touch && e.isTrusted && e.buttons === 0) {
        cleanup();
        return;
      }
      if (Math.hypot(e.clientX - x, e.clientY - y) >= 5) moved = true;
      if (!active && !touch && !moved) return;
      e.preventDefault();
      active = true;
      if (!ghost) {
        el.classList.add("is-dragging");
        ghost = el.cloneNode(true);
        ghost.className = "gv-ref gv-ref-ghost";
        doc.body.appendChild(ghost);
        caret = make(doc, "div", "gv-ref-caret", doc.body);
        band = make(doc, "div", "gv-ref-band", doc.body);
        rail = make(doc, "div", "gv-ref-zone", doc.body);
        doc.body.classList.add("gv-dragging");
      }
      ghost.style.left = e.clientX + (touch ? -24 : 10) + "px";
      ghost.style.top = e.clientY + (touch ? -48 : 10) + "px";
      target = zone ? this.refDropTarget(cm, e.clientX, e.clientY, token, zone, blocks) : null;
      showRail();
      place();
    };
    const tick = () => {
      if (stopped) return;
      if (active) {
        const r = cm.scrollDOM.getBoundingClientRect();
        if (last.clientY < r.top + 36) cm.scrollDOM.scrollTop -= 10;
        if (last.clientY > r.bottom - 36) cm.scrollDOM.scrollTop += 10;
        move(last);
      }
      if (!stopped) frame = win.requestAnimationFrame(tick);
    };
    const up = (e) => {
      const drop = target;
      cleanup();
      if (!active) return;
      stop(e);
      if (cm.state.doc !== snapshot || this.pathFor(cm) !== sourcePath) {
        new Notice(t("The content changed. Move canceled."));
        return;
      }
      if (!drop || drop.same) return;
      if (drop.blocked) {
        new Notice(t("A reference can only be placed within its own gallery's section."), 2500);
        return;
      }
      this.moveRef(cm, token, drop);
    };
    const key = (e) => {
      if (e.key === "Escape") {
        stop(e);
        cleanup();
      }
    };
    const visibility = () => {
      if (doc.visibilityState === "hidden") cleanup();
    };
    const preventNative = (e) => stop(e);
    const touchMove = (e) => {
      if (e.touches.length !== 1) {
        cleanup();
        return;
      }
      const p = [...e.touches].find((t) => t.identifier === touchId);
      if (!p) return;
      stop(e);
      move({ clientX: p.clientX, clientY: p.clientY, preventDefault() {
      } });
    };
    const touchUp = (e) => {
      if ([...e.changedTouches].some((t) => t.identifier === touchId)) up(e);
    };
    if (touch) {
      doc.addEventListener("touchmove", touchMove, { capture: true, passive: false });
      doc.addEventListener("touchend", touchUp, { capture: true, passive: false });
      doc.addEventListener("touchcancel", cleanup, true);
      move(event);
    } else {
      doc.addEventListener("mousemove", move, true);
      doc.addEventListener("mouseup", up, true);
    }
    doc.addEventListener("visibilitychange", visibility);
    doc.addEventListener("dragstart", preventNative, true);
    doc.addEventListener("keydown", key, true);
    win.addEventListener("blur", cleanup);
    this.cancelDrag = cleanup;
    frame = win.requestAnimationFrame(tick);
  }
  moveRef(cm, token, drop) {
    const doc = cm.state.doc, text = this.textOf(doc);
    let rf = token.from, rt = token.to;
    const line = doc.lineAt(rf);
    const prevBlank = line.number === 1 || !doc.line(line.number - 1).text.trim();
    const nextBlank = line.number === doc.lines || !doc.line(line.number + 1).text.trim();
    if (line.text.trim() === token.text && !prevBlank && line.number === doc.lines && line.number > 1) {
      rf = line.from - 1;
      rt = line.to;
    } else if (line.text.trim() === token.text && prevBlank && nextBlank) {
      rf = line.from;
      rt = line.to < text.length ? line.to + 1 : line.to;
      while (rt < text.length && text[rt] === "\n" && rf >= 2 && text[rf - 1] === "\n" && text[rf - 2] === "\n") rt++;
      if (rt >= text.length) while (rf > 0 && text[rf - 1] === "\n") rf--;
    }
    const pos = drop.pos;
    if (pos >= rf && pos <= rt) return;
    let insert;
    if (drop.mode === "before-block") insert = token.text + "\n\n";
    else if (drop.mode === "after-line") insert = (pos >= text.length ? "\n\n" : "\n") + token.text + (text[pos] === "\n" && text[pos + 1] === "\n" ? "" : "\n");
    else insert = token.text;
    this.commit(cm, [{ from: rf, to: rt, insert: "" }, { from: pos, insert }], "ref-move");
  }
  // ---- NSB provider hooks -------------------------------------------------
  releaseTarget(cm, target) {
    if (!cm || !target) return false;
    const block = this.scanDoc(cm.state.doc).find((b) => b.startLine === target.startLine && b.endLine === target.endLine);
    if (!block) return false;
    this.commit(cm, { from: block.from, to: block.to, insert: core.release(block.model, block.indent) }, "release");
    return true;
  }
  nsbUnits(cm) {
    return [...this.uis].filter((ui) => ui.cm === cm && ui.root.isConnected && ui.root.getBoundingClientRect().height > 0).map((ui) => {
      const b = this.blockFor(ui);
      return b && { el: ui.root, kind: "gallery", startLine: b.startLine, endLine: b.endLine };
    }).filter(Boolean);
  }
  nsbTargetAt(cm, x, y, pad) {
    return this.nsbUnits(cm).find((unit) => {
      const r = unit.el.getBoundingClientRect();
      return x >= r.left - pad && x <= r.right && y >= r.top && y <= r.bottom;
    });
  }
  addBlockMenu(menu, editor, target) {
    if (!editor?.cm || !target) return;
    const images = this.selectionImages(editor.cm, target);
    if (!images.length) return;
    const snapshot = editor.cm.state.doc;
    menu.addItem((i) => i.setTitle(t("Gallery")).setIcon("images").onClick(() => {
      if (editor.cm.state.doc === snapshot) this.createGallery(editor.cm, target);
    }));
  }
  galleryAt(doc, x, y) {
    return doc.elementFromPoint(x, y)?.closest(".gv-block")?.galleryUI;
  }
  insertionIndex(ui, event) {
    if (!ui.strip.contains(event.target) && !(event.clientY >= ui.strip.getBoundingClientRect().top && event.clientY <= ui.strip.getBoundingClientRect().bottom)) return ui.block.model.images.length;
    const items = [...ui.strip.querySelectorAll(".gv-thumb")];
    const found = items.findIndex((item) => event.clientX < item.getBoundingClientRect().left + item.getBoundingClientRect().width / 2);
    return found < 0 ? items.length : found;
  }
  showGalleryDrop(ui, event) {
    this.clearDrop();
    this.dropUI = ui;
    ui.frame.classList.add("is-drop-target");
    const index = this.insertionIndex(ui, event), items = ui.strip.querySelectorAll(".gv-thumb");
    const slot = make(ui.doc, "span", "gv-insertion", ui.strip);
    const reference = items[index] || items[index - 1];
    const rect = reference?.getBoundingClientRect(), sr = ui.strip.getBoundingClientRect();
    slot.style.left = (rect ? (index < items.length ? rect.left - sr.left - 6 : rect.right - sr.left + 6) + ui.strip.scrollLeft : 4) + "px";
    this.dropIndex = index;
    if (event.clientY >= sr.top) {
      if (event.clientX < sr.left + 28) ui.strip.scrollLeft -= 16;
      if (event.clientX > sr.right - 28) ui.strip.scrollLeft += 16;
    }
    return index;
  }
  clearDrop() {
    this.dropImages = null;
    if (this.dropUI) {
      this.dropUI.frame.classList.remove("is-drop-target");
      this.dropUI.strip.querySelector(".gv-insertion")?.remove();
      this.dropUI = null;
    }
  }
  nsbDragHover(cm, startLine, endLine, event, target) {
    const ui = this.galleryAt(cm.dom.ownerDocument, event.clientX, event.clientY);
    if (!ui || ui.cm !== cm) {
      this.clearDrop();
      return false;
    }
    const doc = cm.state.doc, text = doc.sliceString(doc.line(startLine + 1).from, doc.line(endLine + 1).to);
    const images = core.imageMatches(text);
    let rest = text;
    for (const match of [...images].reverse()) rest = rest.slice(0, match.from) + rest.slice(match.to);
    if (!images.length || rest.trim()) {
      this.clearDrop();
      return false;
    }
    this.showGalleryDrop(ui, event);
    const from = doc.line(startLine + 1).from;
    this.dropImages = target ? this.selectionImages(cm, { ...target, startLine, endLine }) : core.imageMatches(text, from);
    return true;
  }
  finishNsbDrop(cm, startLine, endLine, snapshot) {
    const ui = this.dropUI, index = this.dropIndex, selected = this.dropImages;
    this.dropImages = null;
    this.clearDrop();
    if (!ui) return false;
    if (cm.state.doc !== snapshot) return true;
    const from = snapshot.line(startLine + 1).from, to = snapshot.line(endLine + 1).to;
    const images = selected || core.imageMatches(snapshot.sliceString(from, to), from);
    const block = this.blockFor(ui);
    if (!block) return true;
    this.commit(cm, [...images.map((item) => ({ from: item.from, to: item.to, insert: "" })), {
      from: block.from,
      to: block.to,
      insert: core.serialize(core.insert(block.model, images.map((i) => i.link), index), block.indent)
    }], "move-in");
    return true;
  }
  acceptsDrop(event) {
    const transfer = event.dataTransfer;
    return !!this.nativeOrigin || [...transfer?.types || []].some((type) => ["Files", "text/plain", "text/uri-list", "application/obsidian"].includes(type));
  }
  captureNativeOrigin(event) {
    this.nativeOrigin = null;
    if (!event.target.closest || event.target.closest(".gv")) return;
    const embed = event.target.closest(".internal-embed");
    if (!embed) return;
    this.nativeOrigin = this.imageOrigin(embed);
  }
  imageOrigin(embed) {
    const cmEl = embed.closest(".cm-editor");
    if (!cmEl) return;
    const cm = EditorView.findFromDOM(cmEl);
    if (!cm) return;
    const units = this.engine()?.collectDraggableUnits(cm) || [];
    const unit = units.find((u) => u.el === embed || u.el.contains(embed) || embed.contains(u.el));
    if (!unit) return;
    const from = cm.state.doc.line(unit.startLine + 1).from, to = cm.state.doc.line(unit.endLine + 1).to;
    let images = core.imageMatches(cm.state.doc.sliceString(from, to), from);
    const source = embed.getAttribute("src");
    if (source) images = images.filter((i) => core.destination(i.link)?.split("|")[0] === source);
    if (images.length === 1) return { cm, snapshot: cm.state.doc, images, sourcePath: this.pathFor(cm) };
    return null;
  }
  // Where a file dropped into a gallery is created. Section Blocks (if installed
  // and its "Organize media" is on) answers with the note's "<note> media"
  // folder; otherwise Obsidian's own attachment setting decides.
  async attachmentPath(name, sourcePath) {
    try {
      const path = await this.app.plugins.plugins["section-blocks"]?.mediaPathFor?.(name, sourcePath);
      if (typeof path === "string" && path) return path;
    } catch (error) {
      console.error("Paipa Gallery:", error);
    }
    return this.app.fileManager.getAvailablePathForAttachment(name, sourcePath);
  }
  async nativeDrop(ui, event) {
    const index = this.insertionIndex(ui, event), snapshot = ui.cm.state.doc, origin = this.nativeOrigin;
    this.endNativeDrag(true);
    let links = [];
    if (origin) {
      if (origin.cm !== ui.cm || origin.snapshot !== snapshot) {
        new Notice(t("Move images within the same editor."));
        return;
      }
      links = origin.images.map((i) => i.link);
    } else {
      const text = event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text/uri-list");
      links = core.imageMatches(text).map((i) => i.link);
      if (!links.length) for (const line of text.split("\n")) {
        const path = line.trim();
        const embed = path.startsWith("[") ? "!" + path : "";
        if (embed && core.imageMatches(embed).length) {
          links.push(embed);
          continue;
        }
        if (!core.mediaExtension.test(path)) continue;
        if (/^https?:\/\//i.test(path)) links.push("![](" + path + ")");
        else if (this.app.metadataCache.getFirstLinkpathDest(path, ui.sourcePath)) links.push("![[" + path + "]]");
      }
      if (!links.length) for (const file of Array.from(event.dataTransfer.files)) {
        if (!core.mediaExtension.test(file.name)) continue;
        const path = await this.attachmentPath(file.name, ui.sourcePath);
        const attachment = await this.app.vault.createBinary(path, await file.arrayBuffer());
        links.push(this.app.fileManager.generateMarkdownLink(attachment, ui.sourcePath).replace(/^\[/, "!["));
      }
    }
    if (!links.length) return;
    if (ui.cm.state.doc !== snapshot) {
      new Notice(t("The editor changed. Drop again; imported attachments stay in the vault."));
      return;
    }
    const block = this.blockFor(ui);
    if (!block) return;
    const changes = [{ from: block.from, to: block.to, insert: core.serialize(core.insert(block.model, links, index), block.indent) }];
    if (origin) changes.push(...origin.images.map((i) => ({ from: i.from, to: i.to, insert: "" })));
    this.commit(ui.cm, changes, "drop");
  }
  outsideSlot(cm, event) {
    if (!cm.dom.contains(cm.dom.ownerDocument.elementFromPoint(event.clientX, event.clientY))) return null;
    const units = this.engine()?.collectDraggableUnits(cm) || [];
    const slots = [];
    for (const unit of units) {
      const r = unit.el.getBoundingClientRect();
      if (!r.height) continue;
      slots.push({ line: unit.startLine, y: r.top, left: r.left, width: r.width });
      slots.push({ line: unit.endLine + 1, y: r.bottom, left: r.left, width: r.width });
    }
    return slots.sort((a, b) => Math.abs(a.y - event.clientY) - Math.abs(b.y - event.clientY))[0] || null;
  }
  startThumbnailDrag(event, ui, itemId, element, origin = null, touchId = null) {
    event.preventDefault();
    event.stopPropagation();
    this.cancelDrag?.();
    const cm = ui?.cm || origin.cm, snapshot = cm.state.doc, doc = element.ownerDocument, win = doc.defaultView;
    const sourcePath = this.pathFor(cm), touch = touchId !== null;
    const x = event.clientX, y = event.clientY;
    let active = false, moved = false, ghost, indicator, over, slot, last = event, frame, stopped = false;
    const cleanup = () => {
      stopped = true;
      doc.removeEventListener("mousemove", move, true);
      doc.removeEventListener("mouseup", up, true);
      doc.removeEventListener("keydown", key, true);
      win.removeEventListener("blur", cleanup);
      doc.removeEventListener("touchmove", touchMove, true);
      doc.removeEventListener("touchend", touchUp, true);
      doc.removeEventListener("touchcancel", cleanup, true);
      doc.removeEventListener("visibilitychange", visibility);
      doc.removeEventListener("dragstart", preventNative, true);
      win.cancelAnimationFrame(frame);
      ghost?.remove();
      indicator?.remove();
      element.classList.remove("is-dragging");
      doc.body.classList.remove("gv-dragging");
      this.clearDrop();
      this.cancelDrag = null;
      if (active) this.suppressClickUntil = Date.now() + 250;
    };
    const move = (e) => {
      if (stopped) return;
      last = e;
      if (!touch && e.isTrusted && e.buttons === 0) {
        cleanup();
        return;
      }
      if (Math.hypot(e.clientX - x, e.clientY - y) >= 5) moved = true;
      if (!active && !touch && !moved) return;
      e.preventDefault();
      active = true;
      if (!ghost) {
        element.classList.add("is-dragging");
        ghost = element.cloneNode(true);
        ghost.className = "gv-drag-ghost";
        doc.body.appendChild(ghost);
        indicator = make(doc, "div", "gv-outside-insertion", doc.body);
        doc.body.classList.add("gv-dragging");
      }
      ghost.style.left = e.clientX + (touch ? -32 : 12) + "px";
      ghost.style.top = e.clientY + (touch ? -80 : 12) + "px";
      over = this.galleryAt(doc, e.clientX, e.clientY);
      if (over?.cm === cm) {
        this.showGalleryDrop(over, e);
        indicator.hidden = true;
        slot = null;
      } else {
        over = null;
        this.clearDrop();
        slot = origin ? null : this.outsideSlot(cm, e);
        indicator.hidden = !slot;
        if (slot) Object.assign(indicator.style, { left: slot.left + "px", top: slot.y + "px", width: slot.width + "px" });
      }
    };
    const tick = () => {
      if (stopped) return;
      if (active) {
        const r = cm.scrollDOM.getBoundingClientRect();
        if (last.clientY < r.top + 36) cm.scrollDOM.scrollTop -= 10;
        if (last.clientY > r.bottom - 36) cm.scrollDOM.scrollTop += 10;
        move(last);
      }
      if (!stopped) frame = win.requestAnimationFrame(tick);
    };
    const up = (e) => {
      const target = over, index = this.dropIndex, outer = slot;
      cleanup();
      if (touch && !moved) {
        element.dispatchEvent(new win.MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
        return;
      }
      if (!active) {
        ui?.select(itemId);
        return;
      }
      stop(e);
      if (cm.state.doc !== snapshot || this.pathFor(cm) !== sourcePath) {
        new Notice(t("The content changed. Move canceled."));
        return;
      }
      if (origin) {
        const block = target && this.blockFor(target);
        if (!block) return;
        this.commit(cm, [
          ...origin.images.map((i) => ({ from: i.from, to: i.to, insert: "" })),
          { from: block.from, to: block.to, insert: core.serialize(core.insert(block.model, origin.images.map((i) => i.link), index), block.indent) }
        ], "touch-in");
        return;
      }
      const source = this.blockFor(ui), image = source?.model.images.find((item) => item.id === itemId);
      if (!source || !image) return;
      if (target === ui) {
        this.update(ui, core.reorder(source.model, itemId, index));
        return;
      }
      if (!target && !outer) return;
      const removed = core.remove(source.model, itemId, ui.current()?.id);
      const changes = [{ from: source.from, to: source.to, insert: core.serialize(removed.model, source.indent) }];
      if (target) {
        const b = this.blockFor(target);
        if (!b) return;
        changes.push({ from: b.from, to: b.to, insert: core.serialize(core.insert(b.model, [image.link], index), b.indent) });
      } else {
        const position = outer.line >= snapshot.lines ? snapshot.length : snapshot.line(outer.line + 1).from;
        if (position > source.from && position < source.to) return;
        changes.push({ from: position, insert: (position === snapshot.length ? "\n\n" : "") + image.link + "\n\n" });
      }
      this.active.set(ui.key(), removed.active);
      this.commit(cm, changes, "move-out");
    };
    const key = (e) => {
      if (e.key === "Escape") {
        stop(e);
        cleanup();
      }
    };
    const visibility = () => {
      if (doc.visibilityState === "hidden") cleanup();
    };
    const preventNative = (e) => stop(e);
    const touchMove = (e) => {
      if (e.touches.length !== 1) {
        cleanup();
        return;
      }
      const p = [...e.touches].find((t) => t.identifier === touchId);
      if (!p) return;
      stop(e);
      move({ clientX: p.clientX, clientY: p.clientY, preventDefault() {
      } });
    };
    const touchUp = (e) => {
      if ([...e.changedTouches].some((t) => t.identifier === touchId)) up(e);
    };
    if (touch) {
      doc.addEventListener("touchmove", touchMove, { capture: true, passive: false });
      doc.addEventListener("touchend", touchUp, { capture: true, passive: false });
      doc.addEventListener("touchcancel", cleanup, true);
      move(event);
    } else {
      doc.addEventListener("mousemove", move, true);
      doc.addEventListener("mouseup", up, true);
    }
    doc.addEventListener("visibilitychange", visibility);
    doc.addEventListener("dragstart", preventNative, true);
    doc.addEventListener("keydown", key, true);
    win.addEventListener("blur", cleanup);
    this.cancelDrag = cleanup;
    frame = win.requestAnimationFrame(tick);
  }
};
var GallerySettingTab = class extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl).setName(t("Language")).setDesc(t("Follow Obsidian's language, or choose one for this plugin.")).addDropdown((dropdown) => dropdown.addOption("auto", t("Follow Obsidian")).addOption("en", "English").addOption("zh", "中文").setValue(this.plugin.settings.language || "auto").onChange(async (value) => {
      this.plugin.settings.language = value;
      paipaLang = value;
      await this.plugin.saveSettings();
      this.display();
      this.plugin.refreshLanguage();
    }));
    // Developer-mode settings are no longer shown. The stored devMode / refOffset values are kept and still apply.
    if (!GallerySettingTab.SHOW_DEV_SETTINGS) return;
    new Setting(containerEl).setName(t("Developer mode")).setDesc(t("Show fine-tuning controls.")).addToggle((toggle) => toggle.setValue(this.plugin.settings.devMode).onChange(async (value) => {
      this.plugin.settings.devMode = value;
      await this.plugin.saveSettings();
      this.display();
    }));
    if (!this.plugin.settings.devMode) return;
    const setting = new Setting(containerEl).setName(t("Figure label vertical offset")).setDesc(t("Nudges the text inside figure reference buttons. Positive moves it down. Unit: px."));
    let label;
    setting.addSlider((slider) => slider.setLimits(-3, 3, 0.25).setValue(this.plugin.settings.refOffset).setDynamicTooltip().onChange(async (value) => {
      this.plugin.settings.refOffset = value;
      if (label) label.textContent = value.toFixed(2) + " px";
      await this.plugin.saveSettings();
    }));
    setting.addExtraButton((button) => button.setIcon("rotate-ccw").setTooltip(t("Reset")).onClick(async () => {
      this.plugin.settings.refOffset = DEFAULT_SETTINGS.refOffset;
      await this.plugin.saveSettings();
      this.display();
    }));
    label = setting.controlEl.createSpan({ cls: "gv-setting-value", text: this.plugin.settings.refOffset.toFixed(2) + " px" });
  }
};
// Pixel size of a JPEG from its SOF marker, swapped for EXIF orientations 5-8
// (what the browser displays); null when the file is not a parsable JPEG.
function jpegDimensions(buffer) {
  try {
    const view = new DataView(buffer);
    if (view.getUint16(0) !== 65496) return null;
    let offset = 2, orientation = 1;
    while (offset + 4 <= view.byteLength) {
      if (view.getUint8(offset) !== 255) return null;
      const marker = view.getUint8(offset + 1), length = view.getUint16(offset + 2);
      if (marker === 225 && offset + 14 <= view.byteLength && view.getUint32(offset + 4) === 1165519206) {
        const tiff = offset + 10, little = view.getUint16(tiff) === 18761;
        const ifd = tiff + view.getUint32(tiff + 4, little), count = view.getUint16(ifd, little);
        for (let i = 0; i < count; i++) {
          const tag = ifd + 2 + i * 12;
          if (tag + 12 > view.byteLength) break;
          if (view.getUint16(tag, little) === 274) {
            orientation = view.getUint16(tag + 8, little);
            break;
          }
        }
      }
      if (marker >= 192 && marker <= 207 && marker !== 196 && marker !== 200 && marker !== 204) {
        const height = view.getUint16(offset + 5), width = view.getUint16(offset + 7);
        return orientation >= 5 ? [height, width] : [width, height];
      }
      offset += 2 + length;
    }
  } catch (_) {
  }
  return null;
}
GallerySettingTab.SHOW_DEV_SETTINGS = false;
GalleryView.jpegDimensions = jpegDimensions;
GalleryView.SCALED = { thumb: 192, hero: 2048 };
GalleryView.SCALED_CACHE = 400;
GalleryView.DECODE_CONCURRENCY = 2;
module.exports = GalleryView;
module.exports.GalleryUI = GalleryUI;
module.exports.core = core;
