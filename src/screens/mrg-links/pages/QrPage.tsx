import { useMemo, useState } from 'react';
import { Download, ImagePlus, QrCode, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import * as QRCode from 'qrcode';
import { toast } from 'sonner';
import { useMrGLinks } from '../MrGLinksContext';
import { buildShortUrl, normaliseUrl } from '../services/storage';
import { PageHeading, MrGButton, EmptyState } from '../components/MrGPrimitives';

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10 dark:border-white/10 dark:bg-[#0b1727] dark:text-white';

async function composeQr(url: string, dark: string, light: string, logoDataUrl?: string): Promise<string> {
  const qrData = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H', width: 720, margin: 2, color: { dark, light } });
  if (!logoDataUrl) return qrData;
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas'); canvas.width = 720; canvas.height = 720;
    const context = canvas.getContext('2d'); if (!context) { reject(new Error('Canvas is not supported by this browser.')); return; }
    const qrImage = new Image();
    qrImage.onload = () => {
      context.drawImage(qrImage, 0, 0, 720, 720);
      const logo = new Image();
      logo.onload = () => {
        const size = 142; const x = (720 - size) / 2; const y = (720 - size) / 2;
        context.fillStyle = light; context.beginPath(); context.roundRect(x - 15, y - 15, size + 30, size + 30, 22); context.fill();
        context.drawImage(logo, x, y, size, size);
        resolve(canvas.toDataURL('image/png'));
      };
      logo.onerror = () => reject(new Error('The uploaded logo could not be loaded.'));
      logo.src = logoDataUrl;
    };
    qrImage.onerror = () => reject(new Error('The QR code image could not be composed.'));
    qrImage.src = qrData;
  });
}

