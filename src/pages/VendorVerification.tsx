import { useState, useEffect } from 'react';
import { Toast } from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { XCircle, Clock, Upload, Loader2, Shield, QrCode, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, postRequest, ENDPOINTS, type VendorStatus, type CreateVendorPayload } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'registered', label: 'Registered Business' },
  { value: 'organizer', label: 'Event Organizer' },
];

const NIGERIAN_STATES = [
  'Abia State', 'Adamawa State', 'Akwa Ibom State', 'Anambra State', 'Bauchi State',
  'Bayelsa State', 'Benue State', 'Cross-River State', 'Delta State', 'Ebonyi State',
  'Edo State', 'Ekiti State', 'Enugu State', 'FCT - Abuja', 'Gombe State',
  'Imo State', 'Jigawa State', 'Kaduna State', 'Kano State', 'Katsina State',
  'Kebbi State', 'Kogi State', 'Kwara State', 'Lagos State', 'Nasarawa State',
  'Niger State', 'Ogun State', 'Ondo State', 'Osun State', 'Oyo State',
  'Plateau State', 'Rivers State', 'Sokoto State', 'Taraba State', 'Yobe State', 'Zamfara State',
];

export function VendorVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { showToast, ToastComponent } = Toast();

  const defaultName = user ? `${user.firstName} ${user.surname}`.trim() : '';

  const [formData, setFormData] = useState<Partial<CreateVendorPayload>>({
    brand_name: '',
    business_type: 'individual',
  });

  const [accountability, setAccountability] = useState({
    legal_name: defaultName,
    residential_address: '',
    state_city: '',
    id_type: '',
    monthly_volume: '',
    business_description: '',
    id_document: null as File | null,
    proof_of_address: null as File | null,
  });

  useEffect(() => {
    setAccountability(prev => ({
      ...prev,
      legal_name: defaultName,
    }));
  }, [user]);

  useEffect(() => {
    fetchVendorStatus();
  }, []);

  const fetchVendorStatus = async () => {
    try {
      const response = await getRequest(ENDPOINTS.vendor_status);
      if (response?.vendor) {
        setVendorStatus(response.vendor);
      } else {
        setVendorStatus(null);
      }
    } catch (err) {
      console.log('No vendor status found');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateVendorPayload, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountabilityChange = (field: string, value: string | File | null) => {
    setAccountability(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.brand_name) {
      showToast('Please enter your business/brand name');
      return;
    }

    if (!accountability.residential_address || !accountability.state_city || !accountability.id_type) {
      showToast('Please complete all accountability details');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        brand_name: formData.brand_name,
        business_type: formData.business_type,
        residential_address: accountability.residential_address,
        state_city: accountability.state_city,
        id_type: accountability.id_type,
        monthly_volume: accountability.monthly_volume,
        business_description: accountability.business_description,
        id_document: accountability.id_document,
        proof_of_address: accountability.proof_of_address,
      };

      const response = await postRequest(ENDPOINTS.create_vendor, payload);

      if (response?.id || response?.success) {
        showToast('Verification request submitted successfully!');
        setShowForm(false);
        fetchVendorStatus();
      } else {
        showToast(response?.error || 'Failed to submit verification request');
      }
    } catch (err) {
      showToast('Failed to submit verification request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
        <ToastComponent />
      </div>
    );
  }

  if (vendorStatus?.is_verified || vendorStatus?.verification_status === 'approved') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => navigate('/marketplace')}
              className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Vendor Verification</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your verified seller status</p>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#dcfce7" />
                    <path d="M8 12l2.5 2.5 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                  Already A Verified Vendor
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Your vendor account has been verified. You can now create and manage events.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-left mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{vendorStatus.brand_name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{vendorStatus.business_type}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate('/event-manager')}
                    className="w-full bg-sky-500 hover:bg-sky-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                  <Button 
                    onClick={() => navigate('/scanner')}
                    variant="outline"
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Scanner
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
        <ToastComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => navigate('/marketplace')}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Vendor Verification</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Become a verified seller</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {vendorStatus?.verification_status === 'pending' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Verification Pending</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">Your verification is being reviewed</p>
                </div>
              </div>
            )}

            {vendorStatus?.verification_status === 'rejected' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <p className="font-medium text-red-800 dark:text-red-200">Verification Rejected</p>
                </div>
              </div>
            )}

            {!showForm && !vendorStatus && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                  Become a Verified Seller
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Verification helps prevent scams and ensures accountability for ticket buyers and event partners.
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  Start Verification
                </Button>
              </div>
            )}

            {showForm && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Seller Identity</h3>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Business Type *</Label>
                    <div className="flex flex-wrap gap-2">
                      {BUSINESS_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleInputChange('business_type', type.value)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            formData.business_type === type.value
                              ? 'bg-sky-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          )}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Legal Full Name *</Label>
                    <Input
                      value={accountability.legal_name}
                      onChange={(e) => handleAccountabilityChange('legal_name', e.target.value)}
                      placeholder="Enter your legal name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Business / Brand Name *</Label>
                    <Input
                      value={formData.brand_name}
                      onChange={(e) => handleInputChange('brand_name', e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Accountability Details</h3>

                  <div className="space-y-2">
                    <Label>Residential Address *</Label>
                    <Textarea
                      value={accountability.residential_address}
                      onChange={(e) => handleAccountabilityChange('residential_address', e.target.value)}
                      placeholder="Enter your residential address"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>State & City *</Label>
                    <select
                      value={accountability.state_city}
                      onChange={(e) => handleAccountabilityChange('state_city', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Means of Identification *</Label>
                    <select
                      value={accountability.id_type}
                      onChange={(e) => handleAccountabilityChange('id_type', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="">Select ID type</option>
                      <option value="nin">NIN Slip</option>
                      <option value="passport">International Passport</option>
                      <option value="driver">Driver's License</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload ID Document *</Label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Upload ID document (PDF, JPG, PNG)</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleAccountabilityChange('id_document', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Proof of Address</Label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Upload proof of address</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleAccountabilityChange('proof_of_address', e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Monthly Volume</Label>
                    <Input
                      value={accountability.monthly_volume}
                      onChange={(e) => handleAccountabilityChange('monthly_volume', e.target.value)}
                      placeholder="Estimated monthly ticket sales"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Business Description</Label>
                    <Textarea
                      value={accountability.business_description}
                      onChange={(e) => handleAccountabilityChange('business_description', e.target.value)}
                      placeholder="Describe your business..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-sky-500 hover:bg-sky-600 py-6"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Verification'
                  )}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastComponent />
    </div>
  );
}