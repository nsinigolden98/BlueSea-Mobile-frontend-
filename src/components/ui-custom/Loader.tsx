import { useState, useCallback } from 'react';
import './Loader.css';



export function Loader() {
  const [LoaderData, setModalData] = useState<{ visible: boolean }>({
    visible: false,
  });

  const showLoader = useCallback(() => {
    setModalData({visible: true });
  }, []);
  const hideLoader = useCallback(() => {
    
    setModalData({visible: false });
  }, []);

  const LoaderComponent = () => {
  
    if (!LoaderData.visible)return null
    return (
       <div className="loader-screen" id="loader">
  <div className="logo">B<span id='S'>S</span></div>
  <div className="loading-text">Loading...</div>
</div>
    )
  };
  return { showLoader, hideLoader, LoaderComponent};
}

export function AuthLoader() {
  
    return (
       <div className="loader-screen" id="loader">
  <div className="logo">B<span id='S'>S</span></div>
  <div className="loading-text">Loading...</div>
</div>
    )
}
