import { useState } from 'react';
import {
  Bell, AlertTriangle, Info, CheckCircle2, AlertCircle,
  Clock, ChevronRight, Trash2, CheckCheck,
} from 'lucide-react';
import {
  MOCK_NOTIFICATIONS,
  NOTIFICATION_SEVERITY_COLORS,
  type AppNotification,
  type NotificationCategory,
} from '../../data/mockNotifications';

const CATEGORIES: { key: NotificationCategory | 'all'; label: string; count: number }[] = [
  { key: 'all', label: 'All Notifications', count: MOCK_NOTIFICATIONS.length },
  { key: 'emergency-alert', label: 'Emergency Alerts', count: MOCK_NOTIFICATIONS.filter((n) => n.category === 'emergency-alert').length },
  { key: 'incident-update', label: 'Incident Updates', count: MOCK_NOTIFICATIONS.filter((n) => n.category === 'incident-update').length },
  { key: 'system-status', label: 'System Status', count: MOCK_NOTIFICATIONS.filter((n) => n.category === 'system-status').length },
  { key: 'citizen-feedback', label: 'Citizen Feedback', count: MOCK_NOTIFICATIONS.filter((n) => n.category === 'citizen-feedback').length },
];

const SEVERITY_ICON: Record<string, any> = {
  emergency: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle2,
};

const SEVERITY_STYLES: Record<string, { bg: string; border: string; iconBg: string }> = {
  emergency: { bg: 'bg-red-50/60', border: 'border-red-200', iconBg: 'bg-red-100' },
  warning: { bg: 'bg-amber-50/60', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  info: { bg: 'bg-blue-50/40', border: 'border-blue-200', iconBg: 'bg-blue-100' },
  success: { bg: 'bg-emerald-50/40', border: 'border-emerald-200', iconBg: 'bg-emerald-100' },
};

export default function Notifications() {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filtered = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1440px]">
      {/* Left Filter Panel */}
      <div className="w-full lg:w-60 flex-shrink-0 space-y-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3">
          <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 mb-2">
            Filter
          </h3>
          <div className="space-y-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-between ${
                  activeCategory === cat.key
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[11px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-blue-500" />
            <h3 className="text-[13px] font-semibold text-slate-800">Summary</h3>
          </div>
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-slate-800">{notifications.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unread</span>
              <span className="font-bold text-red-600">{unreadCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Emergency</span>
              <span className="font-bold text-slate-800">
                {notifications.filter((n) => n.severity === 'emergency').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filtered.length}</span> notifications
          </p>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        </div>

        {/* Notification Cards */}
        <div className="space-y-3">
          {filtered.map((notif) => {
            const severity = SEVERITY_STYLES[notif.severity];
            const SevIcon = SEVERITY_ICON[notif.severity];
            const color = NOTIFICATION_SEVERITY_COLORS[notif.severity];

            return (
              <div
                key={notif.id}
                className={`rounded-xl border p-5 transition-all hover:shadow-sm ${severity.bg} ${severity.border} ${
                  !notif.read ? 'ring-1 ring-offset-1' : 'opacity-85'
                }`}
                style={{ borderColor: !notif.read ? color : undefined }}
                onClick={() => markRead(notif.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${severity.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <SevIcon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[14px] font-bold text-slate-900">{notif.title}</h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" /> {notif.timestamp}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
                          className="w-7 h-7 rounded-lg hover:bg-black/5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {notif.actionLabel && (
                      <button
                        className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors border"
                        style={{
                          color: color,
                          borderColor: `${color}40`,
                          backgroundColor: `${color}08`,
                        }}
                        onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                      >
                        {notif.actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-[14px] text-slate-500 font-medium">No notifications in this category</p>
              <p className="text-[12px] text-slate-400 mt-1">Check back later for updates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
