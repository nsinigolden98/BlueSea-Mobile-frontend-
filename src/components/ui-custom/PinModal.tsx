import { useState, useCallback, useRef} from 'react';
import { ENDPOINTS, postRequest } from '@/types';
import { Loader } from '@/components/ui-custom'
import './PinModal.css'
import { cn } from '@/lib/utils';

interface PinComponentProps {
  type: string;
  value: object;
}

interface Message {
  success?: boolean;
  code?: string;
  response_description?: string;
  error?: string;
  message?: string;
  state?: boolean;
  is_active?: boolean;
}

export function PinModal() {
  const [modalData, setModalData] = useState<{ visible: boolean; type?: string; value?: object }>({
    visible: false,
  });
  const { showLoader, hideLoader, LoaderComponent } = Loader();
  const [message, setMessage] = useState<Message>();
  
  
  
  const showPinModal = useCallback((data?: { type: string; value: object }) => {
    if (data) {
      setModalData({ visible: true, ...data });
    } else {
      setModalData({ visible: true });
    }
  }, []);
  const hidePinModal = useCallback(() => {
    
    setModalData({ visible: false });
    
  }, []);

  

  async function completeTransaction(type: string, value: object) {
    let response = undefined;
    
      if (type === 'airtime') {
        response = await postRequest(ENDPOINTS.buy_airtime, value)  
     }   else if (type === 'light') {
         response = await postRequest(ENDPOINTS.electricity, value);
           
       } else if (type === 'data-MTN') {
       response = await postRequest(ENDPOINTS.buy_mtn, value);
         
       } else if (type === 'data-Glo') {
       response = await postRequest(ENDPOINTS.buy_glo, value);
      
       } else if (type === 'data-Airtel') {
         response = await postRequest(ENDPOINTS.buy_airtel, value);
         
       } else if (type === 'data-9mobile') {
         response = await postRequest(ENDPOINTS.buy_etisalat, value);   
       } else if (type === 'marketplace') {
         const payload = value as { event_id: string; ticket_type: string; quantity: number; transaction_pin: string };
         response = await postRequest(ENDPOINTS.marketplace_purchase(payload.event_id), {
           ticket_type: payload.ticket_type,
           quantity: payload.quantity,
           transaction_pin: payload.transaction_pin,
         });
       } else if (type === 'dstv') {
         response = await postRequest(ENDPOINTS.dstv, value);
       } else if (type === 'gotv') {
         response = await postRequest(ENDPOINTS.gotv, value);
       } else if (type === 'startimes') {
         response = await postRequest(ENDPOINTS.startimes, value);
       } else if (type === 'showmax') {
         response = await postRequest(ENDPOINTS.showmax, value);
       } else if (type === 'waec-registration') {
         response = await postRequest(ENDPOINTS.waec_registration, value);
       } else if (type === 'waec-result') {
         response = await postRequest(ENDPOINTS.waec_result, value);
        } else if (type === 'jamb') {
          response = await postRequest(ENDPOINTS.jamb_registration, value);
        } else if (type === 'auto-topup') {
          response = await postRequest(ENDPOINTS.auto_topup_create, value)
          ;
        } else if (type === 'auto-topup-reactivate') {
          const payload = value as { id: number; transaction_pin: string };
          response = await postRequest(ENDPOINTS.auto_topup_reactivate(payload.id.toString()), { transaction_pin: payload.transaction_pin });
      } else if (type === 'group-airtime') {
        
          response = await postRequest(ENDPOINTS.create_group,value);
          
        } else if (type === 'group-data') {
          response = await postRequest(ENDPOINTS.create_group,value);
        } else if (type === 'group-gotv') {
        response = await postRequest(ENDPOINTS.create_group,value);
        } else if (type === 'group-dstv') {
        response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-startimes') {
         
        response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-showmax') {
          response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-lightbill') {
        response = await postRequest(ENDPOINTS.create_group, value);
        
        } else if (type === 'add-scanner') {
          response = await postRequest(ENDPOINTS.marketplace_add_scanner((value as { event_id: string }).event_id), {
            user_email: (value as { user_email: string }).user_email,
            transaction_pin: (value as { transaction_pin: string }).transaction_pin,
          });
        }
    console.log(response) 
    return response

  };
 
    



  const PinComponent = ({type, value}: PinComponentProps) => {
    const [pin, setPin] = useState({
          user_pin:['', '','',''],
        });
        
      const userPin = useRef<HTMLInputElement>(null);
     const handlePinChange = (
         type: 'user_pin',
         index: number,
         value: string
       ) => {
         if (value.length > 1) return;
         
         const newPins = { ...pin};
         newPins[type][index] = value;
         setPin(newPins);
     
         if (value.length === 1 && index < 3) {
           const input = document.getElementById(`${type}${index + 1}`) as HTMLInputElement;
           if (input) {
             input.focus();
           };
         };
       };
     
       const handleKeyDown = (
         type: 'user_pin',
         index: number,
         e: React.KeyboardEvent
       ) => {
         if (e.key === 'Backspace' && !pin[type][index] && index > 0) {
           const newPins = { ...pin};
           newPins[type][index] = '';
           setPin(newPins);
            const input = document.getElementById(`${type}${index - 1}`) as HTMLInputElement
           if (input) {
             input.focus();
           };
         };
       };
     
    
    const makeTransaction = async () => {
      showLoader();
      
      const response = await completeTransaction(type, { ...value, transaction_pin: pin.user_pin.join('') });
      hidePinModal();
      hideLoader();
      setMessage(response);
    }
      
    
      if (!modalData.visible) return null

    return (
        
      <div>
      <div id="pin-creation-step" className="form-card active-step  dark:bg-slate-600 daek:text-white">
            <h2 className='dark:text-white'> ENTER PIN</h2>

          <div id="create-pin-form">
            
             <div className="flex gap-3 justify-center">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        ref={userPin}
                        type="password"
                        id={`user_pin${index}`}
                        inputMode="numeric"
                        maxLength={1}
                        value={pin['user_pin'][index]}
                        onChange={(e) => handlePinChange('user_pin', index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown('user_pin', index, e)}
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


          <button id='make-payment' className="btn btn-primary"
            onClick={makeTransaction}>CONFIRM </button>
                <button id='cancel-payment'  className="btn  btn-primary" onClick={hidePinModal}>CANCEL </button>
            </div>
            
             
            
            </div>
        <LoaderComponent />
        </div>
    )
  };
  return { showPinModal, hidePinModal, PinComponent, modalData, message};
}
