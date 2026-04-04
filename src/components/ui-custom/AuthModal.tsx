import { useState, useEffect } from 'react';
import { postRequest, ENDPOINTS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import './AuthModal.css';
import {Toast, Loader} from '@/components/ui-custom'
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Eye, EyeOff} from 'lucide-react';

export const ForgotPasswordModal=()=> {
  const [visibility, setForgotPasswordVisibility] = useState<boolean>(false);

  // This is the forgot modal component
  const ForgotPasswordComponent = () => {
    const { showLoader, hideLoader, LoaderComponent } = Loader();
    const { showToast, ToastComponent } = Toast();

    const [emailField, seeEmailField] = useState(true);
    const [ otpField, seeOTPField] = useState(false);
    const [ passwordField, seePasswordField ] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [errorText, setErrorText] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    
    const [count, setCount] = useState(60);
    const [isCounting, setIsCounting] = useState(true);

    const resendOTP = async () => {
      function validateEmail(email: string) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      };
      if (email && validateEmail(email)) {
        showLoader();
        const response = await postRequest(ENDPOINTS.sendOtp_FP, { email: email })
        hideLoader();
        if (response.state) {
    
          seeEmailField(false);
          seeOTPField(true);
          setIsCounting(true);
          setCount(60);
          setErrorText('');
        }
        else {
          setErrorText('No user with the given email.')
          showToast('User not found')
        };
      }
      else {
        setErrorText('A valid email is required')
      }
    };

    const confirmOTP = async () => {
      if (otp.length === 6) {
        const payload = {
          email,
          otp
        };
        showLoader();
        const response = await postRequest(ENDPOINTS.verify_FP, payload);
        hideLoader();

        if (response.state) {
          setResetToken(response.reset_token);
          seePasswordField(true);
          seeOTPField(false);
          setErrorText('');
        } else {
          setErrorText('Incorrect OTP')
        };
      } else {
        setErrorText('Invalid OTP')
      };

    };

    const resetPassword = async () => {
      if (confirmPassword === newPassword) {
        if (newPassword.length >= 8) {
          const payload = {
            token: resetToken,
            new_password: newPassword,
            confirm_password: confirmPassword
          };

          showLoader();
          const response = await postRequest(ENDPOINTS.confirm_FP, payload);
          hideLoader();
          if (response.state) {
            setErrorText('');
            showToast(response.message);
            setTimeout(() => {
              setForgotPasswordVisibility(false);    
            }, 3000)
          } else {
            showToast(response.message)
          }
        } else {
          setErrorText("Password must be more than 8 characters")
        }
      } else {
        setErrorText('New password and confirm password are not the same')
      }
    };

  useEffect(() => {
    let interval = undefined;
    
      if (isCounting && count > 0) {
        interval = setInterval(() => {
          setCount((prev)=> prev - 1)
        }, 1000)
      } else if (count === 0) {
        setIsCounting(false);
        clearInterval(interval);
      }
      
    return ()=> clearInterval(interval)
  }, [count, isCounting]);
  

    
    if (visibility) {

      return (
        <div className='modalBody'>

             <div className="modal_panel dark:bg-slate-600 dark:text-white" id="modal_panel">
            <Button className="modal_close dark:text-white" id="modal_close" aria-label="Close"
              onClick={() => setForgotPasswordVisibility(false)}
            > X </Button>
            <h1 id="modal_title" className="modal_title">Forgot Password</h1>

            { emailField ?( 
            <div>
                

              <p className="small">Enter Your Email Address </p> <br/>
        
            <Input inputMode="email" placeholder="Enter email"  value={email} onChange={(e)=> setEmail(e.target.value)} />
                <p className='error'> {errorText}</p>
               <Button className="bg-sky-500 hover:bg-sky-600 my-3"  onClick={resendOTP}>Request OTP</Button>
            </div>
            ) : (
                <div></div>
            )}
          
            {/* Enter OTP  */}
            {otpField ?(
              <div className="OTP_field" id="OTP_field">
                <p id="reset_text" className="reset_text"></p>
                
                  <Label> OTP sent to {email}</Label> <br />
                <Input  type="text" inputMode="numeric" value={otp} onChange={(e)=> setOTP(e.target.value)} placeholder="Enter OTP" maxLength={6} />
                <p className="error"> {errorText}</p>
                <div className="row modal_actions">
                  <Button  className="bg-sky-500 hover:bg-sky-600 mx-2" onClick={confirmOTP} >Confirm</Button>


                  <Button onClick={()=>{resendOTP()}} className="bg-sky-500 hover:bg-sky-600" disabled={isCounting}>Resend
                    {isCounting ? (
                      <span id="modal_timer_email">({count}s)</span>
                    ) : (
                      <span></span>)} </Button>
                </div>
           
              </div>)
              :(
            <div></div>
              )
            }

            {/* Reset Password */}
            {passwordField ? (
                
               <div className="Reset_password" id="Reset_password">
                <div className="set_password">
                    <p> Enter a new password</p>
              <label htmlFor="reset_password" className="sr_only">Password</label>
              <div className="password_wrapper">
                <Input id="reset_password" name="reset_password" className="input input_password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value) }
                       type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 chars, letters+digit, allowed #$@)"
                       aria-describedby="reset_password_error" required />
               
                         <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
      
              </div>
            </div>

            <div className="confirm_reset">
              <label htmlFor="reset_confirm" className="sr_only">Confirm Password</label>
              <div className="password_wrapper">
                <Input id="reset_confirm" name="reset_confirm" className="input input_password" value= {confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)}
                       type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" aria-describedby="signup_confirm_error" required />
                
                      <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute bg-transparent right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 bg-transparent" /> : <Eye className="w-4 h-4" />}
                  </button>
            
              </div>
                    <p className="error"> {errorText}</p>
            </div>
               <Button onClick={resetPassword} className="bg-sky-500 hover:bg-sky-600 mx-2">Reset</Button>     
            </div>
            ): (
                <div>
                </div>
            )}
            </div>

        
          <ToastComponent />
          <LoaderComponent />
        </div>
      );
    };
  };
 
  return {setForgotPasswordVisibility, ForgotPasswordComponent };
}



