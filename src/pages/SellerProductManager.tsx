import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, X, Trash2, Copy, ChevronRight, 
  Image as ImageIcon, Package, MapPin, CheckCircle2, 
  AlertCircle, Layers, Truck, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui-custom';
import { cn } from '@/lib/utils';
import { 
  useMerchantProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  useLocations
} from '@/hooks/merchant/useMerchant';
import { useCategories } from '@/hooks/marketplace/useMarketplace';
import { Product } from '@/types';

export default function SellerProductManager() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();

  // --- SERVER STATE ---
  const { data: productsRes, isLoading: productsLoading } = useMerchantProducts();
  const { data: categoriesRes } = useCategories();
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];

  // --- LOCAL UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    discount_price: '',
    stock_quantity: '1',
    condition: 'new',
    status: 'active',
    location: '', // Mapped to State for simplicity
    delivery_type: 'delivery',
    delivery_fee: '',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // For edits

  // Location Data
  const { statesQuery, lgasQuery } = useLocations(formData.location);

  // --- HANDLERS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length + existingImages.length > 5) {
      showToast("Maximum 5 images allowed");
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Generate Previews purely for UI
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = () => {
    if (!formData.title || !formData.price || !formData.category_id || !formData.location) {
      showToast("Please fill all required fields");
      return;
    }
    if (imageFiles.length === 0 && existingImages.length === 0) {
      showToast("At least one image is required");
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });
    
    // Append actual File objects
    imageFiles.forEach(file => payload.append('images', file));
    existingImages.forEach(url => payload.append('existing_images', url));

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          showToast("Product updated!");
          closeModal();
        },
        onError: (err: any) => showToast(err.message || "Failed to update product")
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast("Product posted successfully!");
          closeModal();
        },
        onError: (err: any) => showToast(err.message || "Failed to post product")
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showToast("Product deleted");
          setExpandedId(null);
        }
      });
    }
  };

  const openEdit = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description,
      category_id: product.category.id,
      price: product.price.toString(),
      discount_price: product.discount_price ? product.discount_price.toString() : '',
      stock_quantity: product.stock_quantity.toString(),
      condition: product.condition,
      status: product.status,
      location: product.location,
      delivery_type: product.delivery_type,
      delivery_fee: product.delivery_fee.toString(),
    });
    setExistingImages(product.images);
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: '', description: '', category_id: '', price: '', discount_price: '',
      stock_quantity: '1', condition: 'new', status: 'active', location: '', 
      delivery_type: 'delivery', delivery_fee: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
  };

  const copyProductLink = (id: string) => {
    const url = `https://blueseamobile.com.ng/product/${id}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!");
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Your Products</h1>
            <p className="text-xs text-slate-500">Inventory & Management</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5">
          <Plus className="w-4 h-4 mr-2" /> Post Product
        </Button>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {productsLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
              <p className="text-slate-500 text-sm">Loading inventory...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sky-50 flex items-center justify-center">
                <Package className="w-10 h-10 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Products Yet</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start selling by adding your first product to the marketplace.</p>
              <Button onClick={() => setIsModalOpen(true)} className="bg-sky-500 hover:bg-sky-600"><Plus className="w-4 h-4 mr-2" /> Post Your First Product</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product: Product) => {
                const isExpanded = expandedId === product.id;
                return (
                  <div key={product.id} className={cn("group bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden", isExpanded ? "border-sky-200 ring-1 ring-sky-100" : "border-slate-100 hover:border-slate-200")}>
                    <div onClick={() => setExpandedId(isExpanded ? null : product.id)} className="p-4 cursor-pointer flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white truncate">{product.title}</h3>
                            <p className="text-sky-500 font-bold mt-1">₦{product.price.toLocaleString()}</p>
                          </div>
                          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase", product.status === 'active' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600")}>
                            {product.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {product.status}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> Qty: {product.stock_quantity}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {product.location}</span>
                        </div>
                      </div>
                      <ChevronRight className={cn("w-5 h-5 text-slate-300 transition-transform duration-300", isExpanded && "rotate-90 text-sky-500")} />
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/20 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="aspect-video bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100">
                              <img src={product.images[0]} className="w-full h-full object-contain" alt="Main" />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {product.images.map((img, i) => (
                                <img key={i} src={img} className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0" alt="Thumb" />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs text-slate-400 uppercase">Description</Label>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{product.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-slate-400 uppercase">Category</Label>
                                <p className="text-sm font-medium dark:text-white">{product.category.name}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-400 uppercase">Delivery</Label>
                                <p className="text-sm font-medium dark:text-white flex items-center gap-1"><Truck className="w-3 h-3" /> {product.delivery_type}</p>
                              </div>
                            </div>
                            <div className="pt-4 flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(product)} className="flex-1 border-slate-200">Edit Product</Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)} disabled={deleteMutation.isPending} className="flex-1 border-red-100 text-red-500 hover:bg-red-50">
                                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete
                              </Button>
                            </div>
                            <div className="pt-2">
                               <Label className="text-xs text-slate-400 uppercase mb-2 block">Product Link</Label>
                               <div className="flex gap-2">
                                  <Input readOnly value={`https://blueseamobile.com.ng/product/${product.id}`} className="h-9 text-[10px] bg-white border-slate-200" />
                                  <Button size="sm" variant="outline" onClick={() => copyProductLink(product.id)} className="shrink-0 h-9"><Copy className="w-4 h-4" /></Button>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[92vh] md:h-auto md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 z-10 bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Post New Product"}</h2>
                <p className="text-xs text-slate-500">Fill in the details for your listing</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-bold">Product Images (Min 1, Max 5)</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {existingImages.map((src, i) => (
                    <div key={`exist-${i}`} className="relative aspect-square rounded-xl overflow-hidden border">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => removeExistingImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {imagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => removeNewImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {(existingImages.length + imagePreviews.length) < 5 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
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
                  <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. iPhone 15 Pro Max" />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <select className="w-full h-10 px-3 rounded-md border text-sm" value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detailed information..." className="h-24 resize-none" />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Price (₦) *</Label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Discount Price</Label>
                  <Input type="number" value={formData.discount_price} onChange={(e) => setFormData({...formData, discount_price: e.target.value})} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} placeholder="1" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className="w-full h-10 px-3 rounded-md border text-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <Label className="text-sm font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-500" /> Location Details *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">State</Label>
                    <select className="w-full h-10 px-3 rounded-md border text-sm" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}>
                      <option value="">Select State</option>
                      {statesQuery.data?.data.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                <Label className="text-sm font-bold flex items-center gap-2"><Truck className="w-4 h-4 text-sky-500" /> Delivery Settings</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Coverage</Label>
                    <div className="flex gap-2">
                      {['pickup', 'delivery', 'both'].map((type) => (
                        <button key={type} onClick={() => setFormData({...formData, delivery_type: type})} className={cn("flex-1 py-2 text-[10px] font-bold rounded-lg border uppercase", formData.delivery_type === type ? "bg-sky-500 text-white border-sky-500" : "bg-white border-slate-200")}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Base Delivery Fee (₦)</Label>
                    <Input type="number" value={formData.delivery_fee} onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})} placeholder="0.00" disabled={formData.delivery_type === 'pickup'} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <Button onClick={handleSaveProduct} disabled={isSaving} className="w-full bg-sky-500 hover:bg-sky-600 h-12 text-lg font-bold rounded-xl disabled:opacity-50">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {editingId ? "Save Changes" : "Post Product Now"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastComponent />
    </div>
  );
}