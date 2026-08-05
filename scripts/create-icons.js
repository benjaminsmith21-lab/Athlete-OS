const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, 'icons');
fs.mkdirSync(dir, { recursive: true });

function createPNG(size) {
  const width = size;
  const height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const i = rowStart + 1 + x * 4;
      const cx = x - width / 2;
      const cy = y - height / 2;
      const inCircle = cx * cx + cy * cy < (width * 0.42) ** 2;
      raw[i] = inCircle ? 196 : 26;
      raw[i + 1] = inCircle ? 146 : 28;
      raw[i + 2] = inCircle ? 58 : 30;
      raw[i + 3] = 255;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c ^= buf[n];
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const t = Buffer.from(type);
    const crcBuf = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcBuf));
    return Buffer.concat([len, t, data, crc]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

fs.writeFileSync(path.join(dir, 'icon-192.png'), createPNG(192));
fs.writeFileSync(path.join(dir, 'icon-512.png'), createPNG(512));
console.log('Icons created in', dir);
