<p align="left">
  <img src="UIReview-extension/assets/uireview-logo.svg" width="240" alt="UIReview">
</p>

UIReview is a fast, self-contained Chrome extension for visual design review. Inspect interfaces, compare spacing, read layout and typography values, capture and annotate custom regions, and send feedback directly to Feishu/Lark documents or spreadsheets.

Current version: **1.0.0**

## Features

- Element inspection with precise tag, ID, classes, size, box model, spacing, and flex-axis information
- Overlapping-element cycling and keyboard DOM hierarchy navigation
- CSS selector finder with multi-match highlighting and previous/next navigation
- Draggable live inspector plus multiple pinned comparison cards
- Best-effort author-style forcing for detected `:hover`, `:focus`, and `:active` states
- Typography inspection with text color, font size, font weight, line height, radius, background, and opacity
- Automatic spacing measurements from the locked element to the element under the cursor
- Pixel rulers along the top and left edges of the viewport
- X-ray mode for quickly viewing page structure
- Native eyedropper with HEX and RGB values and one-click HEX copy
- Custom region screenshots with pen, arrow, rectangle, ellipse, and undo tools
- Layered screenshot and feedback-card transitions with reduced-motion support
- Direct feedback delivery to Feishu/Lark documents and spreadsheets
- Frame-coalesced inspection, cached geometry reads, and GPU-accelerated dragging
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

After a successful connection, the primary settings button changes to **Close** and closes the settings tab. The connected state and App ID remain visible until the local configuration is deleted.

UIReview calls Feishu directly from the Chrome extension service worker. It does not use a developer server. App credentials and destination history are stored only in the current browser's extension storage; they are never injected into inspected pages or committed to this repository.

## Controls

The floating toolbar opens expanded with no active tool. It can be dragged, and hovering a tool shows its English name and shortcut. The arrow segments beside Inspect and Screenshot open their related menus. Press `Esc` to close the current menu, panel, or active tool first; when nothing is active, press `Esc` again to collapse the toolbar into the UIReview logo. Click the logo to expand it, or long-press and drag the logo to move it without expanding. The browser toolbar icon still fully shows or hides UIReview.

| Tool | Shortcut | Description |
| --- | --- | --- |
| Inspect | `I` | Inspect elements and layout information |
| Typography | `T` | Inspect text styles |
| Rulers | `R` | Show top and left pixel rulers |
| Eyedropper | `P` | Use the browser's native color picker |
| X-ray | `X` | View page structure |
| CSS Selector Finder | `F` | Find and highlight elements with a native CSS selector |
| Screenshot Feedback | `C` | Capture a region and write feedback |
| Settings | `S` | Open UIReview settings |
| Close / collapse | `Esc` | Close the current UI layer or tool, then collapse the idle toolbar |

In Inspect mode, hover an element to see its box model and layout details, then click it to keep its border selected. Click the same element again to cancel the selection, or click another element to move the selection. Move over any other element to measure horizontal and vertical distances automatically—no modifier key is required. Flex and grid containers also outline their visible direct children. Use `Tab` / `Shift + Tab` to cycle through overlapping elements under the pointer, `Alt/Option + Shift + ↑` to select the parent, and `Alt/Option + Shift + ↓` to select the first visible child. Press `Space` to pin the current inspector card; pinned cards can be dragged and closed independently.

The box-model overlay uses tinted regions and per-edge values for margin, padding, and gap. When the selected element has matching author CSS, the inspector can preview detected `:hover`, `:focus`, and `:active` states. This is a best-effort browser-extension preview rather than Chrome DevTools' internal pseudo-state engine; cross-origin stylesheets and complex ancestor pseudo selectors may not be available.

In Screenshot Feedback mode, drag over an area and release; the feedback window opens immediately without an extra confirmation step.

## Screenshot feedback

The feedback workflow supports:

- Custom region capture and retake
- Pen, arrow, rectangle, and ellipse annotations
- `Undo` or `Ctrl/Cmd + Z` for the latest annotation
- Feishu/Lark document or spreadsheet destination selection
- Animated destination-card expansion and collapse
- An issue description and optional note
- Coordinated feedback-window entrance and exit animations, including close button, backdrop click, and `Esc`

After sending, the request continues in the background and the capture tool remains available for the next issue.

## Performance

UIReview keeps high-frequency work aligned with the browser's rendering cycle. Pointer inspection is coalesced to one update per animation frame, geometry and computed-style reads are reused within each render, and complex flex/grid analysis is bounded to prevent large pages from blocking interaction. The toolbar, collapsed logo, and inspector panels use compositor-friendly transforms while dragging, committing their final position only after release.

## Repository layout

```text
UIReview/
├── UIReview-1.0.0.zip              # Ready-to-install 1.0.0 package
└── UIReview-extension/             # Chrome Manifest V3 extension source
    ├── manifest.json               # Extension configuration and permissions
    ├── content.js                  # Inspection, measurement, capture, and feedback UI
    ├── background.js               # Service worker and Feishu request entry point
    ├── feishu-client.js            # Feishu authentication and document/sheet writes
    ├── options.html                 # Settings page
    └── assets/                     # Logo and extension icons
```

This repository contains the browser extension source and the current installable package. It does not contain the retired Node.js service, obsolete release archives, `.env` files, or Feishu credentials.

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
