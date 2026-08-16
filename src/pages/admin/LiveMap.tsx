import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ZoomIn, ZoomOut, Locate, Layers, Download,
  MapPin, Clock, ChevronRight, AlertTriangle,
} from 'lucide-react';
import { MOCK_INCIDENTS, STATUS_LABELS, type Incident } from '../../data/mockIncidents';

const PRIORITY_DOT: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#3B82F6',
};

const STATUS_MAP_COLOR: Record<string, string> = {
  'in-progress': '#F97316',
  assigned: '#3B82F6',
  reported: '#6366F1',
  verified: '#8B5CF6',
  resolved: '#22C55E',
  closed: '#6B7280',
};

type FilterTab = 'all' | 'emergency' | 'utilities';

export default function LiveMap() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredIncidents = MOCK_INCIDENTS.filter((inc) => {
    if (activeTab === 'emergency') return inc.category === 'emergency';
    if (activeTab === 'utilities') return inc.category === 'power' || inc.category === 'public-works';
    return true;
  }).filter((inc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.title.toLowerCase().includes(q) ||
      inc.id.toLowerCase().includes(q) ||
      inc.location.address.toLowerCase().includes(q)
    );
  });

  const getMarkerColor = (inc: Incident) => {
    if (inc.priority === 'critical') return '#EF4444';
    return STATUS_MAP_COLOR[inc.status] || '#3B82F6';
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] -m-6 lg:-m-8">
      {/* Map area */}
      <div className="flex-1 relative bg-slate-200 overflow-hidden">
        {/* Tile-based map background */}
        <div ref={mapRef} className="absolute inset-0">
          <div className="w-full h-full relative">
            {/* Map tiles grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <img
                  key={i}
                  src={`https://tile.openstreetmap.org/${zoom}/${2412 + (i % 3)}/${3078 + Math.floor(i / 3)}.png`}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.7 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-blue-900/5" />
          </div>
        </div>

        {/* Map markers */}
        {filteredIncidents.map((inc, i) => {
          const positions = [
            { top: '20%', left: '30%' }, { top: '35%', left: '55%' }, { top: '50%', left: '25%' },
            { top: '28%', left: '68%' }, { top: '62%', left: '45%' }, { top: '42%', left: '78%' },
            { top: '15%', left: '50%' }, { top: '55%', left: '65%' }, { top: '70%', left: '35%' },
            { top: '38%', left: '15%' }, { top: '48%', left: '42%' }, { top: '25%', left: '85%' },
          ];
          const pos = positions[i % positions.length];
          const color = getMarkerColor(inc);
          const isSelected = selectedIncident?.id === inc.id;

          return (
            <button
              key={inc.id}
              className="absolute group z-10"
              style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
              onClick={() => setSelectedIncident(isSelected ? null : inc)}
            >
              <div className="relative">
                {inc.priority === 'critical' && (
                  <div className="absolute inset-0 w-6 h-6 rounded-full animate-ping" style={{ backgroundColor: color, opacity: 0.3 }} />
                )}
                <div
                  className={`w-5 h-5 rounded-full border-[2.5px] border-white shadow-lg transition-transform ${isSelected ? 'scale-150' : 'group-hover:scale-125'}`}
                  style={{ backgroundColor: color }}
                />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0F172A] text-white text-[11px] px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                <p className="font-semibold">{inc.title}</p>
                <p className="text-slate-400">{inc.id}</p>
              </div>
            </button>
          );
        })}

        {/* Selected incident popup */}
        {selectedIncident && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-[320px] z-20">
            <div className="flex gap-3">
              <img src={selectedIncident.photo} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{selectedIncident.title}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {selectedIncident.location.address}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                    selectedIncident.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedIncident.priority}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {STATUS_LABELS[selectedIncident.status]}
                  </span>
                </div>
              </div>
            </div>
            <Link
              to={`/admin/incidents/${selectedIncident.id}`}
              className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Map controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5">
          <button
            onClick={() => setZoom(Math.min(18, zoom + 1))}
            className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(1, zoom - 1))}
            className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50">
            <Locate className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50">
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="absolute top-4 left-4 right-20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search address, incident ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] shadow-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-4 text-[11px] font-medium shadow-sm border border-slate-200/60">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500" /> Repairing</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500" /> Active</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Resolved</span>
        </div>

        {/* Download snapshot */}
        <button className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
          <Download className="w-3.5 h-3.5" /> Download Snapshot
        </button>
      </div>

      {/* Right panel - Active situations */}
      <div className="w-full lg:w-[340px] bg-white border-l border-slate-200 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-[15px]">Active Situations</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">{filteredIncidents.length} incidents</p>
        </div>

        {/* Tabs */}
        <div className="px-5 py-2 border-b border-slate-100 flex gap-1">
          {(['all', 'emergency', 'utilities'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Incident list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredIncidents.map((inc) => {
            const dotColor = getMarkerColor(inc);
            return (
              <button
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`w-full text-left px-5 py-3.5 hover:bg-slate-50 transition-colors ${
                  selectedIncident?.id === inc.id ? 'bg-blue-50/60' : ''
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: dotColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{inc.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{inc.location.address}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        inc.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        inc.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {inc.priority}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {inc.assignedTeam || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
