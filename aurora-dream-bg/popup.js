/**
 * Aurora Dream Background - Popup Script
 * Handles quick settings popup functionality
 */

// Default configuration (same as content.js and options.js)
const DEFAULT_CONFIG = {
  enabled: true,
  animationSpeed: 1.0,
  blur: 120,
  opacity: 100,
  colors: {
    color1: 'rgba(138, 43, 226, 0.15)',
    color2: 'rgba(0, 206, 209, 0.12)',
    color3: 'rgba(255, 105, 180, 0.18)',
    color4: 'rgba(50, 205, 50, 0.10)',
    color5: 'rgba(147, 51, 234, 0.14)'
  }
};

let currentConfig = { ...DEFAULT_CONFIG };

// DOM Elements
let enableToggle;
let speedSlider;
let speedValue;
let blurSlider;
let blurValue;
let opacitySlider;
let opacityValue;
let statusDot;
let statusText;
let moreSettingsLink;
let presetButtons;

/**
 * Initialize DOM elements
 */
function initElements() {
  enableToggle = document.getElementById('enableToggle');
  speedSlider = document.getElementById('speedSlider');
  speedValue = document.getElementById('speedValue');
  blurSlider = document.getElementById('blurSlider');
  blurValue = document.getElementById('blurValue');
  opacitySlider = document.getElementById('opacitySlider');
  opacityValue = document.getElementById('opacityValue');
  statusDot = document.getElementById('statusDot');
  statusText = document.getElementById('statusText');
  moreSettingsLink = document.getElementById('moreSettingsLink');
  presetButtons = document.querySelectorAll('.preset-btn');
}

/**
 * Load settings from storage and populate form
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['auroraConfig']);
    const config = result.auroraConfig || DEFAULT_CONFIG;

    currentConfig = { ...DEFAULT_CONFIG, ...config };

    // Enable toggle
    enableToggle.checked = currentConfig.enabled !== false;

    // Animation speed
    speedSlider.value = currentConfig.animationSpeed || 1.0;
    speedValue.textContent = speedSlider.value;

    // Blur amount
    blurSlider.value = currentConfig.blur || 120;
    blurValue.textContent = blurSlider.value;

    // Opacity
    opacitySlider.value = currentConfig.opacity || 100;
    opacityValue.textContent = opacitySlider.value;

    // Update status
    updateStatus();
  } catch (error) {
    console.error('[Aurora Popup] Error loading settings:', error);
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    const config = {
      ...currentConfig,
      enabled: enableToggle.checked,
      animationSpeed: parseFloat(speedSlider.value),
      blur: parseInt(blurSlider.value),
      opacity: parseInt(opacitySlider.value)
    };

    await chrome.storage.sync.set({ auroraConfig: config });
    currentConfig = config;

    // Update status
    updateStatus();
  } catch (error) {
    console.error('[Aurora Popup] Error saving settings:', error);
  }
}

/**
 * Update status indicator
 */
function updateStatus() {
  if (currentConfig.enabled) {
    statusDot.classList.add('active');
    statusText.textContent = 'Active';
  } else {
    statusDot.classList.remove('active');
    statusText.textContent = 'Inactive';
  }
}

/**
 * Apply preset configuration
 */
async function applyPreset(preset) {
  switch (preset) {
    case 'subtle':
      speedSlider.value = 0.5;
      blurSlider.value = 160;
      opacitySlider.value = 50;
      break;
    case 'normal':
      speedSlider.value = 1.0;
      blurSlider.value = 120;
      opacitySlider.value = 100;
      break;
    case 'vibrant':
      speedSlider.value = 1.5;
      blurSlider.value = 100;
      opacitySlider.value = 100;
      break;
    case 'intense':
      speedSlider.value = 2.5;
      blurSlider.value = 80;
      opacitySlider.value = 100;
      break;
  }

  // Update displayed values
  speedValue.textContent = speedSlider.value;
  blurValue.textContent = blurSlider.value;
  opacityValue.textContent = opacitySlider.value;

  // Enable if applying a preset
  enableToggle.checked = true;

  // Save the settings
  await saveSettings();

  // Visual feedback
  const btn = document.querySelector(`[data-preset="${preset}"]`);
  if (btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 200);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Enable toggle - save immediately on change
  enableToggle.addEventListener('change', () => {
    saveSettings();
  });

  // Speed slider
  speedSlider.addEventListener('input', (e) => {
    speedValue.textContent = e.target.value;
  });

  speedSlider.addEventListener('change', () => {
    saveSettings();
  });

  // Blur slider
  blurSlider.addEventListener('input', (e) => {
    blurValue.textContent = e.target.value;
  });

  blurSlider.addEventListener('change', () => {
    saveSettings();
  });

  // Opacity slider
  opacitySlider.addEventListener('input', (e) => {
    opacityValue.textContent = e.target.value;
  });

  opacitySlider.addEventListener('change', () => {
    saveSettings();
  });

  // Preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      applyPreset(preset);
    });
  });

  // More settings link
  moreSettingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

/**
 * Initialize the popup
 */
async function init() {
  initElements();
  setupEventListeners();
  await loadSettings();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
