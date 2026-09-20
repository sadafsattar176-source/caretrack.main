import React, { useState, useRef, useEffect } from 'react';
import {
  Stethoscope,
  CalendarDays,
  Pill,
  Bell,
  Menu,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNotifications } from '../context/NotificationContext';
import type { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onToggleMobileSidebar }) => {
  const { profile } = useData();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBellDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.full_name?.trim() ? profile.full_name.trim() : '[USER]';
  const avatarInitial = displayName === '[USER]' ? 'U' : displayName.charAt(0).toUpperCase();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'medicines':
        return 'Medications & Prescriptions';
      case 'appointments':
        return 'Doctor Appointments';
      case 'ai-assistant':
        return 'AI Health Assistant';
      case 'settings':
        return 'Account & Notification Settings';
      default:
        return 'CareTrack';
    }
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(2,132,199,0.03)]"
    >
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button + Context Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileSidebar}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl md:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer md:hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-700 to-cyan-500 flex items-center justify-center text-white shadow-sm">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Care<span className="text-sky-600">Track</span>
            </span>
          </div>

          {/* Desktop Page Title / Breadcrumb */}
          <div className="hidden md:block">
            <h2 className="text-base font-bold text-slate-800">
              {getPageTitle()}
            </h2>
            <p className="text-[11px] text-slate-400">
              Personalized healthcare & medication management
            </p>
          </div>
        </div>

        {/* Right Section: Notification bell, User profile pill */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="notification-bell-btn"
              onClick={() => setShowBellDropdown(!showBellDropdown)}
              className="relative p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-colors border border-transparent hover:border-sky-100 cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  id="notification-unread-badge"
                  className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showBellDropdown && (
              <div
                id="notification-dropdown"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-sky-100 text-sky-700 font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={markAllAsRead}
                        className="text-sky-600 hover:text-sky-800 font-medium transition cursor-pointer"
                      >
                        Mark all read
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={clearNotifications}
                        className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications list */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                        <Bell className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">No notifications</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Reminders for appointments and medicine times will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                          !notif.read ? 'bg-sky-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'appointment'
                              ? 'bg-blue-100 text-blue-700'
                              : notif.type === 'medicine'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {notif.type === 'appointment' ? (
                            <CalendarDays className="w-4 h-4" />
                          ) : notif.type === 'medicine' ? (
                            <Pill className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-snug line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <button
            id="user-profile-badge"
            onClick={() => setActiveTab('settings')}
            title="View Profile Settings"
            className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-slate-100 hover:bg-sky-50 border border-slate-200/70 hover:border-sky-200 text-slate-700 hover:text-sky-700 text-xs font-semibold transition cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[11px]">
              {avatarInitial}
            </div>
            <span className="max-w-[120px] truncate">{displayName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
