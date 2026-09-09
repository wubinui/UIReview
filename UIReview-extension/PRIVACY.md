# UIReview Privacy

UIReview processes interface inspection and screenshots locally in the browser. When a user explicitly sends feedback, the selected screenshot, issue description, optional note, page title, page URL, and viewport size are sent directly from the extension to Feishu Open Platform using the user's own self-built application.

The Feishu App ID and App Secret are stored in `chrome.storage.local`, with access restricted to trusted extension contexts (the background service worker and settings page). They are not available to content scripts, synced through Chrome Sync, injected into inspected web pages, sent to UIReview servers, or included in analytics. UIReview does not operate a cloud backend.

Users can delete credentials and saved destination documents at any time from the UIReview settings page.
