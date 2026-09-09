globalThis.UIReviewFeishu = (() => {
  const API = "https://open.feishu.cn/open-apis";
  const CONFIG_KEY = "uiReviewFeishuConfig";
  const configuredSheets = new Set();
  let tokenCache = { value: "", expiresAt: 0, appId: "" };

  const getConfig = async () => (await chrome.storage.local.get({ [CONFIG_KEY]: null }))[CONFIG_KEY];
  const maskAppId = value => !value ? "" : value.length < 10 ? `${value.slice(0, 3)}…` : `${value.slice(0, 7)}…${value.slice(-4)}`;
  const status = async () => { const saved = await getConfig(); return { configured: Boolean(saved?.appId && saved?.appSecret), appId: maskAppId(saved?.appId || "") }; };

  async function tenantToken(candidate) {
    const saved = candidate || await getConfig();
    if (!saved?.appId || !saved?.appSecret) throw new Error("请先在 UIReview 设置中连接飞书应用。");
    if (tokenCache.value && tokenCache.appId === saved.appId && Date.now() < tokenCache.expiresAt) return tokenCache.value;
    const response = await fetch(`${API}/auth/v3/tenant_access_token/internal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: saved.appId, app_secret: saved.appSecret })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.code !== 0 || !data.tenant_access_token) throw new Error(data.msg || "飞书应用认证失败");
    tokenCache = { value: data.tenant_access_token, appId: saved.appId, expiresAt: Date.now() + Math.max(60, Number(data.expire || 7200) - 300) * 1000 };
    return tokenCache.value;
  }

  async function saveConfig(appId, appSecret) {
    appId = String(appId || "").trim();
    appSecret = String(appSecret || "").trim();
    if (!/^cli_[A-Za-z0-9_-]+$/.test(appId)) throw new Error("请输入正确的飞书 App ID（以 cli_ 开头）");
    if (!appSecret) throw new Error("请输入飞书 App Secret");
    tokenCache = { value: "", expiresAt: 0, appId: "" };
    await tenantToken({ appId, appSecret });
    await chrome.storage.local.set({ [CONFIG_KEY]: { appId, appSecret } });
    return { configured: true, appId: maskAppId(appId) };
  }

  async function testConfig() {
    const saved = await getConfig();
    tokenCache = { value: "", expiresAt: 0, appId: "" };
    await tenantToken(saved);
    return { configured: true, appId: maskAppId(saved.appId) };
  }

  async function clearConfig() {
    tokenCache = { value: "", expiresAt: 0, appId: "" };
    configuredSheets.clear();
    await chrome.storage.local.remove([CONFIG_KEY, "uiReviewDocuments", "uiReviewSelectedDocumentId"]);
    return { configured: false };
  }

  async function feishu(pathname, options = {}) {
    const token = await tenantToken();
    const response = await fetch(`${API}${pathname}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.code !== 0) {
      const error = new Error(data.msg || `飞书请求失败 (${response.status})`);
      error.feishuCode = data.code;
      error.requestId = response.headers.get("x-tt-logid") || response.headers.get("x-request-id") || "";
      error.endpoint = pathname.split("?", 1)[0];
      throw error;
    }
    return data.data || {};
  }

  function documentReference(input) {
    const value = String(input || "").trim();
    const docx = value.match(/\/docx\/([A-Za-z0-9_-]+)/);
    if (docx) return { type: "docx", token: docx[1], url: value };
    const sheets = value.match(/\/sheets\/([A-Za-z0-9_-]+)/);
    if (sheets) {
      let sheetId = "";
      try { sheetId = new URL(value).searchParams.get("sheet") || ""; } catch {}
      return { type: "sheet", token: sheets[1], sheetId, url: value };
    }
    const wiki = value.match(/\/wiki\/([A-Za-z0-9_-]+)/);
    if (wiki) return { type: "wiki", token: wiki[1], url: value };
    if (/^[A-Za-z0-9_-]{8,}$/.test(value)) return { type: "docx", token: value, url: "" };
    throw new Error("请输入飞书 /docx/、/sheets/ 或 /wiki/ 链接");
  }

  async function validateDocument(input) {
    const reference = documentReference(input);
    let id = reference.token;
    let type = reference.type;
    let sheetId = reference.sheetId || "";
    if (type === "wiki") {
      try {
        const data = await feishu(`/wiki/v2/spaces/get_node?token=${encodeURIComponent(reference.token)}`);
        const node = data.node;
        if (!node?.obj_token) throw new Error("无法解析这个飞书 Wiki 文档");
        if (!["docx", "sheet"].includes(node.obj_type)) throw new Error(`当前 Wiki 节点类型为 ${node.obj_type || "未知"}，请选择飞书文档或电子表格`);
        id = node.obj_token;
        type = node.obj_type;
      } catch (error) {
        if (error.feishuCode === 99991672) error.message = "Wiki 链接需要 wiki:node:read 权限，请添加权限并发布应用版本。";
        else if (error.feishuCode === 131005 || /not found/i.test(error.message)) error.message = "飞书应用无法获取这个 Wiki 文档。请确认链接有效、文档与应用属于同一企业，并将应用加入文档协作者。";
        throw error;
      }
    }
    if (type === "sheet") {
      const [spreadsheetData, sheetsData] = await Promise.all([
        feishu(`/sheets/v3/spreadsheets/${encodeURIComponent(id)}`),
        feishu(`/sheets/v3/spreadsheets/${encodeURIComponent(id)}/sheets/query`)
      ]);
      const sheets = (sheetsData.sheets || []).filter(sheet => !sheet.hidden);
      const selected = sheets.find(sheet => sheet.sheet_id === sheetId) || sheets.sort((a, b) => (a.index || 0) - (b.index || 0))[0];
      if (!selected?.sheet_id) throw new Error("电子表格中没有可用工作表");
      return { id, type: "sheet", sheetId: selected.sheet_id, sheetName: selected.title || "Sheet1", rowCount: selected.grid_properties?.row_count || 200, name: `${spreadsheetData.spreadsheet?.title || "未命名电子表格"} · ${selected.title || "Sheet1"}`, url: reference.url || spreadsheetData.spreadsheet?.url || `https://feishu.cn/sheets/${id}` };
    }
    const data = await feishu(`/docx/v1/documents/${encodeURIComponent(id)}`);
    return { id, type: "docx", name: data.document?.title || "未命名飞书文档", url: reference.url || `https://feishu.cn/docx/${id}` };
  }

  function screenshotBytes(dataUrl) {
    if (!dataUrl?.startsWith("data:image/png;base64,")) throw new Error("需要 PNG 截图");
    const binary = atob(dataUrl.split(",", 2)[1]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }

  function textBlock(content, heading = false) {
    const key = heading ? "heading2" : "text";
    return { block_type: heading ? 4 : 2, [key]: { elements: [{ text_run: { content, text_element_style: {} } }], style: {} } };
  }

  async function uploadScreenshot(image, parentType, parentNode) {
    const form = new FormData();
    form.append("file_name", `uireview-${Date.now()}.png`);
    form.append("parent_type", parentType);
    form.append("parent_node", parentNode);
    form.append("size", String(image.byteLength));
    form.append("file", new Blob([image], { type: "image/png" }), "screenshot.png");
    return feishu("/drive/v1/medias/upload_all", { method: "POST", body: form });
  }

  async function writeSheetValues(destination, range, values) {
    return feishu(`/sheets/v2/spreadsheets/${encodeURIComponent(destination.id)}/values`, { method: "PUT", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ valueRange: { range: `${destination.sheetId}!${range}`, values } }) });
  }

  async function writeSheetImage(destination, range, image) {
    return feishu(`/sheets/v2/spreadsheets/${encodeURIComponent(destination.id)}/values_image`, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ range: `${destination.sheetId}!${range}`, image: Array.from(image), name: `uireview-${Date.now()}.png` }) });
  }

  async function setSheetDimension(destination, majorDimension, startIndex, endIndex, fixedSize) {
    return feishu(`/sheets/v2/spreadsheets/${encodeURIComponent(destination.id)}/dimension_range`, { method: "PUT", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ dimension: { sheetId: destination.sheetId, majorDimension, startIndex, endIndex }, dimensionProperties: { visible: true, fixedSize } }) });
  }

  async function configureAcceptanceSheet(destination) {
    const key = `${destination.id}:${destination.sheetId}`;
    if (configuredSheets.has(key)) return;
    const rowCount = Math.max(200, destination.rowCount || 200);
    try {
      await writeSheetValues(destination, "A1:F1", [["模块", "问题截图", "问题描述", "开发负责人", "状态", "备注"]]);
      for (const [index, size] of [[1, 160], [2, 240], [3, 480], [4, 160], [5, 160], [6, 480]]) await setSheetDimension(destination, "COLUMNS", index, index, size);
      await setSheetDimension(destination, "ROWS", 1, rowCount, 64);
      await feishu(`/sheets/v2/spreadsheets/${encodeURIComponent(destination.id)}/dataValidation`, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ range: `${destination.sheetId}!E2:E${rowCount}`, dataValidationType: "list", dataValidation: { conditionValues: ["待修改", "已修改待验收", "验收通过", "暂不修改"], options: { multipleValues: false, highlightValidData: true, colors: ["#F59E0B", "#335cff", "#1fc16b", "#9CA3AF"] } } }) });
      configuredSheets.add(key);
    } catch (error) { error.stage = "configure_acceptance_sheet"; throw error; }
  }

  const a1LastRow = range => { const match = String(range || "").match(/![A-Z]+(\d+)(?::[A-Z]+(\d+))?$/i); return match ? Number(match[2] || match[1]) : 1; };

  async function appendSheetFeedback(body, destination) {
    await configureAcceptanceSheet(destination);
    const appended = await feishu(`/sheets/v2/spreadsheets/${encodeURIComponent(destination.id)}/values_append?insertDataOption=INSERT_ROWS`, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ valueRange: { range: `${destination.sheetId}!A2:F2`, values: [[String(body.pageTitle || "Untitled"), "", String(body.question || "").trim(), "", "待修改", String(body.note || "").trim()]] } }) });
    const row = appended.updates?.updatedRange ? a1LastRow(appended.updates.updatedRange) : a1LastRow(appended.tableRange) + 1;
    try { await writeSheetImage(destination, `B${row}:B${row}`, screenshotBytes(body.screenshotDataUrl)); }
    catch (error) { error.stage = "write_sheet_cell_image"; throw error; }
    return { documentId: destination.id, documentType: "sheet", documentUrl: destination.url, sheetId: destination.sheetId, row };
  }

  async function appendFeedback(body) {
    const question = String(body.question || "").trim();
    if (!question) throw new Error("Question is required");
    screenshotBytes(body.screenshotDataUrl);
    const destination = await validateDocument(body.documentUrl || body.documentId);
    if (destination.type === "sheet") return appendSheetFeedback(body, destination);
    const documentId = destination.id;
    const now = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", dateStyle: "medium", timeStyle: "medium" }).format(new Date());
    const children = [textBlock("UIReview Feedback", true), textBlock(question), textBlock(`Page: ${String(body.pageTitle || "Untitled")}`), textBlock(`URL: ${String(body.pageUrl || "")}`), textBlock(`Viewport: ${String(body.viewport || "")}`), textBlock(`Submitted: ${now}`), { block_type: 27, image: {} }];
    let created;
    try { created = await feishu(`/docx/v1/documents/${encodeURIComponent(documentId)}/blocks/${encodeURIComponent(documentId)}/children?document_revision_id=-1`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ children, index: -1 }) }); }
    catch (error) { error.stage = "create_document_blocks"; if (error.feishuCode === 1770032 || /forbidden/i.test(error.message)) error.message = "目标文档未授予应用编辑权限，请将自建应用加入文档协作者并设为可编辑。"; throw error; }
    const imageBlock = (created.children || []).find(block => block.block_type === 27);
    if (!imageBlock?.block_id) throw new Error("飞书没有返回图片块");
    let uploaded;
    try { uploaded = await uploadScreenshot(screenshotBytes(body.screenshotDataUrl), "docx_image", imageBlock.block_id); }
    catch (error) { error.stage = "upload_screenshot"; throw error; }
    if (!uploaded?.file_token) throw new Error("飞书图片上传未返回文件 Token");
    try { await feishu(`/docx/v1/documents/${encodeURIComponent(documentId)}/blocks/${encodeURIComponent(imageBlock.block_id)}?document_revision_id=-1`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ replace_image: { token: uploaded.file_token } }) }); }
    catch (error) { error.stage = "attach_screenshot_to_block"; throw error; }
    return { documentId, documentUrl: body.documentUrl || `https://feishu.cn/docx/${documentId}` };
  }

  return { status, saveConfig, testConfig, clearConfig, validateDocument, appendFeedback };
})();
