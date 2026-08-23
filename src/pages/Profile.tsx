import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, Camera, Upload, Save, X, MapPin, ChevronDown, ChevronRight, 
  User, Phone, Mail, ShieldCheck, Calendar, Hash, Edit3, AlertCircle, RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { patchRequest, getRequest, ENDPOINTS } from '@/types';
import { Loader } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

interface UserPreference {
  image?: string | null;
  nickname?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  street_address?: string | null;
  landmark?: string | null;
  postal_code?: string | null;
  updated_on?: string | null;
}

interface UserProfileData {
  id?: number;
  other_names?: string | null;
  email?: string | null;
  phone?: string | number | null;
  surname?: string | null;
  pin_is_set?: boolean;
  image?: string | null;
  referral_code?: string | null;
  created_on?: string | null;
  preference?: UserPreference;
}

interface AddressForm {
  country: string;
  state: string;
  city: string;
  addressLine: string;
  landmark: string;
  postalCode: string;
}

interface CountryIso {
  country: string;
  iso2: string;
}

interface CountryApiResponse {
  error: boolean;
  msg: string;
  data: Array<{ name: string; Iso2: string }>;
}

interface StateApiResponse {
  error: boolean;
  msg: string;
  data: {
    name: string;
    iso2: string;
    states: Array<{ name: string; state_code: string }>;
  };
}

