const toolbarDock = document.querySelector(".toolbar-dock");
const siteHeader = document.querySelector(".site-header");
const overlayHost = document.querySelector("#uireview-overlay-host");
const demoCursor = document.querySelector(".demo-cursor");
const inspectGuide = document.querySelector(".inspect-guide");
const heroCopy = document.querySelector(".hero-copy");
const heroDescription = heroCopy?.querySelector("p");
const features = document.querySelector(".features");

let toolbar;
let dockAnimation;
let scrollFrame;
let isDocked = false;
let demoRun = 0;
let demoActive = false;
let demoStopped = false;
let inspectGuideVisible = false;
let inspectGuideTimer;
let lastScrollY = window.scrollY;
let cursorPoint = { x: -40, y: -40 };
const demoTakeoverEvents = new Set(["mousedown", "pointerdown", "keydown", "touchstart", "wheel"]);

const easeInOutQuad = (progress) =>
  progress < 0.5 ? 2 * progress * progress : 1 - ((-2 * progress + 2) ** 2) / 2;

const easeInOutCubic = (progress) =>
  progress < 0.5 ? 4 * progress ** 3 : 1 - ((-2 * progress + 2) ** 3) / 2;

function setCursorPoint(point) {
  cursorPoint = point;
  demoCursor.style.transform = `translate3d(${point.x - 2}px, ${point.y - 2}px, 0)`;
}

