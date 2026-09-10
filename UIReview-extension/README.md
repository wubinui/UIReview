# UIReview

Current package version: **1.0.0**

Chrome MV3 extension for inspecting live interface elements and typography.

## Install and start

UIReview is a self-contained Chrome extension. End users do not install Node.js, run a terminal command, or start a local service. Install it from Chrome Web Store, then complete the settings page that opens automatically:

1. Create a Feishu self-built application, enable the required cloud-document permissions, and publish the application.
2. Enter that application's App ID and App Secret in UIReview settings, then click **Continue**.
3. Add the application as an editable collaborator of the Feishu document or spreadsheet used for feedback.
4. Click UIReview in Chrome's extension toolbar and start inspecting or capturing feedback.

Every user connects their own Feishu application. No developer credential is bundled in UIReview.

## Load locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. Visit any page and use the floating toolbar or `Ctrl/Cmd + Shift + M`.

On first installation UIReview opens its settings page automatically. Enter the App ID and App Secret from your own Feishu self-built application and test the connection. UIReview calls Feishu directly from its Chrome background service worker; no Node.js installation, desktop application, or local server is needed.

## Controls

The extension loads quietly and does not show anything by default. Click the browser extension button or use the extension shortcut to open it. Inspection is modal: while a tool is active, page clicks, links, forms, context menus, and keyboard shortcuts are blocked so you can inspect safely. Click the active tool button again or press its shortcut a second time to close it and restore normal page interaction.

Toolbar shortcuts work only while UIReview is open and the page focus is not in an input: `I` Inspect, `T` Typography, `R` Rulers, `P` Eyedropper, `X` X-ray, `C` Screenshot Feedback, and `M` Menu. The Menu contains Inspector settings and an explicit Exit UIReview action. Pop-up menus and settings automatically stay inside the viewport when the toolbar is near an edge. `Esc` exits the active tool. In the feedback dialog, `Enter` sends, `Shift + Enter` inserts a new line in the question, and `Esc` closes the dialog.

After selecting an element, hover any other element to measure the horizontal and vertical distance between them. If the pointer is over a gap, UIReview falls back to the nearest visible sibling so adjacent spacing remains measurable. The selected element's size is shown as a compact `width × height` label centered inside the element. Open Inspector settings from the Menu to show or hide the style details panel. The panel can be dragged by its header and keeps its position while inspecting other elements.

The element panel is intentionally compact. Its Layout section contains only `Size`, `Margin`, `Padding`, and `Gap`; its Style section contains only `Text color`, `Font size`, `Font weight`, `Line height`, `Radius`, `Background`, and `Opacity`.

Use the pipette button to open Chrome's native eyedropper. The selected color is shown in HEX and RGB; click the HEX value to copy it.

Use Rulers to show fixed pixel rulers along the top and left edges of the viewport. Their document coordinates update while the page scrolls or the viewport resizes.

## Feishu screenshot feedback

1. Open UIReview's extension settings, enter your own Feishu self-built application's App ID and App Secret, then click **Continue**. No Node.js, desktop bridge, or local server is required. Credentials stay in Chrome's local extension storage and are never exposed to inspected web pages.
2. Click **Screenshot Feedback** (crop icon) in the UIReview toolbar, then drag over the area you want to capture. Release the pointer to open the feedback panel immediately; screenshot cropping and destination loading continue in the background with a lightweight preview state, and no extra confirmation click is required. Press `Esc` to cancel before releasing. UIReview hides its own interface before capturing.
3. On first use, or whenever no document is selected, **Destination document** opens automatically. Later, click the document icon immediately to the left of **Send** to open or close it. Choose a saved destination, or paste a Feishu `/docx/`, `/sheets/`, or `/wiki/` link. Pasted links are validated and selected automatically, then saved locally in Chrome. The selected document name and a green connection indicator appear in the Question card. Wiki links require the Feishu application permission `wiki:node:read`.
4. Review the cropped preview (use **Retake** if needed). Annotate with **Pen**, **Arrow**, **Rectangle**, or **Ellipse**. Each drag creates one annotation; use **Undo** or `Ctrl/Cmd + Z` to remove the most recent annotation. Enter the issue description and an optional note, then click **Send**. The annotated image is sent to the selected destination in the background, and UIReview immediately returns to region capture for the next issue. A non-blocking status toast remains visible while reporting sending, success, or failure. Press `Esc` when you are finished with continuous capture.

Each user provides credentials for their own Feishu self-built application. The extension stores them locally with `chrome.storage.local`; Chrome sync is not used. The credentials are read only by the extension's background service worker and are never injected into inspected pages.

For spreadsheets, UIReview appends one acceptance record with the columns `Module`, `Screenshot`, `Description`, `Developer`, `Status`, and `Notes`. It uses the page title for `Module`, leaves `Developer` empty, and defaults `Status` to `To be modified`. The cropped screenshot is stored as an in-cell image in the matching `Screenshot` cell. A direct `/sheets/` URL uses its `sheet` query parameter when present; otherwise UIReview uses the first visible worksheet.
