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
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  issues = [],
  onViewDetails,
  userName = 'Alex Rivera',
  userEmail = 'alex.rivera@example.com',
  userDistrict = 'Downtown District 4',
  userBadge = 'Level 4 Warden',
  onLogout,
  darkMode = false,
  onToggleDarkMode,
}) => {
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
      <section className="flex flex-col items-center text-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/60 transition-colors duration-200">
        <div className="relative">
          <img
            className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
            alt={userName}
            crossOrigin="anonymous"
          />
          <div className="absolute -bottom-2 -right-2 bg-[#1e40af] dark:bg-blue-600 text-white rounded-full p-1.5 flex items-center justify-center w-8 h-8 shadow-sm">
            <Star className="w-4 h-4 fill-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
            <h1 className="text-xl font-extrabold text-[#0d1c2e] dark:text-slate-100">{userName}</h1>
            <span className="bg-[#e6eeff] dark:bg-blue-950/40 text-[#1e40af] dark:text-blue-400 px-2.5 py-0.5 rounded-full font-bold text-xs border border-[#d5e3fc] dark:border-blue-900/50">
              {userBadge}
            </span>
          </div>
          <p className="text-xs text-[#444653] dark:text-slate-300">{userEmail}</p>
          <p className="text-xs text-[#757684] dark:text-slate-400 mt-0.5">{userDistrict} Resident</p>
          <p className="text-xs font-extrabold text-[#1e40af] dark:text-blue-400 mt-2">120 Civic Impact Points</p>
        </div>
      </section>

      {/* 2. IMPACT SUMMARY ROW (4 Metric Cards) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center text-center justify-center transition-colors duration-200">
          <HelpCircle className="w-6 h-6 text-[#1e40af] dark:text-blue-400 mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e] dark:text-slate-100">24</span>
          <span className="text-[11px] font-semibold text-[#757684] dark:text-slate-400 mt-0.5">No. of Queries</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center text-center justify-center transition-colors duration-200">
          <FileText className="w-6 h-6 text-[#1e40af] dark:text-blue-400 mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e] dark:text-slate-100">{myReportsCount}</span>
          <span className="text-[11px] font-semibold text-[#757684] dark:text-slate-400 mt-0.5">My Reports</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center text-center justify-center transition-colors duration-200">
          <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e] dark:text-slate-100">{resolvedCount}</span>
          <span className="text-[11px] font-semibold text-[#757684] dark:text-slate-400 mt-0.5">Resolved</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center text-center justify-center transition-colors duration-200">
          <Trophy className="w-6 h-6 text-amber-500 dark:text-amber-400 mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e] dark:text-slate-100">3</span>
          <span className="text-[11px] font-semibold text-[#757684] dark:text-slate-400 mt-0.5">Rewards</span>
        </div>
      </section>

      {/* 3. ACCOUNT SETTINGS CARD */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/60 p-2 space-y-1 transition-colors duration-200">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-[#444653] dark:text-slate-300" />
            <span className="text-xs font-bold text-[#0d1c2e] dark:text-slate-100">Theme</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleDarkMode && onToggleDarkMode()}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              darkMode ? 'bg-blue-600' : 'bg-slate-200'
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
        <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-[#444653] dark:text-slate-300" />
            <span className="text-xs font-bold text-[#0d1c2e] dark:text-slate-100">Language</span>
          </div>
          <div className="flex items-center gap-1 text-[#444653] dark:text-slate-300">
            <span className="text-xs font-medium">English</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-2 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-bold text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </section>
    </div>
  );
};
