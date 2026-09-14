<h1 align="center">
  <img src="assets/icon.svg" alt="UIReview icon" width="48" height="48" />
  &nbsp;
  <img src="assets/uireview-logo.svg" alt="UIReview" width="144" height="48" />
</h1>

UIReview is a Chrome extension for inspecting live interfaces, comparing spacing, reviewing typography, capturing annotated screenshots, and sending feedback to Feishu/Lark documents.

Current release: **1.0.0**

## Features

- Inspect elements with layout and style details.
- Compare spacing between a selected element and nearby elements.
- Inspect typography tokens, colors, dimensions, margins, padding, and gaps.
- Capture a custom region and annotate it with pen, arrow, rectangle, or ellipse tools.
- Send screenshot feedback to Feishu/Lark Docs or Sheets.
- Toggle X-ray mode, pixel rulers, and the native color picker.
- Drag and collapse the toolbar; all credentials stay in local extension storage.

## Install locally

UIReview is a self-contained Manifest V3 extension. End users do not need Node.js, a local server, or a desktop bridge.

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the **repository root** (the folder containing `manifest.json`).
4. Open the extension settings and connect your own Feishu/Lark application.

## Connect Feishu/Lark

Create and publish a self-built application in the [Feishu/Lark Open Platform](https://open.feishu.cn/). Grant these scopes:

- `docx:document` — create and edit Docs content.
- `drive:drive` — access files and spreadsheets.
- `wiki:node:read` — resolve Wiki document links.

Enter the App ID and App Secret in UIReview settings. Add the application as an editor of the destination document or spreadsheet. Credentials are stored only in `chrome.storage.local` and are never injected into inspected pages.

## Controls

Click the browser toolbar button to open UIReview, then use the shortcuts below. While a tool is active, page interaction is blocked so elements can be inspected safely.

| Shortcut | Action |
| --- | --- |
| <kbd>I</kbd> | Inspect elements |
| <kbd>F</kbd> | Find by CSS selector |
| <kbd>C</kbd> | Capture screenshot feedback |
| <kbd>T</kbd> | Inspect typography |
| <kbd>R</kbd> | Show pixel rulers |
| <kbd>X</kbd> | Toggle X-ray view |
| <kbd>P</kbd> | Open the eyedropper |
| <kbd>Esc</kbd> | Close the current layer or collapse the toolbar |

Closing the active tool restores normal page interaction. After selecting an element, move the pointer over another element to see spacing measurements.

## Screenshot feedback

Choose **Screenshot Feedback**, drag a region, and release. The feedback panel opens automatically while the preview and destination document load in the background. Add a description, optional note, and annotations, then press **Send**. For Sheets destinations, UIReview creates the columns `Module`, `Screenshot`, `Description`, `Developer`, `Status`, and `Notes`; status defaults to `To be modified`, and the screenshot is inserted as an in-cell image.

## Development checks

```bash
python3 -m json.tool manifest.json >/dev/null
node --check background.js
node --check content.js
node --check feishu-client.js
node --check options.js
```

Load the repository root as an unpacked extension after making changes. There is no build step.

## Package for release

```bash
zip -r UIReview-1.0.0.zip . -x '*.DS_Store' '*.zip' '.env*' 'node_modules/*'
```

Upload the ZIP as a GitHub Release asset or submit it to the Chrome Web Store. The static website links to the latest release asset.

## Privacy and license

See [PRIVACY.md](PRIVACY.md) and [STORE-PUBLISHING.md](STORE-PUBLISHING.md). Choose and add an OSI-approved license (for example, MIT or Apache-2.0) before publishing this repository as open source.

This repository contains only the browser extension. It does not contain the marketing website, local service, generated output, or release ZIP files.
