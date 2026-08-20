import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CitizenApp from './CitizenApp';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Incidents from './pages/admin/Incidents';
import IncidentDetails from './pages/admin/IncidentDetails';
import LiveMap from './pages/admin/LiveMap';
import Departments from './pages/admin/Departments';
import FieldTeams from './pages/admin/FieldTeams';
import Citizens from './pages/admin/Citizens';
import Reports from './pages/admin/Reports';
import Notifications from './pages/admin/Notifications';
import { AuthScreen } from './components/auth/AuthScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [auth, setAuth] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('civicwatch_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const ONE_DAY = 24 * 60 * 60 * 1000;
        if (parsed.loginTime && now - parsed.loginTime > ONE_DAY) {
          localStorage.removeItem('civicwatch_auth');
          return null;
        }
        return parsed;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse auth from localStorage", e);
      localStorage.removeItem('civicwatch_auth');
      return null;
    }
  });

  // Temporary debug - remove after fix
  console.log('App rendering, auth:', auth);

  if (!auth?.loggedIn) {
    return (
      <ErrorBoundary fallbackTitle="Authentication Screen Error">
        <AuthScreen onAuthSuccess={(data) => setAuth(data)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="App Root Error">
      <BrowserRouter>
        <Routes>
          {/* Citizen-facing app (blocked for Admin, redirects to /admin) */}
          <Route 
            path="/" 
            element={auth.role === 'admin' ? <Navigate to="/admin" replace /> : <CitizenApp />} 
          />

          {/* Admin dashboard (blocked for User, redirects to /) */}
          <Route 
            path="/admin" 
            element={auth.role === 'admin' ? <AdminLayout /> : <Navigate to="/" replace />}
          >
          <Route index element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/:id" element={<IncidentDetails />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="departments" element={<Departments />} />
          <Route path="teams" element={<FieldTeams />} />
          <Route path="citizens" element={<Citizens />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
