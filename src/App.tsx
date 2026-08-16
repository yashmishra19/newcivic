import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CitizenApp from './CitizenApp';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Incidents from './pages/admin/Incidents';
import IncidentDetails from './pages/admin/IncidentDetails';
import LiveMap from './pages/admin/LiveMap';
import Departments from './pages/admin/Departments';
import FieldTeams from './pages/admin/FieldTeams';
import Citizens from './pages/admin/Citizens';
import Analytics from './pages/admin/Analytics';
import Reports from './pages/admin/Reports';
import Notifications from './pages/admin/Notifications';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Citizen-facing app */}
        <Route path="/" element={<CitizenApp />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/:id" element={<IncidentDetails />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="departments" element={<Departments />} />
          <Route path="teams" element={<FieldTeams />} />
          <Route path="citizens" element={<Citizens />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
