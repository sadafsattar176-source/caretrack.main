import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Medicine, MedicineStatus } from '../types';

interface MedicinesPageProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

export const MedicinesPage: React.FC<MedicinesPageProps> = ({ modalOpen, setModalOpen }) => {
  const { medicines, addMedicine, updateMedicine, deleteMedicine, setMedicineStatus } = useData();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'stopped'>('all');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State - empty by default, no automatic 9:00 AM or default time
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [newTimeInput, setNewTimeInput] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // When modal is opened for adding a medicine, ensure fields start empty
  useEffect(() => {
    if (modalOpen && !editingMedicine) {
      setName('');
      setDosage('');
      setTimes([]);
      setNewTimeInput('');
      setNotes('');
      setFormError(null);
    }
  }, [modalOpen, editingMedicine]);

  const openAddModal = () => {
    setEditingMedicine(null);
    setName('');
    setDosage('');
    setTimes([]);
    setNewTimeInput('');
    setNotes('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setName(med.name);
    setDosage(med.dosage || '');
    setTimes(Array.isArray(med.times) ? med.times : []);
    setNewTimeInput('');
    setNotes(med.notes || '');
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMedicine(null);
    setTimes([]);
    setNewTimeInput('');
    setFormError(null);
  };

  const handleAddTime = () => {
    if (newTimeInput && !times.includes(newTimeInput)) {
      setTimes([...times, newTimeInput].sort());
      setNewTimeInput('');
      if (formError === 'Please select a reminder time.') {
        setFormError(null);
      }
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setTimes(times.filter((t) => t !== timeToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter the medicine name.');
      return;
    }

    // Determine effective times from added time chips or current time picker input
    const effectiveTimes = [...times];
    if (newTimeInput && !effectiveTimes.includes(newTimeInput)) {
      effectiveTimes.push(newTimeInput);
      effectiveTimes.sort();
    }

    // Reminder time is strictly required with clear validation message
    if (effectiveTimes.length === 0) {
      setFormError('Please select a reminder time.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingMedicine) {
        const ok = await updateMedicine(editingMedicine.id, {
          name: name.trim(),
          dosage: dosage.trim() || null,
          times: effectiveTimes,
          notes: notes.trim() || null,
        });
        if (ok) closeModal();
      } else {
        const ok = await addMedicine({
          name: name.trim(),
          dosage: dosage.trim() || null,
          times: effectiveTimes,
          status: 'active',
          notes: notes.trim() || null,
        });
        if (ok) closeModal();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return m.status === 'active' || m.status === 'taken';
    if (statusFilter === 'stopped') return m.status === 'stopped';
    return true;
  });

  return (
    <div id="medicines-page-container" className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medication Schedule
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily prescriptions, dosages, multiple reminder times, and adherence logs.
          </p>
        </div>
        <button
          id="btn-add-medicine"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-700/20 flex items-center justify-center gap-2 transition duration-150 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setStatusFilter('all')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            statusFilter === 'all'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>All Medicines</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {medicines.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            statusFilter === 'active'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Active</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            {medicines.filter((m) => m.status === 'active' || m.status === 'taken').length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('stopped')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            statusFilter === 'stopped'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Stopped</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {medicines.filter((m) => m.status === 'stopped').length}
          </span>
        </button>
      </div>

      {/* Medicines Cards List */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 mb-4">
            <Pill className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No medicines found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6">
            Keep all your medications organized with dosage reminders and taken/skip status logging.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add medicine</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((med) => {
            const timesList = Array.isArray(med.times) ? med.times : [];
            const isStopped = med.status === 'stopped';
            const isTaken = med.status === 'taken';

            return (
              <div
                key={med.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isStopped
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : isTaken
                    ? 'bg-emerald-50/30 border-emerald-200 shadow-sm'
                    : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isStopped
                          ? 'bg-slate-200 text-slate-700'
                          : isTaken
                          ? 'bg-emerald-100 text-emerald-800'
                          : med.status === 'skipped'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {isStopped
                        ? 'Stopped'
                        : isTaken
                        ? 'Taken Today'
                        : med.status === 'skipped'
                        ? 'Skipped'
                        : 'Active Schedule'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(med)}
                        className="p-1 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                        title="Edit medicine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(med.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Name & Dosage */}
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {med.name}
                  </h3>
                  {med.dosage && (
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      Dosage: <span className="text-slate-800">{med.dosage}</span>
                    </p>
                  )}

                  {/* Schedule Times */}
                  <div className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Daily Reminders
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {timesList.map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs font-bold text-sky-800 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg"
                        >
                          <Clock className="w-3 h-3 text-sky-600" />
                          {t.slice(0, 5)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {med.notes && (
                    <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
                      <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 leading-relaxed italic">{med.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isStopped ? (
                    <button
                      onClick={() => setMedicineStatus(med.id, 'active')}
                      className="w-full py-1.5 px-3 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Reactivate Medicine</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setMedicineStatus(med.id, isTaken ? 'active' : 'taken')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isTaken
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isTaken ? 'Taken' : 'Take'}</span>
                        </button>

                        <button
                          onClick={() => setMedicineStatus(med.id, 'skipped')}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
                        >
                          Skip
                        </button>
                      </div>

                      <button
                        onClick={() => setMedicineStatus(med.id, 'stopped')}
                        className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                        title="Stop medicine"
                      >
                        <PauseCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                {editingMedicine ? 'Edit Medication' : 'Add Medication'}
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
                  Medicine Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Pill className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Paracetamol, Amoxicillin, Metformin"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dosage
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500mg, 1 tablet with meal"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              {/* Daily Reminder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Daily Reminder *
                </label>
                {times.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {times.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold px-3 py-1 rounded-xl"
                      >
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTime(t)}
                          className="hover:text-rose-600 ml-0.5 cursor-pointer"
                          title="Remove reminder time"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="time"
                    id="medicine-reminder-time"
                    value={newTimeInput}
                    onChange={(e) => {
                      setNewTimeInput(e.target.value);
                      if (formError === 'Please select a reminder time.') {
                        setFormError(null);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 transition ${
                      formError === 'Please select a reminder time.' && times.length === 0 && !newTimeInput
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-sky-500/20 focus:border-sky-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddTime}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Time</span>
                  </button>
                </div>
                {formError === 'Please select a reminder time.' && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Please select a reminder time.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Take after breakfast, avoid dairy for 1 hour"
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
                  {submitting ? 'Saving...' : editingMedicine ? 'Save Changes' : 'Add Medicine'}
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
            <h3 className="font-bold text-slate-900 text-base">Delete Medicine?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove this medication from your schedule?
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
                  await deleteMedicine(deletingId);
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
