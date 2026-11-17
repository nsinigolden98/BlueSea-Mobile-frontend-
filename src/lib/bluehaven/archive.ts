export type ArchiveEntry = { name: string; data: Uint8Array };

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) crc = (crcTable[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function write16(view: DataView, offset: number, value: number) { view.setUint16(offset, value, true); }
function write32(view: DataView, offset: number, value: number) { view.setUint32(offset, value >>> 0, true); }

/** Creates a standards-compliant ZIP archive, using DEFLATE when the browser supports it. */
export async function createZip(entries: ArchiveEntry[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name.replace(/^\/+/, ''));
    const crc = crc32(entry.data);
    let compressed = entry.data;
    let method = 0;
    if ('CompressionStream' in globalThis) {
      try {
        const stream = new Blob([entry.data]).stream().pipeThrough(new CompressionStream('deflate-raw' as CompressionFormat));
        compressed = new Uint8Array(await new Response(stream).arrayBuffer());
        method = 8;
      } catch { compressed = entry.data; method = 0; }
    }
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    write32(lv, 0, 0x04034b50); write16(lv, 4, 20); write16(lv, 6, 0x0800);
    write16(lv, 8, method); write16(lv, 10, 0); write16(lv, 12, 0);
    write32(lv, 14, crc); write32(lv, 18, compressed.length); write32(lv, 22, entry.data.length);
    write16(lv, 26, name.length); write16(lv, 28, 0); local.set(name, 30);
    localParts.push(local, compressed);

    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    write32(cv, 0, 0x02014b50); write16(cv, 4, 20); write16(cv, 6, 20);
    write16(cv, 8, 0x0800); write16(cv, 10, method); write16(cv, 12, 0); write16(cv, 14, 0);
    write32(cv, 16, crc); write32(cv, 20, compressed.length); write32(cv, 24, entry.data.length);
    write16(cv, 28, name.length); write16(cv, 30, 0); write16(cv, 32, 0);
    write16(cv, 34, 0); write16(cv, 36, 0); write32(cv, 38, 0); write32(cv, 42, offset);
    central.set(name, 46); centralParts.push(central);
    offset += local.length + compressed.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  write32(ev, 0, 0x06054b50); write16(ev, 4, 0); write16(ev, 6, 0);
  write16(ev, 8, entries.length); write16(ev, 10, entries.length);
  write32(ev, 12, centralSize); write32(ev, 16, offset); write16(ev, 20, 0);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
}

export async function encryptBlueArchive(zip: Blob, password: string): Promise<Blob> {
  if (!globalThis.crypto?.subtle) throw new Error('Secure encryption is unavailable in this browser context. Use HTTPS or a secure local environment.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await zip.arrayBuffer());
  const bytesToBase64 = (bytes: Uint8Array) => btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
  const envelope = { format: 'BLUEHAVEN', version: 1, algorithm: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iterations: 250000, salt: bytesToBase64(salt), iv: bytesToBase64(iv), payload: bytesToBase64(new Uint8Array(encrypted)) };
  return new Blob([JSON.stringify(envelope)], { type: 'application/vnd.bluehaven.archive+json' });
}

export async function decryptBlueArchive(file: Blob, password: string): Promise<Blob> {
  if (!globalThis.crypto?.subtle) throw new Error('Secure decryption is unavailable in this browser context.');
  const envelope = JSON.parse(await file.text()) as { format: string; version: number; iterations: number; salt: string; iv: string; payload: string };
  if (envelope.format !== 'BLUEHAVEN' || envelope.version !== 1) throw new Error('This is not a supported BlueHaven archive.');
  const fromBase64 = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));
  const salt = fromBase64(envelope.salt); const iv = fromBase64(envelope.iv); const payload = fromBase64(envelope.payload);
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: envelope.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, payload);
  return new Blob([decrypted], { type: 'application/zip' });
}

export async function extractStoredZip(zip: ArrayBuffer): Promise<ArchiveEntry[]> {
  const bytes = new Uint8Array(zip);
  const view = new DataView(zip);
  const decoder = new TextDecoder();
  const entries: ArchiveEntry[] = [];
  let offset = 0;
  while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const method = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const size = view.getUint32(offset + 22, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    if (method !== 0 && method !== 8) throw new Error('This archive uses a compression method not supported by the current demo extractor.');
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const end = dataStart + compressedSize;
    if (end > bytes.length) throw new Error('The archive appears to be incomplete.');
    let data = bytes.slice(dataStart, end);
    if (method === 8) {
      if (!('DecompressionStream' in globalThis)) throw new Error('This browser cannot extract compressed ZIP entries.');
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw' as CompressionFormat));
      data = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    if (data.length !== size) throw new Error('An archive entry could not be decompressed correctly.');
    entries.push({ name: decoder.decode(bytes.slice(nameStart, nameStart + nameLength)), data });
    offset = end;
  }
  return entries;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = fileName;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
