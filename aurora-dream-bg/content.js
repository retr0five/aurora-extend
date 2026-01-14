/**
 * Aurora Dream Background - Content Script (Fixed for React SPAs like grok.com)
 * Injects beautiful aurora-style gradient background for AI chat websites
 *
 * Strategy: Insert as last child of body after React mounts, force body/html transparency,
 * use aggressive positioning with !important, and monitor for removal via MutationObserver.
 */

// Default configuration
const DEFAULT_CONFIG = {
  enabled: true,
  animationSpeed: 1.0,
  blur: 120,
  opacity: 100,
  colors: {
    color1: 'rgba(138, 43, 226, 0.15)',    // Purple
    color2: 'rgba(0, 206, 209, 0.12)',     // Cyan/Teal
    color3: 'rgba(255, 105, 180, 0.18)',   // Magenta/Pink
    color4: 'rgba(50, 205, 50, 0.10)',     // Soft Green
    color5: 'rgba(147, 51, 234, 0.14)'     // Deep Purple
  }
};

let currentConfig = { ...DEFAULT_CONFIG };
let auroraElement = null;
let styleElement = null;
let bodyObserver = null;
let injectionAttempts = 0;
const MAX_INJECTION_ATTEMPTS = 50;

/**
 * Ensures html, body, and major wrappers don't block the aurora with opaque backgrounds
 */
function ensureTransparentBase() {
  console.debug('[Aurora] Ensuring html/body/wrapper transparency');

  // Force html and body to be transparent so aurora shows through
  const htmlStyle = document.documentElement.style;
  htmlStyle.setProperty('background', 'transparent', 'important');

  const bodyStyle = document.body.style;
  bodyStyle.setProperty('background', 'transparent', 'important');

  // Inject comprehensive style rules to override all opaque backgrounds
  const overrideStyle = document.createElement('style');
  overrideStyle.id = 'aurora-body-override';
  overrideStyle.textContent = `
    /* Base elements */
    html, body {
      background: transparent !important;
    }

    /* Main wrapper and container elements - make transparent or semi-transparent */
    body > div:first-child,
    body > div[class*="wrapper"],
    body > div[class*="container"],
    body > div[class*="app"],
    body > div[id*="root"],
    body > div[id*="app"] {
      background: transparent !important;
    }

    /* Sidebar elements - common patterns across AI chat sites */
    [class*="sidebar"],
    [class*="side-bar"],
    [class*="Sidebar"],
    [id*="sidebar"],
    [id*="side-bar"],
    nav[class*="side"],
    aside,
    [role="complementary"],
    [class*="drawer"] {
      background: transparent !important;
      background-color: transparent !important;
    }

    /* Navigation and header elements */
    nav,
    header,
    [role="navigation"],
    [role="banner"] {
      background: rgba(10, 14, 26, 0.85) !important;
      backdrop-filter: blur(10px) !important;
    }

    /* Main content areas - keep some background for readability but make semi-transparent */
    main,
    [role="main"] {
      background: rgba(10, 14, 26, 0.75) !important;
      backdrop-filter: blur(8px) !important;
    }

    /* Chat/conversation containers - subtle background for text contrast */
    [class*="chat"],
    [class*="conversation"],
    [class*="message"],
    [class*="thread"] {
      background: rgba(10, 14, 26, 0.65) !important;
    }
  `;

  if (!document.getElementById('aurora-body-override')) {
    (document.head || document.documentElement).appendChild(overrideStyle);
  }

  // Also manually set inline styles on common wrappers (in case CSS is overridden)
  requestAnimationFrame(() => {
    // Target body's first child (usually the React root)
    const firstChild = document.body?.firstElementChild;
    if (firstChild && firstChild !== auroraElement) {
      firstChild.style.setProperty('background', 'transparent', 'important');
    }

    // Target common sidebar patterns
    const sidebars = document.querySelectorAll('[class*="sidebar"], [class*="side-bar"], aside, [role="complementary"]');
    sidebars.forEach(sidebar => {
      sidebar.style.setProperty('background', 'transparent', 'important');
      sidebar.style.setProperty('background-color', 'transparent', 'important');
    });
  });
}

/**
 * Creates the aurora background element with animated gradient blobs
 */
