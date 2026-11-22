export type BlueHavenCategory =
  | 'Identity' | 'Education' | 'Finance' | 'Employment' | 'Legal'
  | 'Medical' | 'Personal' | 'Business' | 'Other';

export type BlueHavenDocument = {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  category: BlueHavenCategory;
  folderId: string | null;
  tags: string[];
  description: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  locked: boolean;
  lockHash?: string;
  favorite: boolean;
  demo?: boolean;
};

export type BlueHavenFolder = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  smartRule?: 'all' | 'identity' | 'expiring' | 'recent' | 'large';
};

export type BlueHavenShare = {
  id: string;
  documentId: string;
  email: string;
  permission: 'view' | 'download' | 'edit';
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'revoked';
};

const DB_NAME = 'bluehaven-local-v1';
const STORE = 'files';
const META_KEY = 'bluehaven-metadata-v1';

export const STARTER_FOLDERS: BlueHavenFolder[] = [
  { id: 'folder-identity', name: 'Identity & Travel', color: '#0ea5e9', createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'folder-career', name: 'Career & Education', color: '#8b5cf6', createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'folder-finance', name: 'Finance & Legal', color: '#10b981', createdAt: '2026-01-10T10:00:00.000Z' },
];

const seedDocuments: BlueHavenDocument[] = [
  { id: 'demo-passport', title: 'International Passport', fileName: 'passport-scan.pdf', mimeType: 'application/pdf', size: 2457600, category: 'Identity', folderId: 'folder-identity', tags: ['travel', 'identity'], description: 'Personal passport scan', expiryDate: '2027-02-18', createdAt: '2026-08-12T09:30:00.000Z', updatedAt: '2026-08-12T09:30:00.000Z', locked: true, lockHash: '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', favorite: true, demo: true },
  { id: 'demo-certificate', title: 'University Degree Certificate', fileName: 'degree-certificate.pdf', mimeType: 'application/pdf', size: 1843200, category: 'Education', folderId: 'folder-career', tags: ['education', 'qualification'], description: 'Final degree certificate', expiryDate: '', createdAt: '2026-09-03T13:20:00.000Z', updatedAt: '2026-09-03T13:20:00.000Z', locked: false, favorite: true, demo: true },
  { id: 'demo-contract', title: 'Employment Agreement', fileName: 'employment-agreement.pdf', mimeType: 'application/pdf', size: 860160, category: 'Employment', folderId: 'folder-career', tags: ['work', 'contract'], description: 'Current employment agreement', expiryDate: '2026-12-20', createdAt: '2026-10-04T11:00:00.000Z', updatedAt: '2026-10-04T11:00:00.000Z', locked: false, favorite: false, demo: true },
  { id: 'demo-receipt', title: 'Property Payment Receipt', fileName: 'property-receipt.jpg', mimeType: 'image/jpeg', size: 1258291, category: 'Finance', folderId: 'folder-finance', tags: ['property', 'receipt'], description: 'Proof of property payment', expiryDate: '', createdAt: '2026-10-29T08:15:00.000Z', updatedAt: '2026-10-29T08:15:00.000Z', locked: false, favorite: false, demo: true },
];

export type BlueHavenMetadata = { documents: BlueHavenDocument[]; folders: BlueHavenFolder[]; shares: BlueHavenShare[] };

export function loadMetadata(): BlueHavenMetadata {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return JSON.parse(raw) as BlueHavenMetadata;
  } catch { /* Use starter data when browser storage is unavailable. */ }
  return { documents: seedDocuments, folders: STARTER_FOLDERS, shares: [] };
}

export function saveMetadata(data: BlueHavenMetadata) {
  try { localStorage.setItem(META_KEY, JSON.stringify(data)); } catch { /* UI remains usable for this session. */ }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('This browser does not support local file storage.'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local file storage.'));
  });
}

export async function putFile(id: string, file: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not save file.'));
  });
  db.close();
}

export async function getFile(id: string): Promise<Blob | null> {
  const db = await openDb();
  const result = await new Promise<Blob | null>((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('Could not read file.'));
  });
  db.close();
  return result;
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Could not delete file.'));
  });
  db.close();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) { value /= 1024; index += 1; }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[index]}`;
}

export function formatDate(date: string): string {
  if (!date) return 'No expiry date';
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysUntil(date: string): number | null {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}
