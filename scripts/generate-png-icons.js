import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const cTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    cTable[n] = c;
  }
  return cTable;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcVal = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generatePNG(width, height, isMaskable = false) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type 6 = RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Pixel data generation
  const stride = width * 4 + 1;
  const rawData = Buffer.alloc(height * stride);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2;
  
  // Safe zone radius if maskable
  const paddingRatio = isMaskable ? 0.8 : 0.95;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Background gradient (Dark navy #090d16 -> #0f172a)
      const dy = y / height;
      let r = Math.round(9 + dy * 10);
      let g = Math.round(13 + dy * 12);
      let b = Math.round(22 + dy * 20);
      let a = 255;

      // Soundwave visual
      const nx = (x - cx) / (maxR * paddingRatio);
      const ny = (y - cy) / (maxR * paddingRatio);
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Draw equalizer bars
      const barCount = 7;
      const barWidth = 0.10;
      const spacing = 0.14;
      const startX = -((barCount * spacing) / 2);

      for (let i = 0; i < barCount; i++) {
        const bx = startX + i * spacing;
        const barHeights = [0.25, 0.55, 0.80, 0.95, 0.70, 0.45, 0.20];
        const bh = barHeights[i];

        if (Math.abs(nx - bx) < barWidth / 2 && Math.abs(ny) < bh / 2) {
          // Emerald to Cyan gradient (#10b981 to #06b6d4)
          const mix = (i / (barCount - 1));
          r = Math.round(16 * (1 - mix) + 6 * mix);
          g = Math.round(185 * (1 - mix) + 182 * mix);
          b = Math.round(129 * (1 - mix) + 212 * mix);

          // Give rounded end caps
          const cornerY = Math.abs(ny) - (bh / 2 - barWidth / 2);
          if (cornerY > 0) {
            const cornerDist = Math.sqrt(Math.pow(nx - bx, 2) + Math.pow(cornerY, 2));
            if (cornerDist > barWidth / 2) {
              r = Math.round(9 + dy * 10);
              g = Math.round(13 + dy * 12);
              b = Math.round(22 + dy * 20);
            }
          }
        }
      }

      // Outer ring border if not maskable
      if (!isMaskable && dist > 0.88 && dist < 0.92) {
        r = 16;
        g = 185;
        b = 129;
        a = 150;
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
console.log('Icons successfully created in /public!');
