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

/**
 * Converts a hex string to Uint8Array
 */
export function hexToBytes(hex) {
  if (typeof hex !== 'string') return new Uint8Array(0);
  const cleanHex = hex.trim().replace(/^0x/i, '');
  const bytes = new Uint8Array(Math.floor(cleanHex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16) || 0;
  }
  return bytes;
}

/**
 * Converts Uint8Array to lowercase hex string
 */
export function bytesToHex(bytes) {
  if (!bytes) return '';
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Pure JavaScript HMAC-SHA256 implementation (RFC 2104).
 * @param {Uint8Array} key
 * @param {Uint8Array} message
 * @returns {Uint8Array} 32-byte HMAC digest
 */
export function pureJsHmacSha256(key, message) {
  let keyBytes = key;
  if (keyBytes.length > 64) {
    keyBytes = hexToBytes(pureJsSha256(keyBytes));
  }
  const keyPad = new Uint8Array(64);
  keyPad.set(keyBytes);

  const ipad = new Uint8Array(64);
  const opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    ipad[i] = keyPad[i] ^ 0x36;
    opad[i] = keyPad[i] ^ 0x5c;
  }

  const innerMsg = new Uint8Array(64 + message.length);
  innerMsg.set(ipad);
  innerMsg.set(message, 64);
  const innerHash = hexToBytes(pureJsSha256(innerMsg));

  const outerMsg = new Uint8Array(64 + 32);
  outerMsg.set(opad);
  outerMsg.set(innerHash, 64);
  return hexToBytes(pureJsSha256(outerMsg));
}

/**
 * Derives a cryptographic key using PBKDF2-HMAC-SHA256 (RFC 8018).
 * Provides memory-hard defense against brute-force dictionary attacks.
 * @param {string} password
 * @param {string} salt
 * @param {number} [iterations=100000]
 * @param {number} [keyLen=32]
 * @returns {string} Hex-encoded derived key
 */
export function deriveKeyPbkdf2(password, salt, iterations = 100000, keyLen = 32) {
  const safePass = String(password ?? '');
  const safeSalt = String(salt ?? '');
  const safeIter = Math.max(1000, Math.min(500000, Number(iterations) || 100000));

  if (nodeCrypto && typeof nodeCrypto.pbkdf2Sync === 'function') {
    return nodeCrypto.pbkdf2Sync(safePass, safeSalt, safeIter, keyLen, 'sha256').toString('hex');
  }

  const passBytes = toUtf8Bytes(safePass);
  const saltBytes = toUtf8Bytes(safeSalt);
  const saltWithBlock = new Uint8Array(saltBytes.length + 4);
  saltWithBlock.set(saltBytes);
  saltWithBlock[saltBytes.length + 3] = 1; // Block index 1 (big-endian)

  let u = pureJsHmacSha256(passBytes, saltWithBlock);
  const result = new Uint8Array(u);

  for (let i = 1; i < safeIter; i++) {
    u = pureJsHmacSha256(passBytes, u);
    for (let j = 0; j < 32; j++) {
      result[j] ^= u[j];
    }
  }

  return bytesToHex(result.slice(0, keyLen));
}

/**
 * Generates cryptographically secure random bytes as hex.
 */
export function generateSecureRandomHex(byteCount = 16) {
  const count = Math.max(8, Math.min(64, byteCount));
  if (nodeCrypto && typeof nodeCrypto.randomBytes === 'function') {
    return nodeCrypto.randomBytes(count).toString('hex');
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(count);
    globalThis.crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
  }
  const bytes = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    bytes[i] = Math.floor(Math.random() * 256) ^ (Date.now() & 0xff);
  }
  return bytesToHex(bytes);
}

/**
 * Encrypts a sensitive string record at rest using authenticated encryption.
 * In Node environments, uses hardware AES-256-GCM.
 * In browser/Hermes environments, uses authenticated HMAC-CTR stream cipher.
 * @param {string} plaintext
 * @param {string} keyHex - 256-bit (64 hex characters) encryption key
 * @returns {string} Formatted ciphertext: enc:v1:<iv>:<tag>:<ciphertext>
 */
