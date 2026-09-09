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

const setBusy = value => {
  appId.disabled = value;
  appSecret.disabled = value;
  continueButton.disabled = value;
  clearConfigButton.disabled = value;
  continueLabel.textContent = value ? "Connecting..." : "Continue";
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
  showStatus({ connected: configured, text: configured ? `应用已连接 · ${status.appId}` : "等待连接应用" });
  appId.placeholder = configured ? status.appId : "App ID";
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const nextAppId = appId.value.trim();
  const nextSecret = appSecret.value.trim();

  if ((nextAppId && !nextSecret) || (!nextAppId && nextSecret)) {
    showMessage("请同时填写 App ID 和 App Secret。", "error");
    (nextAppId ? appSecret : appId).focus();
    return;
  }
  if (!nextAppId && !nextSecret && !configured) {
    showMessage("请输入飞书应用的 App ID 和 App Secret。", "error");
    appId.focus();
    return;
  }

  setBusy(true);
  showMessage("");
  showStatus({ text: "正在连接应用..." });
  try {
    const result = nextAppId && nextSecret
      ? await UIReviewFeishu.saveConfig(nextAppId, nextSecret)
      : await UIReviewFeishu.testConfig();
    configured = true;
    appId.value = "";
    appSecret.value = "";
    showStatus({ connected: true, text: `应用已连接 · ${result.appId}` });
    appId.placeholder = result.appId;
    showMessage("连接成功，可以关闭此页面并开始使用 UIReview。", "success");
  } catch (error) {
    showStatus({ error: true, text: "连接失败" });
    showMessage(error.message || "飞书应用连接失败，请检查凭证后重试。", "error");
  } finally {
    setBusy(false);
  }
});

clearConfigButton.addEventListener("click", async () => {
  if (!confirm("删除飞书凭证和已保存的文档列表？")) return;

  setBusy(true);
  showMessage("");
  try {
    await UIReviewFeishu.clearConfig();
    configured = false;
    appId.value = "";
    appSecret.value = "";
    appId.placeholder = "App ID";
    showStatus({ text: "等待连接应用" });
    showMessage("本地配置已删除。", "success");
  } catch (error) {
    showMessage(error.message || "删除配置失败，请重试。", "error");
  } finally {
    setBusy(false);
  }
});

refresh().catch(error => {
  showStatus({ error: true, text: "无法读取连接状态" });
  showMessage(error.message, "error");
});
