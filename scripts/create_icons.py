"""Generate Formula PWA icons (black background, green italic f-hook).

Requires: pip install pillow
"""
from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:
    raise SystemExit('Install Pillow first: pip install pillow') from exc

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / 'icons'

BG = (0, 0, 0, 255)
FG = (143, 212, 100, 255)
GLYPH = '\u0192'


def _load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path('C:/Windows/Fonts/georgiai.ttf'),
        Path('C:/Windows/Fonts/timesi.ttf'),
        Path('/System/Library/Fonts/Supplemental/Georgia Italic.ttf'),
        Path('/System/Library/Fonts/Times.ttc'),
        Path('/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'),
    ]
    for path in candidates:
        if path.exists():
            try:
                return ImageFont.truetype(str(path), size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def render_icon(size: int) -> Image.Image:
    image = Image.new('RGBA', (size, size), BG)
    draw = ImageDraw.Draw(image)
    font_size = max(24, int(size * 0.62))
    font = _load_font(font_size)

    bbox = draw.textbbox((0, 0), GLYPH, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) / 2 - bbox[0]
    y = (size - text_h) / 2 - bbox[1]
    draw.text((x, y), GLYPH, font=font, fill=FG)
    return image


def main() -> None:
    ICONS.mkdir(exist_ok=True)
    for size in (192, 512):
        out = ICONS / f'icon-{size}.png'
        render_icon(size).save(out, format='PNG')
        print('Wrote', out)


if __name__ == '__main__':
    main()
