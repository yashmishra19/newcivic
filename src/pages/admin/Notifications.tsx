import { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, Info, CheckCircle2, AlertCircle,
  Clock, ChevronRight, Trash2, CheckCheck,
} from 'lucide-react';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../services/notifications';

const SEVERITY_ICON: Record<string, any> = {
  critical:  AlertTriangle,
  high:      AlertCircle,
  info:      Info,
  low:       CheckCircle2,
  emergency: AlertTriangle,
  warning:   AlertCircle,
  success:   CheckCircle2,
};

const SEVERITY_STYLES: Record<string, { bg: string; border: string; iconBg: string; color: string }> = {
  critical:  { bg: 'bg-red-50/60',     border: 'border-red-200',    iconBg: 'bg-red-100',    color: '#EF4444' },
  high:      { bg: 'bg-amber-50/60',   border: 'border-amber-200',  iconBg: 'bg-amber-100',  color: '#F59E0B' },
  info:      { bg: 'bg-blue-50/40',    border: 'border-blue-200',   iconBg: 'bg-blue-100',   color: '#3B82F6' },
  low:       { bg: 'bg-emerald-50/40', border: 'border-emerald-200',iconBg: 'bg-emerald-100',color: '#22C55E' },
  emergency: { bg: 'bg-red-50/60',     border: 'border-red-200',    iconBg: 'bg-red-100',    color: '#EF4444' },
  warning:   { bg: 'bg-amber-50/60',   border: 'border-amber-200',  iconBg: 'bg-amber-100',  color: '#F59E0B' },
  success:   { bg: 'bg-emerald-50/40', border: 'border-emerald-200',iconBg: 'bg-emerald-100',color: '#22C55E' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'all',       label: 'All Notifications', count: notifications.length },
    { key: 'incident',  label: 'Incident Updates',  count: notifications.filter((n) => n.category === 'incident').length  },
    { key: 'emergency', label: 'Emergency Alerts',  count: notifications.filter((n) => n.category === 'emergency').length },
    { key: 'power',     label: 'Power',             count: notifications.filter((n) => n.category === 'power').length     },
    { key: 'sanitation',label: 'Sanitation',        count: notifications.filter((n) => n.category === 'sanitation').length},
    { key: 'resolved',  label: 'Resolved',          count: notifications.filter((n) => n.category === 'resolved').length  },
  ];

  const filtered = activeCategory === 'all'
    ? notifications
    : notifications.filter((n) => n.category === activeCategory);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1440px]">
      {/* Left Filter Panel */}
      <div className="w-full lg:w-60 flex-shrink-0 space-y-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3">
          <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 mb-2">
            Filter
          </h3>
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-between ${
                  activeCategory === cat.key ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
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

        {/* Summary */}
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
              <span className="text-slate-500">Critical</span>
              <span className="font-bold text-slate-800">
                {notifications.filter((n) => n.severity === 'critical').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filtered.length}</span> notifications
          </p>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map((notif) => {
            const style = SEVERITY_STYLES[notif.severity] || SEVERITY_STYLES.info;
            const SevIcon = SEVERITY_ICON[notif.severity]  || Info;
            const color   = style.color;

            return (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`rounded-xl border p-5 transition-all hover:shadow-sm cursor-pointer ${style.bg} ${style.border} ${
                  !notif.read ? 'ring-1 ring-offset-1' : 'opacity-85'
                }`}
                style={{ borderColor: !notif.read ? color : undefined }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <SevIcon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[14px] font-bold text-slate-900">{notif.title}</h4>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-[13px] text-slate-600 leading-relaxed">{notif.message}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.created_at).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                          className="w-7 h-7 rounded-lg hover:bg-black/5 flex items-center justify-center text-slate-400 hover:text-slate-600 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {notif.action_label && (
                      <button
                        className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold border"
                        style={{ color, borderColor: `${color}40`, backgroundColor: `${color}08` }}
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                      >
                        {notif.action_label} <ChevronRight className="w-3.5 h-3.5" />
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