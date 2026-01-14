# CLAUDE.md - AI Assistant Guide

## Project Overview

**Aurora Dream Background** is a production-ready browser extension (Manifest V3) that injects beautiful, subtle, moving aurora-style blurry gradient backgrounds behind AI chat websites. The extension targets dark-themed AI chat platforms including:

- grok.x.ai
- gemini.google.com
- chatgpt.com / chat.openai.com
- claude.ai / anthropic.com

### Project Purpose

Create an aesthetic enhancement for AI chat interfaces by adding a dreamy, non-intrusive aurora background effect that:
- Improves visual appeal without affecting usability
- Remains performance-friendly (CPU/GPU optimized)
- Provides user customization options
- Works seamlessly across different AI chat platforms

## Repository Structure

```
aurora-extend/
├── manifest.json          # Manifest V3 configuration
├── content.js            # Content script for aurora injection
├── options.html          # Settings/options page UI
├── options.js            # Options page logic
├── icon128.png          # Extension icon (128x128)
├── CLAUDE.md            # This file - AI assistant guide
└── README.md            # User-facing documentation
```

### File Responsibilities

#### `manifest.json`
- **Purpose**: Extension configuration and permissions
- **Key Elements**:
  - Manifest version 3 compliance
  - Content script injection rules
  - Match patterns for target domains
  - Storage and options page permissions
  - Icon references

#### `content.js`
- **Purpose**: Main aurora effect injection logic
- **Responsibilities**:
  - Create and inject aurora background element
  - Handle DOM insertion at `document_start`
  - Manage CSS animations and styles
  - Listen for storage changes (toggle/settings)
  - Handle SPA/shadow DOM edge cases
  - Ensure CSP compliance

#### `options.html` & `options.js`
- **Purpose**: User settings interface
- **Features**:
  - Enable/disable toggle
  - Animation speed control (0.5× - 3×)
  - Color customization for aurora blobs
  - Save settings to `chrome.storage.sync`

## Technical Architecture

### Aurora Effect Implementation

**Core Concept**: Multiple heavily-blurred, animated radial-gradient "blobs" layered to create aurora appearance.

