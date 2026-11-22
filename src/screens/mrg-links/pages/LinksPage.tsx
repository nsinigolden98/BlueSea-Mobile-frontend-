import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Copy, Download, ExternalLink, Filter, Link2, MoreHorizontal, Pause, Pencil, Play, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMrGLinks } from '../MrGLinksContext';
import { buildShortUrl } from '../services/storage';
import type { MrGLink } from '../types';
import { PageHeading, MrGButton, MrGModal, EmptyState } from '../components/MrGPrimitives';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-[#0b1727] dark:text-white';

export default function LinksPage() {
  const { store, createLink, updateLink, toggleLink, deleteLink } = useMrGLinks();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'protected'>('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MrGLink | null>(null);
  const [destinationUrl, setDestinationUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [removePassword, setRemovePassword] = useState(false);
  const [campaignId, setCampaignId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredLinks = useMemo(() => store.links.filter((link) => {
    const matchesSearch = `${link.title} ${link.shortCode} ${link.destinationUrl} ${link.folder || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'protected' ? link.passwordProtected : link.status === filter);
    const matchesFolder = folderFilter === 'all' || (link.folder || 'Unfiled') === folderFilter;
    return matchesSearch && matchesFilter && matchesFolder;
  }), [store.links, search, filter, folderFilter]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const resetForm = () => { setDestinationUrl(''); setTitle(''); setDescription(''); setFolder(''); setCustomAlias(''); setExpiresAt(''); setPassword(''); setRemovePassword(false); setCampaignId(''); setUtmSource(''); setUtmMedium(''); setUtmCampaign(''); setShowAdvanced(false); setEditing(null); };
  const openCreate = () => { resetForm(); setModalOpen(true); };
  const openEdit = (link: MrGLink) => { setEditing(link); setDestinationUrl(link.destinationUrl); setTitle(link.title); setDescription(link.description); setFolder(link.folder || ''); setExpiresAt(link.expiresAt || ''); setPassword(''); setRemovePassword(false); setCampaignId(link.campaignId || ''); setCustomAlias(''); setUtmSource(''); setUtmMedium(''); setUtmCampaign(''); setShowAdvanced(true); setModalOpen(true); };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const finalUrl = new URL(/^https?:\/\//i.test(destinationUrl) ? destinationUrl : `https://${destinationUrl}`);
      if (utmSource.trim()) finalUrl.searchParams.set('utm_source', utmSource.trim());
      if (utmMedium.trim()) finalUrl.searchParams.set('utm_medium', utmMedium.trim());
      if (utmCampaign.trim()) finalUrl.searchParams.set('utm_campaign', utmCampaign.trim());
      if (editing) {
        updateLink(editing.id, { destinationUrl: finalUrl.toString(), title, description, folder, expiresAt, password: password || undefined, removePassword, campaignId });
        toast.success('Link details updated.');
      } else {
        const link = createLink({ destinationUrl: finalUrl.toString(), title, description, folder, customAlias, expiresAt, password, campaignId });
        toast.success(`Link created: ${buildShortUrl(link.shortCode)}`);
      }
      setModalOpen(false); resetForm();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save this link.'); }
  };

  const copyLink = async (code: string) => {
    const url = buildShortUrl(code);
    try { await navigator.clipboard.writeText(url); toast.success('Short link copied.'); }
    catch { toast.error('Clipboard access was blocked by this browser. Select and copy the link manually.', { description: url }); }
  };

  const exportCsv = () => {
    const rows = [['Title', 'Short URL', 'Destination', 'Status', 'Created', 'Password protected'], ...filteredLinks.map((link) => [link.title, buildShortUrl(link.shortCode), link.destinationUrl, link.status, link.createdAt, String(link.passwordProtected)])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mrg-links.csv'; anchor.click(); URL.revokeObjectURL(url);
    toast.success('Your link list has been exported.');
  };

  return <>
    <PageHeading eyebrow="Link management" title="My links" description="Create short URLs, manage destinations, set expiry rules and protect sensitive links. Short-link redirects become live when MrG.com is connected to the redirect service." action={<div className="flex gap-2"><MrGButton variant="secondary" onClick={exportCsv} disabled={!filteredLinks.length}><Download size={14}/> Export</MrGButton><MrGButton onClick={openCreate}><Plus size={14}/> New link</MrGButton></div>} />
    <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, short code or destination..." className={`${inputClass} pl-9`}/></div>
      <div className="flex flex-wrap items-center gap-2"><Filter size={14} className="text-slate-400"/><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className={`${inputClass} min-w-[135px]`}><option value="all">All links</option><option value="active">Active</option><option value="paused">Paused</option><option value="protected">Password protected</option></select><select value={folderFilter} onChange={(event) => setFolderFilter(event.target.value)} className={`${inputClass} min-w-[125px]`}><option value="all">All folders</option>{Array.from(new Set(store.links.map((link) => link.folder || 'Unfiled'))).map((item) => <option key={item}>{item}</option>)}</select></div>
    </div>
    <div className="mb-4 flex flex-wrap gap-2 text-[9px]"><span className="rounded-full bg-slate-200/70 px-3 py-1.5 font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{store.links.length} total links</span><span className="rounded-full bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-700 dark:text-emerald-300">{store.links.filter((link) => link.status === 'active').length} active</span><span className="rounded-full bg-amber-500/10 px-3 py-1.5 font-bold text-amber-700 dark:text-amber-300">{store.links.filter((link) => link.status === 'paused').length} paused</span></div>
    {filteredLinks.length === 0 ? <EmptyState icon={Link2} title={store.links.length ? 'No links match your search' : 'No links created yet'} description={store.links.length ? 'Try a different search term or change the status filter.' : 'Create your first short link. You can edit its destination later without changing the short code.'} action={store.links.length ? <MrGButton variant="secondary" onClick={() => { setSearch(''); setFilter('all'); setFolderFilter('all'); }}>Clear filters</MrGButton> : <MrGButton onClick={openCreate}><Plus size={14}/> Create a link</MrGButton>}/> : <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#111e30]"><div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1.6fr)_110px_150px] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-white/10 dark:bg-white/[.025] md:grid"><span>Link</span><span>Destination</span><span>Status</span><span className="text-right">Actions</span></div>{filteredLinks.map((link) => <div key={link.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-0 dark:border-white/[.07] md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.6fr)_110px_150px] md:items-center md:gap-4 md:px-5"><div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300"><Link2 size={16}/></span><div className="min-w-0"><p className="truncate text-[11px] font-extrabold text-slate-900 dark:text-white">{link.title}</p><button type="button" onClick={() => void copyLink(link.shortCode)} className="mt-1 flex max-w-full items-center gap-1 truncate text-[10px] font-semibold text-sky-600 hover:underline dark:text-sky-300">{buildShortUrl(link.shortCode)} <Copy size={10}/></button><div className="mt-1 flex flex-wrap gap-1.5"><span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">{link.folder || 'Unfiled'}</span>{link.isCustomAlias && <span className="rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-bold text-violet-600 dark:text-violet-300">Custom alias</span>}{link.passwordProtected && <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-bold text-amber-700 dark:text-amber-300"><ShieldCheck size={9}/> Protected</span>}</div></div></div><div className="min-w-0 pl-12 md:pl-0"><p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{link.destinationUrl}</p><p className="mt-1 text-[9px] text-slate-400">Created {new Date(link.createdAt).toLocaleDateString()}</p></div><div className="pl-12 md:pl-0"><span className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-wider ${link.status === 'active' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'}`}>{link.status}</span></div><div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-2 dark:border-white/[.07] md:border-0 md:pt-0"><button type="button" title="Open destination" onClick={() => window.open(link.destinationUrl, '_blank', 'noopener,noreferrer')} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-white/10"><ExternalLink size={14}/></button><button type="button" title="Edit link" onClick={() => openEdit(link)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-white/10"><Pencil size={14}/></button><button type="button" title={link.status === 'active' ? 'Pause link' : 'Activate link'} onClick={() => { toggleLink(link.id); toast.success(link.status === 'active' ? 'Link paused in this workspace.' : 'Link activated in this workspace.'); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-white/10">{link.status === 'active' ? <Pause size={14}/> : <Play size={14}/>}</button><button type="button" title="Delete link" onClick={() => { if (window.confirm(`Delete ${link.title}? This removes it from this browser's MrG preview data.`)) { deleteLink(link.id); toast.success('Link deleted from this workspace.'); } }} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"><Trash2 size={14}/></button></div></div>)}</div>}

    <MrGModal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title={editing ? 'Edit link details' : 'Create a short link'} description={editing ? 'Change the destination or update the link settings. The short code stays the same.' : `You have ${store.credits} link credits available. One credit is used when you create a link.`} wide>
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Destination URL <span className="text-rose-500">*</span></span><input required type="text" inputMode="url" value={destinationUrl} onChange={(event) => setDestinationUrl(event.target.value)} placeholder="https://yourwebsite.com/page" className={inputClass}/></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Link title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Summer promotion" className={inputClass}/></label>{!editing && <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Custom alias <span className="font-normal text-slate-400">(optional)</span></span><div className="flex overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"><span className="flex items-center bg-slate-50 px-2 text-[9px] text-slate-500 dark:bg-white/5">MrG.com/</span><input value={customAlias} onChange={(event) => setCustomAlias(event.target.value)} placeholder="your-name" className="min-w-0 flex-1 bg-white px-2 py-2.5 text-[11px] outline-none dark:bg-[#0b1727] dark:text-white"/></div><span className="mt-1 block text-[9px] text-slate-400">Verified vendors receive a small complimentary allowance; other users need a paid custom-alias allowance.</span></label>}</div>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Description <span className="font-normal text-slate-400">(optional)</span></span><textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add an internal note" className={inputClass}/></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Folder</span><input value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="e.g. Product launches" className={inputClass}/></label></div>
        <button type="button" onClick={() => setShowAdvanced((value) => !value)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-[10px] font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">Advanced settings <MoreHorizontal size={15}/></button>
        {showAdvanced && <div className="grid gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/[.035] sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Expiry date</span><input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} min={new Date().toISOString().slice(0, 16)} className={inputClass}/></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Password protection</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={editing ? 'New password (leave blank to keep current)' : 'Set a visitor password'} className={inputClass}/>{editing && editing.passwordProtected && <label className="mt-2 flex items-center gap-2 text-[9px] text-slate-500"><input type="checkbox" checked={removePassword} onChange={(event) => setRemovePassword(event.target.checked)} className="accent-sky-500"/> Remove password protection</label>}</label><label className="block sm:col-span-2"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Campaign</span><select value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className={inputClass}><option value="">No campaign</option>{store.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></label><div className="sm:col-span-2"><p className="mb-2 text-[9px] font-bold text-slate-500 dark:text-slate-300">UTM campaign tracking</p><div className="grid gap-2 sm:grid-cols-3"><input value={utmSource} onChange={(event) => setUtmSource(event.target.value)} placeholder="utm_source" className={inputClass}/><input value={utmMedium} onChange={(event) => setUtmMedium(event.target.value)} placeholder="utm_medium" className={inputClass}/><input value={utmCampaign} onChange={(event) => setUtmCampaign(event.target.value)} placeholder="utm_campaign" className={inputClass}/></div></div><p className="text-[9px] leading-5 text-slate-400 sm:col-span-2">Expiry and password-protection settings are saved in this frontend preview; raw passwords are not stored in browser storage. Visitor-side enforcement requires the production redirect backend. UTM values are added to the destination URL when you save.</p></div>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/10"><MrGButton variant="secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancel</MrGButton><MrGButton type="submit" disabled={!editing && store.credits < 1}>{editing ? 'Save changes' : 'Create short link'}</MrGButton></div>
      </form>
    </MrGModal>
  </>;
}
