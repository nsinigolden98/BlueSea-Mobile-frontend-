import { useState, useCallback,useEffect } from 'react';
import './Toast.css'
import './TransactionModal.css'

export function Toast() {
  const [toastData, setToastData] = useState<{ msg: string; visible: boolean }>({
    msg: '',
    visible: false,
  });

  const showToast = useCallback((msg: string, ms = 10000) => {
    setToastData({ msg, visible: true });
    
    setTimeout(() => {
      setToastData((prev) => ({ ...prev, visible: false }));
    }, ms);
  }, []);

  const ToastComponent = () => {
    if (!toastData.visible) return null;
    return (
      <div className='toast'>
        {toastData.msg}
      </div>
    );
  

  };

  return { showToast, ToastComponent };
}



interface TransactionModalProps {
  isSuccess: boolean | null; // null: processing, true: success, false: failure
  onClose: () => void;
  toastMessage: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isSuccess, onClose,toastMessage }) => {
  const [statusText, setStatusText] = useState("Securing your transaction…");
  const [isDone, setIsDone] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Cycle through messages during processing
  useEffect(() => {
    if (isSuccess !== null) return;

    const messages = [
      "Establishing secure channel…",
      "Confirming network response…",
      "Final settlement in progress…"
    ];
    let i = 0;

    const interval = setInterval(() => {
      i++;
      setStatusText(messages[i % messages.length]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isSuccess]);

  // Handle transition to Result
  useEffect(() => {
    if (isSuccess !== null) {
      const timer = setTimeout(() => {
        setIsDone(true);
        setStatusText(isSuccess ? "Transaction secured" : "Transaction declined");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 400); // Wait for the fade-out animation
    window.location.reload()
  };

  return (
    <div className={`overlay-backdrop ${isExiting ? 'exit' : ''}`}>
      <section className="transaction-layer" role="dialog">
        
        <svg className="flow-bg" viewBox="0 0 600 600" preserveAspectRatio="none">
          <path className="wave" d="M0,360 C160,330 320,390 480,360 L600,360 L600,600 L0,600 Z"/>
        </svg>

        <div className="content">
          <p className="status-text">{statusText}</p>

          <div className="icon-wrapper">
            {/* Ripples only during active processing */}
            {isSuccess === null && (
              <svg className="ripple-svg" viewBox="0 0 300 300">
                <circle className="ripple r1" cx="150" cy="150" r="48" />
                <circle className="ripple r2" cx="150" cy="150" r="48" />
              </svg>
            )}

            {/* Logo container fades out when result icon appears */}
            <div className={`logo-container ${isDone ? 'logo-hidden' : ''}`}>
              <svg viewBox="0 0 100 100" className="logo-svg">
                <circle cx="50" cy="50" r="34" className="logo-outline" />
                <circle cx="50" cy="50" r="34" className="logo-fill" />
              </svg>
            </div>

            {/* Success Check or Failure X */}
            {isDone && (
              <svg className="result-svg" viewBox="0 0 52 52">
                {isSuccess ? (
                  <path className="path success-path" d="M14 27 L22 35 L38 18" />
                ) : (
                  <path className="path failure-path" d="M16 16 L36 36 M36 16 L16 36" />
                )}
              </svg>
            )}
          </div>

          <h1 className="headline">
            {isSuccess === null ? "Processing..." : toastMessage}
          </h1>

          <ul className={`conf-list ${isDone ? 'visible' : ''}`}>
            <li>Network: {isSuccess === false ? "Connection Refused" : "Verified"}</li>
            <li>Security Layer: Active</li>
            <li>Status: {isSuccess === null ? "Pending" : isSuccess ? "Complete" : "Rejected"}</li>
          </ul>

          {isDone && (
            <button className="done-btn" onClick={handleClose}>
              Done
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

