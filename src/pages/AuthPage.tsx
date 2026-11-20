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
    showLoader();

    try {
      if (mode === 'login') {
        const response = await login({ email, password, rememberMe });
        if (response && typeof response === 'object' && 'email' in response) {
          navigate('/dashboard');
        } else if (response) {
          showToast(response);
        }
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match');
        return;
      }

      const response = await signup({ email, phone, firstName, surname, password, confirmPassword, agreeToTerms });
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
      showToast(error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Authentication failed. Please try again.');
    } finally {
      hideLoader();
    }
  };

  // If already authenticated or redirecting to mobile app view, render loader immediately
  if (hasSessionToken() || isNative) {
    return <AuthLoader />;
  }

  return (
    <div>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 md:dark:bg-[#090f1b] md:grid md:grid-cols-[1.05fr_0.95fr]">
        {/* Desktop brand panel. The existing compact mobile presentation remains below. */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#0b1726] px-14 py-12 text-white md:flex md:flex-col md:justify-between lg:px-20">
          <div className="pointer-events-none absolute -right-40 -bottom-56 h-[620px] w-[620px] rounded-full border border-cyan-300/10" />
          <div className="pointer-events-none absolute -right-24 -bottom-40 h-[480px] w-[480px] rounded-full border border-cyan-300/10" />
          <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-400/10 blur-[100px]" />
          <div className="relative z-10"><Logo size="sm" /></div>
          <div className="relative z-10 max-w-2xl pb-12 lg:pb-20">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-300/75">Clarity in every transaction</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.12] tracking-tight text-white lg:text-6xl">Your money, <span className="text-cyan-300">moving smarter.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">A simpler way to manage payments, transfers and everyday financial services — all in one secure place.</p>
            <div className="mt-12 max-w-md rounded-2xl border border-cyan-200/15 bg-slate-950/35 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between"><span className="text-xs font-medium text-slate-400">BlueSea overview</span><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">Secure access</span></div>
              <svg viewBox="0 0 360 92" className="h-24 w-full" role="img" aria-label="Abstract rising financial activity line">
                <defs><linearGradient id="blueseaAuthLine" x1="0" x2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity=".35"/><stop offset="100%" stopColor="#2dd4bf"/></linearGradient></defs>
                <path d="M0 76 C34 70 43 52 72 58 S119 67 146 43 S194 51 222 30 S267 41 291 18 S330 24 360 4" fill="none" stroke="url(#blueseaAuthLine)" strokeWidth="3" strokeLinecap="round"/>
                <path d="M0 76 C34 70 43 52 72 58 S119 67 146 43 S194 51 222 30 S267 41 291 18 S330 24 360 4 L360 92 L0 92Z" fill="url(#blueseaAuthLine)" opacity=".08"/>
              </svg>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500"><span>Payments</span><span>Transfers</span><span>Wallet</span></div>
            </div>
          </div>
          <p className="relative z-10 text-[10px] tracking-wide text-slate-500">BlueSea Mobile · Secure financial services</p>
        </section>

        <section className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900 md:dark:bg-[#090f1b]">
          <div className="p-4 md:hidden"><Logo size="sm" /></div>
          <div className="flex flex-1 items-center justify-center p-4 md:px-10 md:py-12 lg:px-16">
            <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="flex mb-6 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm md:bg-slate-800/80 md:shadow-none">
              <button
                onClick={() => setMode('login')}
                className={cn(
                  'flex-1 py-2.5 text-center font-medium transition-all rounded-full',
                  mode === 'login'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                Log in
              </button>
              <button
                onClick={() => setMode('signup')}
                className={cn(
                  'flex-1 py-2.5 text-center font-medium transition-all rounded-full',
                  mode === 'signup'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                Sign up
              </button>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:rounded-none md:bg-transparent md:p-0 md:shadow-none">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1 md:text-3xl md:tracking-tight">
                  {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:mt-2 md:text-slate-400">
                  {mode === 'login' ? 'Sign in to continue to BlueSea Mobile' : 'Join thousands of users today'}
                </p>
              </div>

              {/* Google Sign In Button */}
              <div className="flex justify-center w-full">
                {isNativeAndroid() ? (
                  <Button
                    type="button"
                    onClick={handleNativeGoogleLogin}
                    className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-full flex items-center justify-center gap-2 shadow-sm"
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
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-slate-800 text-slate-400">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                {/* Phone (Signup only) */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0803 123 4567 or +2348031234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-11"
                        maxLength={11}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* First Name & Surname (Signup only) */}
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="firstName"
                          placeholder="e.g. John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname" className="text-sm font-medium">Surname</Label>
                      <Input
                        id="surname"
                        placeholder="Your surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Referral Code (Signup only) */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-sm font-medium">Referral Code</Label>
                    <div className="relative">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="referralCode"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      required
                      minLength={mode === 'signup' ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-xs text-slate-400">Min 8 chars, letter + digit</p>
                  )}
                </div>

                {/* Confirm Password (Signup only) */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

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
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      required
                    />
                    <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 h-11 font-medium"
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