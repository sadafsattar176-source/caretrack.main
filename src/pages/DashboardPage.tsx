import React from 'react';
import {
  CalendarDays,
  Pill,
  Bot,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { ActiveTab, Appointment, Medicine } from '../types';

interface DashboardPageProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddAppointment: () => void;
  onOpenAddMedicine: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  onOpenAddAppointment,
  onOpenAddMedicine,
}) => {
  const { appointments, medicines, setMedicineStatus, toggleAppointmentStatus, profile, loading } = useData();

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = profile?.full_name?.trim() ? profile.full_name.trim() : '[USER]';

  // Today's Date String
  const todayStr = new Date().toISOString().split('T')[0];

  // Today's appointments
  const todayAppointments = appointments.filter(
    (app) => app.date === todayStr && app.status === 'upcoming'
  );

  // Active medicines scheduled for today
  const activeMedicines = medicines.filter((m) => m.status === 'active' || m.status === 'taken');

  // Next upcoming appointment (any future date)
  const upcomingAppointments = appointments
    .filter((app) => app.status === 'upcoming' && app.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const nextAppointment = upcomingAppointments[0];

  return (
    <div id="dashboard-container" className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Top Greeting & Health Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-700 via-sky-800 to-cyan-800 text-white p-6 sm:p-8 shadow-xl shadow-sky-900/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-semibold mb-3 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
            <span>CareTrack Active Health Protection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, <span className="text-cyan-200">{userName}</span>
          </h1>
          <p className="text-sky-100 text-sm sm:text-base mt-2 leading-relaxed">
            Here is your personalized schedule for today. Stay on track with timely reminders and medication alerts.
          </p>

          {/* Quick Action Buttons on Banner */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            <button
              id="btn-quick-add-appointment"
              onClick={onOpenAddAppointment}
              className="px-4 py-2 bg-white text-sky-800 hover:bg-sky-50 rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5 transition duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Add Appointment</span>
            </button>
            <button
              id="btn-quick-add-medicine"
              onClick={onOpenAddMedicine}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5 transition duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Medicine</span>
            </button>
            <button
              id="btn-quick-open-ai"
              onClick={() => setActiveTab('ai-assistant')}
              className="px-4 py-2 bg-sky-900/60 hover:bg-sky-900/90 text-sky-100 rounded-xl text-xs sm:text-sm font-semibold border border-sky-400/30 flex items-center gap-1.5 transition duration-150 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>Ask AI Health Assistant</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid Overview: Today's Appointments & Today's Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Today's Appointments Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Today's Appointments</h2>
                <p className="text-xs text-slate-500">
                  {todayAppointments.length} scheduled for today
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 transition"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center my-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <CalendarDays className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                {appointments.length === 0 ? 'No appointments yet' : 'No appointments today'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                {appointments.length === 0
                  ? "You don't have any appointments scheduled yet. Schedule your first visit to stay organized."
                  : "You don't have any doctor visits scheduled for today."}
              </p>
              <button
                id="btn-empty-schedule-appointment"
                onClick={onOpenAddAppointment}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule appointment</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {todayAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/40 border border-slate-200/60 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {app.time.slice(0, 5)}
                      </span>
                      {app.specialty && (
                        <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {app.specialty}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-2 truncate">
                      Dr. {app.doctor_name}
                    </h3>
                    {app.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{app.location}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleAppointmentStatus(app.id, app.status)}
                    title="Mark as completed"
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Medicines Schedule Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Today's Medicines</h2>
                <p className="text-xs text-slate-500">
                  {activeMedicines.length} medications on schedule
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('medicines')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 transition"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeMedicines.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center my-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Pill className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                {medicines.length === 0 ? 'No medicines added yet' : 'No active medicines'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                {medicines.length === 0
                  ? "You haven't added any medications yet. Add your medications to track schedules and receive reminders."
                  : "All medications are currently marked as stopped. Add or reactivate medicines to resume reminders."}
              </p>
              <button
                id="btn-empty-add-medicine"
                onClick={onOpenAddMedicine}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add medicine</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {activeMedicines.map((med) => {
                const times = Array.isArray(med.times) ? med.times : [];
                return (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      med.status === 'taken'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50 hover:bg-sky-50/40 border-slate-200/60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {med.name}
                        </span>
                        {med.dosage && (
                          <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            {med.dosage}
                          </span>
                        )}
                      </div>

                      {/* Scheduled Time Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {times.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white border border-slate-200/90 px-2 py-0.5 rounded-md"
                          >
                            <Clock className="w-3 h-3 text-slate-400" />
                            {t.slice(0, 5)}
                          </span>
                        ))}
                      </div>

                      {med.notes && (
                        <p className="text-xs text-slate-500 mt-2 italic truncate">
                          "{med.notes}"
                        </p>
                      )}
                    </div>

                    {/* Quick Take/Skip Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {med.status === 'taken' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Taken
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => setMedicineStatus(med.id, 'taken')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Take</span>
                          </button>
                          <button
                            onClick={() => setMedicineStatus(med.id, 'skipped')}
                            className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                            title="Skip this dose"
                          >
                            Skip
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Promotional Callout */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-700/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Have questions about symptoms or your medication?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Ask CareTrack's AI Health Assistant for safe educational information, medication insights, and symptom guidance in English, Urdu, or Roman Urdu.
            </p>
          </div>
        </div>
        <button
          id="btn-goto-ai"
          onClick={() => setActiveTab('ai-assistant')}
          className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-700/15 flex items-center gap-2 shrink-0 transition"
        >
          <span>Open AI Assistant</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
