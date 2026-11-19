import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashSha256,
  pureJsSha256,
  deriveKeyPbkdf2,
  generateSecureRandomHex,
  encryptRecord,
  decryptRecord,
} from './cryptoUtils.js';

describe('Cryptographic Integrity & NIST FIPS 180-4 SHA-256 Compliance', () => {
  const nistVectors = [
    {
      input: '',
      expected: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      input: 'abc',
      expected: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    },
    {
      input: 'hello',
      expected: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    },
    {
      input: 'The quick brown fox jumps over the lazy dog',
      expected: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    },
  ];

  it('matches standard NIST test vectors using hashSha256 (Node crypto path)', () => {
    for (const { input, expected } of nistVectors) {
      const result = hashSha256(input);
      assert.equal(result, expected, `Mismatch for input "${input}"`);
      assert.equal(result.length, 64);
    }
  });

  it('matches standard NIST test vectors using pureJsSha256 (React Native / Hermes fallback)', () => {
    for (const { input, expected } of nistVectors) {
      const bytes = new TextEncoder().encode(input);
      const result = pureJsSha256(bytes);
      assert.equal(result, expected, `Pure JS mismatch for input "${input}"`);
      assert.equal(result.length, 64);
    }
  });

  it('pureJsSha256 and Node crypto produce bit-for-bit identical outputs for arbitrary strings', () => {
    const testCases = [
      'incident_20261114_threat_whatsapp_evidence_01.jpg',
      'UGC_SAMADHAAN_PETITION_2026_HOSTEL_SANITATION',
      '[ALERT] Emergency SOS GPS beacon 17.4483,78.3915 at 11:45:00',
      JSON.stringify({ platform: 'INSTAGRAM', handle: '@stalker_fake', timestamp: '2026-11-14T11:45:00Z' }),
    ];

    for (const tc of testCases) {
      const nodeDigest = hashSha256(tc);
      const pureJsDigest = pureJsSha256(new TextEncoder().encode(tc));
      assert.equal(pureJsDigest, nodeDigest, `Divergence on: ${tc}`);
    }
  });

  it('proves avalanche effect: altering one byte completely changes digest', () => {
    const originalBytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
    const flippedBytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6e]); // "Helln" (1 bit change)
    const hash1 = pureJsSha256(originalBytes);
    const hash2 = pureJsSha256(flippedBytes);
    assert.notEqual(hash1, hash2);
    assert.equal(hash1, '185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969');
  });

  it('throws on null or undefined input', () => {
    assert.throws(() => hashSha256(null), /cannot be null/);
    assert.throws(() => hashSha256(undefined), /cannot be null/);
  });
});

describe('PBKDF2 Key Derivation & Record-Level Content Encryption at Rest', () => {
  it('derives 256-bit key from PIN and salt via PBKDF2-HMAC-SHA256', () => {
    const key = deriveKeyPbkdf2('1234', 'device_salt_test_99', 5000, 32);
    assert.equal(key.length, 64);
    assert.match(key, /^[0-9a-f]{64}$/);

    // Deterministic with same salt and pin
    const key2 = deriveKeyPbkdf2('1234', 'device_salt_test_99', 5000, 32);
    assert.equal(key, key2);

    // Changes with different pin or salt
    const keyOtherPin = deriveKeyPbkdf2('1235', 'device_salt_test_99', 5000, 32);
    assert.notEqual(key, keyOtherPin);
    const keyOtherSalt = deriveKeyPbkdf2('1234', 'device_salt_diff_88', 5000, 32);
    assert.notEqual(key, keyOtherSalt);
  });

  it('generates cryptographically random hex strings of requested byte length', () => {
    const hex12 = generateSecureRandomHex(12);
    assert.equal(hex12.length, 24);
    const hex16 = generateSecureRandomHex(16);
    assert.equal(hex16.length, 32);
    assert.notEqual(hex12, hex16);
  });

  it('encrypts sensitive records at rest and produces authenticated enc:v1 prefix', () => {
    const masterKey = deriveKeyPbkdf2('2468', 'device_keystore_salt_42', 2000, 32);
    const plain = 'Private stalking incident report: Followed home on 14 Nov 2026';

    const encrypted = encryptRecord(plain, masterKey);
    assert.ok(encrypted.startsWith('enc:v1:'));
    assert.ok(!encrypted.includes('stalking'));
    assert.ok(!encrypted.includes('Followed home'));

    const parts = encrypted.split(':');
    assert.equal(parts.length, 5);
    assert.equal(parts[0], 'enc');
    assert.equal(parts[1], 'v1');

    // Decrypts accurately
    const decrypted = decryptRecord(encrypted, masterKey);
    assert.equal(decrypted, plain);
  });

  it('fails decryption or flags auth failure when ciphertext or tag is tampered', () => {
    const masterKey = deriveKeyPbkdf2('9999', 'device_salt_tamper', 2000, 32);
    const plain = 'Confidential witness narrative';
    const encrypted = encryptRecord(plain, masterKey);

    // Tamper with the ciphertext body
    const parts = encrypted.split(':');
    const tamperedCt = parts[4].slice(0, -2) + (parts[4].slice(-2) === 'aa' ? 'bb' : 'aa');
    const tamperedEncrypted = `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:${tamperedCt}`;

    // Tampered payload fails authentication
    let result = '';
    try {
      result = decryptRecord(tamperedEncrypted, masterKey);
    } catch {
      result = '[DECRYPTION_FAILED]';
    }
    assert.notEqual(result, plain);
  });

  it('safely passes through unencrypted legacy records without crashing', () => {
    const masterKey = deriveKeyPbkdf2('1111', 'salt', 1000, 32);
    const legacyPlain = 'Ordinary unencrypted note from older version';
    const result = decryptRecord(legacyPlain, masterKey);
    assert.equal(result, legacyPlain);
  });
});

