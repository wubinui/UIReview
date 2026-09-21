# UIReview Privacy Policy

**Effective date:** September 20, 2026

**Last updated:** September 20, 2026

This Privacy Policy explains how the UIReview Chrome extension ("UIReview") handles user data. UIReview is an interface inspection and visual-feedback tool. The extension does not operate a UIReview cloud backend, does not use advertising or analytics SDKs, and does not sell user data.

## 1. Data UIReview handles

UIReview handles the following categories of data only to provide its user-facing review features:

- **Website content and interface data.** When the user activates an inspection tool, UIReview reads the current page's DOM structure and visible element information, including text, computed CSS, layout, spacing, typography, colors, and iframe context. This is needed to inspect and compare interfaces. UIReview does not read cookies, passwords, form submissions, or network request bodies for this feature.
- **Screenshots and annotations.** When the user starts Capture region, UIReview captures the visible tab, crops it to the region chosen by the user, and may add the user's visual annotations.
- **Feedback content and page context.** UIReview handles the issue description, optional note, current page title, current page URL, viewport size, selected screenshot, and selected destination when the user prepares feedback. The exact fields written to Feishu/Lark depend on whether the destination is a document or spreadsheet.
- **Feishu/Lark authentication information.** If the user connects a self-built Feishu/Lark application, UIReview handles the App ID and App Secret supplied by the user. These credentials are sent only to the Feishu Open Platform authentication endpoint to obtain a temporary tenant access token.
- **Destination information.** UIReview handles Feishu/Lark document, spreadsheet, sheet, or Wiki identifiers and links, plus the destination name and the user's selected destination, so the user can validate and reuse destinations.
- **Clipboard data.** UIReview writes a color value to the clipboard only when the user chooses Copy in the eyedropper tool. UIReview does not read clipboard contents.

UIReview does not collect names, email addresses, payment data, health data, precise location, advertising identifiers, or browsing history unrelated to its interface-inspection and feedback features.

## 2. How data is collected and processed

- Page interface data is read locally from the currently open page only while the user uses UIReview's inspection, typography, ruler, X-ray, selector, or eyedropper features.
- A visible-tab image is captured only after the user starts the screenshot feature and selects a region.
- Feedback content is prepared locally and transmitted only after the user chooses a Feishu/Lark destination and presses **Send**.
- Feishu/Lark credentials are collected only when the user enters them on the UIReview settings page and presses **Continue**. UIReview immediately uses them to authenticate with Feishu/Lark and stores them locally for later user-requested submissions.
- A document or spreadsheet link is sent to Feishu/Lark for validation only when the user adds or selects that destination.

UIReview uses this data solely to inspect the current interface, create the requested screenshot or annotation, validate the user's chosen destination, and send the user's feedback to that destination. It is not used for advertising, profiling, credit decisions, generalized market research, or any unrelated purpose.

## 3. Local storage and retention

- DOM, style, layout, and typography data used for live inspection is processed in browser memory. UIReview does not save this inspection data to `chrome.storage.local`.
- Screenshot drafts, annotations, issue text, and notes are held in browser memory during the active capture/feedback workflow. They are cleared when the workflow is cancelled or completed, the page is reloaded or closed, or the extension process ends. UIReview does not retain a separate local archive of submitted feedback.
- The Feishu/Lark App ID and App Secret are stored in `chrome.storage.local` until the user clears the connection in UIReview settings or uninstalls the extension.
- Saved destination metadata and the selected destination are stored in `chrome.storage.local` until the user clears the Feishu/Lark connection or uninstalls the extension.
- The Feishu/Lark tenant access token is cached only in the extension service worker's memory until it expires, the connection is cleared, or the service worker stops.

UIReview does not use Chrome Sync for these values. The UIReview developer does not receive or retain them on a UIReview server.

## 4. Sharing and external transmission

UIReview shares data only with the **Feishu/Lark Open Platform**, using the user's own self-built application, when required for a feature the user explicitly requests:

