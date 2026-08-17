import { useState, useEffect } from 'react';
import {
  Wrench, Siren, Recycle, Zap, Shield,
  ArrowRight, Plus, CheckCircle2, AlertCircle, CircleDot,
} from 'lucide-react';
import { getDepartments } from '../../services/departments';

const DEPT_ICONS: Record<string, any> = {
  Wrench, Siren, Recycle, Zap, Shield,
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  operational: { label: 'Operational', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
  degraded:    { label: 'Limited',     bg: 'bg-amber-100',   text: 'text-amber-700',   icon: AlertCircle  },
  critical:    { label: 'Offline',     bg: 'bg-red-100',     text: 'text-red-700',     icon: CircleDot    },
};

export default function Departments() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-red-600 bg-red-50 rounded-xl p-4 text-sm">
      Failed to load departments: {error}
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div />
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Add New Department
        </button>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const Icon = DEPT_ICONS[dept.icon] || Wrench;
          const statusCfg = STATUS_CONFIG[dept.status] || STATUS_CONFIG.operational;
          const StatusIcon = statusCfg.icon;

          return (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200/80 p-6 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: dept.color + '15' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: dept.color }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">{dept.name}</h3>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[12px] text-slate-500 leading-relaxed mb-5 line-clamp-2">
                {dept.description}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">{dept.head_count}</span> personnel •{' '}
                  <span className="font-medium text-slate-700">
                    ₹{(dept.budget / 100000).toFixed(1)}L
                  </span> budget
                </div>
                <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Portfolio <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
