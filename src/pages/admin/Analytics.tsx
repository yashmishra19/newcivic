import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import { Clock, TrendingUp, ThumbsUp, ShieldCheck, Calendar } from 'lucide-react';
import {
  INCIDENT_TREND_DATA,
  CATEGORY_DISTRIBUTION,
  RESPONSE_TIME_DATA,
  NEIGHBORHOOD_HEATMAP,
} from '../../data/mockIncidents';

const ANALYTICS_KPIS = [
  { label: 'Avg. Resolution Time', value: '4.2 hrs', trend: '-12%', trendUp: false, icon: Clock, color: '#3B82F6', bg: 'bg-blue-50' },
  { label: 'Citizen Satisfaction', value: '92%', trend: '+3%', trendUp: true, icon: ThumbsUp, color: '#22C55E', bg: 'bg-emerald-50' },
  { label: 'First Response Time', value: '8 min', trend: '-18%', trendUp: false, icon: TrendingUp, color: '#F59E0B', bg: 'bg-amber-50' },
  { label: 'SLA Compliance', value: '96.2%', trend: '+1.8%', trendUp: true, icon: ShieldCheck, color: '#8B5CF6', bg: 'bg-violet-50' },
];

const INTENSITY_COLORS = ['#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-[#0F172A] text-white text-[12px] px-4 py-3 rounded-xl shadow-xl border border-white/10">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Date range */}
      <div className="flex items-center justify-end gap-2">
        <Calendar className="w-4 h-4 text-slate-400" />
        <div className="flex bg-white border border-slate-200 rounded-xl p-1">
          {[
            { label: '7D', value: '7d' },
            { label: '30D', value: '30d' },
            { label: '90D', value: '90d' },
            { label: '1Y', value: '1y' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                dateRange === opt.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ANALYTICS_KPIS.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  kpi.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            <p className="text-[12px] text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident Trends */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 text-[15px]">Incident Trends — 30 Days</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Reported vs. resolved incidents over time</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INCIDENT_TREND_DATA}>
                <defs>
                  <linearGradient id="gradReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="reported" name="Reported" stroke="#3B82F6" fill="url(#gradReported)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22C55E" fill="url(#gradResolved)" strokeWidth={2} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 text-[15px]">Distribution by Category</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Incident breakdown</p>
          </div>
          <div className="h-[200px] flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {CATEGORY_DISTRIBUTION.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-semibold text-slate-800">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Response Time */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 text-[15px]">Avg. Response Time by Department</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Average minutes to first response</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RESPONSE_TIME_DATA} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                  unit=" min"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgMinutes" name="Avg. Response" radius={[6, 6, 0, 0]}>
                  {RESPONSE_TIME_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Neighborhood Heatmap */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900 text-[15px]">Neighborhood Incident Intensity</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Incident density per district</p>
          </div>
          <div className="space-y-2.5">
            {NEIGHBORHOOD_HEATMAP.map((hood) => {
              const colorIdx = Math.min(Math.floor(hood.intensity * INTENSITY_COLORS.length), INTENSITY_COLORS.length - 1);
              return (
                <div key={hood.neighborhood} className="flex items-center gap-3">
                  <span className="text-[12px] text-slate-600 w-28 truncate">{hood.neighborhood}</span>
                  <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${hood.intensity * 100}%`,
                        backgroundColor: INTENSITY_COLORS[colorIdx],
                      }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-600">
                      {hood.incidents}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1 mt-4 justify-end">
            <span className="text-[10px] text-slate-400 mr-1">Low</span>
            {INTENSITY_COLORS.map((c, i) => (
              <div key={i} className="w-5 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[10px] text-slate-400 ml-1">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
