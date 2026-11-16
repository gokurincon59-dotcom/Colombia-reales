"""Convierte imágenes nuevas del catálogo (PNG/JPG) a WebP: versión completa (modal) + miniatura (tarjetas).

Uso:   python3 herramientas/optimizar_imagenes.py ruta/a/nueva.png [otra.png ...]
Salida: assets/catalogo/<nombre>.webp  y  assets/catalogo/t/<nombre>.webp
Requiere: pip install pillow
"""
import sys, os
from PIL import Image
base = os.path.join(os.path.dirname(__file__), '..', 'assets', 'catalogo')
os.makedirs(os.path.join(base, 't'), exist_ok=True)
for f in sys.argv[1:]:
    n = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert('RGB')
    im.thumbnail((1280, 800), Image.LANCZOS)
    im.save(os.path.join(base, f'{n}.webp'), 'WEBP', quality=82, method=6)
    im.resize((480, 300), Image.LANCZOS).save(os.path.join(base, 't', f'{n}.webp'), 'WEBP', quality=76, method=6)
    print('listo:', n)
