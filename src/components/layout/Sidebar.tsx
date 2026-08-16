import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  FileText,
  Bell,
  ChevronLeft,
  Menu,
  Shield,
} from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../data/mockNotifications';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/admin/map', label: 'Live Map', icon: Map },
  { path: '/admin/departments', label: 'Departments', icon: Building2 },
  { path: '/admin/teams', label: 'Field Teams', icon: Users },
  { path: '/admin/citizens', label: 'Citizens', icon: UserCheck },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-white font-bold text-[15px] leading-tight tracking-tight">CivicFix</h1>
            <p className="text-[10px] text-blue-400/80 font-semibold tracking-[0.15em] uppercase">Admin Console</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-white transition-colors hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/[0.06]"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] px-3 mb-2 mt-1">Operations</p>
        )}
        {NAV_ITEMS.map((item) => {
          const isNotif = item.label === 'Notifications';
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />
                  )}
                  <item.icon
                    className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                  {isNotif && unreadCount > 0 && (
                    <span className={`${collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'} bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-500/30`}>
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Profile */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.06]">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="Admin"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F172A]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-[13px] font-semibold truncate">Alex Mercer</p>
              <p className="text-slate-500 text-[11px] truncate">Operations Director</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#0F172A] text-white rounded-xl flex items-center justify-center shadow-lg border border-white/10"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-[#0F172A] border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
