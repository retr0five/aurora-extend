# Aurora Dream Background

A beautiful, production-ready browser extension that injects a stunning aurora-style blurry gradient background behind AI chat websites. Perfect for dark-themed interfaces like Grok, Gemini, ChatGPT, Claude, and more.

## ✨ Features

- 🎨 **Beautiful Aurora Effect**: Dreamy, moving gradient blobs with smooth animations
- 🌐 **Multi-Site Support**: Works on grok.x.ai, gemini.google.com, chatgpt.com, claude.ai, and more
- ⚡ **Performance Optimized**: GPU-accelerated animations, minimal CPU usage
- 🎛️ **Fully Customizable**: Control colors, animation speed, and toggle on/off
- 🔒 **Privacy First**: No data collection, all settings stored locally
- 🌓 **Dark/Light Mode**: Auto-adapts to system color scheme
- 📱 **Manifest V3**: Modern, secure browser extension standard

## 🎯 Supported Websites

- **Grok AI**: `*.x.ai`, `*.grok.com`
- **Google Gemini**: `gemini.google.com`
- **ChatGPT**: `chatgpt.com`, `chat.openai.com`
- **Claude**: `claude.ai`, `*.anthropic.com`

## 📦 Installation

### Chrome/Edge/Brave

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `aurora-dream-bg` folder
6. The extension is now active!

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the `aurora-dream-bg` folder
5. The extension is now active!

## 🎨 Customization

Right-click the extension icon and select "Options" to access settings:

### Available Settings

1. **Enable/Disable Toggle**: Turn the aurora effect on or off
2. **Animation Speed**: Adjust from 0.5× (slower, calmer) to 3× (faster, more dynamic)
3. **Color Customization**: Personalize all 5 aurora blob colors
   - Purple blob (default: `rgba(138, 43, 226, 0.15)`)
   - Cyan blob (default: `rgba(0, 206, 209, 0.12)`)
   - Magenta blob (default: `rgba(255, 105, 180, 0.18)`)
   - Green blob (default: `rgba(50, 205, 50, 0.10)`)
   - Deep purple blob (default: `rgba(147, 51, 234, 0.14)`)

All settings are synced across your devices via Chrome/Firefox sync.

## 🛠️ Technical Details

### Architecture

- **Manifest V3**: Latest extension standard for security and performance
- **Content Script Injection**: Runs at `document_start` for early rendering
- **CSS Animations**: GPU-accelerated with `transform: translate3d` and `will-change`
- **Storage API**: Settings synced via `chrome.storage.sync`
- **Zero Dependencies**: Pure vanilla JavaScript and CSS

### File Structure

```
aurora-dream-bg/
├── manifest.json      # Extension configuration
├── content.js         # Main injection logic
├── options.html       # Settings page UI
├── options.js         # Settings page functionality
├── icon128.png        # Extension icon
└── README.md          # Documentation
```

### Performance

- **Z-index**: `-9999` (stays behind all content)
- **Pointer Events**: `none` (no interaction blocking)
- **Blur Optimization**: Uses CSS `filter: blur()` with hardware acceleration
- **Animation**: Smooth 28-45 second loops with `ease-in-out` timing
- **Memory**: ~5MB typical footprint

## 🔧 Development

### Prerequisites

- Modern browser (Chrome 88+, Firefox 109+, Edge 88+)
- Basic knowledge of browser extensions

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aurora-dream-bg
   ```

2. Make your changes to the source files

3. Reload the extension in your browser:
   - Chrome: Visit `chrome://extensions/`, find the extension, click reload icon
   - Firefox: Visit `about:debugging`, click "Reload" next to the extension

### Modifying Colors

Edit the `DEFAULT_CONFIG` object in `content.js` (lines 10-19):

```javascript
const DEFAULT_CONFIG = {
  enabled: true,
  animationSpeed: 1.0,
  colors: {
    color1: 'rgba(138, 43, 226, 0.15)',  // Your custom color
    color2: 'rgba(0, 206, 209, 0.12)',
    // ...
  }
};
```

### Adding New Sites

Edit the `matches` array in `manifest.json`:

```json
{
  "matches": [
    "*://*.example.com/*",
    // Add your pattern here
  ]
}
```

## 🎭 Design Philosophy

The aurora effect is designed to be:

- **Subtle**: Won't distract from content (low opacity 0.08-0.25)
- **Smooth**: Slow, organic movements (28-45 second cycles)
- **Professional**: Elegant gradient blending with screen blend mode
- **Accessible**: Doesn't interfere with text readability
- **Universal**: Complements any dark-themed interface

## 🐛 Troubleshooting

### Extension not appearing

- Ensure you've enabled the extension in `chrome://extensions/`
- Check that you're on a supported website
- Try refreshing the page (Ctrl/Cmd + Shift + R)

### Colors not showing

- Check if the extension is enabled in the options page
- Verify the website isn't blocking content scripts (check CSP)
- Look for console errors in DevTools (F12)

### Performance issues

- Reduce animation speed in options (try 0.5×)
- Reduce blur intensity by editing CSS in `content.js`
- Disable on specific sites if needed

### Settings not saving

- Check browser sync is enabled
- Clear extension storage and try again
- Check console for storage permission errors

## 📄 License

MIT License - feel free to modify and distribute

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple browsers
5. Submit a pull request

## 🙏 Credits

Created with love for the AI chat community. Inspired by the natural beauty of aurora borealis.

## 📮 Support

Found a bug? Have a feature request? Open an issue on GitHub!

---

**Enjoy your dreamy aurora backgrounds! ✨**
