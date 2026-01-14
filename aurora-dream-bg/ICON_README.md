# Icon Instructions

## Creating icon128.png

The extension requires a 128×128 PNG icon. You have two options:

### Option 1: Convert the included SVG (Recommended)
Use the included `icon.svg` file and convert it to PNG:

```bash
# Using ImageMagick
convert -background none -resize 128x128 icon.svg icon128.png

# OR using Inkscape
inkscape icon.svg --export-filename=icon128.png --export-width=128 --export-height=128

# OR using rsvg-convert
rsvg-convert -w 128 -h 128 icon.svg -o icon128.png

# OR use an online converter
# Upload icon.svg to https://cloudconvert.com/svg-to-png
```

### Option 2: Use a placeholder
Create a simple placeholder using any image editor or online tool:
- Size: 128×128 pixels
- Style: Dark background (#0a0e1a) with gradient purple/cyan/magenta aurora waves
- Format: PNG with transparency support

### Option 3: Quick Base64 Placeholder (For Testing)
For quick testing, you can create a minimal PNG programmatically:

```bash
# Create a simple colored square (requires ImageMagick)
convert -size 128x128 gradient:'#8a2be2'-'#00ced1' icon128.png
```

## Icon Design Description

The icon represents the aurora effect with:
- **Dark background**: #0a0e1a (matching the extension's theme)
- **Purple blob**: #8a2be2 with blur and transparency
- **Cyan blob**: #00ced1 with blur and transparency
- **Magenta accent**: #ff69b4 with blur
- **Green accent**: #32cd32 subtle
- **Deep purple center**: #9333ea
- **Rounded corners**: 24px border radius
- **Blurred, dreamy aesthetic**: Multiple Gaussian blur filters

The design should evoke a calm, cosmic, aurora borealis feeling suitable for AI chat backgrounds.