export default function QrPage() {
  const { store, addQrCode } = useMrGLinks();
  const [name, setName] = useState('My QR code');
  const [targetUrl, setTargetUrl] = useState('');
  const [dark, setDark] = useState('#10233b');
  const [light, setLight] = useState('#ffffff');
  const [logo, setLogo] = useState('');
  const [logoName, setLogoName] = useState('');
  const [generated, setGenerated] = useState('');
  const [generating, setGenerating] = useState(false);
  const linkOptions = useMemo(() => store.links.map((link) => ({ label: `${link.title} · ${link.shortCode}`, value: buildShortUrl(link.shortCode) })), [store.links]);

  const onLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Choose an image file for the QR logo.'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('The logo must be smaller than 2 MB.'); return; }
    const reader = new FileReader(); reader.onload = () => { setLogo(String(reader.result || '')); setLogoName(file.name); }; reader.onerror = () => toast.error('Could not read the selected logo.'); reader.readAsDataURL(file);
  };

  const generate = async () => {
    try {
      const destination = normaliseUrl(targetUrl);
      setGenerating(true);
      const imageDataUrl = await composeQr(destination, dark, light, logo || undefined);
      setGenerated(imageDataUrl);
      addQrCode({ name: name.trim() || 'Untitled QR code', targetUrl: destination, imageDataUrl });
      toast.success('QR code generated and saved in this browser.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to generate QR code.'); }
    finally { setGenerating(false); }
  };

  const download = () => {
    if (!generated) return;
    const anchor = document.createElement('a'); anchor.href = generated; anchor.download = `${(name || 'mrg-qr-code').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`; anchor.click();
    toast.success('QR code downloaded as PNG.');
  };

  const downloadSvg = async () => {
    if (!targetUrl.trim()) return;
    try {
      const destination = normaliseUrl(targetUrl);
      let svg = await QRCode.toString(destination, { type: 'svg', errorCorrectionLevel: 'H', width: 720, margin: 2, color: { dark, light } });
      if (logo) {
        const viewBox = svg.match(/viewBox=\"0 0 ([0-9.]+) ([0-9.]+)\"/);
        const size = Number(viewBox?.[1] || 41);
        const logoSize = size * 0.2;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;
        const overlay = `<rect x=\"${x - 0.025 * size}\" y=\"${y - 0.025 * size}\" width=\"${logoSize + 0.05 * size}\" height=\"${logoSize + 0.05 * size}\" rx=\"${0.025 * size}\" fill=\"${light}\"/><image href=\"${logo}\" x=\"${x}\" y=\"${y}\" width=\"${logoSize}\" height=\"${logoSize}\" preserveAspectRatio=\"xMidYMid meet\"/>`;
        svg = svg.replace('</svg>', `${overlay}</svg>`);
      }
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${(name || 'mrg-qr-code').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.svg`; anchor.click();
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded as SVG.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not export the SVG QR code.'); }
  };

  return <>
    <PageHeading eyebrow="QR intelligence" title="Make every scan count." description="Create branded QR codes, add a logo to the centre, choose your colours and download a high-resolution PNG. Dynamic scan analytics will connect to the MrG redirect service." />
    <div className="grid gap-5 xl:grid-cols-[1fr_.85fr]">
      <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111e30] sm:p-6"><div className="mb-5 flex items-center gap-2"><span className="rounded-xl bg-violet-500/10 p-2 text-violet-600 dark:text-violet-300"><QrCode size={17}/></span><div><h2 className="text-sm font-black">QR code studio</h2><p className="text-[10px] text-slate-400">Set up your code and brand identity.</p></div></div>
        <div className="space-y-4"><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">QR code name</span><input value={name} onChange={(event) => setName(event.target.value)} className={field}/></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Destination URL <span className="text-rose-500">*</span></span><input value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} placeholder="https://yourwebsite.com" className={field}/></label>{linkOptions.length > 0 && <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Or use one of your short links</span><select value="" onChange={(event) => setTargetUrl(event.target.value)} className={field}><option value="">Choose a saved link</option>{linkOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
          <div className="grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">QR colour</span><div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-white/10"><input type="color" value={dark} onChange={(event) => setDark(event.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"/><span className="text-[10px] text-slate-500">Foreground</span><span className="ml-auto text-[9px] font-mono text-slate-400">{dark}</span></div></label><label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Background colour</span><div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 dark:border-white/10"><input type="color" value={light} onChange={(event) => setLight(event.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent"/><span className="text-[10px] text-slate-500">Background</span><span className="ml-auto text-[9px] font-mono text-slate-400">{light}</span></div></label></div>
          <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600 dark:text-slate-300">Company logo <span className="font-normal text-slate-400">(optional, max 2 MB)</span></span><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 transition hover:border-sky-400 dark:border-white/15 dark:bg-white/[.025]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-white/10"><ImagePlus size={17}/></span><span className="min-w-0 flex-1"><strong className="block truncate text-[10px]">{logoName || 'Upload your company logo'}</strong><small className="text-[9px] text-slate-400">PNG, JPG or WebP</small></span><input type="file" accept="image/*" className="hidden" onChange={(event) => onLogo(event.target.files?.[0])}/></label>{logo && <button type="button" onClick={() => { setLogo(''); setLogoName(''); }} className="mt-2 text-[9px] font-bold text-rose-600 hover:underline">Remove logo</button>}</label>
          <div className="rounded-xl bg-amber-500/10 p-3 text-[9px] leading-5 text-amber-800 dark:text-amber-200"><ShieldCheck size={13} className="mr-1 inline"/>For reliable scanning, keep strong contrast and avoid placing a logo that covers too much of the code. Test the downloaded QR with more than one phone before printing.</div>
          <MrGButton onClick={() => void generate()} disabled={!targetUrl.trim() || generating} className="w-full">{generating ? <RefreshCw size={14} className="animate-spin"/> : <Sparkles size={14}/>} {generating ? 'Generating QR code...' : 'Generate QR code'}</MrGButton>
        </div>
      </section>
      <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111e30] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-sm font-black">Live preview</h2><p className="mt-1 text-[10px] text-slate-400">Your QR code will appear here.</p></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">High resolution</span></div><div className="flex min-h-[360px] flex-col items-center justify-center rounded-[22px] border border-slate-100 bg-[#f8fafc] p-5 dark:border-white/10 dark:bg-[#0b1727]"><div className="flex h-[250px] w-[250px] items-center justify-center rounded-[26px] bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,.10)]">{generated ? <img src={generated} alt="Generated MrG QR code" className="h-full w-full object-contain"/> : <div className="flex flex-col items-center text-center text-slate-300"><QrCode size={90} strokeWidth={1.1}/><span className="mt-3 text-[9px] font-semibold">QR preview</span></div>}</div>{generated && <><p className="mt-4 max-w-full truncate text-[10px] font-bold text-slate-700 dark:text-slate-200">{name}</p><p className="mt-1 max-w-full truncate text-[9px] text-slate-400">{targetUrl}</p><div className="mt-4 flex flex-wrap justify-center gap-2"><MrGButton onClick={download}><Download size={14}/> PNG</MrGButton><MrGButton variant="secondary" onClick={() => void downloadSvg()}><Download size={14}/> SVG</MrGButton></div></>}</div><p className="mt-4 text-[9px] leading-5 text-slate-400">The QR image is generated in your browser and stored in this browser's preview data. Cloud synchronisation and scan analytics require the MrG backend.</p></section>
    </div>
    <section className="mt-5 rounded-[24px] border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-[#111e30]"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-black">Saved QR codes</h2><p className="mt-1 text-[10px] text-slate-400">Codes generated in this browser.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{store.qrCodes.length} saved</span></div>{store.qrCodes.length === 0 ? <EmptyState icon={QrCode} title="No saved QR codes" description="Generate your first QR code and it will appear here for quick access."/> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{store.qrCodes.map((qr) => <div key={qr.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10"><img src={qr.imageDataUrl} alt={qr.name} className="h-16 w-16 rounded-lg bg-white p-1"/><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-bold">{qr.name}</p><p className="mt-1 truncate text-[9px] text-slate-400">{qr.targetUrl}</p><a href={qr.imageDataUrl} download={`${qr.name.replace(/[^a-z0-9]+/gi, '-')}.png`} className="mt-2 inline-flex text-[9px] font-bold text-sky-600 hover:underline dark:text-sky-300">Download again</a></div></div>)}</div>}</section>
  </>;
}
