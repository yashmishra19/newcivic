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
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function Header({ searchQuery, onSearchChange, darkMode = false, onToggleDarkMode }: HeaderProps) {
  const location = useLocation();
  const meta = ROUTE_META[location.pathname] || ROUTE_META['/admin'];
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const bg = darkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/80';
  const textMain = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const textBreadcrumb = darkMode ? 'text-slate-500' : 'text-slate-400';
  const textBreadcrumbLast = darkMode ? 'text-slate-300' : 'text-slate-600';
  const inputBg = darkMode ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-400';
  const iconBtnBg = darkMode ? 'bg-slate-800 border-slate-600 text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100';
  const avatarBorder = darkMode ? 'border-slate-600' : 'border-slate-200';
  const nameText = darkMode ? 'text-slate-200' : 'text-slate-800';
  const roleText = darkMode ? 'text-slate-500' : 'text-slate-500';

  return (
    <header className={`${bg} border-b px-6 lg:px-8 py-4 flex-shrink-0 transition-colors duration-200`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Breadcrumb */}
          <div className={`flex items-center gap-1.5 text-[12px] ${textBreadcrumb} mb-1.5 ml-0.5`}>
            {meta.breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === meta.breadcrumb.length - 1 ? `${textBreadcrumbLast} font-medium` : ''}>
                  {item}
                </span>
              </span>
            ))}
          </div>
          {/* Title */}
          <h1 className={`text-xl font-bold ${textMain} truncate`}>{meta.title}</h1>
          <p className={`text-[13px] ${textSub} mt-0.5 hidden sm:block`}>{meta.subtitle}</p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-56 lg:w-64 pl-9 pr-4 py-2 border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${inputBg}`}
            />
          </div>

          {/* Dark mode toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${iconBtnBg}`}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M5.64 18.36l-.71.71m12.73 0-.71-.71M5.64 5.64l-.71-.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                </svg>
              )}
            </button>
          )}

          {/* Notification bell */}
          <button className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${iconBtnBg}`}>
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
          <div className={`hidden sm:flex items-center gap-2.5 pl-3 border-l ${avatarBorder}`}>
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="Admin"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="hidden lg:block">
              <p className={`text-[13px] font-semibold ${nameText}`}>Alex Mercer</p>
              <p className={`text-[11px] ${roleText}`}>Director</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