interface CityApiResponse {
  error: boolean;
  msg: string;
  data: string[];
}

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  // Primary Backend Profile & Loading States
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Profile Picture Upload (Initializes from user context)
  const [uploading, setUploading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profilePicture || null);

  // Nickname State
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [nicknameInput, setNicknameInput] = useState<string>('');
  const [savingNickname, setSavingNickname] = useState<boolean>(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // Gender State
  const [isEditingGender, setIsEditingGender] = useState<boolean>(false);
  const [genderInput, setGenderInput] = useState<string>('');
  const [savingGender, setSavingGender] = useState<boolean>(false);
  const [genderError, setGenderError] = useState<string | null>(null);

  // Date of Birth State
  const [isEditingDob, setIsEditingDob] = useState<boolean>(false);
  const [dobInput, setDobInput] = useState<string>('');
  const [savingDob, setSavingDob] = useState<boolean>(false);
  const [dobError, setDobError] = useState<string | null>(null);

  // Phone Number Editing State
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [savingPhone, setSavingPhone] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Address State
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
  const [savingAddress, setSavingAddress] = useState<boolean>(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [countries, setCountries] = useState<CountryIso[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [loadingLocations, setLoadingLocations] = useState({
    countries: false,
    states: false,
    cities: false
  });

  const [addressForm, setAddressForm] = useState<AddressForm>({
    country: '',
    state: '',
    city: '',
    addressLine: '',
    landmark: '',
    postalCode: ''
  });

  const [addressFieldErrors, setAddressFieldErrors] = useState<Record<string, string>>({});

  // Synchronize image when Auth Context updates
  useEffect(() => {
    if (user?.profilePicture && !imagePreview?.startsWith('blob:')) {
      setImagePreview(user.profilePicture);
    }
  }, [user?.profilePicture]);

  // Helper to sync local edit states with latest profile data
  const populateFormStates = useCallback((data: UserProfileData) => {
    const pref = data.preference || {};

    const activeImage = user?.profilePicture || data.image || pref.image || null;
    setImagePreview(activeImage);

    setNicknameInput(pref.nickname || '');
    setGenderInput(pref.gender || '');
    setDobInput(pref.date_of_birth || '');

    const rawPhone = data.phone ? String(data.phone).replace(/\D/g, '') : '';
    setPhoneInput(rawPhone);

    setAddressForm({
      country: pref.country || '',
      state: pref.state || '',
      city: pref.city || '',
      addressLine: pref.street_address || '',
      landmark: pref.landmark || '',
      postalCode: pref.postal_code || ''
    });
  }, [user]);

  // Fetch Profile Data on Mount & Refresh
  const fetchUserProfile = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) {
      setLoadingProfile(true);
      showLoader();
    }
    setProfileError(null);
    try {
      const response = await getRequest(ENDPOINTS.user);
      if (response) {
        setProfileData(response);
        populateFormStates(response);
      } else {
        setProfileError('Unable to load your profile data. Please try again.');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setProfileError('Unable to connect to the server. Please check your network.');
    } finally {
      if (!isSilentRefresh) {
        setLoadingProfile(false);
        hideLoader();
      }
    }
  }, [populateFormStates, showLoader, hideLoader]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Derived Values from Backend Profile Response
  const fullName = profileData
    ? `${profileData.other_names || ''} ${profileData.surname || ''}`.trim() || 'Valued Member'
    : user?.firstName ? `${user.firstName} ${user?.surname || ''}`.trim() : 'Valued Member';

  const email = profileData?.email || user?.email || 'Not Provided';
  const referralCode = profileData?.referral_code || 'Not Available';

  const memberSince = profileData?.created_on
    ? new Date(profileData.created_on).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Not Available';

  const hasResidentialAddress = Boolean(
    profileData?.preference?.street_address || 
    profileData?.preference?.city || 
    profileData?.preference?.state || 
    profileData?.preference?.country
  );

  // Fetch Countries for Location Dropdowns
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingLocations(prev => ({ ...prev, countries: true }));
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
        const data: CountryApiResponse = await response.json();
        if (!data.error && Array.isArray(data.data)) {
          setCountries(data.data.map((c) => ({ country: c.name, iso2: c.Iso2 })));
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      } finally {
        setLoadingLocations(prev => ({ ...prev, countries: false }));
      }
    };
    fetchCountries();
  }, []);

  // Fetch States when Country Changes
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
        const data: StateApiResponse = await response.json();
        if (!data.error && data.data?.states) {
          setStates(data.data.states.map((s) => s.name));
        }
      } catch (error) {
        console.error('Failed to fetch states:', error);
      } finally {
        setLoadingLocations(prev => ({ ...prev, states: false }));
      }
    };
    fetchStates();
  }, [addressForm.country]);

  // Fetch Cities when State Changes
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
        const data: CityApiResponse = await response.json();
        if (!data.error && Array.isArray(data.data)) {
          setCities(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      } finally {
        setLoadingLocations(prev => ({ ...prev, cities: false }));
      }
    };
    fetchCities();
  }, [addressForm.state, addressForm.country]);

  // Profile Image Upload
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);
    setUploading(true);
    showLoader();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      if (response) {
        await fetchUserProfile(true);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploading(false);
      hideLoader();
    }
  };

  // Nickname PATCH Handler
  const handleSaveNickname = async () => {
    const trimmed = nicknameInput.trim().slice(0, 50);
    setSavingNickname(true);
    setNicknameError(null);
    showLoader();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nickname', trimmed);

      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      if (response) {
        await fetchUserProfile(true);
        setIsEditingNickname(false);
      } else {
        setNicknameError('Could not save nickname. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update nickname:', error);
      setNicknameError('An error occurred while saving nickname.');
    } finally {
      setSavingNickname(false);
      hideLoader();
    }
  };

  // Gender PATCH Handler
  const handleSaveGender = async () => {
    if (!genderInput) {
      setGenderError('Please select a gender option.');
      return;
    }
    setSavingGender(true);
    setGenderError(null);
    showLoader();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('gender', genderInput);

      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      if (response) {
        await fetchUserProfile(true);
        setIsEditingGender(false);
      } else {
        setGenderError('Could not save gender selection.');
      }
    } catch (error) {
      console.error('Failed to update gender:', error);
      setGenderError('An error occurred while saving gender.');
    } finally {
      setSavingGender(false);
      hideLoader();
    }
  };

  // Date of Birth PATCH Handler
  const handleSaveDob = async () => {
    if (!dobInput) {
      setDobError('Please select a valid date of birth.');
      return;
    }
    setSavingDob(true);
    setDobError(null);
    showLoader();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('date_of_birth', dobInput);

      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      if (response) {
        await fetchUserProfile(true);
        setIsEditingDob(false);
      } else {
        setDobError('Could not save date of birth.');
      }
    } catch (error) {
      console.error('Failed to update date of birth:', error);
      setDobError('An error occurred while saving date of birth.');
    } finally {
      setSavingDob(false);
      hideLoader();
    }
  };

  // Phone Number PATCH Handler
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setPhoneInput(val);
      setPhoneError(null);
    }
  };

  const handleSavePhone = async () => {
    if (phoneInput.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits.');
      return;
    }

    setSavingPhone(true);
    setPhoneError(null);
    showLoader();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('phone', phoneInput);

      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      if (response) {
        await fetchUserProfile(true);
        setIsEditingPhone(false);
      } else {
        setPhoneError('Could not update phone number.');
      }
    } catch (error) {
      console.error('Failed to update phone:', error);
      setPhoneError('An error occurred while updating phone number.');
    } finally {
      setSavingPhone(false);
      hideLoader();
    }
  };

  // Address Validation & PATCH Handler
  const validateAddress = () => {
    const newErrors: Record<string, string> = {};
    if (!addressForm.country) newErrors.country = 'Country is required';
    if (!addressForm.state) newErrors.state = 'State is required';
    if (!addressForm.city) newErrors.city = 'City / LGA is required';
    if (!addressForm.addressLine) newErrors.addressLine = 'Street address is required';
    setAddressFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    setSavingAddress(true);
    setAddressError(null);
    showLoader();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('country', addressForm.country);
      formDataToSend.append('state', addressForm.state);
      formDataToSend.append('city', addressForm.city);
      formDataToSend.append('street_address', addressForm.addressLine);
      if (addressForm.landmark) formDataToSend.append('landmark', addressForm.landmark);
      if (addressForm.postalCode) formDataToSend.append('postal_code', addressForm.postalCode);

      const response = await patchRequest(ENDPOINTS.user, formDataToSend);
      if (response) {
        await fetchUserProfile(true);
        setIsEditingAddress(false);
      } else {
        setAddressError('Could not save residential address.');
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      setAddressError('An error occurred while saving address.');
    } finally {
      setSavingAddress(false);
      hideLoader();
    }
  };

  const selectClassName = "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-sky-400 appearance-none text-slate-800 dark:text-slate-100";

  const formattedGender = profileData?.preference?.gender
    ? profileData.preference.gender.charAt(0).toUpperCase() + profileData.preference.gender.slice(1)
    : 'Not Specified';

  const formattedDob = profileData?.preference?.date_of_birth
    ? new Date(profileData.preference.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not Specified';

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

        {/* MAIN SCROLLABLE AREA */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden z-10">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* INITIAL LOADING STATE */}
            {loadingProfile && !profileData ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
                <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading your profile details...</p>
              </div>
            ) : profileError && !profileData ? (
              /* RETRY / ERROR FALLBACK UI */
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-500 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Unable to load profile</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{profileError}</p>
                </div>
                <button
                  onClick={() => fetchUserProfile()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            ) : (
              /* TWO-COLUMN PROFILE CONTENT */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: HERO CARD & ACCOUNT INFORMATION */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* PROFILE HERO CARD */}
                  <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-sky-500/10 via-blue-600/10 to-sky-500/10 dark:from-sky-500/20 dark:to-blue-600/20" />
                    
                    {/* Profile Picture */}
                    <div className="relative mt-4 mb-4">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt={fullName} 
                          className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md border-4 border-white dark:border-slate-900">
                          {fullName?.[0] || 'U'}
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

                    {/* Name & Referral */}
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {fullName}
                    </h2>
                    <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                      <Hash className="w-3 h-3 text-sky-500" />
                      Referral Code: {referralCode}
                    </p>

                    {/* Member Since Badge */}
                    <div className="flex items-center gap-2 mt-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
                        <span className="text-slate-500 dark:text-slate-400">Account ID</span>
                        <span className="font-mono text-xs text-slate-800 dark:text-slate-200">{profileData?.id || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">PIN Status</span>
                        <span className="font-medium text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {profileData?.pin_is_set ? 'PIN Set' : 'PIN Not Set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Referral Code</span>
                        <span className="font-mono text-xs text-slate-800 dark:text-slate-200">{referralCode}</span>
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
                      
                      {/* Full Name (Read-Only) */}
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Full Name</p>
                          <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{fullName}</p>
                        </div>
                      </div>

                      {/* Nickname (Editable) */}
                      <div className="p-4 transition-colors">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => {
                            const nextState = !isEditingNickname;
                            setIsEditingNickname(nextState);
                            if (!nextState) {
                              setNicknameInput(profileData?.preference?.nickname || '');
                              setNicknameError(null);
                            }
                          }}
                        >
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Nickname</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                              {profileData?.preference?.nickname || <span className="text-slate-400 italic font-normal">Not Set</span>}
                            </p>
                          </div>
                          <button type="button" className="flex items-center gap-1 text-sky-500 font-medium text-xs">
                            {isEditingNickname ? (
                              <span>Cancel</span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                {profileData?.preference?.nickname ? 'Edit' : 'Set'}
                              </span>
                            )}
                            {isEditingNickname ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Nickname Form */}
                        {isEditingNickname && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <Input
                              placeholder="Enter preferred nickname (max 50 chars)"
                              maxLength={50}
                              value={nicknameInput}
                              onChange={(e) => setNicknameInput(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                            {nicknameError && (
                              <p className="text-xs text-red-500 mt-1">{nicknameError}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveNickname}
                                disabled={savingNickname}
                                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingNickname ? 'Saving...' : 'Save Nickname'}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingNickname(false);
                                  setNicknameInput(profileData?.preference?.nickname || '');
                                  setNicknameError(null);
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

                      {/* Gender (Editable) */}
                      <div className="p-4 transition-colors">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => {
                            const nextState = !isEditingGender;
                            setIsEditingGender(nextState);
                            if (!nextState) {
                              setGenderInput(profileData?.preference?.gender || '');
                              setGenderError(null);
                            }
                          }}
                        >
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Gender</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">{formattedGender}</p>
                          </div>
                          <button type="button" className="flex items-center gap-1 text-sky-500 font-medium text-xs">
                            {isEditingGender ? (
                              <span>Cancel</span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                {profileData?.preference?.gender ? 'Edit' : 'Set'}
                              </span>
                            )}
                            {isEditingGender ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Gender Form */}
                        {isEditingGender && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="relative">
                              <select
                                value={genderInput}
                                onChange={(e) => setGenderInput(e.target.value)}
                                className={selectClassName}
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                              <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            {genderError && (
                              <p className="text-xs text-red-500 mt-1">{genderError}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveGender}
                                disabled={savingGender}
                                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingGender ? 'Saving...' : 'Save Gender'}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingGender(false);
                                  setGenderInput(profileData?.preference?.gender || '');
                                  setGenderError(null);
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

                      {/* Date of Birth (Editable) */}
                      <div className="p-4 transition-colors">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => {
                            const nextState = !isEditingDob;
                            setIsEditingDob(nextState);
                            if (!nextState) {
                              setDobInput(profileData?.preference?.date_of_birth || '');
                              setDobError(null);
                            }
                          }}
                        >
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Date of Birth</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formattedDob}
                            </p>
                          </div>
                          <button type="button" className="flex items-center gap-1 text-sky-500 font-medium text-xs">
                            {isEditingDob ? (
                              <span>Cancel</span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                {profileData?.preference?.date_of_birth ? 'Edit' : 'Set'}
                              </span>
                            )}
                            {isEditingDob ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Date of Birth Form */}
                        {isEditingDob && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <Input
                              type="date"
                              value={dobInput}
                              onChange={(e) => setDobInput(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                            {dobError && (
                              <p className="text-xs text-red-500 mt-1">{dobError}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveDob}
                                disabled={savingDob}
                                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingDob ? 'Saving...' : 'Save Date of Birth'}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingDob(false);
                                  setDobInput(profileData?.preference?.date_of_birth || '');
                                  setDobError(null);
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

                    </div>
                  </section>

                  {/* SECTION 2: CONTACT INFORMATION */}
                  <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-sky-500" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Contact Information</h3>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      
                      {/* Mobile Number (Editable) */}
                      <div className="p-4 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Mobile Number</p>
                            <p className="font-medium text-slate-800 dark:text-slate-100 mt-0.5">
                              {profileData?.phone ? `+234 ${String(profileData.phone).replace(/\D/g, '').slice(-10)}` : 'Not Provided'}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => {
                              const nextState = !isEditingPhone;
                              setIsEditingPhone(nextState);
                              if (!nextState) {
                                setPhoneInput(profileData?.phone ? String(profileData.phone).replace(/\D/g, '') : '');
                                setPhoneError(null);
                              }
                            }}
                            className="flex items-center gap-1 text-sky-500 font-medium text-xs hover:text-sky-600 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isEditingPhone ? 'Cancel' : 'Edit'}</span>
                            {isEditingPhone ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Phone Editing Form */}
                        {isEditingPhone && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <div>
                              <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                                Enter 10 Mobile Digits (e.g. 8012345678)
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
                                  placeholder="8012345678"
                                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-1"
                                />
                              </div>
                              {phoneError && (
                                <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>
                              )}
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={handleSavePhone}
                                disabled={savingPhone}
                                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {savingPhone ? 'Saving...' : 'Save Phone Number'}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingPhone(false);
                                  setPhoneInput(profileData?.phone ? String(profileData.phone).replace(/\D/g, '') : '');
                                  setPhoneError(null);
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

                      {/* Email Address (Read-Only) */}
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
                      {hasResidentialAddress && !isEditingAddress && (
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
                      {addressError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
                          {addressError}
                        </div>
                      )}

                      {!hasResidentialAddress && !isEditingAddress ? (
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
                        /* Address Form */
                        <div className="space-y-4">
                          {/* Country */}
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Country</label>
                            <div className="relative">
                              <select
                                value={addressForm.country}
                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value, state: '', city: '' })}
                                className={cn(selectClassName, addressFieldErrors.country && "border-red-500")}
                                disabled={loadingLocations.countries}
                              >
                                <option value="">{loadingLocations.countries ? 'Loading countries...' : 'Select Country'}</option>
                                {countries.map((c) => (
                                  <option key={c.iso2} value={c.country}>{c.country}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            {addressFieldErrors.country && <p className="text-[10px] text-red-500 ml-1">{addressFieldErrors.country}</p>}
                          </div>

                          {/* State & City */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">State</label>
                              <div className="relative">
                                <select
                                  value={addressForm.state}
                                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value, city: '' })}
                                  className={cn(selectClassName, addressFieldErrors.state && "border-red-500")}
                                  disabled={!addressForm.country || loadingLocations.states}
                                >
                                  <option value="">{loadingLocations.states ? 'Loading...' : 'Select State'}</option>
                                  {states.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                              {addressFieldErrors.state && <p className="text-[10px] text-red-500 ml-1">{addressFieldErrors.state}</p>}
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">City / LGA</label>
                              <div className="relative">
                                <select
                                  value={addressForm.city}
                                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                  className={cn(selectClassName, addressFieldErrors.city && "border-red-500")}
                                  disabled={!addressForm.state || loadingLocations.cities}
                                >
                                  <option value="">{loadingLocations.cities ? 'Loading...' : 'Select City'}</option>
                                  {cities.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                              </div>
                              {addressFieldErrors.city && <p className="text-[10px] text-red-500 ml-1">{addressFieldErrors.city}</p>}
                            </div>
                          </div>

                          {/* Street Address */}
                          <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Street Address</label>
                            <Input
                              placeholder="e.g. 123 Main St"
                              value={addressForm.addressLine}
                              onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                              className={cn("bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800", addressFieldErrors.addressLine && "border-red-500")}
                            />
                            {addressFieldErrors.addressLine && <p className="text-[10px] text-red-500 ml-1">{addressFieldErrors.addressLine}</p>}
                          </div>

                          {/* Landmark & Postal Code */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Landmark (Optional)</label>
                              <Input
                                placeholder="e.g. Near Plaza"
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

                          {/* Actions */}
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleSaveAddress}
                              disabled={savingAddress}
                              className="flex-1 h-11 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              {savingAddress ? 'Saving Address...' : 'Save Address'}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingAddress(false);
                                setAddressError(null);
                                setAddressFieldErrors({});
                                if (profileData?.preference) {
                                  setAddressForm({
                                    country: profileData.preference.country || '',
                                    state: profileData.preference.state || '',
                                    city: profileData.preference.city || '',
                                    addressLine: profileData.preference.street_address || '',
                                    landmark: profileData.preference.landmark || '',
                                    postalCode: profileData.preference.postal_code || ''
                                  });
                                }
                              }}
                              className="px-4 h-11 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Address Display */
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                          <div className="p-2 bg-sky-500/10 text-sky-500 rounded-xl shrink-0 mt-0.5">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                              {profileData?.preference?.street_address}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {profileData?.preference?.city}, {profileData?.preference?.state}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {profileData?.preference?.country} {profileData?.preference?.postal_code && `• ${profileData.preference.postal_code}`}
                            </p>
                            {profileData?.preference?.landmark && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
                                Landmark: {profileData.preference.landmark}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                </div>

              </div>
            )}

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