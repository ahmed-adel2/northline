/**
 * Pure TypeScript QR Code generator (ISO/IEC 18004, Byte mode, ECC Level L, Versions 1-8).
 * Zero external dependencies — generates a real scannable QR matrix and SVG path.
 */

// Version capacities (bytes) at ECC Level L: [totalCodewords, dataCodewords, ecCodewordsPerBlock, numBlocks]
const VERSIONS: Array<{ ver: number; size: number; total: number; data: number; ecPerBlock: number; blocks: number }> = [
  { ver: 1, size: 21, total: 26, data: 19, ecPerBlock: 7, blocks: 1 },
  { ver: 2, size: 25, total: 44, data: 34, ecPerBlock: 10, blocks: 1 },
  { ver: 3, size: 29, total: 70, data: 55, ecPerBlock: 15, blocks: 1 },
  { ver: 4, size: 33, total: 100, data: 80, ecPerBlock: 20, blocks: 1 },
  { ver: 5, size: 37, total: 134, data: 108, ecPerBlock: 26, blocks: 1 },
  { ver: 6, size: 41, total: 172, data: 136, ecPerBlock: 18, blocks: 2 },
  { ver: 7, size: 45, total: 196, data: 156, ecPerBlock: 20, blocks: 2 },
  { ver: 8, size: 49, total: 242, data: 194, ecPerBlock: 24, blocks: 2 },
];

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
};

// GF(256) log/exp tables with primitive polynomial 0x11D
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    EXP[i] = EXP[i - 255];
  }
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function rsComputeECC(data: Uint8Array, ecLen: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLen);
  const res = new Uint8Array(data.length + ecLen);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

function encodeData(bytes: Uint8Array, dataCapacity: number): Uint8Array {
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };

  // Mode 0100 (Byte), 8-bit length (for versions 1-9)
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  // Terminator (up to 4 zeros)
  const maxBits = dataCapacity * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords = new Uint8Array(dataCapacity);
  for (let i = 0; i < bits.length / 8; i++) {
    let val = 0;
    for (let j = 0; j < 8; j++) val = (val << 1) | bits[i * 8 + j];
    codewords[i] = val;
  }
  const pad = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < dataCapacity; i++, p++) {
    codewords[i] = pad[p % 2];
  }
  return codewords;
}

function buildCodewords(text: string) {
  const bytes = new TextEncoder().encode(text);
  // 2 bytes overhead (4-bit mode + 8-bit length -> 12 bits <= 2 bytes)
  const spec = VERSIONS.find((v) => bytes.length + 2 <= v.data) ?? VERSIONS[VERSIONS.length - 1];
  const clipped = bytes.slice(0, spec.data - 2);
  const data = encodeData(clipped, spec.data);

  const blockSize = Math.floor(spec.data / spec.blocks);
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  for (let b = 0; b < spec.blocks; b++) {
    const start = b * blockSize;
    const end = b === spec.blocks - 1 ? spec.data : start + blockSize;
    const slice = data.slice(start, end);
    dataBlocks.push(slice);
    ecBlocks.push(rsComputeECC(slice, spec.ecPerBlock));
  }

  const out: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map((d) => d.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const blk of dataBlocks) if (i < blk.length) out.push(blk[i]);
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (const blk of ecBlocks) out.push(blk[i]);
  }
  return { spec, codewords: out };
}

function createMatrix(size: number) {
  // -1 = unset, 0 = light, 1 = dark
  const m = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));

  const set = (r: number, c: number, val: number) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      m[r][c] = val;
      reserved[r][c] = 1;
    }
  };

  const drawFinder = (r0: number, c0: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = r0 + dr;
        const c = c0 + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const dark =
          inOuter &&
          (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
        set(r, c, dark ? 1 : 0);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0 ? 1 : 0);
    set(i, 6, i % 2 === 0 ? 1 : 0);
  }

  // Dark module
  set(size - 8, 8, 1);

  // Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (reserved[8][i] === 0) set(8, i, 0);
    if (reserved[i][8] === 0) set(i, 8, 0);
  }
  for (let i = size - 8; i < size; i++) {
    set(8, i, 0);
    set(i, 8, 0);
  }

  return { m, reserved, set };
}

function drawAlignments(ver: number, size: number, m: Int8Array[], reserved: Uint8Array[]) {
  const pos = ALIGNMENT_POSITIONS[ver] ?? [];
  for (const r0 of pos) {
    for (const c0 of pos) {
      if (reserved[r0][c0]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          m[r0 + dr][c0 + dc] = dark ? 1 : 0;
          reserved[r0 + dr][c0 + dc] = 1;
        }
      }
    }
  }
}

function writeFormatInfo(m: Int8Array[], size: number, mask: number) {
  // Format info for ECC L (01) + mask (0..7), precomputed with BCH + 0x5412 XOR
  const FORMAT_BITS_L = [
    0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976,
  ];
  const bits = FORMAT_BITS_L[mask];
  for (let i = 0; i < 15; i++) {
    const bit = (bits >> i) & 1;
    // Vertical
    if (i < 6) m[i][8] = bit;
    else if (i < 8) m[i + 1][8] = bit;
    else m[size - 15 + i][8] = bit;
    // Horizontal
    if (i < 8) m[8][size - 1 - i] = bit;
    else if (i < 9) m[8][15 - i] = bit;
    else m[8][14 - i] = bit;
  }
}

export function generateQrMatrix(text: string): number[][] {
  const { spec, codewords } = buildCodewords(text);
  const { size, ver } = spec;
  const { m, reserved } = createMatrix(size);
  drawAlignments(ver, size, m, reserved);

  const allBits: number[] = [];
  for (const cw of codewords) {
    for (let b = 7; b >= 0; b--) allBits.push((cw >> b) & 1);
  }

  // Place data bits in zigzag, using mask 0 ((r + c) % 2 === 0)
  const mask = 0;
  let bitIdx = 0;
  let up = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const r = up ? size - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (!reserved[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          m[r][c] = (r + c) % 2 === 0 ? bit ^ 1 : bit;
        }
      }
    }
    up = !up;
  }

  writeFormatInfo(m, size, mask);
  return m.map((row) => Array.from(row));
}

export function qrSvgPath(matrix: number[][]): { viewBoxSize: number; path: string } {
  const quiet = 2;
  const n = matrix.length;
  const total = n + quiet * 2;
  let d = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c] === 1) {
        d += `M${c + quiet},${r + quiet}h1v1h-1z`;
      }
    }
  }
  return { viewBoxSize: total, path: d };
}
