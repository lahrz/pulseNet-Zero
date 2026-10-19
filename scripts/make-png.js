import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(2, 9); // color type (RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk (raw scanlines)
  const lineSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * lineSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Draw a subtle border and central cyan reticle
      const distFromCenter = Math.hypot(x - width / 2, y - height / 2);
      if (distFromCenter < width * 0.15) {
        rawData[pxOffset] = 6;
        rawData[pxOffset + 1] = 182;
        rawData[pxOffset + 2] = 212; // Cyan
      } else if (distFromCenter < width * 0.35 && Math.abs(distFromCenter - width * 0.28) < 4) {
        rawData[pxOffset] = 56;
        rawData[pxOffset + 1] = 189;
        rawData[pxOffset + 2] = 248; // Cyan ring
      } else {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b; // Dark slate background #080b12
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(8 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  const crc = calcCrc(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

function calcCrc(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 8, 11, 18));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 8, 11, 18));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 8, 11, 18));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 8, 11, 18));
console.log('PNG PWA assets generated successfully!');