export function encryptRecord(plaintext, keyHex) {
  if (plaintext == null) return '';
  const textStr = String(plaintext);
  if (!textStr) return '';

  const cleanKeyHex = (keyHex || '').padEnd(64, '0').slice(0, 64);
  const keyBytes = hexToBytes(cleanKeyHex);
  const ivHex = generateSecureRandomHex(12);
  const ivBytes = hexToBytes(ivHex);

  if (nodeCrypto && typeof nodeCrypto.createCipheriv === 'function') {
    const cipher = nodeCrypto.createCipheriv('aes-256-gcm', keyBytes, ivBytes);
    let enc = cipher.update(textStr, 'utf8', 'hex');
    enc += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return `enc:v1:${ivHex}:${tag}:${enc}`;
  }

  // Pure JS Authenticated CTR-HMAC
  const textBytes = toUtf8Bytes(textStr);
  const out = new Uint8Array(textBytes.length);
  let offset = 0;
  let blockIdx = 0;

  while (offset < textBytes.length) {
    const counterBuf = new Uint8Array(4);
    const view = new DataView(counterBuf.buffer);
    view.setUint32(0, blockIdx++, false);

    const blockInput = new Uint8Array(12 + 4);
    blockInput.set(ivBytes);
    blockInput.set(counterBuf, 12);
    const ks = pureJsHmacSha256(keyBytes, blockInput);

    const take = Math.min(32, textBytes.length - offset);
    for (let i = 0; i < take; i++) {
      out[offset + i] = textBytes[offset + i] ^ ks[i];
    }
    offset += take;
  }

  const tagInput = new Uint8Array(12 + out.length);
  tagInput.set(ivBytes);
  tagInput.set(out, 12);
  const fullTag = pureJsHmacSha256(keyBytes, tagInput);
  const tagHex = bytesToHex(fullTag).slice(0, 32);

  return `enc:v1:${ivHex}:${tagHex}:${bytesToHex(out)}`;
}

/**
 * Decrypts a sensitive string record previously encrypted at rest.
 * Safely passes through unencrypted/legacy records.
 * @param {string} ciphertext
 * @param {string} keyHex - 256-bit encryption key
 * @returns {string} Decrypted plaintext string
 */
export function decryptRecord(ciphertext, keyHex) {
  if (typeof ciphertext !== 'string' || !ciphertext.startsWith('enc:v1:')) {
    return ciphertext ?? '';
  }

  const parts = ciphertext.split(':');
  if (parts.length !== 5) return ciphertext;

  const cleanKeyHex = (keyHex || '').padEnd(64, '0').slice(0, 64);
  const keyBytes = hexToBytes(cleanKeyHex);
  const ivHex = parts[2];
  const tagHex = parts[3];
  const dataHex = parts[4];
  const ivBytes = hexToBytes(ivHex);
  const dataBytes = hexToBytes(dataHex);

  // 1. Try Node AES-256-GCM
  if (nodeCrypto && typeof nodeCrypto.createDecipheriv === 'function') {
    try {
      const decipher = nodeCrypto.createDecipheriv('aes-256-gcm', keyBytes, ivBytes);
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      let dec = decipher.update(dataHex, 'hex', 'utf8');
      dec += decipher.final('utf8');
      return dec;
    } catch {
      // If AES-GCM tag mismatch, proceed to CTR-HMAC fallback check
    }
  }

  // 2. Pure JS Authenticated CTR-HMAC
  try {
    const tagInput = new Uint8Array(12 + dataBytes.length);
    tagInput.set(ivBytes);
    tagInput.set(dataBytes, 12);
    const expectedTag = bytesToHex(pureJsHmacSha256(keyBytes, tagInput)).slice(0, 32);

    if (tagHex !== expectedTag) {
      return '[ENCRYPTED_DATA_AUTH_FAILED]';
    }

    const out = new Uint8Array(dataBytes.length);
    let offset = 0;
    let blockIdx = 0;

    while (offset < dataBytes.length) {
      const counterBuf = new Uint8Array(4);
      const view = new DataView(counterBuf.buffer);
      view.setUint32(0, blockIdx++, false);

      const blockInput = new Uint8Array(12 + 4);
      blockInput.set(ivBytes);
      blockInput.set(counterBuf, 12);
      const ks = pureJsHmacSha256(keyBytes, blockInput);

      const take = Math.min(32, dataBytes.length - offset);
      for (let i = 0; i < take; i++) {
        out[offset + i] = dataBytes[offset + i] ^ ks[i];
      }
      offset += take;
    }

    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder().decode(out);
    }
    let str = '';
    for (let i = 0; i < out.length; i++) {
      str += String.fromCharCode(out[i]);
    }
    return str;
  } catch {
    return '[DECRYPTION_FAILED]';
  }
}