function createAuroraBackground() {
  // Check if already exists and is attached
  if (auroraElement && document.body && document.body.contains(auroraElement)) {
    console.debug('[Aurora] Element already exists and is attached');
    return;
  }

  console.debug('[Aurora] Creating aurora background element');

  // Create container
  auroraElement = document.createElement('div');
  auroraElement.id = 'aurora-bg';
  auroraElement.className = 'aurora-dream-container';

  // Add data attribute for easier debugging
  auroraElement.setAttribute('data-aurora-version', '2.0');

  // Create 5 animated blob elements
  for (let i = 1; i <= 5; i++) {
    const blob = document.createElement('div');
    blob.className = `aurora-blob aurora-blob-${i}`;
    auroraElement.appendChild(blob);
  }

  // Insert the element
  insertAuroraElement();
}

/**
 * Inserts the aurora element into the DOM using the most reliable strategy
 */
function insertAuroraElement() {
  if (!auroraElement) {
    console.debug('[Aurora] No element to insert');
    return;
  }

  if (!document.body) {
    console.debug('[Aurora] Body not ready, waiting...');
    if (injectionAttempts < MAX_INJECTION_ATTEMPTS) {
      injectionAttempts++;
      requestAnimationFrame(insertAuroraElement);
    }
    return;
  }

  // Strategy: Insert as LAST child of body so it renders after all React content
  // This ensures it's in the DOM tree but positioned behind everything with fixed + negative z-index
  console.debug('[Aurora] Inserting as last child of body');
  document.body.appendChild(auroraElement);

  // Force transparency after insertion
  ensureTransparentBase();

  console.debug('[Aurora] Successfully inserted aurora element');
  injectionAttempts = 0; // Reset counter

  // Set up monitoring to detect if React removes it
  setupElementMonitoring();
}

/**
 * Monitors the aurora element and re-injects if removed
 */
function setupElementMonitoring() {
  // Disconnect existing observer if any
  if (bodyObserver) {
    bodyObserver.disconnect();
  }

  console.debug('[Aurora] Setting up MutationObserver for element monitoring');

  bodyObserver = new MutationObserver((mutations) => {
    // Check if aurora element is still in the body
    if (auroraElement && !document.body.contains(auroraElement)) {
      console.debug('[Aurora] Element was removed, re-injecting...');
      insertAuroraElement();
    }
  });

  // Observe body for child removals
  if (document.body) {
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: false // Only watch direct children of body
    });
  }
}

/**
 * Injects CSS styles for aurora effect
 */
