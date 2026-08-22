import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, Camera, Upload, Save, X, MapPin, ChevronDown, ChevronRight, 
  CheckCircle2, User, Phone, Mail, ShieldCheck, Calendar, Hash, Sparkles, Edit3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { patchRequest, ENDPOINTS } from '@/types';
import { Loader } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

export function Profile() {
  const navigate = useNavigate();
  const authContext = useAuth();
  const { user } = authContext;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  // State: Profile Picture Upload
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || null);

  // Local Storage for Nickname (One-time editable local state)
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('profile_nickname') || '';
  });
  const [isNicknameEdited, setIsNicknameEdited] = useState<boolean>(() => {
    return localStorage.getItem('profile_nickname_edited') === 'true' || Boolean(localStorage.getItem('profile_nickname'));
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(nickname);
  const [nicknameError, setNicknameError] = useState('');

  // Phone Number Editing State
  const [isPhoneEdited, setIsPhoneEdited] = useState<boolean>(() => {
    return localStorage.getItem('profile_phone_edited') === 'true';
  });
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  // Extract raw 10 digits from existing phone
  const rawInitialPhone = (user?.phone || '').replace(/\D/g, '').slice(-10);
  const [phoneInput, setPhoneInput] = useState(rawInitialPhone);
  const [phoneError, setPhoneError] = useState('');

  // Address State - Backend preference object takes precedence if present
  const [residentialAddress, setResidentialAddress] = useState(() => {
    const pref = (user as any)?.preference;
    if (pref && (pref.country || pref.street_address || pref.state || pref.city)) {
      return {
        country: pref.country || '',
        state: pref.state || '',
        city: pref.city || '',
        addressLine: pref.street_address || '',
        landmark: pref.landmark || '',
        postalCode: pref.postal_code || ''
      };
    }
    const saved = localStorage.getItem('marketplace_delivery_location');
    return saved ? JSON.parse(saved) : null;
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [countries, setCountries] = useState<{ country: string; iso2: string }[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [loadingLocations, setLoadingLocations] = useState({
    countries: false,
    states: false,
    cities: false
  });

  const [addressForm, setAddressForm] = useState({
    country: residentialAddress?.country || '',
    state: residentialAddress?.state || '',
    city: residentialAddress?.city || '',
    addressLine: residentialAddress?.addressLine || '',
    landmark: residentialAddress?.landmark || '',
    postalCode: residentialAddress?.postalCode || ''
  });

  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Synchronize state when user context updates
  useEffect(() => {
    const pref = (user as any)?.preference;
    if (pref && (pref.country || pref.street_address || pref.state || pref.city)) {
      const updated = {
        country: pref.country || '',
        state: pref.state || '',
        city: pref.city || '',
        addressLine: pref.street_address || '',
        landmark: pref.landmark || '',
        postalCode: pref.postal_code || ''
      };
      setResidentialAddress(updated);
      setAddressForm(prev => ({
        ...prev,
        country: updated.country,
        state: updated.state,
        city: updated.city,
        addressLine: updated.addressLine,
        landmark: updated.landmark,
        postalCode: updated.postalCode
      }));
    }
  }, [user]);

  // Safely derive Dynamic User Identity Fields
  const fullName = `${user?.firstName || (user as any)?.first_name || ''} ${user?.surname || (user as any)?.last_name || ''}`.trim() || 'Valued Member';
  const email = user?.email || 'Not Provided';
  
  // Dynamic UID safely pulled from user's referral_code with fallback
  const rawUid = (user as any)?.referral_code || (user as any)?.referralCode || (user as any)?.uid || (user as any)?.id || (user as any)?.user_id;
  const uid = rawUid ? String(rawUid) : 'BSM24001000';

  // Dynamic Tier with Default Tier 1
  const tier = (user as any)?.tier || (user as any)?.tierLevel || (user as any)?.tier_level || 'Tier 1';
  
  const verificationStatus = (user as any)?.verificationStatus || (user as any)?.verification_status || 'Verified';
  const gender = (user as any)?.gender || 'Not Specified';
  
  // Date of Birth mapped from preference.date_of_birth if available
  const dateOfBirth = (user as any)?.preference?.date_of_birth || (user as any)?.dob || (user as any)?.dateOfBirth || (user as any)?.date_of_birth || 'Not Specified';
  
  // Dynamic Date Registered safely retrieved from Backend
  const rawCreatedAt = (user as any)?.createdAt || (user as any)?.created_at || (user as any)?.registeredAt || (user as any)?.dateRegistered;
  const memberSince = rawCreatedAt 
    ? new Date(rawCreatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Not Specified';

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
    if (!addressForm.country) {
      setStates([]);
      return;
    }
    const fetchStates = async () => {
      setLoadingLocations(prev => ({ ...prev, states: true }));
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: addressForm.country })
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
  }, [addressForm.country]);

  // Fetch Cities when State changes
  useEffect(() => {
    if (!addressForm.state || !addressForm.country) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingLocations(prev => ({ ...prev, cities: true }));
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country: addressForm.country, state: addressForm.state })
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
  }, [addressForm.state, addressForm.country]);

  // Synchronize authenticated user state using existing AuthContext mechanisms
  const synchronizeUser = async () => {
    const auth = authContext as any;
    if (typeof auth?.refreshUser === 'function') {
      await auth.refreshUser();
    } else if (typeof auth?.fetchUser === 'function') {
      await auth.fetchUser();
    } else {
      window.location.reload();
    }
  };

  // Profile Image Upload Handlers
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
        await synchronizeUser();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      hideLoader();
      setUploading(false);
    }
  };

  // Nickname Handlers (Local persistence with strict one-time edit & validation)
  const handleSaveNickname = () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      setNicknameError('Nickname cannot be empty');
      return;
    }
    localStorage.setItem('profile_nickname', trimmed);
    localStorage.setItem('profile_nickname_edited', 'true');
    setNickname(trimmed);
    setIsNicknameEdited(true);
    setIsEditingNickname(false);
    setNicknameError('');
  };

  // Phone Number Handlers
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhoneInput(val);
      setPhoneError('');
    }
  };

  const handleSavePhone = async () => {
    if (phoneInput.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits (e.g. 8064709041)');
      return;
    }

    showLoader();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('phone', phoneInput);
      
      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      
      if (response) {
        localStorage.setItem('profile_phone_edited', 'true');
        setIsPhoneEdited(true);
        setIsEditingPhone(false);
        await synchronizeUser();
      }
    } catch (error) {
      console.error('Failed to update phone:', error);
      setPhoneError('Could not update phone number. Please try again.');
    } finally {
      hideLoader();
    }
  };

  // Address Validation and Handlers
  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!addressForm.country) newErrors.country = 'Country is required';
    if (!addressForm.state) newErrors.state = 'State is required';
    if (!addressForm.city) newErrors.city = 'City / LGA is required';
    if (!addressForm.addressLine) newErrors.addressLine = 'Street address is required';
    setAddressErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    setSavingAddress(true);
    showLoader();

    try {
      const payload = {
        preference: {
          country: addressForm.country,
          state: addressForm.state,
          city: addressForm.city,
          street_address: addressForm.addressLine,
          landmark: addressForm.landmark,
          postal_code: addressForm.postalCode
        }
      };

      const response = await patchRequest(ENDPOINTS.user, payload);

      if (response) {
        const pref = response.preference || payload.preference;
        const newAddress = {
          country: pref.country || addressForm.country,
          state: pref.state || addressForm.state,
          city: pref.city || addressForm.city,
          addressLine: pref.street_address || addressForm.addressLine,
          landmark: pref.landmark || addressForm.landmark,
          postalCode: pref.postal_code || addressForm.postalCode
        };

        setResidentialAddress(newAddress);
        localStorage.setItem('marketplace_delivery_location', JSON.stringify({
          ...addressForm,
          updatedAt: new Date().toISOString()
        }));
        setIsEditingAddress(false);
        await synchronizeUser();
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      setAddressErrors(prev => ({ ...prev, submit: 'Failed to update address. Please try again.' }));
    } finally {
      setSavingAddress(false);
      hideLoader();
    }
  };

  const selectClassName = "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-sky-400 appearance-none text-slate-800 dark:text-slate-100";

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER */}
        <header className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-700 dark:text-slate-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Profile Center</h1>
            </div>
          </div>
        </header>

        {/* ISOLATED SCROLLABLE CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden z-10">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* DESKTOP TWO-COLUMN LAYOUT CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: HERO CARD & ACCOUNT INFORMATION */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* PROFILE HERO CARD */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-sky-500/10 dark:from-sky-500/20 dark:to-blue-600/20" />
                  
                  {/* Profile Picture */}
                  <div className="relative mt-4 mb-4">
                    {imagePreview || user?.profilePicture ? (
                      <img 
                        src={imagePreview || user?.profilePicture} 
                        alt={fullName} 
                        className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md border-4 border-white dark:border-slate-900">
                        {user?.firstName?.[0]}{(user as any)?.surname?.[0]}
                      </div>
                    )}
                    <button 
                      onClick={handleImageClick}
                      disabled={uploading}
                      className="absolute bottom-1 right-1 p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                      title="Change Profile Picture"
                    >
                      {uploading ? (
                        <Upload className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
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

                  {/* Name & UID */}
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {fullName}
                  </h2>
                  <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                    <Hash className="w-3 h-3 text-sky-500" />
                    UID: {uid}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      {tier}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Member Since {memberSince}
                    </span>
                  </div>
                </section>

   {/* ACCOUNT INFORMATION SECTION */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Account Information</h3>
                  </div>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Account Tier</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{tier}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Verification Status</span>
                      <span className="inline-flex items-center gap-1 font-medium text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" />
                        {verificationStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">BlueSea UID</span>
                      <span className="font-mono text-xs text-slate-800 dark:text-slate-200">{uid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Member Since</span>
                      <span className="text-slate-800 dark:text-slate-200">{memberSince}</span>
                    </div>
                  </div>
                </section>

              </div>

              {/* RIGHT COLUMN: PERSONAL INFO, CONTACT INFO & RESIDENTIAL ADDRESS */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* SECTION 1: PERSONAL INFORMATION */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Personal Information</h3>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    
                    {/* Full Name */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Full Name</p>
                        <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{fullName}</p>
                      </div>
                    </div>

                    {/* Nickname (Editable once locally) */}
                    <div className="p-4 transition-colors">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          if (!isNicknameEdited) {
                            setIsEditingNickname(!isEditingNickname);
                            setNicknameInput(nickname);
                            setNicknameError('');
                          }
                        }}
                      >
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Nickname</p>
                          <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                            {nickname || <span className="text-slate-400 italic font-normal">Not Set</span>}
                          </p>
                        </div>
                        {!isNicknameEdited ? (
                          <div className="flex items-center gap-1 text-sky-500 font-medium text-xs">
                            {isEditingNickname ? (
                              <span>Cancel</span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                {nickname ? 'Edit' : 'Set'}
                              </span>
                            )}
                            {isEditingNickname ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                            Set
                          </span>
                        )}
                      </div>

                      {/* Dropdown Expand Form */}
                      {isEditingNickname && !isNicknameEdited && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div>
                            <Input
                              placeholder="Enter preferred nickname"
                              value={nicknameInput}
                              onChange={(e) => {
                                setNicknameInput(e.target.value);
                                if (nicknameError) setNicknameError('');
                              }}
                              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                            {nicknameError && (
                              <p className="text-xs text-red-500 mt-1">{nicknameError}</p>
                            )}
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                              Note: Nickname can only be set once.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveNickname}
                              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save Nickname
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingNickname(false);
                                setNicknameError('');
                              }}
                              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Gender</p>
                        <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{gender}</p>
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Date of Birth</p>
                        <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {dateOfBirth}
                        </p>
                      </div>
                    </div>

                  </div>
                </section>

                {/* SECTION 2: CONTACT INFORMATION */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sky-500" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Contact Information</h3>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    
                    {/* Mobile Number */}
                    <div className="p-4 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Mobile Number</p>
                          <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                            {phoneInput ? `+234 ${phoneInput}` : 'Not Provided'}
                          </p>
                        </div>
                        
                        {!isPhoneEdited ? (
                          <button
                            onClick={() => setIsEditingPhone(!isEditingPhone)}
                            className="flex items-center gap-1 text-sky-500 font-medium text-xs hover:text-sky-600 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isEditingPhone ? 'Cancel' : 'Edit'}</span>
                            {isEditingPhone ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Dropdown Expand Form */}
                      {isEditingPhone && !isPhoneEdited && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                          <div>
                            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                              Nigerian Mobile Digits (10 digits, e.g. 8064709041)
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                +234
                              </span>
                              <Input
                                type="tel"
                                maxLength={10}
                                value={phoneInput}
                                onChange={handlePhoneInputChange}
                                placeholder="8064709041"
                                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-1"
                              />
                            </div>
                            {phoneError && (
                              <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>
                            )}
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                              Note: Phone number can only be updated once.
                            </p>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={handleSavePhone}
                              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save Phone Number
                            </button>
                            <button
                              onClick={() => setIsEditingPhone(false)}
                              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Email Address</p>
                        <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {email}
                        </p>
                      </div>
                    </div>

                  </div>
                </section>

                {/* SECTION 3: RESIDENTIAL ADDRESS */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-500" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Residential Address</h3>
                    </div>
                    {residentialAddress && !isEditingAddress && (
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="flex items-center gap-1 text-sky-500 font-medium text-xs hover:text-sky-600 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="p-5">
                    {!residentialAddress && !isEditingAddress ? (
                      <div className="py-6 text-center space-y-3">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          No residential address provided yet.
                        </p>
                        <button
                          onClick={() => setIsEditingAddress(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          Add Residential Address
                        </button>
                      </div>
                    ) : isEditingAddress ? (
                      /* Dropdown Address Form */
                      <div className="space-y-4">
                        {/* Country */}
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Country</label>
                          <div className="relative">
                            <select
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value, state: '', city: '' })}
                              className={cn(selectClassName, addressErrors.country && "border-red-500")}
                              disabled={loadingLocations.countries}
                            >
                              <option value="">{loadingLocations.countries ? 'Loading countries...' : 'Select Country'}</option>
                              {countries.map((c) => (
                                <option key={c.iso2} value={c.country}>{c.country}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                          {addressErrors.country && <p className="text-[10px] text-red-500 ml-1">{addressErrors.country}</p>}
                        </div>

{/* State & City */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">State</label>
                            <div className="relative">
                              <select
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value, city: '' })}
                                className={cn(selectClassName, addressErrors.state && "border-red-500")}
                                disabled={!addressForm.country || loadingLocations.states}
                              >
                                <option value="">{loadingLocations.states ? 'Loading...' : 'Select State'}</option>
                                {states.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            {addressErrors.state && <p className="text-[10px] text-red-500 ml-1">{addressErrors.state}</p>}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">City / LGA</label>
                            <div className="relative">
                              <select
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                className={cn(selectClassName, addressErrors.city && "border-red-500")}
                                disabled={!addressForm.state || loadingLocations.cities}
                              >
                                <option value="">{loadingLocations.cities ? 'Loading...' : 'Select City'}</option>
                                {cities.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            {addressErrors.city && <p className="text-[10px] text-red-500 ml-1">{addressErrors.city}</p>}
                          </div>
                        </div>

                        {/* Street Address Line */}
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Street Address</label>
                          <Input
                            placeholder="e.g. 15 Admiralty Way"
                            value={addressForm.addressLine}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                            className={cn("bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800", addressErrors.addressLine && "border-red-500")}
                          />
                          {addressErrors.addressLine && <p className="text-[10px] text-red-500 ml-1">{addressErrors.addressLine}</p>}
                        </div>

                        {/* Landmark & Postal Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Landmark (Optional)</label>
                            <Input
                              placeholder="e.g. Near Civic Center"
                              value={addressForm.landmark}
                              onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Postal Code (Optional)</label>
                            <Input
                              placeholder="100001"
                              value={addressForm.postalCode}
                              onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                          </div>
                        </div>

                        {addressErrors.submit && (
                          <p className="text-xs text-red-500 mt-1">{addressErrors.submit}</p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleSaveAddress}
                            disabled={savingAddress}
                            className="flex-1 h-11 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {savingAddress ? 'Saving Address...' : 'Save Address'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingAddress(false);
                              setAddressForm(residentialAddress || {
                                country: '', state: '', city: '', addressLine: '', landmark: '', postalCode: ''
                              });
                              setAddressErrors({});
                            }}
                            className="px-4 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Address Summary Card */
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                        <div className="p-2 bg-sky-500/10 text-sky-500 rounded-xl shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                            {residentialAddress.addressLine}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {residentialAddress.city}, {residentialAddress.state}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {residentialAddress.country} {residentialAddress.postalCode && `• ${residentialAddress.postalCode}`}
                          </p>
                          {residentialAddress.landmark && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
                              Landmark: {residentialAddress.landmark}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

              </div>

            </div>

          </div>
        </main>

        {/* FIXED MOBILE BOTTOM NAVIGATION */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>
      </div>

      <LoaderComponent />
    </div>
  );
}