import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import Demo from '@/pages/Demo';
import Dashboard from '@/pages/Dashboard';
import Buildings from '@/pages/Buildings';
import BuildingDetail from '@/pages/BuildingDetail';
import Zones from '@/pages/Zones';
import ZoneControl from '@/pages/ZoneControl';
import Alerts from '@/pages/Alerts';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"></div>
          <span className="text-xs text-muted-foreground">Loading HVAC System…</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // auth_required and other errors: allow the app to render publicly
  }

  return (
    <Routes>
      {/* Public pages (no sidebar layout) */}
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/demo" element={<Demo />} />

      {/* App pages (with sidebar/bottom nav layout) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/buildings/:id" element={<BuildingDetail />} />
        <Route path="/zones" element={<Zones />} />
        <Route path="/zones/:id" element={<ZoneControl />} />
        <Route path="/alerts" element={<Alerts />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App