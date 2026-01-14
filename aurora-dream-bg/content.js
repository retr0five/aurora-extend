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
  blur: 140,
  opacity: 100,
  motion: 100,
  stars: false,
  colors: {
    color1: 'rgba(138, 43, 226, 0.35)',    // Purple - increased intensity
    color2: 'rgba(0, 206, 209, 0.28)',     // Cyan/Teal - increased intensity
    color3: 'rgba(255, 105, 180, 0.38)',   // Magenta/Pink - increased intensity
    color4: 'rgba(50, 205, 50, 0.22)',     // Soft Green - increased intensity
    color5: 'rgba(147, 51, 234, 0.32)',    // Deep Purple - increased intensity
    color6: 'rgba(255, 20, 147, 0.30)',    // Deep Pink/Magenta
    color7: 'rgba(64, 224, 208, 0.25)',    // Turquoise
    color8: 'rgba(186, 85, 211, 0.28)'     // Medium Orchid
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
      background-color: transparent !important;
    }

    /* --- GEMINI SPECIFIC FIXES --- */
    :root {
      /* Override Gemini's system color variables to be transparent */
      --gem-sys-color-surface: transparent !important;
      --gem-sys-color-surface-container: transparent !important;
      --mat-sys-color-surface: transparent !important;
      --mat-sys-color-surface-container: transparent !important;

      /* Optional: Make the chat bubbles semi-transparent instead of solid */
      --gem-sys-color-surface-container-high: rgba(30, 35, 50, 0.4) !important;
    }

    /* Force Gemini's main app shell to be transparent */
    body > [class*="App"],
    body > [class*="app"],
    bs-sidebar,
    .gmat-body-large {
      background-color: transparent !important;
      background: transparent !important;
    }
    /* ----------------------------- */

    /* Main wrapper and container elements - make transparent or semi-transparent */
    body > div:first-child,
    body > div[class*="wrapper"],
    body > div[class*="container"],
    body > div[class*="app"],
    body > div[id*="root"],
    body > div[id*="app"],
    #__next {
      background: transparent !important;
    }

    /* Sidebar elements - common patterns across AI chat sites + ChatGPT specific */
    [class*="sidebar"],
    [class*="side-bar"],
    [class*="Sidebar"],
    [id*="sidebar"],
    [id*="side-bar"],
    nav[class*="side"],
    aside,
    [role="complementary"],
    [class*="drawer"],
    [data-testid*="sidebar"],
    [class*="Panel"] {
      background: transparent !important;
      background-color: transparent !important;
    }

    /* Navigation and header elements */
    nav,
    header,
    [role="navigation"],
    [role="banner"] {
      background: rgba(10, 14, 26, 0.4) !important;
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

  // No need to create blob elements - using background image instead

  // Insert the element first
  insertAuroraElement();
}

/**
 * Updates stars in the existing aurora element
 */
function updateStars() {
  if (!auroraElement) {
    console.debug('[Aurora] No aurora element to update stars for');
    return;
  }

  // Remove existing stars if any
  const existingStars = auroraElement.querySelector('.aurora-stars');
  if (existingStars) {
    existingStars.remove();
  }

  // Create stars if enabled
  if (currentConfig.stars) {
    console.debug('[Aurora] Adding stars overlay');
    const starsContainer = document.createElement('div');
    starsContainer.className = 'aurora-stars';

    // Create 50 stars with random positions and sizes
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.className = 'aurora-star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      star.style.animationDuration = `${2 + Math.random() * 3}s`;
      starsContainer.appendChild(star);
    }

    auroraElement.appendChild(starsContainer);
  }
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
  const motion = (currentConfig.motion || 100) / 100;

  // Get the extension URL for the aurora background image
  const auroraImageUrl = chrome.runtime.getURL('aurora-bg.jpg');

  const css = `
    /* Aurora Dream Background - Base Container with Image */
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
      background-image: url('${auroraImageUrl}') !important;
      background-size: cover !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
      filter: blur(${blur * 0.2}px) !important;
      will-change: transform !important;
      transform: translate3d(0, 0, 0) !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      outline: none !important;
      opacity: ${opacity} !important;
      animation: aurora-gentle-move ${60 / speed}s ease-in-out infinite !important;
    }

    /* Gentle movement animation for the aurora background */
    @keyframes aurora-gentle-move {
      0%, 100% {
        transform: translate3d(0, 0, 0) scale(${1 + 0.05 * motion}) !important;
      }
      25% {
        transform: translate3d(${20 * motion}px, ${10 * motion}px, 0) scale(${1 + 0.08 * motion}) !important;
      }
      50% {
        transform: translate3d(${-15 * motion}px, ${-20 * motion}px, 0) scale(${1 + 0.03 * motion}) !important;
      }
      75% {
        transform: translate3d(${10 * motion}px, ${-15 * motion}px, 0) scale(${1 + 0.06 * motion}) !important;
      }
    }

    /* Grok Search Bar - Blur effect with aurora showing through */
    [data-testid="searchbar"],
    [data-testid="message-input"],
    textarea[placeholder*="Ask"],
    textarea[placeholder*="Message"],
    input[type="text"][placeholder*="Ask"],
    .search-input,
    [class*="search-bar"],
    [class*="SearchBar"],
    [class*="message-input"],
    [class*="MessageInput"],
    [class*="chat-input"],
    [class*="ChatInput"] {
      background: rgba(10, 14, 26, 0.3) !important;
      backdrop-filter: blur(15px) saturate(1.5) !important;
      -webkit-backdrop-filter: blur(15px) saturate(1.5) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    }

    /* Input containers and wrappers */
    [class*="input-container"],
    [class*="InputContainer"],
    [class*="search-container"],
    [class*="SearchContainer"] {
      background: transparent !important;
    }

    /* Twinkling Stars */
    .aurora-stars {
      position: absolute !important;
      inset: 0 !important;
      pointer-events: none !important;
      z-index: 1 !important;
    }

    .aurora-star {
      position: absolute !important;
      width: 2px !important;
      height: 2px !important;
      background: rgba(255, 255, 255, 0.8) !important;
      border-radius: 50% !important;
      box-shadow: 0 0 3px rgba(255, 255, 255, 0.5) !important;
      animation: aurora-twinkle 3s ease-in-out infinite !important;
      pointer-events: none !important;
    }

    @keyframes aurora-twinkle {
      0%, 100% {
        opacity: 0.3 !important;
        transform: scale(1) !important;
      }
      50% {
        opacity: 1 !important;
        transform: scale(1.5) !important;
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
    // Always update styles (they contain dynamic values like speed, blur, opacity)
    removeStyles();
    injectStyles();

    // Only create aurora if it doesn't exist
    if (!auroraElement || !document.body.contains(auroraElement)) {
      createAuroraBackground();
    }

    // Update stars (this handles add/remove based on config)
    updateStars();
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
