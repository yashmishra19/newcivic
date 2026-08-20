import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('civicwatch_admin_darkmode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('civicwatch_admin_darkmode', String(next));
      return next;
    });
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark bg-slate-950' : 'bg-[#F1F5F9]'}`}>
      <Sidebar darkMode={darkMode} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        <main className={`flex-1 overflow-y-auto p-6 lg:p-8 ${darkMode ? 'bg-slate-900' : ''}`}>
          <Outlet context={{ searchQuery, darkMode }} />
        </main>
      </div>
    </div>
  );
}
