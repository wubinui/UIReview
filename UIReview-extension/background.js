importScripts("feishu-client.js");

// setAccessLevel is unavailable in older Chrome/Chromium releases. Calling an
// absent method during startup prevents the whole MV3 service worker from
// registering, so guard it and keep the extension usable on those browsers.
const protectLocalStorage = async () => {
  try {
    if (typeof chrome.storage?.local?.setAccessLevel !== "function") return;
    await chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
  } catch (_) {
    // Storage protection is best-effort compatibility hardening. Extension
    // pages and the background worker remain isolated from inspected pages.
  }
};
protectLocalStorage();

chrome.runtime.onInstalled.addListener(({ reason }) => {
  protectLocalStorage();
  if (reason === "install") chrome.runtime.openOptionsPage();
});

chrome.runtime.onStartup.addListener(protectLocalStorage);

const ignoreLastError = () => void chrome.runtime.lastError;

const sendToTab = (tabId, message, options = {}) => {
  try {
    const pending = chrome.tabs.sendMessage(tabId, message, options, ignoreLastError);
    if (pending && typeof pending.catch === "function") pending.catch(() => {});
  } catch (_) {}
};

const frameModes = new Set(["inspect", "typography", "guides", "xray", "eyedropper"]);
const defaultFrameState = () => ({ enabled: false, mode: null });
const normalizeFrameState = value => ({
  enabled: value?.enabled === true,
  mode: value?.enabled === true && frameModes.has(value?.mode) ? value.mode : null
});
const requestTopFrameState = (tabId, sendResponse) => {
  let settled = false;
  const finish = response => {
    if (settled) return;
    settled = true;
    sendResponse(response?.ok ? response : { ok: true, state: defaultFrameState() });
  };
  try {
    const pending = chrome.tabs.sendMessage(tabId, { type: "uireview-frame-state-query" }, { frameId: 0 }, response => {
      const error = chrome.runtime.lastError;
      finish(error ? null : response);
    });
    if (pending && typeof pending.then === "function") pending.then(finish).catch(() => finish(null));
  } catch (_) {
    finish(null);
  }
};

const openSettings = sendResponse => {
  try {
    const pending = chrome.runtime.openOptionsPage(() => {
      const error = chrome.runtime.lastError;
      sendResponse?.(error ? { ok: false, error: error.message } : { ok: true });
    });
    if (pending && typeof pending.then === "function") {
      pending.then(() => sendResponse?.({ ok: true })).catch(error => sendResponse?.({ ok: false, error: error.message }));
    }
  } catch (error) {
    sendResponse?.({ ok: false, error: error.message });
  }
};

chrome.commands.onCommand.addListener(async command => {
  if (command !== "toggle-uireview") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) sendToTab(tab.id, { type: "toggle" });
});

chrome.action.onClicked.addListener(tab => {
  if (tab.id) sendToTab(tab.id, { type: "toggle" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "uireview-frame-state-request") {
    const tabId = sender.tab?.id;
    if (tabId == null || sender.frameId === 0) {
      sendResponse({ ok: true, state: defaultFrameState() });
      return;
    }
    requestTopFrameState(tabId, sendResponse);
    return true;
  }
  if (message?.type === "uireview-frame-state-update") {
    const tabId = sender.tab?.id;
    if (tabId == null) {
      sendResponse({ ok: false, error: "Unable to identify the inspected tab" });
      return;
    }
    const state = normalizeFrameState(message.state);
    sendToTab(tabId, { type: "uireview-frame-state", state });
    sendResponse({ ok: true, state });
    return;
  }
  if (message?.type === "uireview-top-command") {
    const tabId = sender.tab?.id;
    if (tabId == null) {
      sendResponse({ ok: false, error: "Unable to identify the inspected tab" });
      return;
    }
    sendToTab(tabId, { type: "uireview-top-command", command: message.command }, { frameId: 0 });
    sendResponse({ ok: true });
    return;
  }
  if (message?.type === "capture-visible-tab") {
    try {
      const pending = chrome.tabs.captureVisibleTab(sender.tab?.windowId, { format: "png" }, dataUrl => {
        const error = chrome.runtime.lastError;
        sendResponse(error ? { ok: false, error: error.message } : { ok: true, dataUrl });
      });
      if (pending && typeof pending.then === "function") {
        pending.then(dataUrl => sendResponse({ ok: true, dataUrl })).catch(error => sendResponse({ ok: false, error: error.message }));
      }
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
    return true;
  }
  if (message?.type === "feishu-status") {
    UIReviewFeishu.status()
      .then(status => sendResponse({ ok: true, ...status }))
      .catch(error => sendResponse({ ok: false, configured: false, error: error.message }));
    return true;
  }
  if (message?.type === "open-feishu-settings") {
    openSettings(sendResponse);
    return true;
  }
  if (message?.type === "close-options-tab") {
    if (!sender.tab?.id) {
      sendResponse({ ok: false, error: "Unable to identify the settings tab" });
      return;
    }
    try {
      chrome.tabs.remove(sender.tab.id, () => {
        const error = chrome.runtime.lastError;
        sendResponse(error ? { ok: false, error: error.message } : { ok: true });
      });
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
    return true;
  }
  if (message?.type === "document-state") {
    chrome.storage.local.get({ uiReviewDocuments: [], uiReviewSelectedDocumentId: "" })
      .then(saved => sendResponse({
        ok: true,
        documents: Array.isArray(saved.uiReviewDocuments) ? saved.uiReviewDocuments : [],
        selectedDocumentId: String(saved.uiReviewSelectedDocumentId || "")
      }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === "save-document-state") {
    const documents = Array.isArray(message.documents)
      ? message.documents.filter(item => item && typeof item.id === "string").slice(0, 20)
      : [];
    const selectedDocumentId = String(message.selectedDocumentId || "");
    chrome.storage.local.set({ uiReviewDocuments: documents, uiReviewSelectedDocumentId: selectedDocumentId })
      .then(() => sendResponse({ ok: true }))
      .catch(error => sendResponse({ ok: false, error: error.message }));
    return true;
  }
  if (message?.type === "feishu-api-request") {
    const actions = {
      validateDocument: () => UIReviewFeishu.validateDocument(message.body?.documentUrl || message.body?.documentId),
      submitFeedback: () => UIReviewFeishu.appendFeedback(message.body || {})
    };
    const action = actions[message.action];
    if (!action) {
      sendResponse({ ok: false, error: "Unsupported Feishu request" });
      return;
    }
    action()
      .then(data => sendResponse({ ok: true, data }))
      .catch(error => sendResponse({ ok: false, error: error.message, code: error.feishuCode, stage: error.stage, requestId: error.requestId }));
    return true;
  }
});
