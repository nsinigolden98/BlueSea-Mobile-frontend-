// src/layouts/AuthenticatedLayout.tsx
{/*import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RefreshProvider, PullToRefresh } from '../components/refresh';
import { Header } from '../components/ui-custom/Header';
import { MobileBottomNavigation } from '../components/navigation/MobileBottomNavigation';

// Add route paths here that should NOT show a footer
const HIDE_FOOTER_ROUTES = ['/checkout', '/fullscreen-chart', '/chat'];

export const AuthenticatedLayout: React.FC = () => {
  const location = useLocation();

  // Automatically check if the current page should hide the footer
  const showFooter = !HIDE_FOOTER_ROUTES.includes(location.pathname);

  return (
    <RefreshProvider>
      <Header />
      <PullToRefresh>
        <main className="main-content">
          {/* <Outlet /> automatically displays your current page here! 
          <Outlet />
        </main>
      </PullToRefresh>

      {/* Renders Footer on all pages EXCEPT those listed in HIDE_FOOTER_ROUTES 
      {showFooter && <Footer />
    </RefreshProvider>
  );
};
*/}