export const AuthEmailModal = () => {

  const [visibility, setComponentVisibilty] = useState<boolean>(false);
  
  const AuthComponent = () => {
  const { showLoader, hideLoader, LoaderComponent } = Loader();
  const { showToast, ToastComponent } = Toast();

  
  
    const [count, setCount] = useState(60);
    const [isCounting, setIsCounting] = useState(true);
    const { user } = useAuth();
   
  
    const verifyEmailOTP = async (otp:string) => {
      showLoader()
      const verifyResponse = await postRequest(ENDPOINTS.verifyOtp, { email: user?.email, otp: Number(otp) });
      
      hideLoader()
      if (verifyResponse.state) {
        showToast(verifyResponse.message)
        setTimeout(()=>{ setComponentVisibilty(false)},3000)
       
      }
      else {
        showToast(verifyResponse.message)
      }
    };
  const resendOTP = async () => {
    await postRequest(ENDPOINTS.sendOtp, { email: user?.email }) 
    setIsCounting(true);
    setCount(60);
  };
  useEffect(() => {
    let interval = undefined;
    
      if (isCounting && count > 0) {
        interval = setInterval(() => {
          setCount((prev)=> prev - 1)
        }, 1000)
      } else if (count === 0) {
        setIsCounting(false);
        clearInterval(interval);
      }
      
    return ()=> clearInterval(interval)
  }, [count, isCounting]);
  
     const [otp, setOTP] = useState('');
  
    if (visibility) {
      return (

        <div className='modalBody'>

          <div className="modal_panel dark:bg-slate-600 dark:text-white" id="modal_panel">
            <Button className="modal_close dark:text-white" id="modal_close" aria-label="Close"
              onClick={() => setComponentVisibilty(false)}
            > X </Button>
            <h1 id="modal_title" className="modal_title">Verify Account</h1>
        
            <div className='modal_body'>
              <div className="modal_panel_item email_modal" id="email_modal" data-panel="email" aria-hidden="false">
                <p className="small">We sent a 6-digit code to your email. Enter it below.</p>
                <div className="field">

                  <label htmlFor='otp'className='otp'>Email OTP</label>
            
                  <Input 
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(e) => setOTP(e.target.value)}
                    placeholder="Enter email OTP"
                    value={otp}
                    required
                   />
            
                </div>
                <div className="row modal_actions">

                  <Button id="modal_verify_email" onClick={() => { verifyEmailOTP(otp) }} className="bg-sky-500 hover:bg-sky-600 mx-2">Verify Email OTP</Button>
                  <Button id="modal_resend_email" className="bg-sky-500 hover:bg-sky-600 mx-2"
                    onClick={resendOTP} disabled={isCounting}
                  >Resend
                    {isCounting ? (
                      <span id="modal_timer_email">({count}s)</span>
                    ):(
                    <span></span>
                  )}</Button>
                </div>
              </div>
            </div>
          </div>
          <ToastComponent />
          <LoaderComponent />
        </div>
      );
    }
  }
  return {AuthComponent, setComponentVisibilty}
  };





