import { Navigate, Route, Routes } from 'react-router-dom';
import { MrGLinksProvider } from './MrGLinksContext';
import './MrGLinks.css';
import MrGLinksLayout from './components/MrGLinksLayout';
import OverviewPage from './pages/OverviewPage';
import LinksPage from './pages/LinksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import QrPage from './pages/QrPage';
import CampaignsPage from './pages/CampaignsPage';
import LandingPagesPage from './pages/LandingPagesPage';
import SmartRoutingPage from './pages/SmartRoutingPage';
import SecurityPage from './pages/SecurityPage';
import PlansPage from './pages/PlansPage';
import SettingsPage from './pages/SettingsPage';
import ComingSoonPage from './pages/ComingSoonPage';

export default function MrGLinksApp() {
  return <MrGLinksProvider><Routes><Route element={<MrGLinksLayout/>}>
    <Route index element={<OverviewPage/>}/>
    <Route path="links" element={<LinksPage/>}/>
    <Route path="analytics" element={<AnalyticsPage/>}/>
    <Route path="qr" element={<QrPage/>}/>
    <Route path="campaigns" element={<CampaignsPage/>}/>
    <Route path="landing-pages" element={<LandingPagesPage/>}/>
    <Route path="routing" element={<SmartRoutingPage/>}/>
    <Route path="security" element={<SecurityPage/>}/>
    <Route path="plans" element={<PlansPage/>}/>
    <Route path="settings" element={<SettingsPage/>}/>
    <Route path="domains" element={<ComingSoonPage/>}/>
    <Route path="api" element={<ComingSoonPage/>}/>
    <Route path="teams" element={<ComingSoonPage/>}/>
    <Route path="whatsapp" element={<ComingSoonPage/>}/>
    <Route path="ai" element={<ComingSoonPage/>}/>
    <Route path="ab-testing" element={<ComingSoonPage/>}/>
    <Route path="*" element={<Navigate to="/mrg-links" replace/>}/>
  </Route></Routes></MrGLinksProvider>;
}
