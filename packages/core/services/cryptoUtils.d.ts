export declare function hashSha256(data: string | Uint8Array | Buffer): string;
export declare function pureJsSha256(bytes: Uint8Array): string;
export declare function hexToBytes(hex: string): Uint8Array;
export declare function bytesToHex(bytes: Uint8Array): string;
export declare function pureJsHmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array;
export declare function deriveKeyPbkdf2(
  password: string,
  salt: string,
  iterations?: number,
  keyLen?: number
): string;
export declare function generateSecureRandomHex(byteCount?: number): string;
export declare function encryptRecord(plaintext: string, keyHex: string): string;
export declare function decryptRecord(ciphertext: string, keyHex: string): string;
