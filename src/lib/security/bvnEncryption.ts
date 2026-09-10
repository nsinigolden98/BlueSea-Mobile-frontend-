import forge from 'node-forge';

import publicKeyPem from './pin_public_key.pem?raw';

/**
 * Encrypts a BVN for the backend DVA assignment request.
 * The backend expects RSA-OAEP using SHA-256 for both OAEP and MGF1,
 * with the encrypted bytes returned as base64.
 */
export function encryptBvn(bvn: string): string {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const encrypted = publicKey.encrypt(bvn, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha256.create() },
  });

  return forge.util.encode64(encrypted);
}
