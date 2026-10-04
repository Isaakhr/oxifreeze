"""Prepara las fotos del equipo para la web.

Uso:  npm run fotos      (o:  python tools/fotos.py)

1. Guarden las fotos en assets/equipo/ con el nombre de cada quien:
   luka.jpg, iker.jpg, isaak.jpg, felipe.jpg, camarena.jpg  (también .jpeg, .png o .webp).
2. Este script las endereza (EXIF del celular), las recorta en cuadrado con la cara
   un poco arriba del centro, las reduce a 480 px y las guarda como <nombre>-web.jpg.
3. Actualiza "photo" en js/config.js para cada foto encontrada.
Después:  npm run build  y  npm test.
"""
from pathlib import Path
import re
import sys

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
FOLDER = ROOT / "assets" / "equipo"
CONFIG = ROOT / "js" / "config.js"
NAMES = ["luka", "iker", "isaak", "felipe", "camarena"]
EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
SIZE = 480            # px: nítido en pantallas retina para un avatar de ~240 px
QUALITY = 82
FACE_BIAS = 0.35      # 0 = recorta desde arriba, 0.5 = centro; las caras suelen estar arriba


def find_source(name: str) -> Path | None:
    for ext in EXTENSIONS:
        for candidate in (FOLDER / f"{name}{ext}", FOLDER / f"{name}{ext.upper()}"):
            if candidate.exists():
                return candidate
    return None


def square_crop(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = int((h - side) * FACE_BIAS) if h > w else 0
    return img.crop((left, top, left + side, top + side))


def process(name: str, src: Path) -> str:
    with Image.open(src) as raw:
        img = ImageOps.exif_transpose(raw).convert("RGB")
    img = square_crop(img).resize((SIZE, SIZE), Image.LANCZOS)
    out = FOLDER / f"{name}-web.jpg"
    img.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return f"assets/equipo/{out.name}"


def update_config(paths: dict[str, str]) -> None:
    text = CONFIG.read_text(encoding="utf-8")
    for name, path in paths.items():
        pattern = re.compile(r'(\{ name: "' + re.escape(name.capitalize()) + r'",[^}]*photo: )"[^"]*"')
        text, count = pattern.subn(lambda m: f'{m.group(1)}"{path}"', text)
        if count != 1:
            print(f"  ! no encontré a {name.capitalize()} en js/config.js; ponlo a mano: {path}")
    CONFIG.write_text(text, encoding="utf-8")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")  # la consola de Windows no es UTF-8 por defecto
    found: dict[str, str] = {}
    for name in NAMES:
        src = find_source(name)
        if not src:
            print(f"- {name}: sin foto (se quedan las iniciales)")
            continue
        try:
            found[name] = process(name, src)
            kb = (ROOT / found[name]).stat().st_size // 1024
            print(f"✓ {name}: {src.name} → {found[name]} ({kb} KB)")
        except OSError as err:
            print(f"✗ {name}: no se pudo abrir {src.name} ({err}). Si es .HEIC de iPhone, mándala como JPG.")
    if found:
        update_config(found)
        print("Listo. Ahora corre:  npm run build  y  npm test")
    return 0


if __name__ == "__main__":
    sys.exit(main())
