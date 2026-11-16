# Changelog

## 1.5.0

- **Full-size viewer arrows**: previous / next buttons inside the frame, plus ← / →. Videos are skipped. The gallery follows the image you're viewing.
- The viewer keeps a fixed size (94% of the window), so it no longer jumps as you page.
- **New setting "Fit images to the viewer"** (off by default): images fill the viewer frame, small ones are enlarged; large images dropped into a gallery are saved downscaled to what the viewer needs on your largest screen.
- **New command "Downscale images in this note's galleries"** for images already in a note (asks first; overwrites the originals).
- **Fix**: editing a note from outside (another app, a script, Sync) while it was open could be ignored and then overwritten by the old gallery. Those changes now come through.

## 1.4.0

- Interface in English and Chinese, following Obsidian's language, with a **Language** setting to override.

## 1.3.1

- Clean-up release, no behavior change.

## 1.3.0

- Renamed to **Paipa Gallery** (plugin id `paipa-gallery`). Notes keep using the same `gallery-view` code block.

## 1.2.x

- Much faster with large photos: thumbnails and the main view use downscaled copies; neighbours are pre-loaded so the arrows switch instantly.
- Typing above a gallery no longer redraws it.

## 1.1.x

- Figure numbers and captions, figure references in text, video playback.
- Files dropped into a gallery go to Section Blocks' media folder when that plugin is installed.

## 1.0.x

- First release: image blocks, thumbnail reordering, drag in / out, full-size view, delete protection, Lite Gallery conversion, touch support.
