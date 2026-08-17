import React, { useState } from 'react';
import {
  HelpCircle,
  FileText,
  CheckCircle,
  Trophy,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  Star,
} from 'lucide-react';
import { CivicIssue } from '../types';

interface ProfileScreenProps {
  issues?: CivicIssue[];
  onViewDetails?: (issue: CivicIssue) => void;
  userName?: string;
  userEmail?: string;
  userDistrict?: string;
  userBadge?: string;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  issues = [],
  onViewDetails,
  userName = 'Alex Rivera',
  userEmail = 'alex.rivera@example.com',
  userDistrict = 'Downtown District 4',
  userBadge = 'Level 4 Warden',
  onLogout,
}) => {
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    // Clear user session completely
    localStorage.removeItem('civicwatch_auth');
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
    window.location.reload();
  };

  const myReportsCount =
    issues.filter(
      (i) =>
        i.reportedBy?.name?.includes('You') ||
        i.reportedBy?.name?.toLowerCase().includes(userName.toLowerCase())
    ).length || 12;

  const resolvedCount =
    issues.filter(
      (i) =>
        (i.reportedBy?.name?.includes('You') ||
          i.reportedBy?.name?.toLowerCase().includes(userName.toLowerCase())) &&
        i.status === 'resolved'
    ).length || 8;

  return (
    <div className="w-full px-4 pt-4 max-w-md mx-auto space-y-5 pb-8">
      {/* 1. PROFILE HEADER SECTION */}
      <section className="flex flex-col items-center text-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="relative">
          <img
            className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
            alt={userName}
            crossOrigin="anonymous"
          />
          <div className="absolute -bottom-2 -right-2 bg-[#1e40af] text-white rounded-full p-1.5 flex items-center justify-center w-8 h-8 shadow-sm">
            <Star className="w-4 h-4 fill-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
            <h1 className="text-xl font-extrabold text-[#0d1c2e]">{userName}</h1>
            <span className="bg-[#e6eeff] text-[#1e40af] px-2.5 py-0.5 rounded-full font-bold text-xs border border-[#d5e3fc]">
              {userBadge}
            </span>
          </div>
          <p className="text-xs text-[#444653]">{userEmail}</p>
          <p className="text-xs text-[#757684] mt-0.5">{userDistrict} Resident</p>
          <p className="text-xs font-extrabold text-[#1e40af] mt-2">120 Civic Impact Points</p>
        </div>
      </section>

      {/* 2. IMPACT SUMMARY ROW (4 Metric Cards) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col items-center text-center justify-center">
          <HelpCircle className="w-6 h-6 text-[#1e40af] mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e]">24</span>
          <span className="text-[11px] font-semibold text-[#757684] mt-0.5">No. of Queries</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col items-center text-center justify-center">
          <FileText className="w-6 h-6 text-[#1e40af] mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e]">{myReportsCount}</span>
          <span className="text-[11px] font-semibold text-[#757684] mt-0.5">My Reports</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col items-center text-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-600 mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e]">{resolvedCount}</span>
          <span className="text-[11px] font-semibold text-[#757684] mt-0.5">Resolved</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col items-center text-center justify-center">
          <Trophy className="w-6 h-6 text-amber-500 mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e]">3</span>
          <span className="text-[11px] font-semibold text-[#757684] mt-0.5">Rewards</span>
        </div>
      </section>

      {/* 3. ACCOUNT SETTINGS CARD */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-2 space-y-1">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-[#444653]" />
            <span className="text-xs font-bold text-[#0d1c2e]">Theme</span>
          </div>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              darkMode ? 'bg-[#1e40af]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-[#444653]" />
            <span className="text-xs font-bold text-[#0d1c2e]">Language</span>
          </div>
          <div className="flex items-center gap-1 text-[#444653]">
            <span className="text-xs font-medium">English</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-2 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-bold text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </section>
    </div>
  );
};
