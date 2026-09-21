const $ = id => document.getElementById(id);
const form = $("form");
const appId = $("appId");
const appSecret = $("appSecret");
const statusBox = $("status");
const statusText = $("statusText");
const message = $("message");
const continueButton = $("save");
const continueLabel = continueButton.querySelector("span");
const clearConfigButton = $("clearConfig");

let configured = false;

const updatePrimaryButton = () => {
  continueLabel.textContent = configured ? "Close" : "Continue";
};

const setBusy = value => {
  appId.disabled = value;
  appSecret.disabled = value;
  continueButton.disabled = value;
  clearConfigButton.disabled = value;
  continueLabel.textContent = value ? "Connecting..." : configured ? "Close" : "Continue";
};

const showMessage = (text = "", type = "") => {
  message.textContent = text;
  message.className = `message${type ? ` ${type}` : ""}`;
};

const showStatus = ({ connected = false, error = false, text }) => {
  statusBox.className = `status${connected ? " connected" : ""}${error ? " error" : ""}`;
  statusText.textContent = text;
  clearConfigButton.hidden = !connected;
};

async function refresh() {
  const status = await UIReviewFeishu.status();
  configured = status.configured;
  updatePrimaryButton();
  showStatus({ connected: configured, text: configured ? `App connected · ${status.appId}` : "Waiting to connect" });
  appId.placeholder = configured ? status.appId : "App ID";
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (configured) {
    try {
      chrome.runtime.sendMessage({ type: "close-options-tab" }, response => {
        if (chrome.runtime.lastError || !response?.ok) window.close();
      });
    } catch (_) {
      window.close();
    }
    return;
  }
  const nextAppId = appId.value.trim();
  const nextSecret = appSecret.value.trim();

  if ((nextAppId && !nextSecret) || (!nextAppId && nextSecret)) {
    showMessage("Enter both the App ID and App Secret.", "error");
    (nextAppId ? appSecret : appId).focus();
    return;
  }
  if (!nextAppId && !nextSecret && !configured) {
    showMessage("Enter your Feishu app's App ID and App Secret.", "error");
    appId.focus();
    return;
  }

  setBusy(true);
  showMessage("");
  showStatus({ text: "Connecting..." });
  try {
    const result = nextAppId && nextSecret
      ? await UIReviewFeishu.saveConfig(nextAppId, nextSecret)
      : await UIReviewFeishu.testConfig();
    configured = true;
    updatePrimaryButton();
    appId.value = "";
    appSecret.value = "";
    showStatus({ connected: true, text: `App connected · ${result.appId}` });
    appId.placeholder = result.appId;
    showMessage("App connected. Before sending, add this app as a collaborator with edit access to the destination document.", "success");
  } catch (error) {
    showStatus({ error: true, text: "Connection failed" });
    showMessage(error.message || "Feishu app connection failed. Check your credentials and try again.", "error");
  } finally {
    setBusy(false);
  }
});

clearConfigButton.addEventListener("click", async () => {
  if (!confirm("Delete the saved Feishu credentials and document list?")) return;

  setBusy(true);
  showMessage("");
  try {
    await UIReviewFeishu.clearConfig();
    configured = false;
    updatePrimaryButton();
    appId.value = "";
    appSecret.value = "";
    appId.placeholder = "App ID";
    showStatus({ text: "Waiting to connect" });
    showMessage("Local configuration deleted.", "success");
  } catch (error) {
    showMessage(error.message || "Could not delete the configuration. Try again.", "error");
  } finally {
    setBusy(false);
  }
});

refresh().catch(error => {
  showStatus({ error: true, text: "Could not read connection status" });
  showMessage(error.message, "error");
});
