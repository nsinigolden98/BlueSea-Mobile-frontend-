import { useState, useCallback} from 'react';
import { ENDPOINTS, postRequest } from '@/types';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui-custom'
import  './PinModal.css'

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
}

export function PinModal() {
  const [modalData, setModalData] = useState<{ visible: boolean }>({
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
          response = await postRequest(ENDPOINTS.auto_topup_create, value);
        } else if (type === 'auto-topup-reactivate') {
          const payload = value as { id: number; transaction_pin: string };
          response = await postRequest(ENDPOINTS.auto_topup_reactivate(payload.id.toString()), { transaction_pin: payload.transaction_pin });
        } else if (type === 'group-airtime') {
          response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-data') {
          response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-gotv') {
          response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-dstv') {
          response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-startimes') {
          response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-showmax') {
          response = await postRequest(ENDPOINTS.create_group, value);
        } else if (type === 'group-lightbill') {
          response = await postRequest(ENDPOINTS.create_group, value);
        }
    return response

  };
 
    



  const PinComponent = ({type, value}: PinComponentProps) => {
    const [pin, setPin] = useState('');
    
    const makeTransaction = async () => {
      showLoader();
      
      const response = await completeTransaction(type, { ...value, transaction_pin: pin });
      hidePinModal();
      hideLoader();
      setMessage(response);
    }
      
    
      if (!modalData.visible) return null

    return (
        
      <div>
      <div id="pin-creation-step" className="form-card active-step  dark:bg-slate-600 daek:text-white">
            <h2 className='dark:text-white'> Enter PIN</h2>

            <div id="create-pin-form">
                <div className="input-group">
                    
            <Input  className='password' type="password" id="pin" placeholder="••••" maxLength={4} inputMode="numeric" value={pin} onChange={(e)=> setPin(e.target.value)}
            />
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
