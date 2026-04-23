import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Camera, Upload, Save, X, MapPin, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { patchRequest, ENDPOINTS } from '@/types';
import { Loader } from '@/components/ui-custom';

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user?.phone ? '0' + user?.phone.slice(-10) : '');
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  // Location State
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [countries, setCountries] = useState<{ country: string; iso2: string }[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [loadingLocations, setLoadingLocations] = useState({
    countries: false,
    states: false,
    cities: false
  });

  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    const saved = localStorage.getItem('marketplace_delivery_location');
    return saved ? JSON.parse(saved) : null;
  });

  const [locationForm, setLocationForm] = useState({
    country: deliveryLocation?.country || '',
    state: deliveryLocation?.state || '',
    city: deliveryLocation?.city || '',
    addressLine: deliveryLocation?.addressLine || '',
    landmark: deliveryLocation?.landmark || '',
    postalCode: deliveryLocation?.postalCode || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData] = useState({
    firstName: user?.firstName || '',
    surname: user?.surname || '',
    phone: user?.phone ? '0' + user?.phone.slice(-10) : '',
    email: user?.email || '',
  });

  // Fetch Countries on Mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingLocations(prev => ({ ...prev, countries: true }));
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
        const data = await response.json();
        if (!data.error) {
          setCountries(data.data.map((c: any) => ({ country: c.name, iso2: c.Iso2 })));
        }
      } catch (error) {
        console.error('Failed to fetch countries', error);
      } finally {
        setLoadingLocations(prev => ({ ...prev, countries: false }));
      }
    };
    fetchCountries();
  }, []);

  // Fetch States when Country changes
  useEffect(() => {
    if (!locationForm.country) {
      setStates([]);
      return;
    }
    const fetchStates = async () => {
      setLoadingLocations(prev => ({ ...prev, states: true }));
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: locationForm.country })
        });
        const data = await response.json();
        if (!data.error) {
          setStates(data.data.states.map((s: any) => s.name));
        }
      } catch (error) {
        console.error('Failed to fetch states', error);
      } finally {
        setLoadingLocations(prev => ({ ...prev, states: false }));
      }
    };
    fetchStates();
  }, [locationForm.country]);

  // Fetch Cities when State changes
  useEffect(() => {
    if (!locationForm.state || !locationForm.country) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingLocations(prev => ({ ...prev, cities: true }));
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: locationForm.country, state: locationForm.state })
        });
        const data = await response.json();
        if (!data.error) {
          setCities(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch cities', error);
      } finally {
        setLoadingLocations(prev => ({ ...prev, cities: false }));
      }
    };
    fetchCities();
  }, [locationForm.state, locationForm.country]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    showLoader();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      
      if (response) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      hideLoader();
      setUploading(false);
    }
  };

  const handleSavePhone = async () => {
    if (!phoneValue) return;

    const formDataToSend = new FormData();
    formDataToSend.append('phone', phoneValue);
    
    showLoader();
    try {
      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      
      if (response) {
        setEditingPhone(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update phone:', error);
    } finally {
      hideLoader();
    }
  };

  const validateLocation = () => {
    const newErrors: Record<string, string> = {};
    if (!locationForm.country) newErrors.country = 'Country is required';
    if (!locationForm.state) newErrors.state = 'State is required';
    if (!locationForm.city) newErrors.city = 'City/LGA is required';
    if (!locationForm.addressLine) newErrors.addressLine = 'Address line is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveLocation = async () => {
    if (!validateLocation()) return;

    setSavingLocation(true);
    showLoader();

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const dataToSave = {
        ...locationForm,
        updatedAt: new Date().toISOString()
      };

      // TODO: Send location to backend
      // await patchRequest(ENDPOINTS.user, { deliveryLocation: dataToSave });

      localStorage.setItem('marketplace_delivery_location', JSON.stringify(dataToSave));
      setDeliveryLocation(dataToSave);
      setIsEditingLocation(false);
      
      // Feedback via existing pattern if any, otherwise local state UI
    } catch (error) {
      console.error('Failed to save location:', error);
    } finally {
      setSavingLocation(false);
      hideLoader();
    }
  };

  const profileFields = [
    { id: 'fullName', label: 'Full Name', value: `${formData.firstName} ${formData.surname}`, editable: false },
    { id: 'phone', label: 'Mobile Number', value: formData.phone, editable: true, currentValue: phoneValue },
    { id: 'email', label: 'Email', value: formData.email, editable: false },
  ];

  const selectClassName = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 appearance-none";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">My Profile</h1>
      </div>

      <main className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {imagePreview || user?.profilePicture ? (
                <img 
                  src={imagePreview || user?.profilePicture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-600 dark:text-slate-300">
                    {user?.firstName?.[0]}{user?.surname?.[0]}
                  </span>
                </div>
              )}
              <button 
                onClick={handleImageClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Upload className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Tap camera to change profile picture</p>
          </div>

          {/* Profile Fields Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
            {profileFields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  'flex items-center justify-between p-4',
                  index !== profileFields.length - 1 && 'border-b border-slate-100 dark:border-slate-800'
                )}
              >
                <div className="text-left flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{field.label}</p>
                  {field.id === 'phone' && editingPhone ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="tel"
                        maxLength={11}
                        value={phoneValue}
                        onChange={(e) => setPhoneValue(e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1"
                      />
                      <button
                        onClick={handleSavePhone}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingPhone(false);
                          setPhoneValue(user?.phone || '');
                        }}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 dark:text-white">{field.value || 'Not set'}</p>
                      {field.editable && !editingPhone && (
                        <button
                          onClick={() => setEditingPhone(true)}
                          className="text-xs text-sky-500 hover:text-sky-600"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Location Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-800 dark:text-white">Delivery Location</h3>
              </div>
              {deliveryLocation && !isEditingLocation && (
                <button
                  onClick={() => setIsEditingLocation(true)}
                  className="text-xs text-sky-500 hover:text-sky-600 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="p-4">
              {!deliveryLocation && !isEditingLocation ? (
                <div className="py-4 text-center">
                  <button
                    onClick={() => setIsEditingLocation(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors"
                  >
                    Add Delivery Location
                  </button>
                </div>
              ) : isEditingLocation ? (
                <div className="space-y-4">
                  {/* Country Select */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 ml-1">Country</label>
                    <div className="relative">
                      <select
                        value={locationForm.country}
                        onChange={(e) => setLocationForm({ ...locationForm, country: e.target.value, state: '', city: '' })}
                        className={cn(selectClassName, errors.country && "border-red-500")}
                        disabled={loadingLocations.countries}
                      >
                        <option value="">{loadingLocations.countries ? 'Loading countries...' : 'Select Country'}</option>
                        {countries.map((c) => (
                          <option key={c.iso2} value={c.country}>{c.country}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.country && <p className="text-[10px] text-red-500 ml-1">{errors.country}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* State Select */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400 ml-1">State</label>
                      <div className="relative">
                        <select
                          value={locationForm.state}
                          onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value, city: '' })}
                          className={cn(selectClassName, errors.state && "border-red-500")}
                          disabled={!locationForm.country || loadingLocations.states}
                        >
                          <option value="">{loadingLocations.states ? 'Loading...' : 'Select State'}</option>
                          {states.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.state && <p className="text-[10px] text-red-500 ml-1">{errors.state}</p>}
                    </div>

                    {/* City/LGA Select */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400 ml-1">City / LGA</label>
                      <div className="relative">
                        <select
                          value={locationForm.city}
                          onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                          className={cn(selectClassName, errors.city && "border-red-500")}
                          disabled={!locationForm.state || loadingLocations.cities}
                        >
                          <option value="">{loadingLocations.cities ? 'Loading...' : 'Select City'}</option>
                          {cities.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      {errors.city && <p className="text-[10px] text-red-500 ml-1">{errors.city}</p>}
                    </div>
                  </div>

                  {/* Address Line */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 ml-1">Address Line</label>
                    <Input
                      placeholder="Street address, apartment, suite"
                      value={locationForm.addressLine}
                      onChange={(e) => setLocationForm({ ...locationForm, addressLine: e.target.value })}
                      className={errors.addressLine ? "border-red-500" : ""}
                    />
                    {errors.addressLine && <p className="text-[10px] text-red-500 ml-1">{errors.addressLine}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Landmark */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400 ml-1">Landmark (Optional)</label>
                      <Input
                        placeholder="e.g. Near Big Plaza"
                        value={locationForm.landmark}
                        onChange={(e) => setLocationForm({ ...locationForm, landmark: e.target.value })}
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 dark:text-slate-400 ml-1">Postal Code (Optional)</label>
                      <Input
                        placeholder="100001"
                        value={locationForm.postalCode}
                        onChange={(e) => setLocationForm({ ...locationForm, postalCode: e.target.value })}
                      />
                    </div>
                  </div>
    <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveLocation}
                      disabled={savingLocation}
                      className="flex-1 h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {savingLocation ? 'Saving...' : 'Save Location'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingLocation(false);
                        setLocationForm(deliveryLocation || {
                          country: '', state: '', city: '', addressLine: '', landmark: '', postalCode: ''
                        });
                        setErrors({});
                      }}
                      className="px-4 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-sky-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white leading-tight">
                        {deliveryLocation.addressLine}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {deliveryLocation.city}, {deliveryLocation.state}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {deliveryLocation.country} {deliveryLocation.postalCode && `• ${deliveryLocation.postalCode}`}
                      </p>
                      {deliveryLocation.landmark && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">
                          Landmark: {deliveryLocation.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <LoaderComponent />
    </div>
  );
}
