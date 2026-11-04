# Paipa Gallery

Lightweight interactive media blocks for images and videos, styled only with the theme's own variables. UI inspired by Lite Gallery.

## Create

- Select some image / video links, right-click → **Gallery**, or run **Create gallery**. With no selection an empty gallery is inserted.
- **Convert Lite Gallery at cursor** turns a `litegal` code block into a gallery.
- Data lives in a `gallery-view` code block (JSON). Without the plugin it is just a code block.

## Browse and arrange

- Arrow buttons / arrow keys switch items; click the main image to open the original.
- Drag thumbnails to reorder, drag them out into the note, or drag images from the note (or from your file manager) into the gallery.
- Right-click a thumbnail: **Insert reference**, **Remove image / video**.
- Mobile: tap to select, long-press to lift and drag.

## Figures and references

- Each item shows `Figure N` under the main image. Double-click it to add a caption; the caption moves with the item and numbering follows the order.
- **Insert reference** puts a figure reference in the text; clicking it jumps to that item.

## Performance

Thumbnails (192 px) and the main view (2048 px) use downscaled copies generated on demand and decoded once per session; the original file is loaded only when you open it. SVG and GIF are shown as-is.

## Install

Settings → Community plugins → Browse → search **Paipa Gallery**.

Manual: download `main.js`, `manifest.json` and `styles.css` from the latest release into `<vault>/.obsidian/plugins/paipa-gallery/`.

Optional companions: Editor Enhancer (block drag), Section Blocks (puts dropped files into a `<note> media` folder).

## License

MIT
