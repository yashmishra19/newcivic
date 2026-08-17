import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronRight, LogOut } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../data/mockNotifications';

const ROUTE_META: Record<string, { title: string; subtitle: string; breadcrumb: string[] }> = {
  '/admin': {
    title: 'Operations Overview',
    subtitle: 'Real-time municipal operations and civic incident monitoring.',
    breadcrumb: ['Admin', 'Dashboard'],
  },
  '/admin/incidents': {
    title: 'Incident Management',
    subtitle: 'Review, prioritize and dispatch civic incidents.',
    breadcrumb: ['Admin', 'Incidents'],
  },
  '/admin/map': {
    title: 'Live Operations Map',
    subtitle: 'Real-time geographic visualization of all active municipal incidents.',
    breadcrumb: ['Admin', 'Live Map'],
  },
  '/admin/departments': {
    title: 'Municipal Departments',
    subtitle: 'Manage organizational units and their operational capacities.',
    breadcrumb: ['Admin', 'Departments'],
  },
  '/admin/teams': {
    title: 'Active Field Operations',
    subtitle: 'Real-time status and deployment of all municipal field units.',
    breadcrumb: ['Admin', 'Field Teams'],
  },
  '/admin/citizens': {
    title: 'Citizens Registry',
    subtitle: 'Manage user accounts, verification status, and reporting history.',
    breadcrumb: ['Admin', 'Citizens'],
  },
  '/admin/analytics': {
    title: 'Performance Analytics',
    subtitle: 'Comprehensive data visualization of municipal operations and efficiency.',
    breadcrumb: ['Admin', 'Analytics'],
  },
  '/admin/reports': {
    title: 'Reports Vault',
    subtitle: 'Generate, manage and share operational reports and documents.',
    breadcrumb: ['Admin', 'Reports'],
  },
  '/admin/notifications': {
    title: 'Alerts Console',
    subtitle: 'Real-time alerts, incident updates, and system notifications.',
    breadcrumb: ['Admin', 'Notifications'],
  },
};

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const location = useLocation();
  const meta = ROUTE_META[location.pathname] || ROUTE_META['/admin'];
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 lg:px-8 py-4 flex-shrink-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-1.5 ml-0.5">
            {meta.breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === meta.breadcrumb.length - 1 ? 'text-slate-600 font-medium' : ''}>
                  {item}
                </span>
              </span>
            ))}
          </div>
          {/* Title */}
          <h1 className="text-xl font-bold text-slate-900 truncate">{meta.title}</h1>
          <p className="text-[13px] text-slate-500 mt-0.5 hidden sm:block">{meta.subtitle}</p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-56 lg:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Notification bell */}
          <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin Sign Out Button */}
          <button 
            onClick={() => {
              localStorage.removeItem('civicwatch_auth');
              window.history.replaceState({}, '', '/');
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          {/* Admin avatar */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="Admin"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="hidden lg:block">
              <p className="text-[13px] font-semibold text-slate-800">Alex Mercer</p>
              <p className="text-[11px] text-slate-500">Director</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