function injectStyles() {
  if (styleElement && document.head && document.head.contains(styleElement)) {
    console.debug('[Aurora] Styles already injected');
    return;
  }

  console.debug('[Aurora] Injecting aurora styles');

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const baseBg = isDark ? '#0a0e1a' : '#1a1e2a';

  const speed = currentConfig.animationSpeed;
  const blur = currentConfig.blur || 120;
  const opacity = (currentConfig.opacity || 100) / 100;
  const colors = currentConfig.colors;

  const css = `
    /* Aurora Dream Background - Base Container */
    .aurora-dream-container {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: -999999 !important;
      pointer-events: none !important;
      overflow: hidden !important;
      background: ${baseBg} !important;
      will-change: transform !important;
      transform: translate3d(0, 0, 0) !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      outline: none !important;
      opacity: ${opacity} !important;
    }

    /* Individual Aurora Blobs */
    .aurora-blob {
      position: absolute !important;
      border-radius: 50% !important;
      filter: blur(${blur}px) !important;
      opacity: 1 !important;
      will-change: transform, opacity !important;
      mix-blend-mode: screen !important;
      pointer-events: none !important;
    }

    /* Blob 1 - Purple */
    .aurora-blob-1 {
      width: 600px !important;
      height: 600px !important;
      background: radial-gradient(circle, ${colors.color1} 0%, transparent 70%) !important;
      top: -10% !important;
      left: -5% !important;
      animation: aurora-drift-1 ${30 / speed}s ease-in-out infinite !important;
    }

    /* Blob 2 - Cyan/Teal */
    .aurora-blob-2 {
      width: 700px !important;
      height: 700px !important;
      background: radial-gradient(circle, ${colors.color2} 0%, transparent 70%) !important;
      top: 20% !important;
      right: -10% !important;
      animation: aurora-drift-2 ${35 / speed}s ease-in-out infinite !important;
      animation-delay: ${-5 / speed}s !important;
    }

    /* Blob 3 - Magenta/Pink */
    .aurora-blob-3 {
      width: 550px !important;
      height: 550px !important;
      background: radial-gradient(circle, ${colors.color3} 0%, transparent 70%) !important;
      bottom: 10% !important;
      left: 15% !important;
      animation: aurora-drift-3 ${40 / speed}s ease-in-out infinite !important;
      animation-delay: ${-10 / speed}s !important;
    }

    /* Blob 4 - Soft Green */
    .aurora-blob-4 {
      width: 650px !important;
      height: 650px !important;
      background: radial-gradient(circle, ${colors.color4} 0%, transparent 70%) !important;
      bottom: -5% !important;
      right: 20% !important;
      animation: aurora-drift-4 ${28 / speed}s ease-in-out infinite !important;
      animation-delay: ${-15 / speed}s !important;
    }

    /* Blob 5 - Deep Purple (Center) */
    .aurora-blob-5 {
      width: 800px !important;
      height: 800px !important;
      background: radial-gradient(circle, ${colors.color5} 0%, transparent 70%) !important;
      top: 40% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      animation: aurora-drift-5 ${45 / speed}s ease-in-out infinite !important;
      animation-delay: ${-20 / speed}s !important;
    }

    /* Keyframe Animations */
    @keyframes aurora-drift-1 {
      0%, 100% {
        transform: translate(0, 0) scale(1) !important;
        opacity: 1 !important;
      }
      25% {
        transform: translate(100px, 50px) scale(1.1) !important;
        opacity: 0.8 !important;
      }
      50% {
        transform: translate(200px, -30px) scale(0.95) !important;
        opacity: 1 !important;
      }
      75% {
        transform: translate(50px, 80px) scale(1.05) !important;
        opacity: 0.9 !important;
      }
    }

    @keyframes aurora-drift-2 {
      0%, 100% {
        transform: translate(0, 0) scale(1) !important;
        opacity: 1 !important;
      }
      33% {
        transform: translate(-120px, 100px) scale(1.15) !important;
        opacity: 0.85 !important;
      }
      66% {
        transform: translate(-80px, -60px) scale(0.9) !important;
        opacity: 1 !important;
      }
    }

    @keyframes aurora-drift-3 {
      0%, 100% {
        transform: translate(0, 0) scale(1) rotate(0deg) !important;
        opacity: 1 !important;
      }
      30% {
        transform: translate(150px, -80px) scale(1.2) rotate(5deg) !important;
        opacity: 0.9 !important;
      }
      60% {
        transform: translate(-100px, 50px) scale(0.85) rotate(-5deg) !important;
        opacity: 0.95 !important;
      }
    }

    @keyframes aurora-drift-4 {
      0%, 100% {
        transform: translate(0, 0) scale(1) !important;
        opacity: 1 !important;
      }
      40% {
        transform: translate(-150px, -100px) scale(1.1) !important;
        opacity: 0.8 !important;
      }
      80% {
        transform: translate(100px, 60px) scale(0.95) !important;
        opacity: 1 !important;
      }
    }

    @keyframes aurora-drift-5 {
      0%, 100% {
        transform: translate(-50%, -50%) scale(1) !important;
        opacity: 1 !important;
      }
      20% {
        transform: translate(-50%, -50%) translate(80px, 100px) scale(1.15) !important;
        opacity: 0.85 !important;
      }
      40% {
        transform: translate(-50%, -50%) translate(-100px, -80px) scale(0.9) !important;
        opacity: 0.95 !important;
      }
      60% {
        transform: translate(-50%, -50%) translate(120px, -50px) scale(1.1) !important;
        opacity: 0.9 !important;
      }
      80% {
        transform: translate(-50%, -50%) translate(-60px, 80px) scale(0.95) !important;
        opacity: 1 !important;
      }
    }

    /* Subtle overall enhancement */
    .aurora-dream-container::after {
      content: '' !important;
      position: absolute !important;
      inset: 0 !important;
      background: linear-gradient(
        135deg,
        rgba(138, 43, 226, 0.03) 0%,
        transparent 50%,
        rgba(0, 206, 209, 0.03) 100%
      ) !important;
      animation: aurora-hue-shift ${60 / speed}s linear infinite !important;
      pointer-events: none !important;
    }

    @keyframes aurora-hue-shift {
      0%, 100% {
        filter: hue-rotate(0deg) !important;
      }
      50% {
        filter: hue-rotate(15deg) !important;
      }
    }
  `;

  styleElement = document.createElement('style');
  styleElement.id = 'aurora-dream-styles';
  styleElement.textContent = css;

  // Inject into head when available
  const injectStyleElement = () => {
    if (document.head) {
      document.head.appendChild(styleElement);
      console.debug('[Aurora] Styles injected into head');
    } else if (document.documentElement) {
      document.documentElement.appendChild(styleElement);
      console.debug('[Aurora] Styles injected into documentElement');
    } else {
      console.debug('[Aurora] Cannot inject styles yet, retrying...');
      requestAnimationFrame(injectStyleElement);
    }
  };

  injectStyleElement();
}

