import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Bell,
  Save,
  Loader2,
  CheckCircle2,
  Clock,
  Pill,
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import type { ActiveTab } from '../types';

interface SettingsPageProps {
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateTab }) => {
  const { profile, updateProfileName, signOut } = useData();
  const { success, error: showError } = useToast();
  const { notifications, clearNotifications } = useNotifications();

  // If user has not configured their username, keep blank so placeholder/fallback is [USER]
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setEmail(profile?.email || '');
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfileName(fullName.trim(), email.trim());
      if (res.success) {
        if (fullName.trim()) {
          success(`Profile updated. You will now be greeted as ${fullName.trim()}.`);
        } else {
          success('Profile updated. Display name reset to [USER].');
        }
      } else {
        showError(res.error || 'Failed to update profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setFullName('');
      setEmail('');
      success('You have been signed out successfully.');
      onNavigateTab?.('dashboard');
    } catch (err: any) {
      showError('Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div id="settings-page-container" className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal profile and notification preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Update how your name and contact details appear across CareTrack</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. user123"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If left blank, your dashboard greeting will display as <span className="font-semibold text-slate-600">[USER]</span>.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for appointment confirmations, medication summaries, and health record notices.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              id="btn-sign-out"
              className="px-4 py-2 border border-slate-300 hover:border-rose-300 bg-white hover:bg-rose-50/70 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {signingOut ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </>
              )}
            </button>

            <button
              type="submit"
              id="btn-save-profile"
              disabled={saving}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* In-App Notifications Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">In-App Notifications</h2>
              <p className="text-xs text-slate-500">
                Reminders for scheduled appointments and medicines appear directly in your top bell menu
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Clear All Alerts
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Bell Reminder System Active</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  CareTrack manages all alerts directly inside the application. When you add medications or doctor appointments, reminders are stored and displayed under the notification bell.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Medication Reminders</p>
                  <p className="text-[11px] text-slate-500">Delivered at your daily scheduled times</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CalendarDays className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Doctor Appointments</p>
                  <p className="text-[11px] text-slate-500">Delivered before upcoming consultations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
