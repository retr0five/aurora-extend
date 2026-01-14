#!/usr/bin/env python3
"""Generate aurora background image for browser extension"""

from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import math

def create_aurora_background(width=1920, height=1080):
    """Create a beautiful aurora background with flowing colors"""

    # Create base image with dark blue/black background
    img = Image.new('RGB', (width, height), (10, 14, 26))
    pixels = img.load()

    # Create multiple layers of aurora waves
    for y in range(height):
        for x in range(width):
            # Normalize coordinates
            nx = x / width
            ny = y / height

            # Create flowing wave patterns
            wave1 = math.sin(nx * 3 + ny * 2) * 0.5 + 0.5
            wave2 = math.sin(nx * 2 - ny * 3) * 0.5 + 0.5
            wave3 = math.cos(nx * 4 + ny * 1.5) * 0.5 + 0.5

            # Distance from top (aurora typically appears in upper portion)
            top_dist = ny

            # Create aurora intensity based on waves and position
            intensity = (wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.3) * (1 - top_dist * 0.7)

            # Apply different colors based on wave patterns
            # Purple/magenta areas
            if wave1 > 0.6:
                r = int(138 * intensity * 1.5)
                g = int(43 * intensity * 1.5)
                b = int(226 * intensity * 1.5)
            # Cyan/turquoise areas
            elif wave2 > 0.6:
                r = int(64 * intensity * 1.5)
                g = int(224 * intensity * 1.5)
                b = int(208 * intensity * 1.5)
            # Green areas
            elif wave3 > 0.6:
                r = int(50 * intensity * 1.5)
                g = int(205 * intensity * 1.5)
                b = int(50 * intensity * 1.5)
            # Pink areas
            else:
                r = int(255 * intensity * 1.2)
                g = int(105 * intensity * 1.2)
                b = int(180 * intensity * 1.2)

            # Get current pixel value and blend
            current = pixels[x, y]
            pixels[x, y] = (
                min(255, current[0] + r),
                min(255, current[1] + g),
                min(255, current[2] + b)
            )

    # Apply multiple blur passes for smooth aurora effect
    img = img.filter(ImageFilter.GaussianBlur(radius=30))
    img = img.filter(ImageFilter.GaussianBlur(radius=20))

    # Add some stars
    draw = ImageDraw.Draw(img)
    np.random.seed(42)
    for _ in range(150):
        x = np.random.randint(0, width)
        y = np.random.randint(0, height // 2)  # Stars in upper half
        size = np.random.randint(1, 3)
        brightness = np.random.randint(150, 255)
        draw.ellipse([x, y, x + size, y + size], fill=(brightness, brightness, brightness))

    return img

if __name__ == '__main__':
    print("Generating aurora background image...")
    aurora = create_aurora_background(1920, 1080)
    aurora.save('aurora-bg.jpg', quality=95, optimize=True)
    print("✓ Generated aurora-bg.jpg")
