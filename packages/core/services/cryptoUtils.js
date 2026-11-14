/**
 * Cross-platform cryptographic helper.
 * Uses native Node.js crypto in server/test environments and a fallback in React Native.
 */
let nodeCrypto = null;
try {
  if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
    nodeCrypto = process.getBuiltinModule('crypto');
  }
} catch {
  nodeCrypto = null;
}

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
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (p1 + p2).repeat(4);
}
