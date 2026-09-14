import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paylinkService } from '@/services/paylinkService';
import type { BusinessProfile, BusinessProduct, PayLinkType } from '@/types/paylink';
import { ArrowLeft, Check, Sparkles, Building2, Package } from 'lucide-react';

export function CreatePayLink() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [linkType, setLinkType] = useState<PayLinkType>('FIXED');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [suggestedAmounts, setSuggestedAmounts] = useState('1000, 2500, 5000');
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { ToastComponent, showToast } = Toast();

  useEffect(() => {
    paylinkService.getBusinesses().then(setBusinesses);
    paylinkService.getProducts().then(setProducts);
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      showToast('Please enter a title');
      return;
    }

    setSubmitting(true);
    try {
      const biz = businesses.find((b) => b.id === selectedBusiness);
      const prod = products.find((p) => p.id === selectedProduct);
      const parseSuggested = suggestedAmounts
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);

      const newLink = await paylinkService.createPayLink({
        type: linkType,
        title,
        description,
        amount: linkType === 'FIXED' || linkType === 'PRODUCT' ? Number(amount.replace(/,/g, '')) || 0 : 0,
        isFixedAmount: linkType === 'FIXED' || linkType === 'PRODUCT',
        suggestedAmounts: linkType === 'FLEXIBLE' || linkType === 'COLLECTION' ? parseSuggested : [],
        allowCustomAmount: true,
        creatorName: biz ? biz.name : 'Lucid',
        business: biz,
        product: prod,
      });

      showToast('PayLink created successfully!');
      setTimeout(() => navigate(`/paylink/details/${newLink.id}`), 500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create PayLink';
      showToast(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Create BlueC PayLink" 
            subtitle="Configure payment parameters and rules"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10 max-w-2xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/paylink')}
            className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to PayLink Dashboard
          </button>

          <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-sm">
            {/* TYPE SELECTION */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PayLink Category</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'FIXED', label: 'Fixed Amount' },
                  { id: 'FLEXIBLE', label: 'Flexible / Donation' },
                  { id: 'PRODUCT', label: 'Business Product' },
                  { id: 'COLLECTION', label: 'Group Collection' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLinkType(type.id as PayLinkType)}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1 ${
                      linkType === type.id
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{type.label}</span>
                    {linkType === type.id && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* BUSINESS / PRODUCT POPULATION */}
            {linkType === 'PRODUCT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>Select Business</span>
                  </Label>
                  <select
                    value={selectedBusiness}
                    onChange={(e) => setSelectedBusiness(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Choose Business Profile --</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-sky-500" />
                    <span>Select Product</span>
                  </Label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      const p = products.find((prod) => prod.id === e.target.value);
                      if (p) {
                        setTitle(p.name);
                        setDescription(p.description);
                        setAmount(p.price.toString());
                      }
                    }}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (₦{p.price.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* MAIN FORM FIELDS */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Title / Purpose</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nike Air Force 1 or Event Ticket"
                  className="bg-slate-50 dark:bg-slate-900 h-11 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Description (Optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional payment details or context"
                  className="bg-slate-50 dark:bg-slate-900 h-11 text-xs font-semibold"
                />
              </div>

              {(linkType === 'FIXED' || linkType === 'PRODUCT') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Exact Amount Required (₦)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5000"
                    className="bg-slate-50 dark:bg-slate-900 h-11 text-xs font-bold text-sky-500"
                  />
                  <p className="text-[11px] text-slate-400">Payer must submit exactly this amount.</p>
                </div>
              )}

              {(linkType === 'FLEXIBLE' || linkType === 'COLLECTION') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 dark:text-slate-400">Suggested Amounts (Comma Separated)</Label>
                  <Input
                    value={suggestedAmounts}
                    onChange={(e) => setSuggestedAmounts(e.target.value)}
                    placeholder="1000, 2500, 5000"
                    className="bg-slate-50 dark:bg-slate-900 h-11 text-xs font-semibold"
                  />
                </div>
              )}
            </div>

            {/* PRICING & COMMISSION NOTE */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>BlueC PayLink Fee Policy</span>
              </div>
              <p>Creating and sharing PayLinks is free. The customer always pays the full listed amount. For business transactions, a 1% BlueC settlement commission is applied.</p>
            </div>

            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all"
            >
              {submitting ? 'Generating PayLink...' : 'Generate BlueC PayLink'}
            </Button>
          </div>
        </main>
      </div>

      <ToastComponent />
    </div>
  );
}