import React from 'react';
import { Home, Map, Plus, Users, User } from 'lucide-react';

export type TabType = 'home' | 'map' | 'report' | 'community' | 'profile';

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
    <nav className="shrink-0 w-full h-[64px] bg-white/90 backdrop-blur-md border-t border-gray-100 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50 transition-all">
      <div className="flex items-center justify-around h-full px-2 relative pb-safe">
        
        {/* Home */}
        <button
          id="nav-tab-home"
          type="button"
          onClick={() => onTabChange('home')}
          className="relative flex flex-col items-center justify-center w-16 h-full transition-all duration-200"
        >
          {activeTab === 'home' && (
            <div className="absolute top-0 w-8 h-[3px] bg-blue-600 rounded-b-full shadow-[0_1px_3px_rgba(37,99,235,0.4)]" />
          )}
          <Home className={`w-[22px] h-[22px] mb-1 transition-all duration-200 ${activeTab === 'home' ? 'text-blue-600 stroke-[2.5] scale-110' : 'text-gray-400 stroke-[2]'}`} />
          <span className={`text-[10px] transition-colors ${activeTab === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-400 font-medium'}`}>
            Home
          </span>
        </button>

        {/* Map */}
        <button
          id="nav-tab-map"
          type="button"
          onClick={() => onTabChange('map')}
          className="relative flex flex-col items-center justify-center w-16 h-full transition-all duration-200"
        >
          {activeTab === 'map' && (
            <div className="absolute top-0 w-8 h-[3px] bg-blue-600 rounded-b-full shadow-[0_1px_3px_rgba(37,99,235,0.4)]" />
          )}
          <Map className={`w-[22px] h-[22px] mb-1 transition-all duration-200 ${activeTab === 'map' ? 'text-blue-600 stroke-[2.5] scale-110' : 'text-gray-400 stroke-[2]'}`} />
          <span className={`text-[10px] transition-colors ${activeTab === 'map' ? 'text-blue-600 font-semibold' : 'text-gray-400 font-medium'}`}>
            Map
          </span>
        </button>

        {/* Report (Prominent FAB) */}
        <button
          id="nav-tab-report"
          type="button"
          onClick={() => onTabChange('report')}
          className="relative flex flex-col items-center justify-center w-16 transition-all duration-200 -mt-6 active:scale-95"
        >
          <div className="w-[56px] h-[56px] rounded-full bg-[#2563EB] flex items-center justify-center shadow-[0_4px_14px_rgba(37,99,235,0.5)] border-[3px] border-white z-10 transition-transform">
            <Plus className="w-7 h-7 text-white stroke-[3]" />
          </div>
          <span className="text-[10px] font-semibold text-blue-600 mt-1">
            Report
          </span>
        </button>

        {/* Community */}
        <button
          id="nav-tab-community"
          type="button"
          onClick={() => onTabChange('community')}
          className="relative flex flex-col items-center justify-center w-16 h-full transition-all duration-200"
        >
          {activeTab === 'community' && (
            <div className="absolute top-0 w-8 h-[3px] bg-blue-600 rounded-b-full shadow-[0_1px_3px_rgba(37,99,235,0.4)]" />
          )}
          <Users className={`w-[22px] h-[22px] mb-1 transition-all duration-200 ${activeTab === 'community' ? 'text-blue-600 stroke-[2.5] scale-110' : 'text-gray-400 stroke-[2]'}`} />
          <span className={`text-[10px] transition-colors ${activeTab === 'community' ? 'text-blue-600 font-semibold' : 'text-gray-400 font-medium'}`}>
            Community
          </span>
        </button>

        {/* Profile */}
        <button
          id="nav-tab-profile"
          type="button"
          onClick={() => onTabChange('profile')}
          className="relative flex flex-col items-center justify-center w-16 h-full transition-all duration-200"
        >
          {activeTab === 'profile' && (
            <div className="absolute top-0 w-8 h-[3px] bg-blue-600 rounded-b-full shadow-[0_1px_3px_rgba(37,99,235,0.4)]" />
          )}
          <User className={`w-[22px] h-[22px] mb-1 transition-all duration-200 ${activeTab === 'profile' ? 'text-blue-600 stroke-[2.5] scale-110' : 'text-gray-400 stroke-[2]'}`} />
          <span className={`text-[10px] transition-colors ${activeTab === 'profile' ? 'text-blue-600 font-semibold' : 'text-gray-400 font-medium'}`}>
            Profile
          </span>
        </button>

      </div>
    </nav>
  );
};
