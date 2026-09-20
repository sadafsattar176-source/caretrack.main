import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  FileText,
  User,
  Bell,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Appointment, AppointmentReminder, AppointmentStatus } from '../types';

interface AppointmentsPageProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ modalOpen, setModalOpen }) => {
  const { appointments, addAppointment, updateAppointment, deleteAppointment, toggleAppointmentStatus, loading } = useData();

  const [activeView, setActiveView] = useState<'upcoming' | 'completed'>('upcoming');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderTime, setReminderTime] = useState<AppointmentReminder>('none');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingAppointment(null);
    setDoctorName('');
    setSpecialty('');
    // Default date to today
    setDate(new Date().toISOString().split('T')[0]);
    setTime('10:00');
    setLocation('');
    setNotes('');
    setReminderTime('30 minutes before');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (app: Appointment) => {
    setEditingAppointment(app);
    setDoctorName(app.doctor_name);
    setSpecialty(app.specialty || '');
    setDate(app.date);
    setTime(app.time.slice(0, 5));
    setLocation(app.location || '');
    setNotes(app.notes || '');
    setReminderTime(app.reminder_time || 'none');
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!doctorName.trim()) {
      setFormError('Please provide the doctor\'s name.');
      return;
    }

    if (!date) {
      setFormError('Please select a date.');
      return;
    }

    if (!time) {
      setFormError('Please select a time.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingAppointment) {
        const ok = await updateAppointment(editingAppointment.id, {
          doctor_name: doctorName.trim(),
          specialty: specialty.trim() || null,
          date,
          time,
          location: location.trim() || null,
          notes: notes.trim() || null,
          reminder_time: reminderTime,
        });
        if (ok) closeModal();
      } else {
        const ok = await addAppointment({
          doctor_name: doctorName.trim(),
          specialty: specialty.trim() || null,
          date,
          time,
          location: location.trim() || null,
          notes: notes.trim() || null,
          status: 'upcoming',
          reminder_time: reminderTime,
        });
        if (ok) closeModal();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter((app) =>
    activeView === 'upcoming' ? app.status === 'upcoming' : app.status === 'completed'
  );

  return (
    <div id="appointments-page-container" className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage consultations, follow-ups, and clinic appointments with automated alerts.
          </p>
        </div>
        <button
          id="btn-add-appointment"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-700/15 flex items-center justify-center gap-2 transition duration-150 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Appointment</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveView('upcoming')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeView === 'upcoming'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Upcoming Appointments</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
            {appointments.filter((a) => a.status === 'upcoming').length}
          </span>
        </button>

        <button
          onClick={() => setActiveView('completed')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeView === 'completed'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Completed Visits</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {appointments.filter((a) => a.status === 'completed').length}
          </span>
        </button>
      </div>

      {/* Appointment Cards List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-4">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {activeView === 'upcoming' ? 'No upcoming appointments' : 'No completed appointments yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6">
            {activeView === 'upcoming'
              ? 'Keep track of upcoming doctor visits, specialist checkups, and diagnostic screenings.'
              : 'When appointments are marked as completed, they will be archived here for your records.'}
          </p>
          {activeView === 'upcoming' && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule appointment</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Status & Timing Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                      <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
                      {app.date}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {app.time.slice(0, 5)}
                    </span>
                  </div>

                  {app.reminder_time && app.reminder_time !== 'none' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                      <Bell className="w-3 h-3 text-cyan-600" />
                      {app.reminder_time}
                    </span>
                  )}
                </div>

                {/* Doctor & Specialty */}
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Dr. {app.doctor_name}
                </h3>
                {app.specialty && (
                  <p className="text-xs font-semibold text-sky-600 mt-0.5">
                    {app.specialty}
                  </p>
                )}

                {/* Location */}
                {app.location && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{app.location}</span>
                  </p>
                )}

                {/* Notes */}
                {app.notes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 leading-relaxed">{app.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleAppointmentStatus(app.id, app.status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    app.status === 'completed'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{app.status === 'completed' ? 'Mark Upcoming' : 'Mark Completed'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(app)}
                    className="p-1.5 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                    title="Edit appointment"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(app.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Appointment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                {editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Doctor Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Robert Martinez"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Specialty
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Cardiology, Pediatrics, General Medicine"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location / Clinic
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. City General Hospital, Room 304"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Automated Reminder
                </label>
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value as AppointmentReminder)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                >
                  <option value="none">None</option>
                  <option value="10 minutes before">10 minutes before</option>
                  <option value="30 minutes before">30 minutes before</option>
                  <option value="1 hour before">1 hour before</option>
                  <option value="1 day before">1 day before</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fast for 8 hours prior, bring previous lab test reports"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-700/20 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingAppointment ? 'Save Changes' : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Delete Appointment?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove this appointment? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteAppointment(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
