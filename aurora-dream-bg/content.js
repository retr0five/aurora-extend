/**
 * Aurora Dream Background - Content Script
 * Injects beautiful aurora-style gradient background for AI chat websites
 */

// Default configuration
const DEFAULT_CONFIG = {
  enabled: true,
  animationSpeed: 1.0,
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

/**
 * Creates the aurora background element with animated gradient blobs
 */
function createAuroraBackground() {
  // Check if already exists
  if (auroraElement && document.body.contains(auroraElement)) {
    return;
  }

  // Create container
  auroraElement = document.createElement('div');
  auroraElement.id = 'aurora-bg';
  auroraElement.className = 'aurora-dream-container';

  // Create 5 animated blob elements
  for (let i = 1; i <= 5; i++) {
    const blob = document.createElement('div');
    blob.className = `aurora-blob aurora-blob-${i}`;
    auroraElement.appendChild(blob);
  }

  // Insert as first child of body
  if (document.body) {
    document.body.insertBefore(auroraElement, document.body.firstChild);
  } else {
    // Wait for body if not ready yet
    const observer = new MutationObserver(() => {
      if (document.body) {
        document.body.insertBefore(auroraElement, document.body.firstChild);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }
}

/**
 * Injects CSS styles for aurora effect
 */
function injectStyles() {
  if (styleElement && document.head.contains(styleElement)) {
    return;
  }

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const baseBg = isDark ? '#0a0e1a' : '#1a1e2a';

  const speed = currentConfig.animationSpeed;
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
      z-index: -9999 !important;
      pointer-events: none !important;
      overflow: hidden !important;
      background: ${baseBg} !important;
      will-change: transform !important;
      transform: translate3d(0, 0, 0) !important;
    }

    /* Individual Aurora Blobs */
    .aurora-blob {
      position: absolute !important;
      border-radius: 50% !important;
      filter: blur(120px) !important;
      opacity: 1 !important;
      will-change: transform, opacity !important;
      mix-blend-mode: screen !important;
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
  if (document.head) {
    document.head.appendChild(styleElement);
  } else {
    const observer = new MutationObserver(() => {
      if (document.head) {
        document.head.appendChild(styleElement);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}

/**
 * Removes the aurora background
 */
function removeAuroraBackground() {
  if (auroraElement && auroraElement.parentNode) {
    auroraElement.parentNode.removeChild(auroraElement);
    auroraElement = null;
  }
}

/**
 * Removes injected styles
 */
function removeStyles() {
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
    styleElement = null;
  }
}

/**
 * Updates the aurora effect based on config
 */
function updateAurora() {
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
    }
  } catch (error) {
    // Storage not available, use defaults
    currentConfig = { ...DEFAULT_CONFIG };
  }
  updateAurora();
}

/**
 * Listen for storage changes
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.auroraConfig) {
    currentConfig = { ...DEFAULT_CONFIG, ...changes.auroraConfig.newValue };
    updateAurora();
  }
});

/**
 * Initialize the extension
 */
function init() {
  // Load config and apply aurora effect
  loadConfig();

  // Also update on dark mode changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentConfig.enabled) {
      updateAurora();
    }
  });
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
