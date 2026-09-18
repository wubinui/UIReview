# Chrome Web Store checklist

1. Rotate any App Secret that has previously been shared; never bundle developer credentials in the extension.
2. Upload the store ZIP whose root contains `manifest.json`.
3. Explain `<all_urls>` as required for user-initiated inspection on arbitrary pages.
4. Explain `activeTab` as required for user-initiated screenshot capture, `storage` for local settings and destination history, and `clipboardWrite` for copying inspected colors.
5. Explain the `https://open.feishu.cn/*` host permission as required for direct Feishu authentication and document/Sheet writes.
6. Publish a privacy policy consistent with `PRIVACY.md` and disclose that screenshots are sent only after the user presses Send.
7. In the store instructions, tell each user to create their own Feishu self-built application, publish its permissions, and add it as an editor of the destination document.
8. Verify iframe-heavy applications: the toolbar should appear only once, while inspection works inside visible child frames.
