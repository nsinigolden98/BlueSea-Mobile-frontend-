import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowRight, Bell, CalendarClock, CheckCircle2, ChevronRight, Cloud,
  Clock3, Download, File as FileIcon, FileArchive, FileImage, FileText, Filter, Folder,
  FolderPlus, HardDrive, HelpCircle, Home, Lock, LockKeyhole, Menu,
  MoreHorizontal, Plus, RefreshCw, Search, Settings2, Share2, Shield,
  ShieldCheck, Sparkles, Star, Trash2, UnlockKeyhole, Upload, Users, X,
} from 'lucide-react';
import { Sidebar } from '@/components/ui-custom/Sidebar';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import {
  type BlueHavenCategory, type BlueHavenDocument, type BlueHavenFolder,
  type BlueHavenShare, loadMetadata, saveMetadata, putFile, getFile, deleteFile,
  formatBytes, formatDate, daysUntil,
} from '@/lib/bluehaven/storage';
import { createZip, decryptBlueArchive, downloadBlob, encryptBlueArchive, extractStoredZip, uint8ArrayToArrayBuffer } from '@/lib/bluehaven/archive';
import './bluehaven.css';

type Section = 'overview' | 'documents' | 'smart' | 'shared' | 'expiring' | 'archives' | 'storage' | 'cloud' | 'security' | 'settings';
type Modal = 'upload' | 'folder' | 'preview' | 'share' | 'lock' | 'archive' | 'edit' | 'import' | 'storage' | null;
const CATEGORIES: BlueHavenCategory[] = ['Identity', 'Education', 'Finance', 'Employment', 'Legal', 'Medical', 'Personal', 'Business', 'Other'];
const CAPACITY_GB = 3;
const CLOUD_KEY = 'bluehaven-cloud-connections-v1';
const GB = 1024 ** 3;
const sectionItems: { id: Section; label: string; icon: typeof Home }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'documents', label: 'My documents', icon: FileText },
  { id: 'smart', label: 'Smart folders', icon: Sparkles },
  { id: 'shared', label: 'Shared with me', icon: Users },
  { id: 'expiring', label: 'Expiry tracker', icon: CalendarClock },
  { id: 'archives', label: 'Archives', icon: FileArchive },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'cloud', label: 'Cloud connections', icon: Cloud },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];


function shortDate(value: string) { return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); }
function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return FileImage;
  if (mime.includes('pdf') || mime.includes('text') || mime.includes('word')) return FileText;
  return FileIcon;
}
function makeId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }

