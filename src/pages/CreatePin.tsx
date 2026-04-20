import { useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Toast, Loader } from '@/components/ui-custom';
import { ENDPOINTS, postRequest } from '@/types';


export function CreatePin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ToastComponent, showToast } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();
  const [pins, setPins] = useState({
    current:['', '','',''],
    new: ['', '', '', ''],
    confirm: ['', '', '', ''],
  });
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'otp' | 'new_pin'>('otp');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [verificationToken, setVerificationToken] = useState('');
  const [resetNewPin, setResetNewPin] = useState(['', '', '', '']);
  const [resetConfirmPin, setResetConfirmPin] = useState(['', '', '', '']);
  
  
  const currentPin = useRef<HTMLInputElement>(null);
  const newPin = useRef<HTMLInputElement>(null);
  const confirmPin = useRef<HTMLInputElement>(null);

  
  const handlePinChange = (
    type: 'current' | 'new' | 'confirm',
    index: number,
    value: string
  ) => {
    if (value.length > 1) return;
    
    const newPins = { ...pins };
    newPins[type][index] = value;
    setPins(newPins);

    if (value.length === 1 && index < 3) {
      const input = document.getElementById(`${type}${index + 1}`) as HTMLInputElement;
      if (input) {
        input.focus();
      };
    };
  };

  const handleKeyDown = (
    type: 'current' | 'new' | 'confirm',
    index: number,
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Backspace' && !pins[type][index] && index > 0) {
      const newPins = { ...pins };
      newPins[type][index] = '';
      setPins(newPins);
       const input = document.getElementById(`${type}${index - 1}`) as HTMLInputElement
      if (input) {
        input.focus();
      };
    };
  };

  const handleCreatePin = async() => {
    const newPin = pins.new.join('');
    const confirmPin = pins.confirm.join('');
    const currentPin = pins.current.join('');

    showLoader()
    if (user?.pin_is_set) {
      const payload = {
        old_pin: currentPin,
        new_pin: newPin,
        confirm_pin: confirmPin
      };
      const response = await postRequest(ENDPOINTS.pin_reset, payload);
      if (response.state) {
        
        showToast(response.message);
        setTimeout(()=>{    navigate(-1);}, 3000)
        
      } else {
        showToast(response.message);  
      };
      
      
    }
    else {
      const payload = {
        pin: newPin,
        confirm_pin: confirmPin
      };
      const response = await postRequest(ENDPOINTS.pin_set, payload);
      if (response.state) {
        
        showToast(response.message);
        setTimeout(() => {
          window.location.reload();
          navigate(-1);
        }, 3000)

      } else {
        showToast(response.message);  
      };
      
    };
    
    hideLoader();
  };

  const handleForgotPin = async () => {
    showLoader();
    const response = await postRequest(ENDPOINTS.pin_reset_request, {});
    hideLoader();
    
    if (response.state) {
      setShowForgotModal(true);
      setForgotStep('otp');
    } else {
      showToast(response.message || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    
    if (value.length === 1 && index < 5) {
      const input = document.getElementById(`otp${index + 1}`) as HTMLInputElement;
      if (input) input.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent)=>{
     if (e.key === 'Backspace' && otpValues[index] && index > 0) {
       const newPin = { ...otpValues};
           newPin[index] = '';
       setResetConfirmPin(newPin);
            const input = document.getElementById(`otp${index - 1}`) as HTMLInputElement
           if (input) {
             input.focus();
           };
         };
  }

  const handleVerifyOtp = async () => {
    showLoader();
    const otp = otpValues.join('');
    const response = await postRequest(ENDPOINTS.pin_reset_verify, { otp });
    hideLoader();
    
    if (response.state) {
      setVerificationToken(response.verification_token);
      setForgotStep('new_pin');
    } else {
      showToast(response.message || 'Invalid OTP');
    }
  };

  const handleResetNewPinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...resetNewPin];
    newPin[index] = value;
    setResetNewPin(newPin);
    
    if (value.length === 1 && index < 3) {
      const input = document.getElementById(`resetNew${index + 1}`) as HTMLInputElement;
      if (input) input.focus();
    }
  };

    const handleResetNewPinKeyDown = (index: number, e: React.KeyboardEvent)=>{
     if (e.key === 'Backspace' && resetNewPin[index] && index > 0) {
       const newPin = { ...resetNewPin};
           newPin[index] = '';
       setResetConfirmPin(newPin);
            const input = document.getElementById(`resetNew${index - 1}`) as HTMLInputElement
           if (input) {
             input.focus();
           };
         };
  }

  const handleResetConfirmPinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...resetConfirmPin];
    newPin[index] = value;
    setResetConfirmPin(newPin);
    
    if (value.length === 1 && index < 3) {
      const input = document.getElementById(`resetConfirm${index + 1}`) as HTMLInputElement;
      if (input) input.focus();
    }
  };

  const handleResetConfirmPinKeyDown = (index: number, e: React.KeyboardEvent)=>{
     if (e.key === 'Backspace' && resetConfirmPin[index] && index > 0) {
       const newPin = { ...resetConfirmPin};
           newPin[index] = '';
       setResetConfirmPin(newPin);
            const input = document.getElementById(`resetConfirm${index - 1}`) as HTMLInputElement
           if (input) {
             input.focus();
           };
         };
  }

  const handleConfirmResetPin = async () => {
    showLoader();
    const newPin = resetNewPin.join('');
    const confirmPin = resetConfirmPin.join('');
    
    const response = await postRequest(ENDPOINTS.pin_reset_confirm, {
      verification_token: verificationToken,
      new_pin: newPin,
      confirm_pin: confirmPin
    });
    hideLoader();
    
    if (response.state) {
      showToast('PIN reset successfully');
      setShowForgotModal(false);
      navigate(-1);
    } else {
      showToast(response.message || 'Failed to reset PIN');
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('otp');
    setOtpValues(['', '', '', '', '', '']);
    setResetNewPin(['', '', '', '']);
    setResetConfirmPin(['', '', '', '']);
    setVerificationToken('');
  };


  return (
    <div>
      {user?.pin_is_set ? (
        // Change Pin
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Create PIN</h1>
      </div>

      <main className="p-4 md:p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Create Your 4-Digit PIN
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              This PIN will be used for future secure transactions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
            {/* <PinInput type="current" label="Enter PIN" />
            <PinInput type="new" label="Create PIN" />
            <PinInput type="confirm" label="Confirm PIN" /> */}
            <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Enter PIn
      </label>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={currentPin}
            type="password"
            id={`current${index}`}
            inputMode="numeric"
            maxLength={1}
            value={pins['current'][index]}
            onChange={(e) => handlePinChange('current', index, e.target.value)}
            onKeyDown={(e) => handleKeyDown('current', index, e)}
            className={cn(
              'w-14 h-14 text-center text-2xl font-bold rounded-xl',
              'border-2 border-slate-200 dark:border-slate-700',
              'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
              'outline-none transition-all',
              'current'
            )}
          />
        ))}
      </div>
                </div>
                <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        New Pin
      </label>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={newPin}
            type="password"
              id={`new${index}`}
            inputMode="numeric"
            maxLength={1}
            value={pins.new[index]}
            onChange={(e) => handlePinChange('new', index, e.target.value)}
            onKeyDown={(e) => handleKeyDown('new', index, e)}
            className={cn(
              'w-14 h-14 text-center text-2xl font-bold rounded-xl',
              'border-2 border-slate-200 dark:border-slate-700',
              'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
              'outline-none transition-all'
            )}
          />
        ))}
      </div>
                </div>
                
                <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Confirm Pin
      </label>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={confirmPin}
            type="password"
              id={`confirm${index}`}
            inputMode="numeric"
            maxLength={1}
            value={pins.confirm[index]}
            onChange={(e) => handlePinChange('confirm', index, e.target.value)}
            onKeyDown={(e) => handleKeyDown('confirm', index, e)}
            className={cn(
              'w-14 h-14 text-center text-2xl font-bold rounded-xl',
              'border-2 border-slate-200 dark:border-slate-700',
              'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
              'outline-none transition-all'
            )}
          />
        ))}
      </div>
    </div>
                

            <Button 
              onClick={handleCreatePin}
              className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6"
            >
              Create Pin
            </Button>
            
            <button 
              onClick={handleForgotPin}
              className="w-full text-center text-sm text-slate-500 hover:text-sky-500 transition-colors py-2"
            >
              Forgot PIN ?
            </button>
          </div>
        </div>
      </main>
    </div>
      ) : (
          // Create Pin
          
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Create PIN</h1>
      </div>

      <main className="p-4 md:p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Create Your 4-Digit PIN
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              This PIN will be used for future secure transactions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">

                  
                      <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        New Pin
      </label>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={newPin}
            type="password"
              id={`new${index}`}
            inputMode="numeric"
            maxLength={1}
            value={pins.new[index]}
            onChange={(e) => handlePinChange('new', index, e.target.value)}
            onKeyDown={(e) => handleKeyDown('new', index, e)}
            className={cn(
              'w-14 h-14 text-center text-2xl font-bold rounded-xl',
              'border-2 border-slate-200 dark:border-slate-700',
              'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
              'outline-none transition-all'
            )}
          />
        ))}
      </div>
                </div>
                
                <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Confirm Pin
      </label>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={confirmPin}
            type="password"
            inputMode="numeric"
              id={`confirm${index}`}
            maxLength={1}
            value={pins.confirm[index]}
            onChange={(e) => handlePinChange('confirm', index, e.target.value)}
            onKeyDown={(e) => handleKeyDown('confirm', index, e)}
            className={cn(
              'w-14 h-14 text-center text-2xl font-bold rounded-xl',
              'border-2 border-slate-200 dark:border-slate-700',
              'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
              'outline-none transition-all'
            )}
          />
        ))}
      </div>
    </div>

            <Button 
              onClick={handleCreatePin}
              className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6"
            >
              Create Pin
            </Button>
          </div>
        </div>
      </main>
    </div>
      )

      }
      <LoaderComponent />
      <ToastComponent />
      
      {/* Forgot PIN Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Reset PIN
              </h3>
              <button 
                onClick={closeForgotModal}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotStep === 'otp' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enter the 6-digit OTP sent to your email address.
                </p>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="password"
                      id={`otp${index}`}
                      inputMode="numeric"
                      maxLength={1}
                      value={otpValues[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                       onKeyDown={(e)=> handleOtpKeyDown(index,e)}
                      className={cn(
                        'w-10 h-12 text-center text-xl font-bold rounded-lg',
                        'border-2 border-slate-200 dark:border-slate-700',
                        'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
                        'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
                        'outline-none transition-all'
                      )}
                    />
                  ))}
                </div>
                <Button 
                  onClick={handleVerifyOtp}
                  className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6"
                >
                  Verify OTP
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enter your new PIN.
                </p>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    New PIN
                  </label>
                  <div className="flex gap-3 justify-center">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        type="password"
                        id={`resetNew${index}`}
                        inputMode="numeric"
                        maxLength={1}
                        value={resetNewPin[index]}
                        onChange={(e) => handleResetNewPinChange(index, e.target.value)}
                          onKeyDown={(e)=> handleResetNewPinKeyDown(index,e)}
                        className={cn(
                          'w-14 h-14 text-center text-2xl font-bold rounded-xl',
                          'border-2 border-slate-200 dark:border-slate-700',
                          'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
                          'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
                          'outline-none transition-all'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm PIN
                  </label>
                  <div className="flex gap-3 justify-center">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        type="password"
                        id={`resetConfirm${index}`}
                        inputMode="numeric"
                        maxLength={1}
                        value={resetConfirmPin[index]}
                        onChange={(e) => handleResetConfirmPinChange(index, e.target.value)}
                        onKeyDown={(e)=> handleResetConfirmPinKeyDown(index,e)}
                        className={cn(
                          'w-14 h-14 text-center text-2xl font-bold rounded-xl',
                          'border-2 border-slate-200 dark:border-slate-700',
                          'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
                          'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
                          'outline-none transition-all'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleConfirmResetPin}
                  className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6"
                >
                  Reset PIN
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    
  );
}
