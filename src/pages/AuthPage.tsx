import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo, Toast, AuthEmailModal, Loader, AuthLoader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Mail, User, Phone, Ticket, ShieldCheck, ArrowUpRight, WalletCards, Sparkles } from 'lucide-react';
import { postRequest, ENDPOINTS, setCookie } from '@/types';
import { hasSessionToken } from '@/lib/session';
import { ForgotPasswordModal } from '@/components/ui-custom/AuthModal';
import { GoogleLogin } from '@react-oauth/google';
import { isNativeAndroid, performNativeGoogleSignIn } from '@/lib/nativeGoogleAuth';

type AuthMode = 'login' | 'signup';

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
      if (idToken) {
        await googleLogin({ credential: idToken });
      }
    } catch (error: Error | unknown) {
      console.error('Native Google login error:', error);
      const msg = (error instanceof Error) ? error.message : '';
      if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('dismiss')) {
        showToast(msg || 'Google Sign-In failed');
      }
    } finally {
      hideLoader();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader();

    if (mode === 'login') {
      const response = await login({ email, password, rememberMe });
      if (response && typeof response === 'object' && 'email' in response) {
        navigate('/dashboard');
      } else if (response) {
        showToast(response);
      }
    } else {
      if (password !== confirmPassword) {
        showToast('Passwords do not match');
        hideLoader();
        return;
      } else {
        const response = await signup({ email, phone, firstName, surname, password, confirmPassword, agreeToTerms });

        if (response.state) {
          showToast(response.message);
          setComponentVisibilty(true);
        } else if (response?.errors?.email?.[0] === 'Email already exists.') {
          const otpResponse = await postRequest(ENDPOINTS.sendOtp, { email: email });
          console.log(otpResponse);
          showToast(otpResponse.message);
          setComponentVisibilty(true);
        } else {
          showToast(response.message);
        }
        navigate('/login');
      }
    }
    hideLoader();
  };

  // If already authenticated or redirecting to mobile app view, render loader immediately
  if (hasSessionToken() || isNative) {
    return <AuthLoader />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fb] font-sans text-slate-900 dark:bg-[#071321] dark:text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.04fr)_minmax(430px,0.96fr)]">
        {/* Brand and product introduction */}
        <aside className="relative isolate overflow-hidden bg-[#082b49] px-5 pb-8 pt-6 text-white sm:px-8 sm:pt-8 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-12 lg:py-10 xl:px-16">
          <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 -left-24 -z-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:44px_44px]" />

          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-white px-3 py-2 shadow-lg shadow-slate-950/10">
              <Logo size="sm" />
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-2 text-xs font-medium text-sky-100 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
              Your everyday financial companion
            </div>
          </div>

          <div className="mx-auto mt-10 w-full max-w-2xl lg:mx-0 lg:mt-0 lg:py-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-sky-200/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200 sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" /> Banking made simpler
            </div>
            <h1 className="max-w-xl text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl xl:text-[3.45rem]">
              Your money. Your plans. <span className="text-sky-300">One connected experience.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Welcome to a simpler way to manage your everyday financial activities. Sign in to pick up where you left off, or create an account to get started.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-2 gap-3 sm:mt-10 sm:gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm sm:p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/15 text-sky-200">
                  <WalletCards className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-white">Manage with ease</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Keep your financial activities within reach.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm sm:p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-white">A secure experience</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Access your account through your secure sign-in.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-slate-400 lg:mt-0">
            <span>BlueSea Mobile</span>
            <span className="inline-flex items-center gap-1.5">Made for everyday life <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
        </aside>

        {/* Authentication panel */}
        <main className="flex min-w-0 items-start justify-center px-4 py-8 sm:px-8 sm:py-10 lg:min-h-screen lg:items-center lg:px-10 lg:py-12 xl:px-14">
          <div className="w-full max-w-[480px]">
            <div className="mb-7 lg:mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
                {mode === 'login' ? 'Welcome back' : 'Get started with BlueSea'}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {mode === 'login' ? 'Enter your details below to continue to BlueSea Mobile.' : 'A few details are all you need to get started.'}
              </p>
            </div>

            {/* Login / signup switch */}
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setMode('login')}
                aria-pressed={mode === 'login'}
                className={cn(
                  'min-h-11 rounded-lg px-4 text-sm font-semibold transition-all duration-200',
                  mode === 'login'
                    ? 'bg-[#087fbd] text-white shadow-md shadow-sky-900/15'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
                )}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                aria-pressed={mode === 'signup'}
                className={cn(
                  'min-h-11 rounded-lg px-4 text-sm font-semibold transition-all duration-200',
                  mode === 'signup'
                    ? 'bg-[#087fbd] text-white shadow-md shadow-sky-900/15'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
                )}
              >
                Create account
              </button>
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_55px_-28px_rgba(15,43,70,0.28)] sm:p-7 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/20">
              {/* Google sign-in: preserve the existing web and native authentication paths */}
              <div className="w-full min-w-0">
                {isNativeAndroid() ? (
                  <Button
                    type="button"
                    onClick={handleNativeGoogleLogin}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-700 dark:text-white dark:ring-slate-600 dark:hover:bg-slate-600"
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
                  </Button>
                ) : (
                  <div className="flex min-h-11 w-full justify-center overflow-hidden [&>div]:!w-full [&_iframe]:!max-w-full">
                    <GoogleLogin
                      onSuccess={googleLogin}
                      onError={() => { console.log('Google Login error'); }}
                      type="standard"
                      size="large"
                      theme="outline"
                      text={mode === 'login' ? 'signin_with' : 'signup_with'}
                      shape="rectangular"
                      width="100%"
                      logo_alignment="left"
                    />
                  </div>
                )}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
                <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider">
                  <span className="bg-white px-3 text-slate-400 dark:bg-slate-800">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-lg border-slate-200 bg-slate-50/70 pl-10 text-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-700/60"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0803 123 4567 or +2348031234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12 rounded-lg border-slate-200 bg-slate-50/70 pl-10 text-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-700/60"
                        maxLength={11}
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0 space-y-1.5">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 dark:text-slate-200">First name</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="firstName"
                          placeholder="e.g. John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-12 rounded-lg border-slate-200 bg-slate-50/70 pl-10 text-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-700/60"
                          autoComplete="given-name"
                          required
                        />
                      </div>
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <Label htmlFor="surname" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Surname</Label>
                      <Input
                        id="surname"
                        placeholder="Your surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className="h-12 rounded-lg border-slate-200 bg-slate-50/70 text-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-700/60"
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="referralCode" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Referral code <span className="font-normal text-slate-400">(optional)</span></Label>
                    <div className="relative">
                      <Ticket className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="referralCode"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="h-12 rounded-lg border-slate-200 bg-slate-50/70 pl-10 text-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-700/60"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-lg border-slate-200 bg-slate-50/70 pl-10 pr-11 text-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-700/60"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      required
                      minLength={mode === 'signup' ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mode === 'signup' && <p className="text-xs text-slate-400">Use at least 8 characters, including a letter and a number.</p>}
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Enter your password again"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 rounded-lg border-slate-200 bg-slate-50/70 pl-10 pr-11 text-sm focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-700/60"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                      <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-slate-600 dark:text-slate-300">Remember me</Label>
                    </div>
                    <button type="button" className="text-sm font-semibold text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400" onClick={() => setForgotPasswordVisibility(true)}>
                      Forgot password?
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 pt-1">
                    <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)} required />
                    <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-5 text-slate-600 dark:text-slate-300">
                      I agree to the{' '}
                      <button type="button" onClick={() => navigate('/legal/terms')} className="font-semibold text-sky-600 hover:underline dark:text-sky-400">Terms &amp; Conditions</button>
                    </Label>
                  </div>
                )}

                <Button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-lg bg-[#087fbd] text-sm font-semibold shadow-lg shadow-sky-900/15 transition-all hover:bg-[#066da4] hover:shadow-sky-900/20"
                  disabled={loading}
                >
                  {mode === 'login' ? 'Sign in to BlueSea' : 'Create my account'}
                </Button>
              </form>
            </section>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to use BlueSea Mobile responsibly. Your account security matters to us.
            </p>
          </div>
        </main>
      </div>
      <ToastComponent />
      <LoaderComponent />
      <ForgotPasswordComponent />
      <AuthComponent />
    </div>
  );
}