import { pureJsSha256, hashSha256 } from '@walking-companion/core';

export interface HashedEvidenceResult {
  hash: string;
  integrityType: 'FILE_CONTENT_SHA256' | 'METADATA_CHECKSUM';
  byteCount: number;
  isByteLevel: boolean;
  label: string;
}

/**
 * Converts a Base64 string to Uint8Array bytes
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Reads actual file bytes and computes genuine NIST FIPS 180-4 SHA-256.
 * If file byte reading is blocked by OS sandbox permissions, falls back
 * honestly to METADATA_CHECKSUM without false labeling.
 */
export async function readAndHashFile(
  uri: string,
  fileName: string,
  fileSize?: number
): Promise<HashedEvidenceResult> {
  // 1. Attempt reading raw bytes via fetch / ArrayBuffer (standard in React Native / Expo)
  try {
    const response = await fetch(uri);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      if (buffer && buffer.byteLength > 0) {
        const bytes = new Uint8Array(buffer);
        const digest = pureJsSha256(bytes);
        return {
          hash: digest,
          integrityType: 'FILE_CONTENT_SHA256',
          byteCount: bytes.length,
          isByteLevel: true,
          label: `SHA-256 Content Byte Hash (${bytes.length} bytes)`,
        };
      }
    }
  } catch {
    // ArrayBuffer read attempt failed, continue to Base64 reader
  }

  // 2. Fallback to honest metadata checksum if OS restricts byte read
  const metadataStr = `NAME=${fileName};SIZE=${fileSize || 0};URI=${uri}`;
  const metadataDigest = hashSha256(metadataStr);

  return {
    hash: metadataDigest,
    integrityType: 'METADATA_CHECKSUM',
    byteCount: fileSize || 0,
    isByteLevel: false,
    label: `Metadata Checksum (${fileSize || 0} bytes)`,
  };
}

