import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo, Toast, AuthEmailModal, Loader, AuthLoader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Mail, User, Phone, Ticket } from 'lucide-react';
import { postRequest, ENDPOINTS, setCookie } from '@/types';
import { hasSessionToken } from '@/lib/session';
import { ForgotPasswordModal } from '@/components/ui-custom/AuthModal';
import { GoogleLogin } from '@react-oauth/google';
import { isNativeAndroid, performNativeGoogleSignIn } from '@/lib/nativeGoogleAuth';

type AuthMode = 'login' | 'signup';

const normalizeNigerianPhone = (value: string) => {
  const compact = value.replace(/[\s()-]/g, '');
  if (compact.startsWith('+234')) return `0${compact.slice(4).replace(/\D/g, '').slice(0, 10)}`;
  const digits = compact.replace(/\D/g, '').slice(0, 11);
  return digits.length === 10 ? `0${digits}` : digits;
};

const isValidNigerianPhone = (value: string) => /^0[789]\d{9}$/.test(value);
const isValidGmail = (value: string) => /^(?!\.)(?!.*\.\.)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(?<!\.)@gmail\.com$/i.test(value.trim());
const isValidPersonName = (value: string) => /^[\p{L}][\p{L}\s'-]{1,39}$/u.test(value.trim());

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, googleLogin, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();
  const { AuthComponent, setComponentVisibilty } = AuthEmailModal();
  const { setForgotPasswordVisibility, ForgotPasswordComponent } = ForgotPasswordModal();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState<string>('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [formError, setFormError] = useState('');

  // Synchronous check for mobile native environment
  const isNative = isNativeAndroid();

  // Seamless redirection before DOM render (prevents layout flash)
  useLayoutEffect(() => {
    if (isNative) {
      const refCode = searchParams.get('ref');
      const targetPath = refCode || mode === 'signup' ? '/app-auth/signup' : '/app-auth';
      navigate(targetPath, { replace: true });
    }
  }, [isNative, searchParams, mode, navigate]);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setCookie('ref', refCode);
      setMode('signup');
    }
  }, [searchParams]);

  const handleNativeGoogleLogin = async () => {
    try {
      showLoader();
      const idToken = await performNativeGoogleSignIn();
      await googleLogin({ credential: idToken });
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google Sign-In failed. Please try again.';
      const normalized = message.toLowerCase();
      if (!normalized.includes('cancel') && !normalized.includes('dismiss')) showToast(message);
    } finally {
      hideLoader();
    }
  };

  const handleWebGoogleSuccess = async (credentialResponse: any) => {
    try {
      showLoader();
      await googleLogin(credentialResponse);
      navigate('/dashboard');
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Google Sign-In failed. Please try again.');
    } finally {
      hideLoader();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (mode === 'login') {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setFormError('Enter a valid email address.');
        return;
      }
      if (!password) {
        setFormError('Enter your password to continue.');
        return;
      }
    } else {
      const normalizedEmail = email.trim().toLowerCase();
      if (!isValidGmail(normalizedEmail)) {
        setFormError('Please use a valid Gmail address ending in @gmail.com.');
        return;
      }
      if (!isValidNigerianPhone(phone)) {
        setFormError('Enter a valid Nigerian mobile number, for example 08031234567.');
        return;
      }
      if (!isValidPersonName(firstName) || !isValidPersonName(surname)) {
        setFormError('First name and surname must contain letters only (spaces, hyphens and apostrophes are allowed).');
        return;
      }
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        setFormError('Use at least 8 characters, including one letter and one number.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
      if (!agreeToTerms) {
        setFormError('Please accept the Terms & Conditions to create your account.');
        return;
      }
    }

    showLoader();
    try {
      if (mode === 'login') {
        const response = await login({ email: email.trim().toLowerCase(), password, rememberMe });
        if (response && typeof response === 'object' && 'email' in response) {
          setFailedLoginAttempts(0);
          navigate('/dashboard');
        } else if (response) {
          setFailedLoginAttempts((attempts) => attempts + 1);
          setFormError(String(response));
        }
        return;
      }

      const response = await signup({ email: email.trim().toLowerCase(), phone, firstName: firstName.trim(), surname: surname.trim(), password, confirmPassword, agreeToTerms });
      if (response.state) {
        showToast(response.message);
        setComponentVisibilty(true);
      } else if (response?.errors?.email?.[0] === 'Email already exists.') {
        const otpResponse = await postRequest(ENDPOINTS.sendOtp, { email });
        showToast(otpResponse.message || 'A verification code has been sent.');
        setComponentVisibilty(true);
      } else {
        showToast(response.message || 'Unable to create your account. Please try again.');
      }
      navigate('/login');
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Authentication failed. Please try again.';
      if (mode === 'login') setFailedLoginAttempts((attempts) => attempts + 1);
      setFormError(message);
    } finally {
      hideLoader();
    }
  };

  // If already authenticated or redirecting to mobile app view, render loader immediately
  if (hasSessionToken() || isNative) {
    return <AuthLoader />;
  }

  return (
    <div className="md:h-dvh md:overflow-hidden">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 md:grid md:h-dvh md:min-h-0 md:grid-cols-[1.05fr_0.95fr] md:overflow-hidden md:overscroll-none md:dark:bg-[#090f1b]">
        {/* Desktop brand panel: BlueSea colours and a purposeful financial activity chart. */}
        <section className="relative hidden h-full min-h-0 overflow-hidden bg-[#071a2d] px-8 py-6 text-white md:flex md:flex-col md:justify-between lg:px-[clamp(3rem,5vw,5.5rem)] lg:py-7">
          <div className="pointer-events-none absolute -right-44 -bottom-64 h-[700px] w-[700px] rounded-full border border-sky-400/[0.09]" />
          <div className="pointer-events-none absolute -right-24 -bottom-44 h-[520px] w-[520px] rounded-full border border-sky-400/[0.10]" />
          <div className="pointer-events-none absolute right-[-8%] top-[27%] h-[420px] w-[420px] rounded-full bg-blue-500/[0.12] blur-[110px]" />
          <div className="pointer-events-none absolute left-[-12%] bottom-[8%] h-[340px] w-[340px] rounded-full bg-cyan-500/[0.07] blur-[100px]" />

          <div className="relative z-10 flex items-center justify-between">
            <Logo size="sm" />
            <span className="rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-100/75">BlueSea Mobile</span>
          </div>

          <div className="relative z-10 my-auto max-w-[620px] py-5 lg:py-6">
            <p className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-sky-300">
              <span className="h-px w-8 bg-sky-400/80" /> Banking that moves with you
            </p>
            <h1 className="max-w-[590px] text-[clamp(2.8rem,4.3vw,4.35rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-white">
              Your money, <span className="text-sky-300">under your control.</span>
            </h1>
            <p className="mt-4 max-w-[510px] text-sm leading-6 text-slate-300/80 lg:text-[15px] lg:leading-7">
              Make everyday payments, send money, manage your wallet and stay on top of your finances — all from one secure place built around you.
            </p>

            <div className="mt-6 max-w-[510px] overflow-hidden rounded-2xl border border-sky-200/15 bg-[#0a2035]/90 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-md lg:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">Your financial overview</p>
                  <p className="mt-1.5 text-sm font-semibold text-white">A clearer picture of your activity</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-2.5 py-1.5 text-[9px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Secure & connected
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-sky-100/[0.07] bg-[#071a2d]/75 px-3 pt-3 pb-2">
                <div className="mb-2 flex items-center justify-between text-[9px] font-medium text-slate-500">
                  <span>ACTIVITY TREND</span><span>ILLUSTRATIVE OVERVIEW</span>
                </div>
                <svg viewBox="0 0 480 142" className="h-[82px] w-full" role="img" aria-label="Illustrative financial activity trend line">
                  <defs>
                    <linearGradient id="blueSeaActivityStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient>
                    <linearGradient id="blueSeaActivityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity=".19"/><stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/></linearGradient>
                  </defs>
                  {[24, 58, 92, 126].map((y) => <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#8ab7d8" strokeOpacity=".10" strokeDasharray="3 6" />)}
                  {[60, 156, 252, 348, 444].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="130" stroke="#8ab7d8" strokeOpacity=".07" />)}
                  <path d="M0 105 C28 101 39 84 66 89 S105 102 132 76 S177 82 204 65 S246 73 274 51 S317 63 344 42 S389 48 414 29 S454 34 480 14 L480 132 L0 132Z" fill="url(#blueSeaActivityFill)" />
                  <path d="M0 105 C28 101 39 84 66 89 S105 102 132 76 S177 82 204 65 S246 73 274 51 S317 63 344 42 S389 48 414 29 S454 34 480 14" fill="none" stroke="url(#blueSeaActivityStroke)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="480" cy="14" r="4" fill="#7dd3fc" stroke="#071a2d" strokeWidth="3" />
                </svg>
                <div className="mt-1 flex justify-between text-[9px] text-slate-500"><span>Payments</span><span>Transfers</span><span>Wallet activity</span></div>
              </div>
              <div className="mt-4 grid grid-cols-3 divide-x divide-sky-100/10">
                <div className="pr-3"><p className="text-[9px] text-slate-500">PAYMENTS</p><p className="mt-1 text-xs font-semibold text-slate-200">Simple & fast</p></div>
                <div className="px-3"><p className="text-[9px] text-slate-500">TRANSFERS</p><p className="mt-1 text-xs font-semibold text-slate-200">Move with ease</p></div>
                <div className="pl-3"><p className="text-[9px] text-slate-500">WALLET</p><p className="mt-1 text-xs font-semibold text-slate-200">Stay in control</p></div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 border-t border-sky-100/10 pt-5 text-[9px] tracking-[0.12em] text-slate-500">
            <span>BLUESEA MOBILE</span><span>YOUR FINANCES. ONE SECURE PLACE.</span>
          </div>
        </section>

        <section className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 md:h-full md:min-h-0 md:overflow-hidden md:dark:bg-[#090f1b]">
          <div className="p-4 md:hidden"><Logo size="sm" /></div>
          <div className="flex flex-1 items-center justify-center p-3 sm:p-4 md:min-h-0 md:overflow-hidden md:px-6 md:py-2 lg:px-9">
            <div className="w-full max-w-[440px] md:max-h-full md:overflow-visible md:py-0">
            {/* Tabs */}
            <div className="mb-2 flex rounded-full bg-white p-1 shadow-sm dark:bg-slate-800 md:mb-2 md:bg-slate-800/80 md:shadow-none">
              <button
                onClick={() => { setMode('login'); setFormError(''); }}
                className={cn(
                  'flex-1 rounded-full py-2 text-center text-sm font-semibold transition-all',
                  mode === 'login'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                Log in
              </button>
              <button
                onClick={() => { setMode('signup'); setFormError(''); }}
                className={cn(
                  'flex-1 rounded-full py-2 text-center text-sm font-semibold transition-all',
                  mode === 'signup'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                Sign up
              </button>
            </div>

            {/* Form Card */}
            <div className="rounded-[26px] border border-slate-200/80 bg-white p-3.5 shadow-[0_18px_55px_rgba(15,35,60,0.09)] dark:border-slate-700/70 dark:bg-slate-800 sm:p-4 md:rounded-[24px] md:border-slate-700/70 md:bg-slate-900/55 md:p-3 lg:p-3.5">
              <div className="mb-2 text-center md:mb-2">
                <h2 className="mb-1 text-xl font-bold text-slate-800 dark:text-white md:text-2xl md:tracking-tight">
                  {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 md:mt-1 md:text-slate-400">
                  {mode === 'login' ? 'Sign in to continue to BlueSea Mobile' : 'Join thousands of users today'}
                </p>
              </div>

              {/* Google Sign In Button */}
              <div className="flex justify-center w-full">
                {isNativeAndroid() ? (
                  <Button
                    type="button"
                    onClick={handleNativeGoogleLogin}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-sky-500 font-medium text-white shadow-sm hover:bg-sky-600"
                  >
                    <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
                  </Button>
                ) : (
                  <GoogleLogin
                    onSuccess={handleWebGoogleSuccess}
                    onError={() => showToast('Google Sign-In could not be completed. Please try again.')}
                    type="standard"
                    size="large"
                    theme="filled_blue"
                    text={mode === 'login' ? 'signin_with' : 'signup_with'}
                    shape="pill"
                    width={380}
                    logo_alignment="left"
                  />
                )}
              </div>

              {/* Divider */}
              <div className="relative my-2 md:my-1.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-slate-800 text-slate-400">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2 md:space-y-1.5" noValidate>
                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={mode === 'signup' ? 'yourname@gmail.com' : 'Enter your email'}
                      value={email}
                      maxLength={254}
                      autoComplete="email"
                      onChange={(e) => { setEmail(e.target.value.slice(0, 254)); setFormError(''); }}
                      className="h-10 pl-10 text-sm md:h-9"
                      required
                    />
                  </div>
                </div>

                {/* Country code and phone number (Signup only) */}
                {mode === 'signup' && (
                  <div className="grid grid-cols-[minmax(86px,0.34fr)_minmax(0,1fr)] gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="countryCode" className="text-xs font-semibold">Code</Label>
                      <div id="countryCode" className="flex h-10 items-center justify-center rounded-md border border-input bg-slate-50 px-3 text-sm font-medium text-slate-600 dark:bg-slate-900 md:h-9">
                        <span className="mr-1.5" aria-hidden="true">🇳🇬</span> +234
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="803 123 4567"
                          value={phone.startsWith('0') ? phone.slice(1) : phone}
                          onChange={(e) => setPhone(normalizeNigerianPhone(e.target.value))}
                          className="h-10 pl-10 text-sm md:h-9"
                          maxLength={10}
                          inputMode="numeric"
                          autoComplete="tel-national"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* First Name & Surname (Signup only) */}
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="firstName" className="text-xs font-semibold">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="firstName"
                          placeholder="e.g. John"
                          value={firstName}
                          maxLength={40}
                          autoComplete="given-name"
                          onChange={(e) => setFirstName(e.target.value.replace(/[^\p{L}\s'-]/gu, '').slice(0, 40))}
                          className="h-10 pl-10 text-sm md:h-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="surname" className="text-xs font-semibold">Surname</Label>
                      <Input
                        id="surname"
                        placeholder="Your surname"
                        value={surname}
                        maxLength={40}
                        autoComplete="family-name"
                        onChange={(e) => setSurname(e.target.value.replace(/[^\p{L}\s'-]/gu, '').slice(0, 40))}
                        className="h-10 text-sm md:h-9"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Referral Code (Signup only) */}
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <Label htmlFor="referralCode" className="text-xs font-semibold">Referral Code</Label>
                    <div className="relative">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="referralCode"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="h-10 pl-10 text-sm md:h-9"
                      />
                    </div>
                  </div>
                )}

                {/* Password fields: side-by-side on signup, full-width on login */}
                <div className={mode === 'signup' ? 'grid grid-cols-2 gap-3' : 'block'}>
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
                        className="h-10 pl-10 pr-9 text-sm md:h-9 md:pl-9"
                        required
                        minLength={mode === 'signup' ? 8 : undefined}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === 'signup' && <p className="text-[9px] leading-tight text-slate-400">8+ characters, with a letter and a number.</p>}
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setFormError(''); }}
                          className="h-10 pl-10 pr-9 text-sm md:h-9 md:pl-9"
                          required
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remember Me / Terms */}
                {mode === 'login' ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-sky-500 hover:text-sky-600 font-medium"
                      onClick={() => setForgotPasswordVisibility(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      required
                    />
                    <Label htmlFor="terms" className="cursor-pointer text-xs font-normal leading-5">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/legal/terms')}
                        className="text-sky-500 hover:underline font-medium"
                      >
                        Terms & Conditions
                      </button>
                    </Label>
                  </div>
                )}

                {formError && (
                  <div role="alert" aria-live="polite" className="rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-3 py-2 text-xs leading-relaxed text-rose-600 dark:text-rose-300">
                    {formError}
                  </div>
                )}
                {mode === 'login' && failedLoginAttempts >= 5 && (
                  <div role="status" className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-200">
                    We noticed {failedLoginAttempts} unsuccessful sign-in attempts. Check your details before trying again. If you do not remember your password, use “Forgot password?”.
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="h-10 w-full rounded-xl bg-sky-500 font-semibold hover:bg-sky-600 md:h-9"
                  disabled={loading}
                >
                  {mode === 'login' ? 'Log in' : 'Sign up'}
                </Button>
              </form>
            </div>
            </div>
          </div>
        </section>
      </div>
      <ToastComponent />
      <LoaderComponent />
      <ForgotPasswordComponent />
      <AuthComponent />
    </div>
  );
}