- App ID and App Secret are sent to Feishu/Lark to authenticate the user's application.
- Destination links or identifiers are sent to Feishu/Lark to resolve and validate a document, spreadsheet, sheet, or Wiki destination.
- After the user presses **Send**, the screenshot and feedback are written directly to the selected Feishu/Lark destination. A Feishu document submission includes the issue description, screenshot, page title, page URL, viewport size, and submission time. A spreadsheet submission includes the page title, screenshot, issue description, optional note, and review status.

All external transmissions use HTTPS. Data written to Feishu/Lark is then governed by the user's Feishu/Lark organization, application permissions, selected document access, and Feishu/Lark's own terms and privacy practices. UIReview cannot access or delete that cloud content on the user's behalf.

UIReview does not send user data to UIReview-controlled servers, analytics providers, advertisers, or data brokers. It does not sell user data or allow the developer or other humans to read it. It does not transfer user data for personalized advertising, retargeting, or monetization.

## 5. Security

UIReview requests only the browser permissions needed for its disclosed features. Stored configuration is kept in the user's local Chrome extension storage. UIReview configures that storage for trusted extension contexts where the Chrome API supports this restriction; the extension's code does not inject credentials into inspected pages or expose them to UIReview content scripts. Feishu/Lark credentials and feedback are transmitted only to `https://open.feishu.cn/` over HTTPS.

No storage or transmission method can be guaranteed to be completely secure. Users should protect their Chrome profile and use a dedicated Feishu/Lark self-built application with only the permissions UIReview requires. If credentials may have been exposed, users should rotate the App Secret in Feishu/Lark and clear the saved connection in UIReview.

## 6. Chrome permissions

- **`activeTab`** — captures the visible tab only for the screenshot feature initiated by the user.
- **`storage`** — stores Feishu/Lark connection details and reusable destination metadata locally.
- **`clipboardWrite`** — copies a selected color value when the user presses Copy; UIReview does not read the clipboard.
- **Access to websites (`<all_urls>`, including frames)** — enables user-initiated interface inspection and screenshot-region selection on arbitrary pages and inside visible iframes. Website content is not used for background tracking or advertising.
- **`https://open.feishu.cn/*`** — authenticates the user's Feishu/Lark application, validates destinations, uploads screenshots, and writes feedback to the destination selected by the user.

## 7. User controls and deletion

Users control when UIReview opens, which inspection tool runs, what region is captured, what feedback is written, which destination receives it, and whether to press **Send**.

Users can open UIReview settings and choose **Clear** to delete the stored App ID, App Secret, saved destination list, and selected destination from local extension storage. Uninstalling UIReview removes its local extension data under Chrome's normal extension-removal behavior. To delete feedback already submitted to Feishu/Lark, the user must delete it from the destination document or spreadsheet or ask that destination's administrator; UIReview has no cloud copy to delete.

## 8. Chrome Web Store Limited Use disclosure

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements. Data is used only to provide or improve UIReview's single-purpose, user-facing interface review and feedback features. UIReview does not use or transfer user data for personalized advertising, sell it, use it for unrelated purposes, or permit human access except where the user explicitly asks for support and consents to sharing the specific information, or where required for security or applicable law.

## 9. Website

The UIReview website is a static product website. UIReview does not include its own analytics, advertising trackers, or account system on the website and does not intentionally set tracking cookies. The website's hosting provider may process standard network request information, such as IP address and request headers, to deliver and secure the site under the provider's own privacy practices.

## 10. Changes to this policy

If UIReview's data practices change, this policy will be updated before the changed practices are released. Material changes will also be disclosed through the extension or Chrome Web Store listing when required.

## 11. Contact

For privacy questions or requests, open an issue in the [UIReview GitHub repository](https://github.com/wubinui/UIReview/issues). Do not include App Secrets, screenshots, private document links, or other sensitive data in a public issue.
