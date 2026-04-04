import { useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
  
  
  const currentPin = useRef<(HTMLInputElement)>(null);
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
        setTimeout(()=>{    navigate(-1);}, 3000)

      } else {
        showToast(response.message);  
      };
      
    };
    
    hideLoader();
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
    </div>
    
  );
}
