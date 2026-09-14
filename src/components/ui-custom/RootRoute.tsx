import React from 'react';
import { Capacitor } from '@capacitor/core';
import SplashScreen from './SplashScreen'; 
import { LandingPage } from '@/pages'; // Imported correctly using your pages alias

export const RootRoute: React.FC = () => {
  // Check if the application is running inside iOS or Android webview
  const isMobileApp = Capacitor.isNativePlatform();

  if (isMobileApp) {
    return <SplashScreen />;
  }

  return <LandingPage />;
};

export default RootRoute;
