import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Clock, CheckCircle2, ShieldAlert, Eye,
  TrendingUp, TrendingDown, ArrowRight, MapPin, Users,
  Wrench, Siren, Recycle, Zap, Shield,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import { MOCK_INCIDENTS, INCIDENT_SPARKLINE_DATA, DISPATCH_DISTRIBUTION } from '../../data/mockIncidents';

const KPI_CARDS = [
  {
    label: 'Open Incidents',
    value: 248,
    trend: '+12%',
    trendUp: true,
    sub: 'From last week',
    color: '#3B82F6',
    bg: 'bg-blue-50',
    icon: AlertTriangle,
    iconColor: 'text-blue-600',
  },
  {
    label: 'Critical',
    value: 12,
    trend: '3 urgent',
    trendUp: true,
    sub: 'Require immediate attention',
    color: '#EF4444',
    bg: 'bg-red-50',
    icon: ShieldAlert,
    iconColor: 'text-red-600',
  },
  {
    label: 'In Progress',
    value: 47,
    trend: '31 crews',
    trendUp: false,
    sub: 'Active repair teams',
    color: '#F59E0B',
    bg: 'bg-amber-50',
    icon: Wrench,
    iconColor: 'text-amber-600',
  },
  {
    label: 'Awaiting Verification',
    value: 18,
    trend: '',
    trendUp: false,
    sub: 'Needs officer review',
    color: '#8B5CF6',
    bg: 'bg-violet-50',
    icon: Eye,
    iconColor: 'text-violet-600',
  },
  {
    label: 'Resolved',
    value: '1,284',
    trend: '+18%',
    trendUp: true,
    sub: 'This month',
    color: '#22C55E',
    bg: 'bg-emerald-50',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
];

const PRIORITY_INCIDENTS = MOCK_INCIDENTS.filter(
  (i) => i.priority === 'critical' || i.priority === 'high'
).slice(0, 5);

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  'in-progress': { bg: 'bg-amber-100', text: 'text-amber-700' },
  assigned: { bg: 'bg-blue-100', text: 'text-blue-700' },
  reported: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  verified: { bg: 'bg-violet-100', text: 'text-violet-700' },
  resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

const PRIORITY_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
};

const DEPT_ICONS: Record<string, any> = {
  'Public Works': Wrench,
  'Emergency': Siren,
  'Sanitation': Recycle,
  'Power': Zap,
  'Law Enforcement': Shield,
};

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Date selector */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-slate-500">Period:</span>
          <select className="text-[13px] bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This month</option>
            <option>This quarter</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-slate-200/80 p-5 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
              {kpi.trend && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    kpi.trendUp && kpi.trend.includes('+')
                      ? 'bg-emerald-50 text-emerald-600'
                      : kpi.trendUp
                      ? 'bg-red-50 text-red-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {kpi.trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            <p className="text-[12px] text-slate-500 mt-1 font-medium">{kpi.label}</p>
            <div className="mt-3 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={INCIDENT_SPARKLINE_DATA}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={kpi.color}
                    fill={kpi.color}
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Map + Priority Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live Incident Map */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-[15px]">Live Incident Map</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Real-time incident locations across the municipality</p>
            </div>
            <Link
              to="/admin/map"
              className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Open Full Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="relative h-[340px] bg-slate-100">
            {/* Static map preview using tile image */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <img
                src="https://tile.openstreetmap.org/13/2412/3078.png"
                alt="Map"
                className="w-full h-full object-cover opacity-60"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
              {/* Mock map markers */}
              {MOCK_INCIDENTS.slice(0, 6).map((inc, i) => {
                const positions = [
                  { top: '25%', left: '35%' },
                  { top: '40%', left: '55%' },
                  { top: '55%', left: '30%' },
                  { top: '30%', left: '65%' },
                  { top: '60%', left: '50%' },
                  { top: '45%', left: '75%' },
                ];
                const pos = positions[i];
                const color =
                  inc.priority === 'critical'
                    ? '#EF4444'
                    : inc.status === 'in-progress'
                    ? '#F97316'
                    : inc.status === 'resolved'
                    ? '#22C55E'
                    : '#3B82F6';
                return (
                  <div
                    key={inc.id}
                    className="absolute animate-pulse"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Map legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-3 text-[10px] font-medium shadow-sm border border-slate-200/60">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Repairing</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Active</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved</span>
            </div>
          </div>
        </div>

        {/* Priority Incidents */}
        <div className="bg-white rounded-xl border border-slate-200/80 flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-[15px]">Priority Incidents</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Requires immediate attention</p>
          </div>
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {PRIORITY_INCIDENTS.map((inc) => {
              const pBadge = PRIORITY_BADGE[inc.priority];
              const sBadge = STATUS_BADGE[inc.status];
              return (
                <Link
                  key={inc.id}
                  to={`/admin/incidents/${inc.id}`}
                  className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${pBadge.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {inc.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {inc.location.address}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pBadge.bg} ${pBadge.text} uppercase`}>
                        {inc.priority}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sBadge.bg} ${sBadge.text}`}>
                        {inc.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 mt-1">
                    <Clock className="w-3 h-3 inline mr-0.5" />
                    {new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-slate-100">
            <Link
              to="/admin/incidents"
              className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all incidents <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dispatch Distribution */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-900 text-[15px]">Municipal Dispatch Distribution</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Department-wise dispatch activity this month</p>
          </div>
          <span className="text-[12px] text-slate-500 font-medium">Total: 408 dispatches</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISPATCH_DISTRIBUTION} layout="vertical" barSize={20}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="department"
                  width={110}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                    padding: '8px 14px',
                  }}
                  formatter={(val: number) => [`${val} dispatches`, 'Total']}
                />
                <Bar dataKey="dispatches" radius={[0, 6, 6, 0]}>
                  {DISPATCH_DISTRIBUTION.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Percentage cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
            {DISPATCH_DISTRIBUTION.map((dept) => {
              const Icon = DEPT_ICONS[dept.department] || Wrench;
              return (
                <div
                  key={dept.department}
                  className="rounded-xl border border-slate-200/80 p-3.5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: dept.color + '15' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: dept.color }} />
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{dept.percentage}%</p>
                  <p className="text-[11px] text-slate-500 truncate">{dept.department}</p>
                  <p className="text-[10px] text-slate-400">{dept.dispatches} dispatches</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
