(() => {
  const messageListeners = [];
  const storageKey = "uireview-demo-documents";

  function readDocuments() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return {
        documents: Array.isArray(saved.documents) ? saved.documents : [],
        selectedDocumentId: String(saved.selectedDocumentId || ""),
      };
    } catch {
      return { documents: [], selectedDocumentId: "" };
    }
  }

  async function captureViewport() {
    if (typeof window.html2canvas !== "function") {
      return { ok: false, error: "Screenshot preview is unavailable in this browser." };
    }

    try {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const viewportScrollX = window.scrollX;
      const viewportScrollY = window.scrollY;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const fixedHeader = document.querySelector(".site-header");
      const fixedHeaderRect = fixedHeader?.getBoundingClientRect();

      const canvas = await window.html2canvas(document.documentElement, {
        backgroundColor: "#ffffff",
        scale,
        useCORS: true,
        logging: false,
        x: 0,
        y: 0,
        scrollX: -viewportScrollX,
        scrollY: -viewportScrollY,
        width: viewportWidth,
        height: viewportHeight,
        windowWidth: viewportWidth,
        windowHeight: viewportHeight,
        onclone(clonedDocument) {
          const clonedHeader = clonedDocument.querySelector(".site-header");
          const clonedCursor = clonedDocument.querySelector(".demo-cursor");
          if (clonedHeader) clonedHeader.style.visibility = "hidden";
          if (clonedCursor) clonedCursor.style.visibility = "hidden";
        },
      });

      if (fixedHeader && fixedHeaderRect?.width && fixedHeaderRect?.height) {
        const headerCanvas = await window.html2canvas(fixedHeader, {
          backgroundColor: null,
          scale,
          useCORS: true,
          logging: false,
        });
        const canvasScale = canvas.width / viewportWidth;
        canvas
          .getContext("2d")
          ?.drawImage(headerCanvas, fixedHeaderRect.left * canvasScale, fixedHeaderRect.top * canvasScale);
      }

      return { ok: true, dataUrl: canvas.toDataURL("image/png") };
    } catch (error) {
      return { ok: false, error: error?.message || "Unable to capture this page." };
    }
  }

  const runtime = {
    lastError: null,
    getURL(path) {
      return `UIReview/${path}`;
    },
    onMessage: {
      addListener(listener) {
        messageListeners.push(listener);
      },
    },
    async sendMessage(message) {
      if (message?.type === "capture-visible-tab") return captureViewport();
      if (message?.type === "document-state") return { ok: true, ...readDocuments() };
      if (message?.type === "save-document-state") {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            documents: Array.isArray(message.documents) ? message.documents : [],
            selectedDocumentId: String(message.selectedDocumentId || ""),
          }),
        );
        return { ok: true };
      }
      if (message?.type === "feishu-status") return { ok: true, configured: false, demo: true };
      if (message?.type === "open-feishu-settings") {
        window.dispatchEvent(new CustomEvent("uireview-demo-install"));
        return { ok: true };
      }
      if (message?.type === "feishu-api-request") {
        return { ok: false, error: "Install UIReview to connect and send feedback to Feishu." };
      }
      return { ok: false, error: "This extension-only action is unavailable in the web demo." };
    },
  };

  window.chrome = { ...(window.chrome || {}), runtime };
  window.__UIREVIEW_DEMO__ = {
    locked: true,
    manageToolbarGeometry: true,
    toggle() {
      messageListeners.forEach((listener) => listener({ type: "toggle" }, {}, () => {}));
    },
    hide() {
      document.querySelector("#uireview-overlay-host")?.shadowRoot?.querySelector("#app")?.classList.add("website-demo-hide-inspection");
    },
    show() {
      document.querySelector("#uireview-overlay-host")?.shadowRoot?.querySelector("#app")?.classList.remove("website-demo-hide-inspection");
    },
  };

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") return;
      const shadow = document.querySelector("#uireview-overlay-host")?.shadowRoot;
      const toolbar = shadow?.querySelector(".toolbar");
      if (!toolbar) return;
      const hasOpenLayer = shadow.querySelector(
        '[data-mode].active, .tool-menu:not([hidden]), .settings:not([hidden]), .selector-finder:not([hidden]), .feedback-backdrop:not([hidden]), .capture-overlay:not([hidden])',
      );
      if (hasOpenLayer) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    { capture: true },
  );
})();
