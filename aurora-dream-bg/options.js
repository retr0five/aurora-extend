/**
 * Aurora Dream Background - Options Script
 * Handles settings page functionality
 */

// Default configuration (same as content.js)
const DEFAULT_CONFIG = {
  enabled: true,
  animationSpeed: 1.0,
  colors: {
    color1: 'rgba(138, 43, 226, 0.15)',
    color2: 'rgba(0, 206, 209, 0.12)',
    color3: 'rgba(255, 105, 180, 0.18)',
    color4: 'rgba(50, 205, 50, 0.10)',
    color5: 'rgba(147, 51, 234, 0.14)'
  }
};

// DOM Elements
let enableToggle;
let enableStatus;
let speedSlider;
let speedValue;
let colorInputs = {};
let colorPickers = {};
let saveButton;
let statusMessage;

/**
 * Initialize DOM elements
 */
function initElements() {
  enableToggle = document.getElementById('enableToggle');
  enableStatus = document.getElementById('enableStatus');
  speedSlider = document.getElementById('speedSlider');
  speedValue = document.getElementById('speedValue');
  saveButton = document.getElementById('saveButton');
  statusMessage = document.getElementById('statusMessage');

  // Color inputs and pickers
  for (let i = 1; i <= 5; i++) {
    colorInputs[`color${i}`] = document.getElementById(`color${i}`);
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

    // Enable toggle
    enableToggle.checked = config.enabled !== false;
    updateEnableStatus();

    // Animation speed
    speedSlider.value = config.animationSpeed || 1.0;
    speedValue.textContent = speedSlider.value;

    // Colors
    if (config.colors) {
      for (let i = 1; i <= 5; i++) {
        const colorKey = `color${i}`;
        const colorValue = config.colors[colorKey] || DEFAULT_CONFIG.colors[colorKey];
        colorInputs[colorKey].value = colorValue;

        // Set color picker to RGB part
        const rgba = parseRgba(colorValue);
        if (rgba) {
          colorPickers[colorKey].value = rgbToHex(rgba.r, rgba.g, rgba.b);
        }
      }
    }
  } catch (error) {
    showStatus('Error loading settings', 'error');
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    const config = {
      enabled: enableToggle.checked,
      animationSpeed: parseFloat(speedSlider.value),
      colors: {}
    };

    // Save colors
    for (let i = 1; i <= 5; i++) {
      const colorKey = `color${i}`;
      config.colors[colorKey] = colorInputs[colorKey].value;
    }

    await chrome.storage.sync.set({ auroraConfig: config });

    // Visual feedback
    saveButton.classList.add('saved');
    saveButton.textContent = '✓ Saved!';
    showStatus('Settings saved successfully!', 'success');

    setTimeout(() => {
      saveButton.classList.remove('saved');
      saveButton.textContent = 'Save Settings';
    }, 2000);
  } catch (error) {
    showStatus('Error saving settings', 'error');
  }
}

/**
 * Show status message
 */
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type} show`;

  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 3000);
}

/**
 * Update enable status text
 */
function updateEnableStatus() {
  enableStatus.textContent = enableToggle.checked ? 'Enabled' : 'Disabled';
  enableStatus.style.color = enableToggle.checked ? '#34d399' : '#9ca3af';
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Enable toggle
  enableToggle.addEventListener('change', updateEnableStatus);

  // Speed slider
  speedSlider.addEventListener('input', (e) => {
    speedValue.textContent = e.target.value;
  });

  // Color pickers - update text input when color picker changes
  for (let i = 1; i <= 5; i++) {
    const colorKey = `color${i}`;

    colorPickers[colorKey].addEventListener('input', (e) => {
      const rgb = hexToRgb(e.target.value);
      if (rgb) {
        // Preserve alpha from current value
        const current = parseRgba(colorInputs[colorKey].value);
        const alpha = current ? current.a : 0.15;
        colorInputs[colorKey].value = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      }
    });

    // Also update color picker when text is changed
    colorInputs[colorKey].addEventListener('blur', (e) => {
      const rgba = parseRgba(e.target.value);
      if (rgba) {
        colorPickers[colorKey].value = rgbToHex(rgba.r, rgba.g, rgba.b);
      }
    });
  }

  // Save button
  saveButton.addEventListener('click', saveSettings);

  // Also save with Ctrl/Cmd + S
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveSettings();
    }
  });
}

/**
 * Initialize the options page
 */
function init() {
  initElements();
  setupEventListeners();
  loadSettings();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
