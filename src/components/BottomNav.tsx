import React from 'react';
import { Home, Map, Plus, CheckCircle, User } from 'lucide-react';

export type TabType = 'home' | 'map' | 'report' | 'resolved' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  reportCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-md bg-white/95 backdrop-blur-md rounded-full border border-slate-200/80 shadow-[0_8px_30px_rgba(13,28,46,0.08)] px-3 py-2 z-50 transition-all">
      <div className="flex items-center justify-around relative">
        
        {/* Home */}
        <button
          id="nav-tab-home"
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 py-1.5 transition-all rounded-full ${
            activeTab === 'home'
              ? 'bg-[#e8edff] text-[#1e40af] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-xs tracking-tight">Home</span>
        </button>

        {/* Map */}
        <button
          id="nav-tab-map"
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 py-1.5 transition-all rounded-full ${
            activeTab === 'map'
              ? 'bg-[#e8edff] text-[#1e40af] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Map className="w-5 h-5 stroke-[2.2]" />
          <span className="text-xs tracking-tight">Map</span>
        </button>

        {/* Report (Primary Action matching screen.png) */}
        <button
          id="nav-tab-report"
          type="button"
          onClick={() => onTabChange('report')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3.5 py-1.5 transition-all rounded-full ${
            activeTab === 'report'
              ? 'bg-[#e8edff] text-[#1e40af] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#1e40af] flex items-center justify-center text-[#1e40af] font-black text-xs">
            +
          </div>
          <span className="text-xs tracking-tight">Report</span>
        </button>

        {/* Resolved */}
        <button
          id="nav-tab-resolved"
          type="button"
          onClick={() => onTabChange('resolved')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 py-1.5 transition-all rounded-full ${
            activeTab === 'resolved'
              ? 'bg-[#e8edff] text-[#1e40af] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <CheckCircle className="w-5 h-5 stroke-[2.2]" />
          <span className="text-xs tracking-tight">Resolved</span>
        </button>

        {/* Profile */}
        <button
          id="nav-tab-profile"
          type="button"
          onClick={() => onTabChange('profile')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 px-3 py-1.5 transition-all rounded-full ${
            activeTab === 'profile'
              ? 'bg-[#e8edff] text-[#1e40af] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <User className="w-5 h-5 stroke-[2.2]" />
          <span className="text-xs tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};
