import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo,Toast, AuthEmailModal, Loader,AuthLoader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';
import { TOKEN, postRequest,ENDPOINTS } from '@/types'
import { ForgotPasswordModal } from '@/components/ui-custom/AuthModal';
import {GoogleLogin} from '@react-oauth/google';


type AuthMode = 'login' | 'signup';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, googleLogin, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast, ToastComponent } = Toast()
  const { showLoader, hideLoader, LoaderComponent } = Loader()
  const { AuthComponent, setComponentVisibilty } = AuthEmailModal()
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader()
    
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
      }
      else {
       
        const response = await signup({ email, phone, firstName, surname, password, confirmPassword, agreeToTerms });
        
        if (response.state) {
          showToast(response.message);
          // setModalVisiblity(true);
          setComponentVisibilty(true);

        } else if (response.errors.email[0] === "Email already exists.") {
          const otpResponse = await postRequest(ENDPOINTS.sendOtp, { email: email });
          console.log(otpResponse);
          showToast(otpResponse.message)
          setComponentVisibilty(true);
        }
        else {
          showToast(response.message)
        }
        navigate('/login');
      }
    }
    hideLoader()
  };
 
  
  return (
    <div>
      {TOKEN ?(
        <div> 
            <AuthLoader/>
      </div>
      ): (
        <div >
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col" >
      {/* Header */}
      <div className="p-4 md:p-6">
        <Logo size="sm" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex mb-6 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setMode('login')}
              className={cn(
                'flex-1 py-2.5 text-center font-medium transition-all rounded-full',
                mode === 'login' 
                  ? 'bg-sky-500 text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
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
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              )}
            >
              Sign up
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {mode === 'login' ? 'Sign in to continue to BlueSea Mobile' : 'Join thousands of users today'}
              </p>
            </div>

            {/* Google Sign In Button */}
           

            <GoogleLogin 
            onSuccess = {googleLogin}
            onError={()=>{console.log("Google Login error")}}
            type="standard"
            size="large"
            theme="filled_blue"
            text= {mode === 'login' ? "signin_with" : "signup_with"}
            shape="pill"
            width={380}
            logo_alignment="left"
            
            />
           

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
                      value= {phone}
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

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {mode === 'signup' ? 'Password' : 'Password'}
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
                  <button type="button" className="text-sm text-sky-500 hover:text-sky-600 font-medium" onClick={()=> setForgotPasswordVisibility(true)}>
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
                    I agree to the <a href="#" className="text-sky-500 hover:underline font-medium">Terms & Policy</a>
                  </Label>
                </div>
              )}
           
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 h-11 font-medium"
                 disabled={loading}
                >
                { mode === 'login' ? 'Log in' : 'Sign up'}
              </Button>
            </form>
          </div>
        </div>
      </div>
      </div>
                <ToastComponent/>
            <LoaderComponent />
            <ForgotPasswordComponent />
            <AuthComponent />
      </div>
    )}
      </div>
  );
}