**Technical Details**:
- **Container**: Fixed-position div (`id="aurora-bg"`)
- **Positioning**: First child of `<body>`, z-index: -9999
- **Blob Count**: 3-5 animated gradient blobs
- **Blur Intensity**: 80px-180px filter blur
- **Colors**: Semi-transparent (opacity 0.08-0.25)
  - Soft purple (#8b5cf6)
  - Cyan/teal (#06b6d4)
  - Magenta/pink (#ec4899)
  - Faint green (#10b981)
- **Base Background**: Dark (#0a0e1a)

### Animation Strategy

**Performance Optimizations**:
```javascript
// Use transform instead of position changes
transform: translate3d(x, y, 0);
will-change: transform;

// Smooth, infinite loops
animation: ease-in-out infinite;
// or custom cubic-bezier for organic feel
```

**Animation Properties**:
- Slow, looping movements (15-60s duration)
- Scale, translate, rotate transformations
- Offset timing per blob for non-repetitive feel
- Optional subtle hue-rotate overlay

### Storage Schema

```javascript
{
  enabled: true,              // boolean
  animationSpeed: 1.0,        // number (0.5 - 3.0)
  colors: {
    blob1: "rgba(139, 92, 246, 0.15)",
    blob2: "rgba(6, 182, 212, 0.12)",
    blob3: "rgba(236, 72, 153, 0.18)",
    blob4: "rgba(16, 185, 129, 0.10)"
  }
}
```

## Development Workflows

### Making Changes to Core Features

1. **Aurora Effect Modifications**:
   - Edit `content.js`
   - Test on all target domains
   - Verify performance (no jank/lag)
   - Check dark/light theme compatibility

2. **Settings/Options Changes**:
   - Update `options.html` for UI
   - Update `options.js` for logic
   - Ensure storage schema compatibility
   - Test real-time updates via storage listeners

3. **Adding New Target Domains**:
   - Add match pattern to `manifest.json`
   - Test injection timing
   - Verify z-index layering
   - Check for site-specific CSS conflicts

### Testing Workflow

**Manual Testing Checklist**:
- [ ] Load unpacked extension in Chrome/Edge
- [ ] Visit each target domain
- [ ] Verify aurora appears behind content
- [ ] Test toggle on/off via options
- [ ] Test animation speed changes
- [ ] Test color customization
- [ ] Check performance (CPU/GPU usage)
- [ ] Verify no console errors
- [ ] Test on both dark/light themes
- [ ] Test rapid navigation (SPA behavior)

**Performance Testing**:
```bash
# Monitor in Chrome DevTools
# Performance tab -> Record -> Check for:
# - Long tasks (>50ms)
# - Layout thrashing
# - Excessive repaints
# - GPU memory usage
```

### Deployment Workflow

1. **Version Bump**: Update version in `manifest.json`
2. **Build Package**: `zip -r aurora-dream-bg.zip * -x "*.git*"`
3. **Test Package**: Load from zip in clean browser profile
4. **Submit**: Upload to Chrome Web Store / Firefox Add-ons

## Key Conventions for AI Assistants

### Code Style

**JavaScript**:
- Use ES6+ features (const/let, arrow functions, template literals)
- Prefer async/await over callbacks
- Use descriptive variable names
- Comment complex logic, especially performance hacks
- No console.log in production code (use conditional debug flag)

**CSS**:
- Inject via `<style>` element or separate CSS file
- Prefer CSS custom properties for theming
- Use transform over position for animations
- Always include vendor prefixes for animations
- Keep specificity low (avoid !important)

**Example Code Quality**:
```javascript
// GOOD: Clear, performance-optimized
const createAuroraBlob = (color, delay) => {
  const blob = document.createElement('div');
  blob.className = 'aurora-blob';
  blob.style.setProperty('--blob-color', color);
  blob.style.animationDelay = `${delay}s`;
  return blob;
};

// AVOID: Inline styles, no optimization
const blob = document.createElement('div');
blob.style = 'background: purple; animation: move 10s;';
```

### Critical Requirements

**MUST DO**:
- ✅ Use Manifest V3 only
- ✅ Inject at `document_start` with safety checks
- ✅ Use `z-index: -9999` and `pointer-events: none`
- ✅ Apply heavy blur (80-180px) to blobs
- ✅ Use `transform: translate3d()` for animations
- ✅ Implement storage listeners for real-time updates
- ✅ Handle CSP restrictions gracefully
- ✅ Test on all target domains

**NEVER DO**:
- ❌ Use Manifest V2
- ❌ Inject at `document_end` or `document_idle` (too late)
- ❌ Use `position: absolute` with top/left animations (janky)
- ❌ Forget `will-change: transform` on animated elements
- ❌ Leave console.log statements
- ❌ Use inline event handlers (CSP violation)
- ❌ Hardcode colors without storage fallbacks
- ❌ Forget to cleanup listeners on disable

### Common Pitfalls

1. **CSP Violations**:
   - Don't use inline `style` attributes with complex values
   - Use classList or CSS custom properties instead

2. **Z-Index Issues**:
   - Some sites use stacking contexts - verify aurora stays behind
   - May need to target specific containers on some sites

3. **Performance**:
   - Too many blobs = lag (keep to 3-5)
   - Blur > 200px can cause GPU issues
   - Avoid animating multiple properties simultaneously

4. **SPA Navigation**:
   - Listen for URL changes on SPAs
   - Re-inject if needed (though fixed positioning usually works)

5. **Storage Sync Delays**:
   - Use `chrome.storage.onChanged` for instant updates
   - Provide visual feedback in options page

### Debugging Tips

**Check Aurora Injection**:
```javascript
// In console on target site:
document.getElementById('aurora-bg');
// Should return the aurora container element
```

**Verify Storage**:
```javascript
chrome.storage.sync.get(['enabled', 'animationSpeed', 'colors'], (data) => {
  console.log('Current settings:', data);
});
```

**Performance Debugging**:
```javascript
// Add to content.js temporarily:
const perfStart = performance.now();
// ... aurora creation code ...
console.log(`Aurora injected in ${performance.now() - perfStart}ms`);
```

## Working with This Codebase

### When Adding Features

1. **Read existing code first**: Understand current implementation
2. **Check manifest permissions**: Add if needed
3. **Update options page**: If user-facing setting
4. **Test incrementally**: Don't bundle multiple changes
5. **Document complex logic**: Inline comments for tricky parts

### When Fixing Bugs

1. **Reproduce reliably**: Test on specific domain/scenario
2. **Check browser console**: Look for errors/warnings
3. **Verify manifest**: Ensure permissions/patterns correct
4. **Test edge cases**: Dark theme, light theme, rapid navigation
5. **Performance test**: Ensure fix doesn't degrade performance

### When Refactoring

1. **Preserve functionality**: Aurora must look identical
2. **Test all domains**: Regression test each target site
3. **Check bundle size**: Keep extension lightweight
4. **Verify storage compatibility**: Don't break existing users' settings
5. **Update comments**: Reflect new structure

## Domain-Specific Knowledge

### Target Domains Characteristics

**grok.x.ai**:
- Dark theme default
- Fast SPA navigation
- Modern CSS (flexbox/grid)

**gemini.google.com**:
- Light/dark theme toggle
- Material Design components
- Strict CSP policies

**chatgpt.com**:
- Dark theme popular
- React-based SPA
- Frequent UI updates

**claude.ai**:
- Clean, minimal design
- Dark theme default
- Fast page loads

### Compatibility Notes

- All sites use modern browsers (ES6+ safe)
- Most have strict CSP (avoid inline scripts)
- All support CSS animations and transforms
- Shadow DOM possible on some sites (direct <body> injection safer)

## Storage and Settings

### Default Configuration

```javascript
const DEFAULT_SETTINGS = {
  enabled: true,
  animationSpeed: 1.0,
  colors: {
    blob1: 'rgba(139, 92, 246, 0.15)',  // Purple
    blob2: 'rgba(6, 182, 212, 0.12)',   // Cyan
    blob3: 'rgba(236, 72, 153, 0.18)',  // Pink
    blob4: 'rgba(16, 185, 129, 0.10)'   // Green
  }
};
```

### Storage Access Pattern

```javascript
// Read settings
chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  applyAuroraSettings(settings);
});

// Listen for changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.enabled) {
    toggleAurora(changes.enabled.newValue);
  }
});

// Save settings (in options.js)
chrome.storage.sync.set({ enabled: true }, () => {
  console.log('Settings saved');
});
```

## Performance Benchmarks

**Target Metrics**:
- Initial injection: < 10ms
- Frame rate: Solid 60fps during animation
- CPU usage: < 5% on modern hardware
- GPU memory: < 50MB

**Optimization Checklist**:
- [ ] Use `transform` instead of `top/left`
- [ ] Apply `will-change: transform`
- [ ] Use `translate3d()` for GPU acceleration
- [ ] Limit blur to reasonable range (80-180px)
- [ ] Keep blob count to 3-5
- [ ] Use `requestAnimationFrame` for JS animations (if any)
- [ ] Avoid layout thrashing

## Future Enhancement Ideas

*For AI assistants considering improvements:*

- **Preset themes**: "Northern Lights", "Cosmic", "Ocean"
- **Intensity slider**: Overall opacity control
- **Particle effects**: Subtle stars/sparkles overlay
- **Theme detection**: Auto-adjust to site's theme
- **Per-site settings**: Different colors per domain
- **Export/import**: Share settings via JSON
- **Accessibility**: Respect `prefers-reduced-motion`

## Version History

*Update this section when making significant changes:*

- **v1.0.0** (Planned): Initial release with core aurora effect and basic customization

## Resources

**Manifest V3 Documentation**:
- https://developer.chrome.com/docs/extensions/mv3/

**Performance Best Practices**:
- https://web.dev/animations-guide/
- https://developers.google.com/web/fundamentals/performance/rendering

**CSS Animation Optimization**:
- https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance

## Quick Reference

### Match Patterns
```json
[
  "*://*.x.ai/*",
  "*://*.grok.com/*",
  "*://gemini.google.com/*",
  "*://chatgpt.com/*",
  "*://chat.openai.com/*",
  "*://claude.ai/*",
  "*://*.anthropic.com/*"
]
```

### Essential CSS Properties
```css
#aurora-bg {
  position: fixed;
  inset: 0;
  z-index: -9999;
  pointer-events: none;
  overflow: hidden;
}

.aurora-blob {
  will-change: transform;
  transform: translate3d(0, 0, 0);
  filter: blur(120px);
}
```

### Storage Keys
- `enabled` (boolean)
- `animationSpeed` (number, 0.5-3.0)
- `colors.blob1` through `colors.blob4` (rgba strings)

---

**Last Updated**: 2026-01-14
**Maintained by**: AI Assistants working on Aurora Dream Background
**Questions?**: Refer to manifest.json and content.js inline comments