/**
 * Removes the aurora background
 */
function removeAuroraBackground() {
  console.debug('[Aurora] Removing aurora background');

  if (bodyObserver) {
    bodyObserver.disconnect();
    bodyObserver = null;
  }

  if (auroraElement && auroraElement.parentNode) {
    auroraElement.parentNode.removeChild(auroraElement);
    auroraElement = null;
  }
}

/**
 * Removes injected styles
 */
function removeStyles() {
  console.debug('[Aurora] Removing styles');

  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
    styleElement = null;
  }

  const overrideStyle = document.getElementById('aurora-body-override');
  if (overrideStyle && overrideStyle.parentNode) {
    overrideStyle.parentNode.removeChild(overrideStyle);
  }
}

/**
 * Updates the aurora effect based on config
 */
function updateAurora() {
  console.debug('[Aurora] Updating aurora, enabled:', currentConfig.enabled);

  if (currentConfig.enabled) {
    removeStyles(); // Remove old styles
    injectStyles(); // Inject new styles with updated config
    createAuroraBackground();
  } else {
    removeAuroraBackground();
    removeStyles();
  }
}

/**
 * Loads configuration from storage
 */
async function loadConfig() {
  try {
    const result = await chrome.storage.sync.get(['auroraConfig']);
    if (result.auroraConfig) {
      currentConfig = { ...DEFAULT_CONFIG, ...result.auroraConfig };
      console.debug('[Aurora] Loaded config from storage:', currentConfig);
    } else {
      console.debug('[Aurora] Using default config');
    }
  } catch (error) {
    console.debug('[Aurora] Storage not available, using defaults:', error);
    currentConfig = { ...DEFAULT_CONFIG };
  }
  updateAurora();
}

/**
 * Listen for storage changes
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.auroraConfig) {
    console.debug('[Aurora] Config changed:', changes.auroraConfig.newValue);
    currentConfig = { ...DEFAULT_CONFIG, ...changes.auroraConfig.newValue };
    updateAurora();
  }
});

/**
 * Wait for body to be ready before injecting
 */
function waitForBody() {
  if (document.body) {
    console.debug('[Aurora] Body is ready');
    return Promise.resolve();
  }

  console.debug('[Aurora] Waiting for body...');
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (document.body) {
        console.debug('[Aurora] Body detected via observer');
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}

/**
 * Wait for React to finish initial render
 * Checks for common indicators that the app has mounted
 */
async function waitForReactMount() {
  console.debug('[Aurora] Waiting for React to mount...');

  // Wait a bit for React hydration/render
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if main content wrapper exists (common in React SPAs)
  let attempts = 0;
  while (attempts < 20) {
    const wrapper = document.querySelector('div[class*="wrapper"]') ||
                   document.querySelector('main') ||
                   document.querySelector('#root > div');

    if (wrapper) {
      console.debug('[Aurora] React content detected after', attempts * 100, 'ms');
      // Wait a bit more to ensure full render
      await new Promise(resolve => setTimeout(resolve, 200));
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  console.debug('[Aurora] Proceeding without detecting React mount');
}

/**
 * Initialize the extension
 */
async function init() {
  console.debug('[Aurora] Initializing...');

  // Wait for body
  await waitForBody();

  // Wait for React to mount
  await waitForReactMount();

  // Load config and apply aurora effect
  await loadConfig();

  // Also update on dark mode changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    console.debug('[Aurora] Dark mode changed');
    if (currentConfig.enabled) {
      updateAurora();
    }
  });

  console.debug('[Aurora] Initialization complete');
}

// Run initialization based on document state
if (document.readyState === 'loading') {
  console.debug('[Aurora] Document loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', init);
} else {
  console.debug('[Aurora] Document already loaded, initializing immediately');
  init();
}
