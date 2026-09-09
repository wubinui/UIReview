<p align="left">
  <img src="UIReview-extension/assets/uireview-logo.svg" width="240" alt="UIReview">
</p>

UIReview is a Chrome extension for visual design review. Inspect elements, read layout and typography values, measure spacing, capture custom regions, annotate issues, and send feedback directly to Feishu/Lark documents or spreadsheets.

Current version: **1.0.0**

## Features

- Element inspection with size, layout, spacing, and parent information
- Typography inspection with text color, font size, font weight, line height, radius, background, and opacity
- `Alt` spacing measurements between elements
- Pixel rulers along the top and left edges of the viewport
- X-ray mode for quickly viewing page structure
- Native eyedropper with HEX and RGB values and one-click HEX copy
- Custom region screenshots with pen, arrow, rectangle, ellipse, and undo tools
- Direct feedback delivery to Feishu/Lark documents and spreadsheets
- Self-contained browser extension: no Node.js, local server, or Bridge required

## Installation

### Chrome Web Store

Install UIReview from the Chrome Web Store, then click the UIReview icon in the browser toolbar. The settings page opens automatically on first install.

### Load from source

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `UIReview-extension/` folder.

UIReview is opt-in and remains hidden until you click the toolbar icon or use the extension shortcut.

## Connect Feishu/Lark

Each user connects their own Feishu/Lark self-built application:

1. Create an enterprise self-built application in the [Feishu Open Platform](https://open.feishu.cn/app).
2. Request the required cloud document, spreadsheet, drive media, and Wiki permissions, then publish an application version.
3. Open UIReview settings, enter the App ID and App Secret, and click **Continue**.
4. In the feedback window, add a Feishu/Lark document or spreadsheet link and make sure the application has edit access.

UIReview calls Feishu directly from the Chrome extension service worker. It does not use a developer server. App credentials and destination history are stored only in the current browser's extension storage; they are never injected into inspected pages or committed to this repository.

## Controls

The floating toolbar can be dragged. Hover a tool to see its English name and shortcut.

| Tool | Shortcut | Description |
| --- | --- | --- |
| Inspect | `I` | Inspect elements and layout information |
| Typography | `T` | Inspect text styles |
| Rulers | `R` | Show top and left pixel rulers |
| Eyedropper | `P` | Use the browser's native color picker |
| X-ray | `X` | View page structure |
| Screenshot Feedback | `C` | Capture a region and write feedback |
| Settings | `S` | Open UIReview settings |
| Close | `Esc` | Close the active tool or feedback window |

In Inspect mode, click an element to keep it selected. Hold `Alt` while moving over another element to measure the distance between them. In Screenshot Feedback mode, drag over an area and release; the feedback window opens immediately without an extra confirmation step.

## Screenshot feedback

The feedback workflow supports:

- Custom region capture and retake
- Pen, arrow, rectangle, and ellipse annotations
- `Undo` or `Ctrl/Cmd + Z` for the latest annotation
- Feishu/Lark document or spreadsheet destination selection
- An issue description and optional note

After sending, the request continues in the background and the capture tool remains available for the next issue.

## Repository layout

```text
UIReview/
└── UIReview-extension/  # Chrome Manifest V3 extension source
    ├── manifest.json     # Extension configuration and permissions
    ├── content.js        # Inspection, measurement, capture, and feedback UI
    ├── background.js     # Service worker and Feishu request entry point
    ├── feishu-client.js  # Feishu authentication and document/sheet writes
    ├── options.html       # Settings page
    └── assets/           # Logo and extension icons
```

This repository contains browser extension source only. It does not contain the retired Node.js service, release archives, `.env` files, or Feishu credentials.

## Privacy and security

Read [`UIReview-extension/PRIVACY.md`](UIReview-extension/PRIVACY.md). UIReview has no cloud backend. Feishu requests are sent directly by the extension after the user explicitly submits feedback, and inspected pages cannot read stored credentials.

## Development

The project uses plain HTML, CSS, and JavaScript and has no build step. After editing, click the extension's reload button in `chrome://extensions`.

Run these checks before committing:

```bash
node --check UIReview-extension/content.js
node --check UIReview-extension/background.js
node --check UIReview-extension/feishu-client.js
node --check UIReview-extension/options.js
```

## License

License and distribution terms will be added in a future release.
