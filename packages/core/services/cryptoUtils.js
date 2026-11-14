/**
 * Cross-platform cryptographic helper.
 * Uses native Node.js crypto in server/test environments and a standard
 * NIST FIPS 180-4 compliant SHA-256 algorithm in browser / React Native / Hermes environments.
 */

let nodeCrypto = null;
try {
  if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
    nodeCrypto = process.getBuiltinModule('crypto');
  }
} catch {
  nodeCrypto = null;
}

// 64 round constants (first 32 bits of the fractional parts of the cube roots of the first 64 prime numbers)
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/**
 * Pure JavaScript NIST FIPS 180-4 compliant SHA-256 implementation.
 * Guarantees standard test-vector cryptographic accuracy in React Native, Hermes, and browsers.
 * @param {Uint8Array} bytes
 * @returns {string} 64-character lowercase hex digest
 */
export function pureJsSha256(bytes) {
  // Initial 256-bit state (first 32 bits of the fractional parts of the square roots of the first 8 primes)
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLength = bytes.length * 8;

  // Pre-processing: append single 1 bit (0x80), then k zero bits such that total length ≡ 448 (mod 512)
  const remainder = (bytes.length + 9) % 64;
  const paddingLength = remainder === 0 ? 0 : 64 - remainder;
  const totalLength = bytes.length + 1 + paddingLength + 8;
  const padded = new Uint8Array(totalLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // Append 64-bit big-endian original bit length
  const highBits = Math.floor(bitLength / 0x100000000);
  const lowBits = bitLength >>> 0;
  const view = new DataView(padded.buffer);
  view.setUint32(totalLength - 8, highBits, false);
  view.setUint32(totalLength - 4, lowBits, false);

  const w = new Int32Array(64);

  // Process each 512-bit (64-byte) chunk
  for (let offset = 0; offset < totalLength; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getInt32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^
                 ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^
                 (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^
                 ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^
                 (w[i - 2] >>> 10);
      w[i] = (((w[i - 16] + s0) | 0) + ((w[i - 7] + s1) | 0)) | 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (((((h + S1) | 0) + ch) | 0) + ((K[i] + w[i]) | 0)) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const toHex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

/**
 * Encodes string to UTF-8 Uint8Array without external dependencies
 */
function toUtf8Bytes(data) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(data);
  }
  // Fallback UTF-8 encoder
  const utf8 = [];
  for (let i = 0; i < data.length; i++) {
    let charcode = data.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (data.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return new Uint8Array(utf8);
}

/**
 * Calculates genuine SHA-256 cryptographic digest.
 * Always produces standard NIST test-vector output across all environments.
 * @param {string | Uint8Array | Buffer} data
 * @returns {string} 64-character lowercase hex digest
 */
export function hashSha256(data) {
  if (data == null) {
    throw new Error('Data cannot be null or undefined for SHA-256 calculation');
  }

  if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
    return nodeCrypto
      .createHash('sha256')
      .update(typeof data === 'string' ? data : Buffer.from(data))
      .digest('hex');
  }

  // Cross-platform standard NIST FIPS 180-4 implementation
  const bytes = typeof data === 'string'
    ? toUtf8Bytes(data)
    : data instanceof Uint8Array
      ? data
      : toUtf8Bytes(JSON.stringify(data));

  return pureJsSha256(bytes);
}
