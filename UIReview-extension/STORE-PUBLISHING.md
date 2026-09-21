# Chrome Web Store checklist

1. Rotate any App Secret that has previously been shared; never bundle developer credentials in the extension.
2. Upload the store ZIP whose root contains `manifest.json`.
3. Explain `<all_urls>` as required for user-initiated inspection on arbitrary pages.
4. Explain `activeTab` as required for user-initiated screenshot capture, `storage` for local settings and destination history, and `clipboardWrite` for copying inspected colors.
5. Explain the `https://open.feishu.cn/*` host permission as required for direct Feishu authentication and document/Sheet writes.
6. Publish the full privacy policy at `https://uirevu.com/privacy.html` and keep it consistent with `PRIVACY.md` and the extension's actual behavior.
7. In the store instructions, tell each user to create their own Feishu self-built application, publish its permissions, and add it as an editor of the destination document.
8. Verify iframe-heavy applications: the toolbar should appear only once, while inspection works inside visible child frames.

## Privacy practices declaration

The Chrome Web Store Privacy practices form must match the extension and the published policy. Based on the current UIReview behavior, disclose at least:

- **Authentication information** — the user-provided Feishu/Lark App ID and App Secret are stored locally and sent to Feishu/Lark over HTTPS for authentication.
- **Web history** — the current page URL and title are included when the user explicitly sends feedback to a Feishu/Lark document.
- **Website content** — UIReview locally inspects DOM text, layout, style, typography, and colors; captures a user-selected screenshot; and sends the chosen screenshot and feedback only after the user presses Send.
- **User-provided content** if the current dashboard presents this category — issue descriptions, optional notes, annotations, destination links, and document identifiers.

Certify Limited Use only while the implementation continues to use this data solely for UIReview's disclosed interface-review workflow. Do not declare analytics, advertising, data sale, or a UIReview server because the current extension does not use them.

Before resubmitting, verify that the dashboard's privacy policy URL is the public HTTPS URL above, that it loads without authentication, and that its content is identical in substance to `PRIVACY.md`.
