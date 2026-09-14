import forge from 'node-forge';
import publicKeyPem from './pin_public_key.pem?raw';

export function makeTransactionPin(pin: string): string {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

  const encrypted = publicKey.encrypt(pin, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: { md: forge.md.sha256.create() },
  });

  return forge.util.encode64(encrypted);
}