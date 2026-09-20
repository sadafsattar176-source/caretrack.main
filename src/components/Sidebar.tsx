import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Pill,
  Bot,
  Settings as SettingsIcon,
  Stethoscope,
  X,
  User as UserIcon,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const { profile } = useData();

  // If user has not configured their name, display exactly: [USER]
  const displayName = profile?.full_name?.trim() ? profile.full_name.trim() : '[USER]';
  const avatarInitial = displayName === '[USER]' ? 'U' : displayName.charAt(0).toUpperCase();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines', label: 'Add Medicine', icon: Pill },
    { id: 'appointments', label: 'Appointment', icon: CalendarDays },
    { id: 'ai-assistant', label: 'AI Healthcare', icon: Bot },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Vertical Sidebar */}
      <aside
        id="caretrack-left-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 shadow-sm flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <button
              id="sidebar-brand-btn"
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Care<span className="text-sky-600">Track</span>
                </span>
                <p className="text-[10px] font-medium text-slate-400 -mt-0.5 tracking-wide">
                  Health & Med Manager
                </p>
              </div>
            </button>

            {/* Mobile close button */}
            <button
              id="close-sidebar-mobile-btn"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Vertical List) */}
          <nav className="p-3.5 space-y-1.5" aria-label="Sidebar Navigation">
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold shadow-sm ring-1 ring-sky-200'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-sky-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            id="sidebar-user-profile-btn"
            onClick={() => handleSelectTab('settings')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200/80 transition-all text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {avatarInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-700">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {displayName === '[USER]' ? 'Click to set name' : 'Account settings'}
              </p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