const wait = (duration, run) =>
  new Promise((resolve) => {
    const started = performance.now();
    const tick = (now) => {
      if (run !== demoRun || demoStopped) return resolve(false);
      if (now - started >= duration) return resolve(true);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

function targetPoint(target, xRatio = 0.5, yRatio = 0.5) {
  const rect = target.getBoundingClientRect();
  return {
    x: rect.left + rect.width * xRatio,
    y: rect.top + rect.height * yRatio,
  };
}

function dispatchMouseMove(point) {
  const target = document.elementFromPoint(point.x, point.y);
  if (!target || target === document.body || target === document.documentElement || demoCursor.contains(target)) return;
  target.dispatchEvent(
    new MouseEvent("mousemove", {
      bubbles: true,
      clientX: point.x,
      clientY: point.y,
      view: window,
    }),
  );
}

async function moveDemoCursor(target, options = {}, run) {
  if (!target || run !== demoRun || demoStopped) return false;
  window.__UIREVIEW_DEMO__?.show?.();
  const point = targetPoint(target, options.xRatio ?? 0.5, options.yRatio ?? 0.5);
  const from = cursorPoint;
  const duration = options.duration ?? 760;
  const control = {
    x: (from.x + point.x) / 2 + (Math.random() * 140 - 70),
    y: (from.y + point.y) / 2 + (Math.random() * 140 - 70),
  };
  demoCursor.classList.add("is-visible");
  return new Promise((resolve) => {
    const started = performance.now();
    const frame = (now) => {
      if (run !== demoRun || demoStopped) return resolve(false);
      const progress = Math.min(1, (now - started) / duration);
      const eased = easeInOutQuad(progress);
      const inverse = 1 - eased;
      const current = {
        x: inverse * inverse * from.x + 2 * inverse * eased * control.x + eased * eased * point.x,
        y: inverse * inverse * from.y + 2 * inverse * eased * control.y + eased * eased * point.y,
      };
      setCursorPoint(current);
      dispatchMouseMove(current);
      if (progress < 1) requestAnimationFrame(frame);
      else resolve(true);
    };
    requestAnimationFrame(frame);
  });
}

async function clickWithDemoCursor(target, run) {
  if (!target || run !== demoRun || demoStopped) return false;
  if (!(await wait(300, run))) return false;
  demoCursor.classList.remove("is-pressed", "is-rippling");
  void demoCursor.offsetWidth;
  demoCursor.classList.add("is-pressed", "is-rippling");

  const eventOptions = {
    bubbles: true,
    clientX: cursorPoint.x,
    clientY: cursorPoint.y,
    button: 0,
    view: window,
  };
  target.dispatchEvent(new PointerEvent("pointerdown", eventOptions));
  target.dispatchEvent(new MouseEvent("mousedown", eventOptions));
  target.dispatchEvent(new MouseEvent("click", eventOptions));
  await wait(180, run);
  if (run !== demoRun || demoStopped) return false;
  target.dispatchEvent(new PointerEvent("pointerup", eventOptions));
  target.dispatchEvent(new MouseEvent("mouseup", eventOptions));
  demoCursor.classList.remove("is-pressed");
  if (!(await wait(150, run))) return false;
  if (!(await wait(120, run))) return false;
  demoCursor.classList.remove("is-rippling");
  return wait(80, run);
}

function stopFeatureDemo() {
  if (!demoActive && demoStopped) return;
  demoStopped = true;
  demoActive = false;
  demoRun += 1;
  demoCursor.getAnimations().forEach((animation) => animation.cancel());
  demoCursor.classList.remove("is-visible", "is-pressed", "is-rippling");
  hideInspectGuide(true);
  window.__UIREVIEW_DEMO__?.hide?.();
}

function positionInspectGuide() {
  if (!inspectGuideVisible || !toolbar || !inspectGuide) return;
  const inspectButton = toolbar.querySelector('[data-mode="inspect"]');
  if (!inspectButton) return;
  const rect = inspectButton.getBoundingClientRect();
  inspectGuide.style.left = `${rect.left + rect.width / 2}px`;
  inspectGuide.style.top = `${rect.top}px`;
}

function showInspectGuide() {
  if (!inspectGuide || !toolbar || demoStopped) return;
  clearTimeout(inspectGuideTimer);
  inspectGuideVisible = true;
  inspectGuide.hidden = false;
  inspectGuide.setAttribute("aria-hidden", "false");
  positionInspectGuide();
  requestAnimationFrame(() => {
    if (inspectGuideVisible) inspectGuide.classList.add("is-visible");
  });
}

function hideInspectGuide(immediate = false) {
  if (!inspectGuide) return;
  clearTimeout(inspectGuideTimer);
  inspectGuideVisible = false;
  inspectGuide.classList.remove("is-visible");
  inspectGuide.setAttribute("aria-hidden", "true");
  if (immediate) {
    inspectGuide.hidden = true;
    return;
  }
  inspectGuideTimer = setTimeout(() => {
    if (!inspectGuideVisible) inspectGuide.hidden = true;
  }, 280);
}

const scrollToY = (targetY, duration, run) =>
  new Promise((resolve) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const started = performance.now();
    let finished = false;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      document.documentElement.classList.remove("demo-controlled-scroll");
      resolve(result);
    };
    document.documentElement.classList.add("demo-controlled-scroll");
    const frame = (now) => {
      if (run !== demoRun || demoStopped) return finish(false);
      const progress = Math.min(1, (now - started) / duration);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(frame);
      else finish(true);
    };
    requestAnimationFrame(frame);
  });

function featureTarget(name, selector) {
  const row = [...document.querySelectorAll(".feature-row")].find(
    (item) => item.querySelector("h3")?.textContent.trim() === name,
  );
  return row?.querySelector(selector);
}

async function runFeatureDemo() {
  if (
    demoStopped ||
    !toolbar ||
    !demoCursor ||
    window.innerWidth < 760 ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const inspectButton = overlayHost.shadowRoot.querySelector('[data-mode="inspect"]');
  const title = document.querySelector("#hero-title");
  const description = document.querySelector(".hero-copy p");
  const inspectName = featureTarget("Inspect", "h3");
  const inspectKey = featureTarget("Inspect", "kbd");
  const captureName = featureTarget("Screenshot Feedback", "h3");
  const sendName = featureTarget("Send", "h3");
  if (!inspectButton || !title || !description || !inspectName || !inspectKey || !captureName || !sendName) return;

  demoActive = true;
  const run = ++demoRun;
  const start = targetPoint(inspectButton, 1.7, 1.9);
  setCursorPoint(start);

  if (!(await wait(1100, run))) return;
  demoCursor.classList.add("is-visible");
  if (!(await wait(600, run))) return;
  if (!(await moveDemoCursor(inspectButton, { duration: 800 }, run))) return;
  if (!(await clickWithDemoCursor(inspectButton, run))) return;
  if (!(await moveDemoCursor(title, { xRatio: 0.7, yRatio: 0.34, duration: 900 }, run))) return;
  if (!(await wait(1700, run))) return;
  if (!(await moveDemoCursor(description, { xRatio: 0.28, yRatio: 0.55, duration: 700 }, run))) return;
  if (!(await wait(1300, run))) return;

  window.__UIREVIEW_DEMO__?.hide?.();
  document.body.classList.add("demo-act2");
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const secondActY = Math.min(maxScroll, window.innerHeight);
  if (!(await scrollToY(secondActY, 1100, run))) return;
  if (!(await wait(450, run))) return;

  if (!(await moveDemoCursor(inspectName, { duration: 800 }, run))) return;
  if (!(await wait(1400, run))) return;
  if (!(await moveDemoCursor(inspectKey, { duration: 500 }, run))) return;
  if (!(await wait(1100, run))) return;
  if (!(await moveDemoCursor(captureName, { duration: 650 }, run))) return;
  if (!(await wait(1400, run))) return;
  if (!(await moveDemoCursor(sendName, { duration: 600 }, run))) return;
  if (!(await wait(1300, run))) return;
  if (!(await moveDemoCursor(inspectButton, { duration: 900 }, run))) return;
  if (!(await clickWithDemoCursor(inspectButton, run))) return;

  demoCursor.classList.remove("is-visible");
  await wait(300, run);
  demoActive = false;
  showInspectGuide();
}

function handleRealInteraction(event) {
  if (
    inspectGuideVisible &&
    event.isTrusted &&
    demoTakeoverEvents.has(event.type)
  ) {
    hideInspectGuide();
  }
  if (demoStopped && event.isTrusted && (event.type === "mousemove" || event.type === "pointermove")) {
    window.__UIREVIEW_DEMO__?.show?.();
    return;
  }
  if (!demoActive || !event.isTrusted || !demoTakeoverEvents.has(event.type)) return;
  stopFeatureDemo();
}

function setDemoToolbarGeometry() {
  if (!toolbar) return;

  toolbar.style.animation = "none";
  toolbar.style.cursor = "default";
  toolbar.style.zIndex = "99";
  toolbar.style.width = "max-content";

  if (isDocked) {
    toolbar.style.position = "fixed";
    toolbar.style.top = "auto";
    toolbar.style.right = "0";
    toolbar.style.bottom = "32px";
    toolbar.style.left = "0";
    toolbar.style.margin = "auto";
    return;
  }

  toolbar.style.position = "fixed";
  toolbar.style.right = "auto";
  toolbar.style.bottom = "auto";
  toolbar.style.left = "0";
  toolbar.style.margin = "0";
  const dockRect = toolbarDock.getBoundingClientRect();
  const width = toolbar.offsetWidth;
  toolbar.style.top = `${dockRect.top}px`;
  toolbar.style.left = `${dockRect.left + (dockRect.width - width) / 2}px`;
}

function positionUIReviewLayer(layer, anchor, { gap = 8, align = "left" } = {}) {
  if (!layer || layer.hidden || !anchor) return;

  const edge = 8;
  const width = layer.offsetWidth;
  const height = layer.offsetHeight;
  const preferredLeft = align === "center" ? anchor.left + (anchor.width - width) / 2 : anchor.left;
  const left = Math.min(Math.max(preferredLeft, edge), Math.max(edge, window.innerWidth - width - edge));
  const below = anchor.bottom + gap;
  const above = anchor.top - height - gap;
  const top =
    below + height <= window.innerHeight - edge
      ? below
      : above >= edge
        ? above
        : Math.min(Math.max(anchor.top - height / 2, edge), Math.max(edge, window.innerHeight - height - edge));

  layer.style.left = `${left}px`;
  layer.style.top = `${top}px`;
}

function syncUIReviewLayerGeometry() {
  const shadow = overlayHost?.shadowRoot;
  if (!shadow || !toolbar) return;

  positionInspectGuide();

  const menu = shadow.querySelector(".tool-menu:not([hidden])");
  if (menu) {
    const menuName = menu.dataset.menu;
    const trigger =
      menuName === "main"
        ? toolbar.querySelector('[data-menu-trigger="main"]')
        : toolbar.querySelector(`.tool-arrow[data-menu="${menuName}"]`)?.closest(".tool-group");
    positionUIReviewLayer(menu, trigger?.getBoundingClientRect());
  }

  const finder = shadow.querySelector(".selector-finder:not([hidden])");
  const inspectGroup = toolbar.querySelector('[data-mode="inspect"]')?.closest(".tool-group");
  positionUIReviewLayer(finder, inspectGroup?.getBoundingClientRect());

  const settings = shadow.querySelector(".settings:not([hidden])");
  const settingsTrigger = toolbar.querySelector('[data-menu-trigger="main"]');
  positionUIReviewLayer(settings, settingsTrigger?.getBoundingClientRect());

  const colorPanel = shadow.querySelector(".color-panel:not([hidden])");
  const colorTrigger = toolbar.querySelector('[data-mode="eyedropper"]')?.closest(".tool-group");
  positionUIReviewLayer(colorPanel, colorTrigger?.getBoundingClientRect());
}

function followToolbarAnimation(animation) {
  const update = () => {
    if (dockAnimation !== animation) return;
    syncUIReviewLayerGeometry();
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function setToolbarDocked(nextDocked, animate = true) {
  if (!toolbar || nextDocked === isDocked) return;

  const firstRect = toolbar.getBoundingClientRect();
  const previousAnimation = dockAnimation;
  dockAnimation = undefined;
  previousAnimation?.cancel();
  toolbar.getAnimations().forEach((animation) => animation.cancel());

  isDocked = nextDocked;
  document.body.classList.toggle("toolbar-docked", isDocked);
  toolbar.classList.toggle("website-docked", isDocked);
  setDemoToolbarGeometry();

  if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    syncUIReviewLayerGeometry();
    return;
  }

  const lastRect = toolbar.getBoundingClientRect();
  const deltaX = firstRect.left - lastRect.left;
  const deltaY = firstRect.top - lastRect.top;
  const animation = toolbar.animate(
    [
      { transform: `translate(${deltaX}px, ${deltaY}px)` },
      { transform: "translate(0, 0)" },
    ],
    {
      duration: 420,
      easing: "cubic-bezier(0.32, 0.72, 0, 1)",
      fill: "both",
    },
  );

  dockAnimation = animation;
  syncUIReviewLayerGeometry();
  followToolbarAnimation(animation);
  animation.addEventListener("finish", () => {
    if (dockAnimation !== animation) return;
    dockAnimation = undefined;
    animation.cancel();
    syncUIReviewLayerGeometry();
  });
}

function updateScrollState() {
  scrollFrame = undefined;
  const currentScrollY = window.scrollY;
  const scrollDelta = currentScrollY - lastScrollY;
  const hasPassedHeroDescription = heroDescription
    ? heroDescription.getBoundingClientRect().bottom <= siteHeader.getBoundingClientRect().top
    : false;

  siteHeader.classList.toggle("is-scrolled", currentScrollY > 0);
  if (!hasPassedHeroDescription || scrollDelta < 0) {
    siteHeader.classList.remove("is-compact");
  } else if (scrollDelta > 0) {
    siteHeader.classList.add("is-compact");
  }
  lastScrollY = currentScrollY;

  if (currentScrollY < window.innerHeight * 0.4) document.body.classList.remove("demo-act2");

  if (!toolbar) return;
  if (!isDocked && window.scrollY > 32) {
    setToolbarDocked(true);
  } else if (isDocked && window.scrollY <= 8) {
    setToolbarDocked(false);
  } else if (!isDocked) {
    setDemoToolbarGeometry();
    syncUIReviewLayerGeometry();
  }
}

function requestScrollUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollState);
}

function handleWheel(event) {
  handleRealInteraction(event);
}

function syncToolbarNode() {
  const nextToolbar = overlayHost?.shadowRoot?.querySelector(".toolbar, .toolbar-logo");
  if (!nextToolbar) return;

  if (nextToolbar !== toolbar) {
    dockAnimation?.cancel();
    dockAnimation = undefined;
    toolbar = nextToolbar;
  }
  setDemoToolbarGeometry();
  syncUIReviewLayerGeometry();
  document.body.classList.toggle(
    "inspecting",
    overlayHost.shadowRoot.querySelector('[data-mode="inspect"]')?.classList.contains("active") ?? false,
  );
}

function startUIReviewDemo() {
  if (!overlayHost?.shadowRoot || !window.__UIREVIEW_DEMO__) return;

  overlayHost.style.visibility = "hidden";
  overlayHost.style.zIndex = "999";
  window.__UIREVIEW_DEMO__.toggle();
  const demoStyles = document.createElement("style");
  demoStyles.textContent = `
    #app.website-demo-hide-inspection .box,
    #app.website-demo-hide-inspection .label,
    #app.website-demo-hide-inspection .measure-layer,
    #app.website-demo-hide-inspection .box-model-layer,
    #app.website-demo-hide-inspection .layout-children-layer,
    #app.website-demo-hide-inspection .selection-guide-layer,
    #app.website-demo-hide-inspection > .panel:not(.pinned) { display: none !important; }
    #app > .hint { display: none !important; }
    @media (max-width: 360px) { .toolbar { gap: 2px; } }
  `;
  overlayHost.shadowRoot.appendChild(demoStyles);
  toolbar = overlayHost.shadowRoot.querySelector(".toolbar");
  if (!toolbar) return;

  setDemoToolbarGeometry();
  new MutationObserver(syncToolbarNode).observe(overlayHost.shadowRoot, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "hidden"],
  });
  overlayHost.style.visibility = "";
  toolbarDock.dataset.ready = "true";
  runFeatureDemo();
}

window.addEventListener("mousemove", handleRealInteraction, { capture: true, passive: true });
window.addEventListener("mousedown", handleRealInteraction, { capture: true, passive: true });
window.addEventListener("pointermove", handleRealInteraction, { capture: true, passive: true });
window.addEventListener("pointerdown", handleRealInteraction, { capture: true, passive: true });
window.addEventListener("wheel", handleWheel, { capture: true, passive: true });
window.addEventListener("keydown", handleRealInteraction, { capture: true });
window.addEventListener("touchstart", handleRealInteraction, { capture: true, passive: true });
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
window.addEventListener("uireview-demo-install", () => {
  window.location.href = "https://chromewebstore.google.com/detail/uireview/aciphknkafonjcakpmkmmgdpeejcnjda";
});

setTimeout(() => document.body.classList.add("entered"), 900);
document.fonts?.ready.then(requestScrollUpdate);
startUIReviewDemo();