export default function BlueHavenHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<Section>('overview');
  const [metadata, setMetadata] = useState(loadMetadata);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All types');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [smartFilter, setSmartFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeDocument, setActiveDocument] = useState<BlueHavenDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [notice, setNotice] = useState('');
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#0ea5e9');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<BlueHavenCategory>('Personal');
  const [uploadFolder, setUploadFolder] = useState('');
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'download' | 'edit'>('view');
  const [shareExpiry, setShareExpiry] = useState('');
  const [lockPassword, setLockPassword] = useState('');
  const [archivePassword, setArchivePassword] = useState('');
  const [archiveName, setArchiveName] = useState('My BlueHaven files');
  const [editorContent, setEditorContent] = useState('');
  const [storageCapacity, setStorageCapacity] = useState(() => {
    try {
      const saved = Number(localStorage.getItem('bluehaven-capacity-gb'));
      return Number.isFinite(saved) && saved >= CAPACITY_GB ? Math.min(saved, 1024) : CAPACITY_GB;
    } catch { return CAPACITY_GB; }
  });
  const [cloudConnections, setCloudConnections] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(CLOUD_KEY) || '{}') as Record<string, boolean>; } catch { return {}; }
  });
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveMetadata(metadata); }, [metadata]);
  useEffect(() => { try { localStorage.setItem('bluehaven-capacity-gb', String(storageCapacity)); } catch { /* Local demo preference only. */ } }, [storageCapacity]);
  useEffect(() => { try { localStorage.setItem(CLOUD_KEY, JSON.stringify(cloudConnections)); } catch { /* Local demo preference only. */ } }, [cloudConnections]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const usedBytes = metadata.documents.reduce((sum, doc) => sum + doc.size, 0);
  const capacityBytes = storageCapacity * GB;
  const usage = Math.min(100, (usedBytes / capacityBytes) * 100);
  const expiringDocuments = metadata.documents.filter(doc => {
    const days = daysUntil(doc.expiryDate);
    return days !== null && days >= 0 && days <= 90;
  }).sort((a, b) => (daysUntil(a.expiryDate) ?? 999) - (daysUntil(b.expiryDate) ?? 999));
  const recentDocuments = [...metadata.documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const activeShares = metadata.shares.filter(share => share.status === 'active');

  const filteredDocuments = useMemo(() => {
    let docs = [...metadata.documents];
    if (categoryFilter !== 'All types') docs = docs.filter(doc => doc.category === categoryFilter);
    if (activeFolderId) docs = docs.filter(doc => doc.folderId === activeFolderId);
    if (smartFilter === 'Identity') docs = docs.filter(doc => doc.category === 'Identity');
    if (smartFilter === 'Recent') docs = docs.slice(0, 4);
    if (smartFilter === 'Expiring') docs = docs.filter(doc => expiringDocuments.some(item => item.id === doc.id));
    if (smartFilter === 'Favourites') docs = docs.filter(doc => doc.favorite);
    if (smartFilter === 'Unfiled') docs = docs.filter(doc => !doc.folderId);
    if (smartFilter === 'Large') docs = docs.filter(doc => doc.size > 5 * 1024 * 1024);
    if (query.trim()) {
      const q = query.toLowerCase();
      docs = docs.filter(doc => [doc.title, doc.fileName, doc.category, doc.description, ...doc.tags].join(' ').toLowerCase().includes(q));
    }
    if (section === 'expiring') docs = docs.filter(doc => expiringDocuments.some(item => item.id === doc.id));
    if (section === 'smart') docs = docs.filter(doc => !doc.folderId || doc.category === 'Identity' || doc.favorite);
    return docs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [metadata.documents, categoryFilter, query, section, expiringDocuments, activeFolderId, smartFilter]);

  const showNotice = (message: string) => setNotice(message);
  const changeSection = (next: Section) => { setSection(next); setQuery(''); setCategoryFilter('All types'); setActiveFolderId(null); setSmartFilter(null); setSelected([]); };
  const openFolder = (folderId: string) => { setSection('documents'); setQuery(''); setCategoryFilter('All types'); setActiveFolderId(folderId); setSmartFilter(null); setSelected([]); };
  const openUpload = () => { setUploadFile(null); setUploadTitle(''); setUploadCategory('Personal'); setUploadFolder(''); setUploadExpiry(''); setUploadDescription(''); setUploadTags(''); setModal('upload'); };
  const onFileChosen = (file?: File) => {
    if (!file) return;
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
  };

  const saveUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) { showNotice('Choose a file and give it a clear title first.'); return; }
    const duplicate = metadata.documents.find(doc => doc.fileName.toLowerCase() === uploadFile.name.toLowerCase() && doc.size === uploadFile.size);
    if (duplicate && !window.confirm(`A file with the same name and size already exists as “${duplicate.title}”. Add another copy anyway?`)) return;
    if (usedBytes + uploadFile.size > capacityBytes) { setModal('storage'); showNotice('This upload exceeds your available storage.'); return; }
    setBusy(true);
    try {
      const id = makeId();
      await putFile(id, uploadFile);
      const now = new Date().toISOString();
      const doc: BlueHavenDocument = {
        id, title: uploadTitle.trim(), fileName: uploadFile.name, mimeType: uploadFile.type || 'application/octet-stream',
        size: uploadFile.size, category: uploadCategory, folderId: uploadFolder || null,
        tags: uploadTags.split(',').map(tag => tag.trim()).filter(Boolean), description: uploadDescription.trim(),
        expiryDate: uploadExpiry, createdAt: now, updatedAt: now, locked: false, favorite: false,
      };
      setMetadata(current => ({ ...current, documents: [doc, ...current.documents] }));
      setModal(null); setUploadFile(null); showNotice('Document added to your local BlueHaven workspace.');
    } catch (error) { showNotice(error instanceof Error ? error.message : 'Could not save this file in this browser.'); }
    finally { setBusy(false); }
  };

  const createFolder = () => {
    if (!folderName.trim()) { showNotice('Enter a folder name.'); return; }
    const folder: BlueHavenFolder = { id: makeId(), name: folderName.trim(), color: folderColor, createdAt: new Date().toISOString() };
    setMetadata(current => ({ ...current, folders: [...current.folders, folder] }));
    setFolderName(''); setModal(null); showNotice('Folder created.');
  };

  const toggleSelected = (id: string) => setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const toggleFavorite = (doc: BlueHavenDocument) => {
    setMetadata(current => ({ ...current, documents: current.documents.map(item => item.id === doc.id ? { ...item, favorite: !item.favorite, updatedAt: new Date().toISOString() } : item) }));
  };
  const updateDocument = (doc: BlueHavenDocument, patch: Partial<BlueHavenDocument>) => {
    setMetadata(current => ({ ...current, documents: current.documents.map(item => item.id === doc.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item) }));
    setActiveDocument(current => current?.id === doc.id ? { ...current, ...patch } : current);
  };
  const removeDocument = async (doc: BlueHavenDocument) => {
    if (!window.confirm(`Move “${doc.title}” to deleted items?`)) return;
    if (!doc.demo) await deleteFile(doc.id).catch(() => undefined);
    setMetadata(current => ({ ...current, documents: current.documents.filter(item => item.id !== doc.id), shares: current.shares.filter(share => share.documentId !== doc.id) }));
    setActiveDocument(null); setModal(null); showNotice('Document removed from this demo vault.');
  };
  const previewDocument = async (doc: BlueHavenDocument) => {
    setActiveDocument(doc);
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }
    if (doc.locked) { setModal('lock'); return; }
    const blob = await getFile(doc.id).catch(() => null);
    if (blob) setPreviewUrl(URL.createObjectURL(blob));
    setModal('preview');
  };
  const downloadDocument = async (doc: BlueHavenDocument) => {
    const blob = await getFile(doc.id);
    if (!blob) { showNotice('This is a sample document. Upload a real file to preview or download its contents.'); return; }
    downloadBlob(blob, doc.fileName); showNotice('Download prepared.');
  };
  const openEditor = async (doc: BlueHavenDocument) => {
    if (!(doc.mimeType.startsWith('text/') || /\.(txt|md|csv|json)$/i.test(doc.fileName))) {
      const title = window.prompt('Update document title', doc.title);
      if (title?.trim()) { updateDocument(doc, { title: title.trim() }); showNotice('Document details updated.'); }
      return;
    }
    const blob = await getFile(doc.id);
    if (!blob) { showNotice('This sample record has no editable file content. Upload a text file to edit it.'); return; }
    setEditorContent(await blob.text()); setActiveDocument(doc); setModal('edit');
  };
  const saveEditor = async () => {
    if (!activeDocument) return;
    const blob = new Blob([editorContent], { type: activeDocument.mimeType || 'text/plain' });
    await putFile(activeDocument.id, blob);
    updateDocument(activeDocument, { size: blob.size });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
    setModal('preview'); showNotice('Document changes saved in this browser.');
  };
  const shareDocument = () => {
    if (!activeDocument || !shareEmail.includes('@')) { showNotice('Enter a valid email address.'); return; }
    const share: BlueHavenShare = { id: makeId(), documentId: activeDocument.id, email: shareEmail.trim(), permission: sharePermission, createdAt: new Date().toISOString(), expiresAt: shareExpiry, status: 'active' };
    setMetadata(current => ({ ...current, shares: [share, ...current.shares] }));
    setShareEmail(''); setShareExpiry(''); setModal(null); showNotice('Demo share invitation created. No email has been sent.');
  };
  const revokeShare = (id: string) => setMetadata(current => ({ ...current, shares: current.shares.map(share => share.id === id ? { ...share, status: 'revoked' } : share) }));
  const lockDocument = async () => {
    if (!activeDocument || lockPassword.length < 4) { showNotice('Enter at least four characters for the demo lock.'); return; }
    try {
      const digest = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('');
      if (activeDocument.locked) {
        const expected = activeDocument.lockHash ?? '';
        if (expected && await digest(lockPassword) !== expected) { showNotice('That password does not match this document.'); return; }
        updateDocument(activeDocument, { locked: false, lockHash: undefined });
        const blob = await getFile(activeDocument.id).catch(() => null);
        if (blob) setPreviewUrl(URL.createObjectURL(blob));
        setLockPassword(''); setModal('preview');
        showNotice('Document unlocked in this demo.');
      } else {
        updateDocument(activeDocument, { locked: true, lockHash: await digest(lockPassword) }); setLockPassword(''); setModal(null);
        showNotice('Document locked in this demo.');
      }
    } catch { showNotice('Password hashing is unavailable in this browser context.'); }
  };

  const buildArchive = async (encrypted: boolean) => {
    const docs = metadata.documents.filter(doc => selected.includes(doc.id));
    if (!docs.length) { showNotice('Select at least one document first.'); return; }
    if (encrypted && archivePassword.length < 8) { showNotice('Use an archive password with at least 8 characters.'); return; }
    setBusy(true);
    try {
      const entries: { name: string; data: Uint8Array }[] = [];
      for (const doc of docs) {
        const blob = await getFile(doc.id);
        if (!blob) continue;
        entries.push({ name: doc.fileName, data: new Uint8Array(await blob.arrayBuffer()) });
      }
      if (!entries.length) { showNotice('The selected sample records do not contain real file data. Upload files to create an archive.'); return; }
      const zip = await createZip(entries);
      const result = encrypted ? await encryptBlueArchive(zip, archivePassword) : zip;
      downloadBlob(result, `${archiveName.trim().replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '-') || 'bluehaven-archive'}.${encrypted ? 'blue' : 'zip'}`);
      setModal(null); setArchivePassword(''); showNotice(`${encrypted ? '.blue encrypted archive' : '.zip archive'} created successfully.`);
    } catch (error) { showNotice(error instanceof Error ? error.message : 'Archive creation failed.'); }
    finally { setBusy(false); }
  };

  const importArchive = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      let zipBlob: Blob = file;
      if (file.name.toLowerCase().endsWith('.blue')) {
        const password = window.prompt('Enter the password for this BlueHaven archive:');
        if (!password) { setBusy(false); return; }
        zipBlob = await decryptBlueArchive(file, password);
      }
      const entries = await extractStoredZip(await zipBlob.arrayBuffer());
      let imported = 0;
      let importedBytes = usedBytes;
      for (const entry of entries) {
        if (entry.name.endsWith('/')) continue;
        const blob = new Blob([uint8ArrayToArrayBuffer(entry.data)]);
        if (importedBytes + blob.size > capacityBytes) break;
        importedBytes += blob.size;
        const id = makeId(); await putFile(id, blob);
        const now = new Date().toISOString();
        const name = entry.name.split('/').pop() || entry.name;
        const ext = name.split('.').pop()?.toLowerCase() || '';
        const mime = ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';
        const doc: BlueHavenDocument = { id, title: name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '), fileName: name, mimeType: mime, size: blob.size, category: 'Other', folderId: null, tags: ['archive import'], description: `Imported from ${file.name}`, expiryDate: '', createdAt: now, updatedAt: now, locked: false, favorite: false };
        setMetadata(current => ({ ...current, documents: [...current.documents, doc] })); imported += 1;
      }
      showNotice(`${imported} file${imported === 1 ? '' : 's'} extracted into My Documents.`);
    } catch (error) { showNotice(error instanceof Error ? error.message : 'Could not open this archive.'); }
    finally { setBusy(false); }
  };

  const purchaseStorage = (gb: number) => {
    setStorageCapacity(current => Math.min(1024, current + gb)); setModal(null);
    showNotice(`Demo upgrade applied: +${gb >= 1024 ? '1TB' : `${gb}GB`}. No real payment was collected.`);
  };

  const DocumentRow = ({ doc }: { doc: BlueHavenDocument }) => {
    const Icon = fileIcon(doc.mimeType);
    const days = daysUntil(doc.expiryDate);
    return (
      <div className="bh-document-row">
        <input aria-label={`Select ${doc.title}`} type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggleSelected(doc.id)} className="bh-checkbox" />
        <button type="button" className="bh-file-icon" onClick={() => void previewDocument(doc)} aria-label={`Open ${doc.title}`}><Icon size={21} /></button>
        <button type="button" className="bh-document-main" onClick={() => void previewDocument(doc)}>
          <span className="bh-document-title">{doc.title}</span>
          <span className="bh-document-sub">{doc.fileName} <i>·</i> {formatBytes(doc.size)}</span>
        </button>
        <span className="bh-category-pill">{doc.category}</span>
        {days !== null && <span className={`bh-expiry-chip ${days <= 30 ? 'urgent' : ''}`}>{days < 0 ? 'Expired' : `${days}d left`}</span>}
        {doc.locked && <Lock size={14} className="bh-muted-icon" />}
        <button type="button" className="bh-icon-button" aria-label={doc.favorite ? 'Remove favourite' : 'Add favourite'} onClick={() => toggleFavorite(doc)}><Star size={16} fill={doc.favorite ? 'currentColor' : 'none'} /></button>
        <button type="button" className="bh-icon-button" aria-label="More document actions" onClick={() => void previewDocument(doc)}><MoreHorizontal size={18} /></button>
      </div>
    );
  };

  const FolderCard = ({ folder }: { folder: BlueHavenFolder }) => {
    const docs = metadata.documents.filter(doc => doc.folderId === folder.id);
    return <button type="button" className="bh-folder-card" onClick={() => openFolder(folder.id)}>
      <div className="bh-folder-top"><span className="bh-folder-icon" style={{ background: `${folder.color}18`, color: folder.color }}><Folder size={22} fill="currentColor" /></span><MoreHorizontal size={17} className="bh-muted-icon" /></div>
      <strong>{folder.name}</strong><span>{docs.length} document{docs.length === 1 ? '' : 's'}</span>
      <div className="bh-folder-foot"><span className="bh-folder-dot" style={{ background: folder.color }} />{formatBytes(docs.reduce((sum, doc) => sum + doc.size, 0))} stored</div>
    </button>;
  };

  return (
    <div className="bh-app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="bh-main-shell">
        <header className="bh-topbar">
          <button type="button" className="bh-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open app menu"><Menu size={21} /></button>
          <div className="bh-brand-lockup"><span className="bh-brand-mark"><Shield size={19} /></span><span><strong>BlueHaven</strong><small>Secure personal workspace</small></span></div>
          <div className="bh-top-actions"><span className="bh-environment"><span /> Demo workspace</span><button className="bh-top-icon" type="button" onClick={() => changeSection('expiring')} aria-label="Expiry notifications"><Bell size={19} />{expiringDocuments.length > 0 && <i />}</button><div className="bh-avatar">BH</div></div>
        </header>
        <div className="bh-workspace">
          <aside className="bh-module-nav">
            <div className="bh-nav-label">WORKSPACE</div>
            {sectionItems.map(item => { const Icon = item.icon; return <button key={item.id} type="button" className={`bh-nav-item ${section === item.id ? 'active' : ''}`} onClick={() => changeSection(item.id)}><Icon size={17} /><span>{item.label}</span>{item.id === 'expiring' && expiringDocuments.length > 0 && <b>{expiringDocuments.length}</b>}</button>; })}
            <div className="bh-nav-divider" />
            <div className="bh-nav-label bh-nav-folder-heading"><span>YOUR FOLDERS</span><button type="button" onClick={() => setModal('folder')} aria-label="Create folder"><Plus size={15} /></button></div>
            {metadata.folders.slice(0, 5).map(folder => <button type="button" className="bh-nav-folder" key={folder.id} onClick={() => openFolder(folder.id)}><span style={{ background: folder.color }} />{folder.name}</button>)}
            <button type="button" className="bh-create-folder-link" onClick={() => setModal('folder')}><FolderPlus size={15} /> New folder</button>
            <div className="bh-nav-help"><span className="bh-help-icon"><HelpCircle size={17} /></span><strong>Need a hand?</strong><p>Learn how to organise and protect your important files.</p><button type="button" onClick={() => showNotice('Help centre is part of the upcoming connected experience.')}>Explore guide <ArrowRight size={13} /></button></div>
          </aside>

          <main className="bh-content">
            {section === 'overview' && <>
              <div className="bh-page-heading"><div><div className="bh-eyebrow">YOUR PRIVATE DIGITAL SPACE</div><h1>Good to see you again.</h1><p>Everything important, safely in one place.</p></div><button className="bh-primary-button" type="button" onClick={openUpload}><Upload size={17} /> Upload files</button></div>
              <div className="bh-storage-hero">
                <div className="bh-storage-copy"><span className="bh-hero-kicker"><ShieldCheck size={14} /> YOUR STORAGE OVERVIEW</span><h2>{formatBytes(usedBytes)} <span>of {storageCapacity} GB used</span></h2><p>{formatBytes(Math.max(0, capacityBytes - usedBytes))} available in your personal space</p><div className="bh-storage-track"><span style={{ width: `${usage}%` }} /></div><div className="bh-storage-foot"><span>{usage.toFixed(1)}% used</span><button type="button" onClick={() => changeSection('storage')}>Manage storage <ArrowRight size={14} /></button></div></div>
                <div className="bh-storage-art"><div className="bh-art-orbit orbit-one"/><div className="bh-art-orbit orbit-two"/><div className="bh-art-shield"><ShieldCheck size={43} /></div><span className="bh-art-file file-one"><FileText size={18} /></span><span className="bh-art-file file-two"><FileImage size={17} /></span><span className="bh-art-file file-three"><FileArchive size={18} /></span></div>
              </div>
              <div className="bh-metric-grid">
                <button type="button" className="bh-metric-card" onClick={() => changeSection('documents')}><span className="bh-metric-icon blue"><FilesIcon /></span><span className="bh-metric-value">{metadata.documents.length}</span><span className="bh-metric-label">Saved documents</span><span className="bh-metric-link">View library <ChevronRight size={13} /></span></button>
                <button type="button" className="bh-metric-card" onClick={() => changeSection('smart')}><span className="bh-metric-icon purple"><Sparkles size={19} /></span><span className="bh-metric-value">{metadata.folders.length}</span><span className="bh-metric-label">Organised folders</span><span className="bh-metric-link">Explore folders <ChevronRight size={13} /></span></button>
                <button type="button" className="bh-metric-card" onClick={() => changeSection('expiring')}><span className="bh-metric-icon amber"><Clock3 size={19} /></span><span className="bh-metric-value">{expiringDocuments.length}</span><span className="bh-metric-label">Upcoming expiries</span><span className="bh-metric-link">Review dates <ChevronRight size={13} /></span></button>
                <button type="button" className="bh-metric-card" onClick={() => changeSection('shared')}><span className="bh-metric-icon green"><Share2 size={19} /></span><span className="bh-metric-value">{activeShares.length}</span><span className="bh-metric-label">Active shares</span><span className="bh-metric-link">Manage access <ChevronRight size={13} /></span></button>
              </div>
              <div className="bh-section-heading"><div><h2>Quick access</h2><p>Pick up where you left off.</p></div><button type="button" className="bh-text-button" onClick={() => changeSection('documents')}>View all documents <ArrowRight size={14} /></button></div>
              <div className="bh-document-list">{recentDocuments.map(doc => <DocumentRow key={doc.id} doc={doc} />)}</div>
              <div className="bh-overview-bottom"><div className="bh-panel"><div className="bh-panel-heading"><div><h3>Your folders</h3><p>Keep related files together.</p></div><button type="button" onClick={() => setModal('folder')}><Plus size={16} /> New</button></div><div className="bh-folder-grid">{metadata.folders.slice(0, 3).map(folder => <FolderCard key={folder.id} folder={folder} />)}</div></div><div className="bh-panel bh-expiry-panel"><div className="bh-panel-heading"><div><h3>Expiry watch</h3><p>Documents that need your attention.</p></div><button type="button" onClick={() => changeSection('expiring')}>See all</button></div>{expiringDocuments.slice(0, 3).map(doc => <div className="bh-expiry-line" key={doc.id}><span className="bh-expiry-file"><FileText size={16} /></span><span><strong>{doc.title}</strong><small>Expires {formatDate(doc.expiryDate)}</small></span><b>{daysUntil(doc.expiryDate)}d</b></div>)}{!expiringDocuments.length && <p className="bh-empty-inline">No upcoming expiries. You're all caught up.</p>}</div></div>
            </>}

            {section !== 'overview' && <>
              <div className="bh-page-heading"><div><div className="bh-eyebrow">BLUEHAVEN WORKSPACE</div><h1>{sectionItems.find(item => item.id === section)?.label}</h1><p>{section === 'documents' ? 'Your files, clearly organised and easy to find.' : section === 'smart' ? 'Useful collections that help keep your files organised.' : section === 'shared' ? 'Keep track of files shared with you and people you have invited.' : section === 'expiring' ? 'Stay ahead of important document renewal dates.' : section === 'archives' ? 'Create, protect and open portable file archives.' : section === 'storage' ? 'Understand your storage and choose when to expand it.' : section === 'security' ? 'Manage the protection settings for your workspace.' : 'Personalise your BlueHaven experience.'}</p></div>{section === 'documents' && <button className="bh-primary-button" type="button" onClick={openUpload}><Upload size={17} /> Upload files</button>}{section === 'smart' && <button className="bh-primary-button" type="button" onClick={() => setModal('folder')}><FolderPlus size={17} /> New folder</button>}</div>
              {section === 'documents' && <><div className="bh-toolbar"><div className="bh-search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name, tag or category..." /></div><select className="bh-select" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}><option>All types</option>{CATEGORIES.map(category => <option key={category}>{category}</option>)}</select><button className="bh-outline-button" type="button" onClick={() => setSelected(metadata.documents.map(doc => doc.id))}>Select all</button></div>{selected.length > 0 && <div className="bh-selection-bar"><span>{selected.length} selected</span><button type="button" onClick={() => setModal('archive')}><FileArchive size={15} /> Create archive</button><button type="button" onClick={() => setSelected([])}>Clear</button></div>}<div className="bh-document-list">{filteredDocuments.map(doc => <DocumentRow key={doc.id} doc={doc} />)}{!filteredDocuments.length && <div className="bh-empty-state"><FileText size={28} /><strong>No documents found</strong><p>Try another search or upload a document to get started.</p><button className="bh-primary-button" type="button" onClick={openUpload}><Upload size={16} /> Upload a document</button></div>}</div></>}
              {section === 'smart' && <><div className="bh-smart-intro"><Sparkles size={20} /><div><strong>Collections that think ahead</strong><p>These views update automatically from your document details. Add titles, categories and expiry dates to make them more useful.</p></div></div><div className="bh-smart-grid">{[{ name: 'Identity documents', desc: 'Passports, IDs and travel records', count: metadata.documents.filter(doc => doc.category === 'Identity').length, icon: ShieldCheck, color: 'blue', filter: 'Identity' }, { name: 'Recently added', desc: 'Your newest uploads and updates', count: recentDocuments.length, icon: Clock3, color: 'purple', filter: 'Recent' }, { name: 'Needs attention', desc: 'Documents expiring in the next 90 days', count: expiringDocuments.length, icon: AlertTriangle, color: 'amber', filter: 'Expiring' }, { name: 'Favourites', desc: 'Files you marked for quick access', count: metadata.documents.filter(doc => doc.favorite).length, icon: Star, color: 'green', filter: 'Favourites' }, { name: 'Unfiled documents', desc: 'Files waiting to be organised', count: metadata.documents.filter(doc => !doc.folderId).length, icon: Folder, color: 'slate', filter: 'Unfiled' }, { name: 'Large files', desc: 'Documents using the most space', count: metadata.documents.filter(doc => doc.size > 5 * 1024 * 1024).length, icon: HardDrive, color: 'blue', filter: 'Large' }].map(item => <button type="button" className="bh-smart-card" key={item.name} onClick={() => { setSection('documents'); setQuery(''); setCategoryFilter('All types'); setActiveFolderId(null); setSmartFilter(item.filter); }}><span className={`bh-smart-icon ${item.color}`}><item.icon size={20} /></span><strong>{item.name}</strong><p>{item.desc}</p><span className="bh-smart-count">{item.count} items <ArrowRight size={14} /></span></button>)}</div><div className="bh-panel bh-rules-panel"><div className="bh-panel-heading"><div><h3>How smart folders work</h3><p>Simple rules help BlueHaven keep your library tidy.</p></div><Sparkles size={19} /></div><div className="bh-rule-row"><CheckCircle2 size={17} /><span>Category-based grouping</span><small>Uses the category you choose when uploading</small></div><div className="bh-rule-row"><CheckCircle2 size={17} /><span>Expiry-aware collections</span><small>Uses document expiry dates to flag renewals</small></div><div className="bh-rule-row"><CheckCircle2 size={17} /><span>Recent and favourite views</span><small>Updates as you add or revisit documents</small></div></div></>}
              {section === 'shared' && <div className="bh-panel"><div className="bh-panel-heading"><div><h3>Sharing activity</h3><p>Invitations created in this browser demo.</p></div><Users size={19} /></div>{metadata.shares.length ? metadata.shares.map(share => { const doc = metadata.documents.find(item => item.id === share.documentId); return <div className="bh-share-row" key={share.id}><span className="bh-share-avatar">{share.email.slice(0, 1).toUpperCase()}</span><span className="bh-share-info"><strong>{doc?.title ?? 'Removed document'}</strong><small>{share.email} · {share.permission} access</small></span><span className={`bh-share-status ${share.status}`}>{share.status}</span>{share.status === 'active' && <button className="bh-outline-button small" type="button" onClick={() => revokeShare(share.id)}>Revoke</button>}</div>; }) : <div className="bh-empty-state"><Share2 size={28} /><strong>No shared documents yet</strong><p>Open a document and use Share to create an invitation.</p></div>}</div>}
              {section === 'expiring' && <div className="bh-panel"><div className="bh-panel-heading"><div><h3>Upcoming expiry dates</h3><p>Based on the dates you added to your documents.</p></div><CalendarClock size={19} /></div>{expiringDocuments.length ? expiringDocuments.map(doc => <div className="bh-expiry-document" key={doc.id}><span className="bh-expiry-file"><FileText size={18} /></span><span className="bh-expiry-info"><strong>{doc.title}</strong><small>{doc.category} · Expires {formatDate(doc.expiryDate)}</small></span><span className={`bh-expiry-chip ${(daysUntil(doc.expiryDate) ?? 999) <= 30 ? 'urgent' : ''}`}>{daysUntil(doc.expiryDate)} days left</span><button className="bh-outline-button small" type="button" onClick={() => { setActiveDocument(doc); setModal('preview'); }}>Review</button></div>) : <div className="bh-empty-state"><CheckCircle2 size={28} /><strong>No documents expiring soon</strong><p>Add expiry dates while uploading passports, licences and certificates to receive reminders here.</p></div>}</div>}
              {section === 'archives' && <div className="bh-archive-layout"><div className="bh-archive-card"><span className="bh-archive-illustration"><FileArchive size={31} /></span><h3>Create an archive</h3><p>Select documents from your library and package them into a standard ZIP or a password-encrypted BlueHaven archive.</p><button type="button" className="bh-primary-button" onClick={() => { setSection('documents'); setNotice('Select the files you want to include, then choose Create archive.'); }}>Choose documents <ArrowRight size={15} /></button></div><div className="bh-archive-card"><span className="bh-archive-illustration blue"><ShieldCheck size={31} /></span><h3>Open an archive</h3><p>Import a ZIP or decrypt a .blue archive created with this demo. Extracted files are added to your document library.</p><button type="button" className="bh-outline-button" onClick={() => importInputRef.current?.click()}><Upload size={15} /> Choose archive</button><input ref={importInputRef} type="file" accept=".zip,.blue,application/zip" hidden onChange={event => void importArchive(event.target.files?.[0])} /></div><div className="bh-archive-note"><Shield size={17} /><span><strong>About .blue archives</strong><br />This prototype uses AES-256-GCM encryption with a password-derived key. Keep your password safe: there is no password recovery for an encrypted archive.</span></div></div>}
              {section === 'storage' && <><div className="bh-storage-detail"><div><span className="bh-eyebrow">PERSONAL STORAGE</span><h2>{formatBytes(usedBytes)} <small>used</small></h2><p>of {storageCapacity} GB available capacity</p><div className="bh-storage-track"><span style={{ width: `${usage}%` }} /></div><div className="bh-storage-foot"><span>{usage.toFixed(1)}% occupied</span><span>{formatBytes(Math.max(0, capacityBytes - usedBytes))} remaining</span></div></div><div className="bh-storage-big-icon"><HardDrive size={38} /></div></div><div className="bh-panel"><div className="bh-panel-heading"><div><h3>Storage by file category</h3><p>A breakdown of your current document library.</p></div><Filter size={18} /></div>{CATEGORIES.map(category => { const bytes = metadata.documents.filter(doc => doc.category === category).reduce((sum, doc) => sum + doc.size, 0); if (!bytes) return null; return <div className="bh-category-usage" key={category}><div><span>{category}</span><strong>{formatBytes(bytes)}</strong></div><div className="bh-mini-track"><span style={{ width: `${Math.max(2, (bytes / Math.max(usedBytes, 1)) * 100)}%` }} /></div></div>; })}{!usedBytes && <p className="bh-empty-inline">Your storage breakdown will appear when you add files.</p>}</div><div className="bh-panel"><div className="bh-panel-heading"><div><h3>Expand your space</h3><p>Starter allowance: 3GB. Proposed demo pricing: ₦1,000 per additional GB.</p></div><Plus size={18} /></div><div className="bh-storage-plans">{[{ label: '+1 GB', gb: 1, price: '₦1,000' }, { label: '+10 GB', gb: 10, price: '₦10,000' }, { label: '+50 GB', gb: 50, price: '₦50,000' }, { label: '1 TB total', gb: 1021, price: '₦1,021,000' }].map(plan => <div className="bh-plan-card" key={plan.label}><strong>{plan.label}</strong><span>{plan.price}</span><button type="button" onClick={() => purchaseStorage(plan.gb)}>Select plan</button></div>)}</div><p className="bh-demo-disclaimer">Demo only — selecting a plan updates the local capacity display. No wallet debit or payment is made.</p></div></>}
              {section === 'cloud' && <div className="bh-cloud-grid">{[{ id: 'google-drive', name: 'Google Drive', desc: 'Import files and selected folders from Google Drive.', mark: 'G', tint: 'google' }, { id: 'dropbox', name: 'Dropbox', desc: 'Bring your Dropbox files into your BlueHaven library.', mark: 'D', tint: 'dropbox' }, { id: 'onedrive', name: 'Microsoft OneDrive', desc: 'Access documents stored in your Microsoft cloud.', mark: '1', tint: 'onedrive' }].map(provider => <div className="bh-cloud-card" key={provider.id}><span className={`bh-cloud-mark ${provider.tint}`}>{provider.mark}</span><div className="bh-cloud-copy"><strong>{provider.name}</strong><p>{provider.desc}</p><small>{cloudConnections[provider.id] ? 'Demo connection enabled' : 'Not connected'}</small></div><button type="button" className={cloudConnections[provider.id] ? 'bh-outline-button small' : 'bh-primary-button'} onClick={() => { setCloudConnections(current => ({ ...current, [provider.id]: !current[provider.id] })); showNotice(cloudConnections[provider.id] ? `${provider.name} demo connection disconnected.` : `${provider.name} demo connection enabled. No account was authorised.`); }}>{cloudConnections[provider.id] ? 'Disconnect' : 'Connect'}</button></div>)}<div className="bh-cloud-note"><Cloud size={18} /><span><strong>Cloud integration is in prototype mode.</strong> These controls demonstrate the intended connection workflow only. Real provider sign-in, consent, file browsing and synchronisation require OAuth integrations and backend support.</span></div></div>}
              {section === 'security' && <div className="bh-security-grid"><div className="bh-security-card"><span className="bh-security-icon"><ShieldCheck size={22} /></span><strong>Workspace protection</strong><p>Your demo workspace is stored in this browser. Real account-level encryption and remote access controls require backend integration.</p><span className="bh-status-label">Prototype mode</span></div><div className="bh-security-card"><span className="bh-security-icon"><LockKeyhole size={22} /></span><strong>Document locks</strong><p>Lock state and access prompts are simulated in this frontend. They do not encrypt the original uploaded file.</p><button type="button" onClick={() => changeSection('documents')}>Manage documents <ArrowRight size={14} /></button></div><div className="bh-security-card"><span className="bh-security-icon"><FileArchive size={22} /></span><strong>Encrypted .blue archives</strong><p>Archive encryption uses the browser's Web Crypto API and AES-256-GCM with PBKDF2 key derivation.</p><button type="button" onClick={() => changeSection('archives')}>Open archive manager <ArrowRight size={14} /></button></div></div>}
              {section === 'settings' && <div className="bh-panel"><div className="bh-panel-heading"><div><h3>Workspace preferences</h3><p>Controls for your BlueHaven demo environment.</p></div><Settings2 size={19} /></div><div className="bh-setting-row"><span><strong>Default storage</strong><small>Initial personal storage allowance</small></span><b>3 GB</b></div><div className="bh-setting-row"><span><strong>Archive extension</strong><small>Custom encrypted archive format</small></span><b>.blue</b></div><div className="bh-setting-row"><span><strong>Local persistence</strong><small>Metadata in browser storage; uploaded file data in IndexedDB</small></span><b>Enabled</b></div><div className="bh-setting-row"><span><strong>Cloud connections</strong><small>External provider integrations</small></span><b>Coming later</b></div><button type="button" className="bh-danger-button" onClick={() => { if (window.confirm('Clear this browser demo workspace and restore the sample documents?')) { localStorage.removeItem('bluehaven-metadata-v1'); localStorage.removeItem('bluehaven-capacity-gb'); window.location.reload(); } }}><RefreshCw size={15} /> Reset demo workspace</button></div>}
            </>}
          </main>
        </div>
        <MobileBottomNavigation />
      </div>

      {notice && <div className="bh-toast" role="status"><CheckCircle2 size={17} />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}

      {modal && <div className="bh-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}>
        <div className="bh-modal" role="dialog" aria-modal="true">
          <div className="bh-modal-heading"><div><span className="bh-eyebrow">BLUEHAVEN</span><h2>{modal === 'upload' ? 'Add a document' : modal === 'folder' ? 'Create a folder' : modal === 'preview' ? 'Document details' : modal === 'edit' ? 'Edit document' : modal === 'share' ? 'Share document' : modal === 'lock' ? 'Protected document' : modal === 'archive' ? 'Create archive' : modal === 'storage' ? 'Storage limit reached' : 'Storage options'}</h2></div><button type="button" className="bh-icon-button" onClick={() => setModal(null)} aria-label="Close"><X size={19} /></button></div>
          {modal === 'upload' && <div className="bh-modal-body"><button type="button" className="bh-upload-drop" onClick={() => fileInputRef.current?.click()}><Upload size={24} /><strong>{uploadFile ? uploadFile.name : 'Choose a file to upload'}</strong><span>{uploadFile ? formatBytes(uploadFile.size) : 'PDF, images, documents and other file types'}</span><small>Files are stored locally in this browser during the prototype.</small></button><input ref={fileInputRef} type="file" hidden onChange={event => onFileChosen(event.target.files?.[0])} /><label className="bh-field">Document title<input value={uploadTitle} onChange={event => setUploadTitle(event.target.value)} placeholder="e.g. International Passport" /></label><div className="bh-field-grid"><label className="bh-field">Category<select value={uploadCategory} onChange={event => setUploadCategory(event.target.value as BlueHavenCategory)}>{CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label><label className="bh-field">Save to folder<select value={uploadFolder} onChange={event => setUploadFolder(event.target.value)}><option value="">No folder yet</option>{metadata.folders.map(folder => <option value={folder.id} key={folder.id}>{folder.name}</option>)}</select></label></div><label className="bh-field">Expiry date <span>(optional)</span><input type="date" value={uploadExpiry} onChange={event => setUploadExpiry(event.target.value)} /></label><label className="bh-field">Description <span>(optional)</span><textarea value={uploadDescription} onChange={event => setUploadDescription(event.target.value)} rows={2} placeholder="Add a note to help identify this document" /></label><label className="bh-field">Tags <span>(comma separated)</span><input value={uploadTags} onChange={event => setUploadTags(event.target.value)} placeholder="travel, renewal, personal" /></label><div className="bh-modal-actions"><button className="bh-outline-button" type="button" onClick={() => setModal(null)}>Cancel</button><button className="bh-primary-button" type="button" disabled={busy} onClick={() => void saveUpload()}>{busy ? 'Saving...' : 'Save document'}</button></div></div>}
          {modal === 'folder' && <div className="bh-modal-body"><label className="bh-field">Folder name<input autoFocus value={folderName} onChange={event => setFolderName(event.target.value)} placeholder="e.g. Family records" /></label><div className="bh-field"><span>Folder colour</span><div className="bh-color-options">{['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'].map(color => <button type="button" key={color} className={folderColor === color ? 'selected' : ''} style={{ background: color }} onClick={() => setFolderColor(color)} aria-label={`Choose ${color}`} />)}</div></div><div className="bh-modal-actions"><button className="bh-outline-button" type="button" onClick={() => setModal(null)}>Cancel</button><button className="bh-primary-button" type="button" onClick={createFolder}>Create folder</button></div></div>}
          {modal === 'preview' && activeDocument && <div className="bh-modal-body"><div className="bh-preview-file"><span className="bh-file-icon large">{(() => { const Icon = fileIcon(activeDocument.mimeType); return <Icon size={27} />; })()}</span><div><strong>{activeDocument.title}</strong><small>{activeDocument.fileName}</small></div><button type="button" className="bh-icon-button" onClick={() => toggleFavorite(activeDocument)}><Star size={18} fill={activeDocument.favorite ? 'currentColor' : 'none'} /></button></div>{previewUrl && activeDocument.mimeType.startsWith('image/') && <div className="bh-file-preview"><img src={previewUrl} alt={activeDocument.title} /></div>}{previewUrl && (activeDocument.mimeType === 'application/pdf' || activeDocument.mimeType.startsWith('text/')) && <div className="bh-file-preview document"><iframe src={previewUrl} title={`Preview of ${activeDocument.title}`} /></div>}<div className="bh-preview-meta"><span>File size</span><strong>{formatBytes(activeDocument.size)}</strong><span>Category</span><strong>{activeDocument.category}</strong><span>Added</span><strong>{shortDate(activeDocument.createdAt)}</strong><span>Expiry</span><strong>{formatDate(activeDocument.expiryDate)}</strong><span>Protection</span><strong>{activeDocument.locked ? 'Locked (demo)' : 'Not locked'}</strong></div>{activeDocument.description && <p className="bh-preview-description">{activeDocument.description}</p>}<div className="bh-modal-action-grid"><button type="button" className="bh-outline-button" onClick={() => void downloadDocument(activeDocument)}><Download size={15} /> Download</button><button type="button" className="bh-outline-button" onClick={() => { setSharePermission('view'); setModal('share'); }}><Share2 size={15} /> Share</button><button type="button" className="bh-outline-button" onClick={() => { setLockPassword(''); setModal('lock'); }}>{activeDocument.locked ? <UnlockKeyhole size={15} /> : <Lock size={15} />}{activeDocument.locked ? 'Unlock' : 'Lock'}</button><button type="button" className="bh-outline-button" onClick={() => void openEditor(activeDocument)}><FileText size={15} /> Edit / rename</button></div><button type="button" className="bh-danger-button" onClick={() => void removeDocument(activeDocument)}><Trash2 size={15} /> Delete document</button><p className="bh-demo-disclaimer">Preview and editing of sample records are limited. Upload a real file to use browser preview and download.</p></div>}
          {modal === 'edit' && activeDocument && <div className="bh-modal-body"><div className="bh-share-target"><FileText size={18} /><span><strong>{activeDocument.title}</strong><small>{activeDocument.fileName} · Local text editor</small></span></div><label className="bh-field">Document content<textarea className="bh-document-editor" rows={13} value={editorContent} onChange={event => setEditorContent(event.target.value)} spellCheck /></label><div className="bh-modal-actions"><button className="bh-outline-button" type="button" onClick={() => setModal('preview')}>Cancel</button><button className="bh-primary-button" type="button" onClick={() => void saveEditor()}>Save changes</button></div><p className="bh-demo-disclaimer">Text, Markdown, CSV and JSON files can be edited in this prototype. Rich document editing will require a dedicated editor integration.</p></div>}
          {modal === 'share' && activeDocument && <div className="bh-modal-body"><div className="bh-share-target"><FileText size={18} /><span><strong>{activeDocument.title}</strong><small>Sharing invitation · Demo only</small></span></div><label className="bh-field">Recipient's BlueSea email<input type="email" value={shareEmail} onChange={event => setShareEmail(event.target.value)} placeholder="name@example.com" /></label><div className="bh-field-grid"><label className="bh-field">Permission<select value={sharePermission} onChange={event => setSharePermission(event.target.value as 'view' | 'download' | 'edit')}><option value="view">View only</option><option value="download">View and download</option><option value="edit">Can edit (supported files)</option></select></label><label className="bh-field">Access expiry<input type="date" value={shareExpiry} onChange={event => setShareExpiry(event.target.value)} /></label></div><p className="bh-demo-disclaimer">This creates a local sharing record only. No email or real access permission is issued until backend sharing is connected.</p><div className="bh-modal-actions"><button className="bh-outline-button" type="button" onClick={() => setModal('preview')}>Back</button><button className="bh-primary-button" type="button" onClick={shareDocument}>Create invitation</button></div></div>}
          {modal === 'lock' && activeDocument && <div className="bh-modal-body"><div className="bh-lock-notice"><LockKeyhole size={25} /><strong>{activeDocument.locked ? 'This document is marked as locked' : 'Add a demo access password'}</strong><p>{activeDocument.locked ? 'Enter a password to unlock this document in the prototype.' : 'The lock state is simulated and does not encrypt the uploaded file.'}</p>{activeDocument.id === 'demo-passport' && <small className="bh-demo-password">Sample password: demo1234</small>}</div><label className="bh-field">{activeDocument.locked ? 'Password' : 'Create password'}<input type="password" value={lockPassword} onChange={event => setLockPassword(event.target.value)} placeholder="At least 4 characters" /></label><div className="bh-modal-actions"><button className="bh-outline-button" type="button" onClick={() => setModal('preview')}>Cancel</button><button className="bh-primary-button" type="button" onClick={lockDocument}>{activeDocument.locked ? 'Unlock document' : 'Lock document'}</button></div></div>}
          {modal === 'archive' && <div className="bh-modal-body"><div className="bh-archive-selected"><FileArchive size={21} /><span><strong>{selected.length} selected documents</strong><small>Only real uploaded file contents can be added to an archive.</small></span></div><label className="bh-field">Archive name<input value={archiveName} onChange={event => setArchiveName(event.target.value)} /></label><label className="bh-field">Encryption password <span>(required for .blue)</span><input type="password" value={archivePassword} onChange={event => setArchivePassword(event.target.value)} placeholder="At least 8 characters" /></label><div className="bh-modal-actions archive-actions"><button className="bh-outline-button" type="button" disabled={busy} onClick={() => void buildArchive(false)}><FileArchive size={15} /> Create .zip</button><button className="bh-primary-button" type="button" disabled={busy} onClick={() => void buildArchive(true)}><ShieldCheck size={15} /> Create .blue</button></div></div>}
          {modal === 'storage' && <div className="bh-modal-body"><div className="bh-lock-notice"><HardDrive size={25} /><strong>You're running out of space</strong><p>Your current upload would exceed your available storage. Choose a larger capacity to continue.</p></div><div className="bh-storage-plans compact">{[{ label: '+1 GB', gb: 1, price: '₦1,000' }, { label: '+10 GB', gb: 10, price: '₦10,000' }, { label: '+50 GB', gb: 50, price: '₦50,000' }].map(plan => <div className="bh-plan-card" key={plan.label}><strong>{plan.label}</strong><span>{plan.price}</span><button type="button" onClick={() => purchaseStorage(plan.gb)}>Select</button></div>)}</div><p className="bh-demo-disclaimer">Prototype simulation only. No payment is collected.</p></div>}
        </div>
      </div>}
    </div>
  );
}

function FilesIcon() { return <FileText size={19} />; }
