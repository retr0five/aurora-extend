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
  motion: 100,
  stars: false,
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
let motionSlider;
let motionValue;
let starsToggle;
let colorPickers = {};
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
  motionSlider = document.getElementById('motionSlider');
  motionValue = document.getElementById('motionValue');
  starsToggle = document.getElementById('starsToggle');
  statusDot = document.getElementById('statusDot');
  statusText = document.getElementById('statusText');
  moreSettingsLink = document.getElementById('moreSettingsLink');
  presetButtons = document.querySelectorAll('.preset-btn');

  // Color pickers
  for (let i = 1; i <= 5; i++) {
    colorPickers[`color${i}`] = document.getElementById(`color${i}Picker`);
  }
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Extract RGB values from rgba string
 */
function parseRgba(rgba) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    };
  }
  return null;
}

/**
 * Convert RGB to Hex
 */
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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

    // Motion intensity
    motionSlider.value = currentConfig.motion || 100;
    motionValue.textContent = motionSlider.value;

    // Stars toggle
    starsToggle.checked = currentConfig.stars || false;

    // Color pickers
    if (currentConfig.colors) {
      for (let i = 1; i <= 5; i++) {
        const colorKey = `color${i}`;
        const colorValue = currentConfig.colors[colorKey] || DEFAULT_CONFIG.colors[colorKey];
        const rgba = parseRgba(colorValue);
        if (rgba) {
          colorPickers[colorKey].value = rgbToHex(rgba.r, rgba.g, rgba.b);
        }
      }
    }

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
    // Build colors object from color pickers
    const colors = {};
    for (let i = 1; i <= 5; i++) {
      const colorKey = `color${i}`;
      const hex = colorPickers[colorKey].value;
      const rgb = hexToRgb(hex);
      if (rgb) {
        // Preserve alpha from current config or use default
        const currentRgba = currentConfig.colors[colorKey] ? parseRgba(currentConfig.colors[colorKey]) : null;
        const alpha = currentRgba ? currentRgba.a : 0.15;
        colors[colorKey] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      }
    }

    const config = {
      ...currentConfig,
      enabled: enableToggle.checked,
      animationSpeed: parseFloat(speedSlider.value),
      blur: parseInt(blurSlider.value),
      opacity: parseInt(opacitySlider.value),
      motion: parseInt(motionSlider.value),
      stars: starsToggle.checked,
      colors: colors
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
      motionSlider.value = 50;
      break;
    case 'normal':
      speedSlider.value = 1.0;
      blurSlider.value = 120;
      opacitySlider.value = 100;
      motionSlider.value = 100;
      break;
    case 'vibrant':
      speedSlider.value = 1.5;
      blurSlider.value = 100;
      opacitySlider.value = 100;
      motionSlider.value = 150;
      break;
    case 'intense':
      speedSlider.value = 2.5;
      blurSlider.value = 80;
      opacitySlider.value = 100;
      motionSlider.value = 200;
      break;
  }

  // Update displayed values
  speedValue.textContent = speedSlider.value;
  blurValue.textContent = blurSlider.value;
  opacityValue.textContent = opacitySlider.value;
  motionValue.textContent = motionSlider.value;

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

  // Motion slider
  motionSlider.addEventListener('input', (e) => {
    motionValue.textContent = e.target.value;
  });

  motionSlider.addEventListener('change', () => {
    saveSettings();
  });

  // Stars toggle
  starsToggle.addEventListener('change', () => {
    saveSettings();
  });

  // Color pickers
  for (let i = 1; i <= 5; i++) {
    const colorKey = `color${i}`;
    colorPickers[colorKey].addEventListener('change', () => {
      saveSettings();
    });
  }

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
