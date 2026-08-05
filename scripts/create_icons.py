"""Generate minimal PWA icons for Athlete OS."""
import struct
import zlib
from pathlib import Path

def crc32(data: bytes) -> int:
    return zlib.crc32(data) & 0xFFFFFFFF

def chunk(chunk_type: bytes, data: bytes) -> bytes:
    return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', crc32(chunk_type + data))

def create_png(size: int) -> bytes:
    width = height = size
    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            cx = x - width / 2
            cy = y - height / 2
            in_circle = cx * cx + cy * cy < (width * 0.42) ** 2
            if in_circle:
                row.extend([196, 146, 58, 255])
            else:
                row.extend([26, 28, 30, 255])
        rows.append(bytes(row))
    raw = b''.join(rows)
    compressed = zlib.compress(raw, 9)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

def main():
    out = Path(__file__).resolve().parent.parent / 'icons'
    out.mkdir(exist_ok=True)
    (out / 'icon-192.png').write_bytes(create_png(192))
    (out / 'icon-512.png').write_bytes(create_png(512))
    print('Icons created in', out)

if __name__ == '__main__':
    main()
