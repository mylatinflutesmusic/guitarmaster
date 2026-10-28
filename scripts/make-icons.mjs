/**
 * Generates the PNG icons for the home screen.
 *
 * Written by hand with zlib so the project needs no image dependencies:
 * a rounded wood-coloured tile, a soundhole with an amber ring, and six strings,
 * rasterised with 2x supersampling. Run with: node scripts/make-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public";

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => Math.round(a + (b - a) * t);

/** Rounded-rectangle test in unit coordinates, corner radius r. */
function inTile(u, v, r) {
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  const cx = u < r ? r : u > 1 - r ? 1 - r : u;
  const cy = v < r ? r : v > 1 - r ? 1 - r : v;
  return Math.hypot(u - cx, v - cy) <= r + 1e-9;
}

function sample(u, v, maskable) {
  if (!maskable && !inTile(u, v, 0.22)) return [0, 0, 0, 0];
  let r = lerp(0x3b, 0x18, v);
  let g = lerp(0x2a, 0x12, v);
  let b = lerp(0x1d, 0x0e, v);

  const d = Math.hypot(u - 0.5, v - 0.56);
  if (d < 0.245) {
    if (d < 0.228) {
      r = 0x0b;
      g = 0x08;
      b = 0x06;
    } else {
      r = mix(r, 0xc8, 0.6);
      g = mix(g, 0x91, 0.6);
      b = mix(b, 0x3f, 0.6);
    }
  }

  if (v > 0.09 && v < 0.93) {
    const offsets = [-0.09, -0.048, 0, 0.048, 0.09];
    const widths = [0.0062, 0.005, 0.0072, 0.005, 0.0056];
    for (let i = 0; i < 6; i++) {
      if (Math.abs(u - (0.5 + offsets[i])) < widths[i]) {
        r = mix(r, 0xe8, 0.88);
        g = mix(g, 0xd3, 0.88);
        b = mix(b, 0xae, 0.88);
      }
    }
  }
  return [r, g, b, 255];
}

function render(size, maskable) {
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (const dy of [0.25, 0.75]) {
        for (const dx of [0.25, 0.75]) {
          const [sr, sg, sb, sa] = sample((x + dx) / size, (y + dy) / size, maskable);
          r += sr * sa;
          g += sg * sa;
          b += sb * sa;
          a += sa;
        }
      }
      const i = (y * size + x) * 4;
      if (a > 0) {
        out[i] = Math.round(r / a);
        out[i + 1] = Math.round(g / a);
        out[i + 2] = Math.round(b / a);
      }
      out[i + 3] = Math.round(a / 4);
    }
  }
  return out;
}

mkdirSync(OUT, { recursive: true });
const jobs = [
  { file: "icon-192.png", size: 192, maskable: false },
  { file: "icon-512.png", size: 512, maskable: false },
  { file: "apple-touch-icon.png", size: 180, maskable: true },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
];

for (const job of jobs) {
  const png = encodePng(job.size, job.size, render(job.size, job.maskable));
  writeFileSync(`${OUT}/${job.file}`, png);
  console.log(`${job.file}  ${job.size}x${job.size}  ${(png.length / 1024).toFixed(1)} kB`);
}
