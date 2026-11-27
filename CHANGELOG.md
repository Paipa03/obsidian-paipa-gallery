# Changelog

## 2.0.0

- **Galleries stay put**: jumping to a search result, picking a thumbnail, paging or following a figure reference no longer scrolls a gallery that is already on screen. A gallery off screen is scrolled to the middle of the pane instead of the top. Opening the search box or editing a title no longer scrolls the note.
- **Zoom survives switching tabs**: a zoomed viewer or image tab keeps its zoom and position when you switch to another tab in the same pane and back. Resizing the pane still resets it.

- **Every image in a note opens in the viewer**: click any image in a note, even outside a gallery (tap on phones), to open it in the same full-size viewer, with its file name under the picture. The pointer turns into a magnifier over these images. Modifier-clicks, linked images and tiny inline images keep their usual behaviour. Turn it on in settings with **Gallery behaviour for note images** (off by default; when off, note images behave exactly as in Obsidian).
- **Drag the viewer into its own tab** (desktop): the strip at the top of the viewer drags like a tab. Drop it on a tab bar for a new tab, on a pane edge for a split, or outside the window for a new window. The file and the gallery stay as they are. Double-click the strip to open the image in a new tab. The strip keeps clear of the close button, and its hint appears only after the pointer rests on it.
- **Image tabs look and zoom like the viewer**: an image opened this way (or dragged straight from a note onto a tab bar or pane edge) shows its caption or file name under the picture, and zooms with Ctrl + scroll around the pointer; drag to pan.
- Hovering a gallery, its main image or the viewer no longer pops up a text tooltip.
- **Drag a note image straight into a tab** (desktop): dragging an image in a note works like dragging a tab, to a tab bar, a pane edge or out of the window. Dropping it on a gallery still moves it into the gallery.
- **Originals are kept**: "Fit images to the viewer" is now two settings. **Fill the viewer frame** only changes the display. **Shrink large images when adding** replaces files and is off by default; after updating it starts off, so galleries stop overwriting originals.
- **Sharper main image**: the gallery's main image is made at the size this device's screens need (up to 4096 px) instead of a fixed 2048 px.
- **Faster viewer**: the viewer shows the gallery's main image at once and switches to the original as soon as it is loaded, without a flash and without resetting the zoom.
- **Previews kept on this device**: thumbnails and main images are kept in the app's own storage (outside the vault, so no sync tool copies them), and galleries no longer re-read every original after a restart. Set the size limit or clear it under **Keep previews on this device**; uninstalling the plugin deletes them.

## 1.8.0

- **Search figure titles** (desktop): hover a gallery and a small search icon appears in its top-left corner. Click it to search the titles of every figure in the note's galleries. Matches are highlighted; use ↑ / ↓ and Enter (or click) to jump to that gallery and figure, Esc to close. Works in editing and reading view.

## 1.7.5

- **Full titles in the full-size viewer**: titles are no longer cut short. A title that fits on one line looks as before, under the image. A longer one is shown in full on a layer that grows upward over the bottom of the picture, with a backdrop so it stays readable. The image never moves or resizes because of the title, on desktop or on phones.

## 1.7.4

- **The image no longer moves with the title**: the title line under the full-size image now has a fixed height (one line on desktop, two on phones; longer titles end in "…"), so the picture stays exactly in place when you page between images with titles of different lengths.

## 1.7.3

- **Titles in the full-size viewer**: the figure number and the image's title from the gallery now show in a line centred under the picture, and follow along as you page. Long titles are cut short with "…" on desktop (hover for the full text) and wrap on phones.

## 1.7.2

- **Full-size viewer stays in its pane** (desktop): the viewer now covers only the pane that holds the gallery instead of the whole window. With split panes, only that pane is dimmed; the other panes keep working normally. Esc and ← / → act on the viewer only while you are in it; elsewhere they behave as usual. The viewer follows the pane's size and closes when the pane is closed or switches to another note. Hover popovers and phones are unchanged.

## 1.7.1

- Fix: when a script or another plugin replaces the whole text of an open note (`editor.setValue()`) and the new text has one gallery fewer, the change now goes through. The deletion guard used to block it, and the old note was later saved back over the file. Deleting or cutting a whole gallery by hand is still blocked.

## 1.7.0

- **Zoom in the full-size viewer**: Ctrl + scroll (or trackpad pinch) zooms around the pointer, only inside the frame; drag to pan. Zoom snaps at the fitted size. No flicker at the edges while zooming.
- **Phones**: the viewer is just the picture (no panel, no arrows). Swipe to page with a sliding animation, pinch to zoom, drag to pan; when zoomed, keep dragging past the edge to go to the next image. Tap outside the picture to close. No grey flash when tapping the main image.
- **Fit images to the viewer**: phones no longer re-encode images. Images added to a gallery on a phone are shrunk the next time a desktop shows that gallery.
- Thumbnail menu: **Show in system explorer** (desktop).
- **Insert reference** now goes at the end of the gallery's section, above the next heading.
- Dragging an image out of a gallery and back no longer leaves blank lines.

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
