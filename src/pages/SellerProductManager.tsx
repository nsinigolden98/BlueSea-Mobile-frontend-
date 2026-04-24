import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Trash2, 
  Copy, 
  ChevronRight, 
  Image as ImageIcon, 
  Package, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Truck,
  Loader2
} from 'lucide-react';

// UI Components from the system
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toast, Loader } from '@/components/ui-custom';
import { cn } from '@/lib/utils';

/**
 * TYPES & INTERFACES
 */
interface Location {
  country: string;
  state: string;
  city: string;
  lga: string;
}

interface DeliverySettings {
  type: 'Local' | 'Nationwide' | 'International';
  feeType: 'Flat' | 'Per State';
  fee: string;
}

interface Product {
  productId: string;
  name: string;
  description: string;
  category: string;
  images: string[]; // Base64 or Blob URLs for this demo
  price: string;
  discountPrice?: string;
  quantity: string;
  location: Location;
  delivery: DeliverySettings;
  sellerId: string;
  sellerName: string;
  verified: boolean;
  createdAt: string;
  status: 'In Stock' | 'Out of Stock';
}

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Gadgets', 'Automobile', 'Others'];

/**
 * SELLER PRODUCT MANAGER COMPONENT
 */
export default function SellerProductManager() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();

  // --- STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: 'Electronics',
    price: '',
    discountPrice: '',
    quantity: '1',
    status: 'In Stock',
    location: { country: 'Nigeria', state: '', city: '', lga: '' },
    delivery: { type: 'Local', feeType: 'Flat', fee: '' },
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // API State for Location (Simulating API fetch)
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);

  // --- EFFECTS ---
  useEffect(() => {
    loadProducts();
    fetchStates();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    const saved = localStorage.getItem('seller_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    }
    setLoading(false);
  };

  const saveToStorage = (updatedProducts: Product[]) => {
    localStorage.setItem('seller_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  // --- LOCATION API SIMULATION ---
  const fetchStates = async () => {
    // In a real app: const res = await getRequest(ENDPOINTS.states)
    const mockStates = ['Akwa Ibom', 'Lagos', 'Abuja', 'Rivers', 'Kano'];
    setStates(mockStates);
  };

  const fetchLGAs = async (state: string) => {
    // In a real app: const res = await getRequest(`${ENDPOINTS.lgas}/${state}`)
    const mockLGAs = state === 'Akwa Ibom' ? ['Uyo', 'Ikot Ekpene', 'Eket'] : ['General LGA 1', 'General LGA 2'];
    setLgas(mockLGAs);
  };

  // --- HANDLERS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 5) {
      showToast("Maximum 5 images allowed");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreviews(prev => [...prev, result]);
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = () => {
    // Validation
    if (!formData.name || !formData.price || !formData.category || !formData.location?.state) {
      showToast("Please fill all required fields");
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      showToast("At least one image is required");
      return;
    }

    showLoader();

    setTimeout(() => {
      const newProduct: Product = {
        ...(formData as Product),
        productId: isEditing ? formData.productId! : `PROD-${Date.now()}`,
        sellerId: "VENDOR-001", // Handled by system
        sellerName: "Verified Seller",
        verified: true,
        createdAt: isEditing ? formData.createdAt! : new Date().toISOString(),
      };

      let updatedList;
      if (isEditing) {
        updatedList = products.map(p => p.productId === newProduct.productId ? newProduct : p);
      } else {
        updatedList = [newProduct, ...products];
      }

      saveToStorage(updatedList);
      hideLoader();
      showToast(isEditing ? "Product updated!" : "Product posted successfully!");
      closeModal();
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updated = products.filter(p => p.productId !== id);
      saveToStorage(updated);
      showToast("Product deleted");
      setExpandedProductId(null);
    }
  };

  const openEdit = (product: Product) => {
    setFormData(product);
    setImagePreviews(product.images);
    setIsEditing(true);
    setIsModalOpen(true);
    fetchLGAs(product.location.state);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      category: 'Electronics',
      price: '',
      discountPrice: '',
      quantity: '1',
      status: 'In Stock',
      location: { country: 'Nigeria', state: '', city: '', lga: '' },
      delivery: { type: 'Local', feeType: 'Flat', fee: '' },
      images: []
    });
    setImagePreviews([]);
  };

  const copyProductLink = (id: string) => {
    const url = `https://blueseamobile.com.ng/product/${id}`; // TODO: Replace with real product URL
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!");
  };

  // --- RENDER HELPERS ---
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(amount));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Your Products</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inventory & Management</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Product
        </Button>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
              <p className="text-slate-500 text-sm">Loading inventory...</p>
            </div>
          ) : products.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
                <Package className="w-10 h-10 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Products Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                Start selling by adding your first product to the marketplace.
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-sky-500 hover:bg-sky-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Product
              </Button>
            </div>
          ) : (
            /* PRODUCT LIST */
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => {
                const isExpanded = expandedProductId === product.productId;
                
                return (
                  <div 
                    key={product.productId}
                    className={cn(
                      "group bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden",
                      isExpanded ? "border-sky-200 dark:border-sky-900 ring-1 ring-sky-100 dark:ring-sky-900/30" : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                    )}
                  >
                    {/* Main Card View */}
                    <div 
                      onClick={() => setExpandedProductId(isExpanded ? null : product.productId)}
                      className="p-4 cursor-pointer flex items-center gap-4"
                    >
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white truncate">
                              {product.name}
                            </h3>
                            <p className="text-sky-500 font-bold mt-1">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            product.status === 'In Stock' 
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {product.status === 'In Stock' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {product.status}
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            Qty: {product.quantity}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {product.location.state}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className={cn(
                        "w-5 h-5 text-slate-300 transition-transform duration-300",
                        isExpanded && "rotate-90 text-sky-500"
                      )} />
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/20 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Image Gallery */}
                          <div className="space-y-3">
                            <div className="aspect-video bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                              <img src={product.images[0]} className="w-full h-full object-contain" alt="Main" />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {product.images.map((img, i) => (
                                <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0" alt="Thumb" />
                              ))}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs text-slate-400 uppercase">Description</Label>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                {product.description}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-slate-400 uppercase">Category</Label>
                                <p className="text-sm font-medium dark:text-white">{product.category}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-400 uppercase">Delivery</Label>
                                <p className="text-sm font-medium dark:text-white flex items-center gap-1">
                                  <Truck className="w-3 h-3" /> {product.delivery.type}
                                </p>
                              </div>
                            </div>

                            {/* Actions System */}
                            <div className="pt-4 flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEdit(product)}
                                className="flex-1 border-slate-200 dark:border-slate-700"
                              >
                                Edit Product
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDelete(product.productId)}
                                className="flex-1 border-red-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>

                            {/* Link Copy Logic (Marketplace Pattern) */}
                            <div className="pt-2">
                               <Label className="text-xs text-slate-400 uppercase mb-2 block">Product Link</Label>
                               <div className="flex gap-2">
                                  <Input 
                                    readOnly 
                                    value={`https://blueseamobile.com.ng/product/${product.productId}`} 
                                    className="h-9 text-[10px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => copyProductLink(product.productId)}
                                    className="shrink-0 h-9"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

       {/* POST/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[92vh] md:h-auto md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {isEditing ? "Edit Product" : "Post New Product"}
                </h2>
                <p className="text-xs text-slate-500">Fill in the details for your listing</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label className="text-sm font-bold">Product Images (Min 1, Max 5)</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {imagePreviews.length < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                      <span className="text-[10px] text-slate-500 mt-1">Add Image</span>
                      <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. iPhone 15 Pro Max" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Provide detailed information about the product..."
                  className="h-24 resize-none"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Price (₦) *</Label>
                  <Input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Price</Label>
                  <Input 
                    type="number" 
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                    placeholder="Optional" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="1" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Location (API Based) */}
              <div className="space-y-4">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-500" /> Location Details *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">State</Label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                      value={formData.location?.state}
                      onChange={(e) => {
                        const state = e.target.value;
                        setFormData({
                          ...formData, 
                          location: { ...formData.location!, state, lga: '' }
                        });
                        fetchLGAs(state);
                      }}
                    >
                      <option value="">Select State</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">City / LGA</Label>
                    <select 
                      disabled={!formData.location?.state}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm disabled:opacity-50"
                      value={formData.location?.lga}
                      onChange={(e) => setFormData({
                        ...formData, 
                        location: { ...formData.location!, lga: e.target.value, city: e.target.value }
                      })}
                    >
                      <option value="">Select Area</option>
                      {lgas.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-500" /> Delivery Settings
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Coverage</Label>
                    <div className="flex gap-2">
                      {['Local', 'Nationwide', 'International'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({
                            ...formData, 
                            delivery: { ...formData.delivery!, type: type as any }
                          })}
                          className={cn(
                            "flex-1 py-2 text-xs font-medium rounded-lg border transition-all",
                            formData.delivery?.type === type
                              ? "bg-sky-500 text-white border-sky-500"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Delivery Fee (₦)</Label>
                    <Input 
                      type="number"
                      value={formData.delivery?.fee}
                      onChange={(e) => setFormData({
                        ...formData, 
                        delivery: { ...formData.delivery!, fee: e.target.value }
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <Button 
                onClick={handleSaveProduct}
                className="w-full bg-sky-500 hover:bg-sky-600 h-12 text-lg font-bold rounded-xl"
              >
                {isEditing ? "Save Changes" : "Post Product Now"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL OVERLAYS */}
      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
