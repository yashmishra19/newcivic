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
  Bell,
  PhoneCall,
} from 'lucide-react';
import { CivicIssue } from '../types';

interface ProfileScreenProps {
  issues: CivicIssue[];
  onViewDetails: (issue: CivicIssue) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ issues, onViewDetails }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [proximityRadius, setProximityRadius] = useState('2 km');

  const myReported = issues.slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 max-w-md mx-auto w-full space-y-5">
      
      {/* 1. PROFILE HEADER SECTION */}
      <section className="flex flex-col items-center text-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="relative">
          <img
            className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
            alt="Alex Rivera"
            crossOrigin="anonymous"
          />
          <div className="absolute -bottom-2 -right-2 bg-[#1e40af] text-white rounded-full p-1.5 flex items-center justify-center w-8 h-8 shadow-sm">
            <Star className="w-4 h-4 fill-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1 flex-wrap justify-center">
            <h1 className="text-xl font-extrabold text-[#0d1c2e]">Alex Rivera</h1>
            <span className="bg-[#e6eeff] text-[#1e40af] px-2.5 py-0.5 rounded-full font-bold text-xs border border-[#d5e3fc]">
              Level 4 Warden
            </span>
          </div>
          <p className="text-xs text-[#444653]">alex.rivera@example.com</p>
          <p className="text-xs text-[#757684] mt-0.5">Downtown District 4 Resident</p>
          <p className="text-xs font-extrabold text-[#1e40af] mt-2">280 Civic Impact Points</p>
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
          <span className="text-xl font-black text-[#0d1c2e]">12</span>
          <span className="text-[11px] font-semibold text-[#757684] mt-0.5">My Reports</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col items-center text-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-600 mb-1.5" />
          <span className="text-xl font-black text-[#0d1c2e]">8</span>
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
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-bold text-xs cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </section>

      {/* 4. MY SUBMITTED REPORTS LIST */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-extrabold text-[#0d1c2e]">My Submitted Reports ({myReported.length})</h2>
          <button type="button" className="text-xs font-bold text-[#1e40af] hover:underline cursor-pointer">
            View All
          </button>
        </div>

        <div className="space-y-2.5">
          {myReported.map((item) => (
            <div
              key={item.id}
              onClick={() => onViewDetails(item)}
              className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex gap-3 hover:shadow-md transition-all items-center cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                crossOrigin="anonymous"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs text-[#0d1c2e] truncate mb-1">{item.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#757684]">{item.reportedAt}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      item.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-[#e6eeff] text-[#1e40af]'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#757684] flex-shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. SAFETY ALERTS & EMERGENCY QUICK DIAL */}
      <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-[#0d1c2e] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1e40af]" />
          <span>Local Safety Alerts & Notifications</span>
        </h3>

        <div className="flex items-center justify-between text-xs py-1">
          <div>
            <span className="font-bold text-[#0d1c2e] block">Critical Road Hazards</span>
            <span className="text-[#757684]">Receive alerts when potholes or lane blocks appear nearby</span>
          </div>
          <input
            type="checkbox"
            checked={pushAlerts}
            onChange={(e) => setPushAlerts(e.target.checked)}
            className="w-5 h-5 accent-[#1e40af] rounded-md cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <span className="font-bold text-[#0d1c2e]">Alert Radius</span>
          <select
            value={proximityRadius}
            onChange={(e) => setProximityRadius(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-[#0d1c2e] rounded-lg px-2.5 py-1 font-semibold text-xs"
          >
            <option value="1 km">1 km (Walking)</option>
            <option value="2 km">2 km (Neighborhood)</option>
            <option value="5 km">5 km (Full Ward)</option>
          </select>
        </div>
      </section>

      <section className="bg-[#f8f9ff] rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#0d1c2e] font-bold">
          <PhoneCall className="w-4 h-4 text-red-600" />
          <span>Emergency Dispatch Quick Dial</span>
        </div>
        <p className="text-[#757684] text-[11px]">
          For live gas leaks, electrical fires, or life-threatening sinkholes, dial 911 immediately.
        </p>
        <div className="flex gap-2 pt-1">
          <a
            href="tel:311"
            className="flex-1 py-2 bg-white border border-slate-200 hover:border-slate-400 rounded-xl text-center font-bold text-[#0d1c2e] shadow-xs"
          >
            Call 311 (City Services)
          </a>
          <a
            href="tel:911"
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-center font-bold shadow-xs"
          >
            Call 911 (Emergency)
          </a>
        </div>
      </section>
    </div>
  );
};
