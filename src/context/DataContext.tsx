import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';
import { useNotifications } from './NotificationContext';
import type { Appointment, Medicine, MedicineStatus, Profile } from '../types';

interface DataContextType {
  appointments: Appointment[];
  medicines: Medicine[];
  profile: Profile;
  loading: boolean;
  refreshData: () => Promise<void>;
  updateProfileName: (name: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  // Appointment actions
  addAppointment: (app: Omit<Appointment, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateAppointment: (id: string, app: Partial<Appointment>) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  toggleAppointmentStatus: (id: string, currentStatus: Appointment['status']) => Promise<boolean>;
  // Medicine actions
  addMedicine: (med: Omit<Medicine, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateMedicine: (id: string, med: Partial<Medicine>) => Promise<boolean>;
  deleteMedicine: (id: string) => Promise<boolean>;
  setMedicineStatus: (id: string, status: MedicineStatus) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generate or retrieve a persistent client patient ID
const getPatientId = (): string => {
  try {
    const existing = localStorage.getItem('caretrack_patient_id');
    if (existing && existing.length >= 10) return existing;
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : '00000000-0000-4000-8000-000000000001';
    localStorage.setItem('caretrack_patient_id', newId);
    return newId;
  } catch {
    return '00000000-0000-4000-8000-000000000001';
  }
};

const DEFAULT_PROFILE: Profile = {
  full_name: '',
  email: '',
};

const INITIAL_APPOINTMENTS: Appointment[] = [];
const INITIAL_MEDICINES: Medicine[] = [];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error: showError } = useToast();
  const { sendNotification } = useNotifications();

  const patientId = getPatientId();

  // Initialize state from localStorage without any fake/demo records
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('caretrack_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const cleanName = parsed.full_name === 'Sarah Jenkins' ? '' : (parsed.full_name || '');
          const cleanEmail = parsed.email === 'sarah.jenkins@example.com' ? '' : (parsed.email || '');
          return { full_name: cleanName, email: cleanEmail };
        }
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('caretrack_appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a) => a.id !== 'sample-app-1' && a.id !== 'sample-app-2');
        }
      }
    } catch (e) {
      console.error('Failed reading cached appointments', e);
    }
    return INITIAL_APPOINTMENTS;
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    try {
      const saved = localStorage.getItem('caretrack_medicines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((m) => m.id !== 'sample-med-1' && m.id !== 'sample-med-2');
        }
      }
    } catch (e) {
      console.error('Failed reading cached medicines', e);
    }
    return INITIAL_MEDICINES;
  });

  const [loading, setLoading] = useState(false);
  const alertedRef = useRef<Set<string>>(new Set());

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('caretrack_appointments', JSON.stringify(appointments));
    } catch (e) {
      console.error('Failed saving appointments to cache', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('caretrack_medicines', JSON.stringify(medicines));
    } catch (e) {
      console.error('Failed saving medicines to cache', e);
    }
  }, [medicines]);

  useEffect(() => {
    try {
      localStorage.setItem('caretrack_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed saving profile to cache', e);
    }
  }, [profile]);

  // Fetch from database if configured
  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setLoading(true);
    try {
      // 1. Fetch appointments
      const { data: appsData, error: appsError } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (!appsError && appsData && appsData.length > 0) {
        setAppointments(appsData as Appointment[]);
      }

      // 2. Fetch medicines
      const { data: medsData, error: medsError } = await supabase
        .from('medicines')
        .select('*')
        .order('created_at', { ascending: false });

      if (!medsError && medsData && medsData.length > 0) {
        setMedicines(medsData as Medicine[]);
      }

      // 3. Fetch profile if available
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (!profError && profData && profData.length > 0 && profData[0].full_name) {
        const fetchedName = profData[0].full_name === 'Sarah Jenkins' ? '' : profData[0].full_name;
        if (fetchedName) {
          setProfile((prev) => ({
            ...prev,
            full_name: fetchedName,
            email: profData[0].email || prev.email,
          }));
        }
      }
    } catch (err) {
      console.error('Exception fetching database records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Profile update
  const updateProfileName = async (name: string, email?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedProfile: Profile = {
        ...profile,
        full_name: name,
        email: email !== undefined ? email : profile.email,
      };
      setProfile(updatedProfile);

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('profiles')
            .upsert({
              id: patientId,
              full_name: name,
              email: updatedProfile.email,
            });
        } catch (dbErr) {
          console.warn('Could not sync profile update to remote database:', dbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Failed to update profile settings.' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut().catch((err) => {
          console.warn('Supabase sign out error:', err);
        });
      }
    } catch (e) {
      console.warn('Sign out exception:', e);
    }
    try {
      localStorage.removeItem('caretrack_profile');
      sessionStorage.removeItem('caretrack_ai_chat');
    } catch {}
    setProfile(DEFAULT_PROFILE);
  };

  // Appointment CRUD
  const addAppointment = async (appData: Omit<Appointment, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `app-${Date.now()}`;

    const newAppointment: Appointment = {
      ...appData,
      id: generatedId,
      user_id: patientId,
      created_at: new Date().toISOString(),
    };

    // Update locally immediately
    setAppointments((prev) =>
      [...prev, newAppointment].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    );

    // Create in-app reminder in the notification bell
    sendNotification(
      `Appointment Scheduled: Dr. ${appData.doctor_name}`,
      `Upcoming consultation with Dr. ${appData.doctor_name}${appData.specialty ? ` (${appData.specialty})` : ''} on ${appData.date} at ${appData.time.slice(0, 5)}. Reminder set for ${appData.reminder_time}.`,
      'appointment',
      generatedId
    );

    // Sync to database if available
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            ...appData,
            user_id: patientId,
          })
          .select()
          .single();

        if (!error && data) {
          setAppointments((prev) =>
            prev.map((item) => (item.id === generatedId ? (data as Appointment) : item))
          );
        } else if (error) {
          console.warn('Database sync notice for appointment:', error.message);
        }
      } catch (dbErr) {
        console.warn('Failed remote appointment insert:', dbErr);
      }
    }

    success('Appointment scheduled successfully.');
    return true;
  };

  const updateAppointment = async (id: string, appData: Partial<Appointment>): Promise<boolean> => {
    setAppointments((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, ...appData } : item))
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    );

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update(appData)
          .eq('id', id);

        if (error) {
          console.warn('Database update notice:', error.message);
        }
      } catch (dbErr) {
        console.warn('Failed remote appointment update:', dbErr);
      }
    }

    success('Appointment updated.');
    return true;
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    setAppointments((prev) => prev.filter((item) => item.id !== id));

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Database delete notice:', error.message);
        }
      } catch (dbErr) {
        console.warn('Failed remote appointment delete:', dbErr);
      }
    }

    success('Appointment removed.');
    return true;
  };

  const toggleAppointmentStatus = async (id: string, currentStatus: Appointment['status']): Promise<boolean> => {
    const newStatus: Appointment['status'] = currentStatus === 'completed' ? 'upcoming' : 'completed';
    const ok = await updateAppointment(id, { status: newStatus });
    if (ok) {
      success(newStatus === 'completed' ? 'Appointment marked as completed.' : 'Appointment marked as upcoming.');
    }
    return ok;
  };

  // Medicine CRUD
  const addMedicine = async (medData: Omit<Medicine, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `med-${Date.now()}`;

    const newMedicine: Medicine = {
      ...medData,
      id: generatedId,
      user_id: patientId,
      created_at: new Date().toISOString(),
    };

    setMedicines((prev) => [newMedicine, ...prev]);

    // Create in-app reminder in the notification bell
    const timesList = Array.isArray(medData.times) && medData.times.length > 0 
      ? medData.times.join(', ') 
      : 'daily schedule';
    sendNotification(
      `Medicine Added: ${medData.name}`,
      `Schedule set for ${medData.name}${medData.dosage ? ` (${medData.dosage})` : ''} at ${timesList}. Medication reminders are active.`,
      'medicine',
      generatedId
    );

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('medicines')
          .insert({
            ...medData,
            user_id: patientId,
          })
          .select()
          .single();

        if (!error && data) {
          setMedicines((prev) =>
            prev.map((item) => (item.id === generatedId ? (data as Medicine) : item))
          );
        } else if (error) {
          console.warn('Database sync notice for medicine:', error.message);
        }
      } catch (dbErr) {
        console.warn('Failed remote medicine insert:', dbErr);
      }
    }

    success('Medicine added to your schedule.');
    return true;
  };

  const updateMedicine = async (id: string, medData: Partial<Medicine>): Promise<boolean> => {
    setMedicines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...medData } : item))
    );

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('medicines')
          .update(medData)
          .eq('id', id);

        if (error) {
          console.warn('Database update notice:', error.message);
        }
      } catch (dbErr) {
        console.warn('Failed remote medicine update:', dbErr);
      }
    }

    success('Medicine updated.');
    return true;
  };

  const deleteMedicine = async (id: string): Promise<boolean> => {
    setMedicines((prev) => prev.filter((item) => item.id !== id));

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('medicines')
          .delete()
          .eq('id', id);

        if (error) {
          console.warn('Database delete notice:', error.message);
        }
      } catch (dbErr) {
        console.warn('Failed remote medicine delete:', dbErr);
      }
    }

    success('Medicine deleted.');
    return true;
  };

  const setMedicineStatus = async (id: string, status: MedicineStatus): Promise<boolean> => {
    const ok = await updateMedicine(id, { status });
    if (ok) {
      if (status === 'taken') success('Marked medicine as taken.');
      else if (status === 'skipped') success('Marked medicine as skipped.');
      else if (status === 'stopped') success('Medicine marked as stopped.');
      else if (status === 'active') success('Medicine reactivated.');
    }
    return ok;
  };

  // Background reminder checker for appointments and medicines
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayDateStr = now.toISOString().split('T')[0];
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // 1. Check today's active medicines
      medicines.forEach((med) => {
        if (med.status !== 'active') return;
        const times = Array.isArray(med.times) ? med.times : [];

        times.forEach((timeStr) => {
          const formattedMedTime = timeStr.slice(0, 5);
          const reminderKey = `med-${med.id}-${todayDateStr}-${formattedMedTime}`;

          if (formattedMedTime === currentTimeStr && !alertedRef.current.has(reminderKey)) {
            alertedRef.current.add(reminderKey);
            sendNotification(
              `Medicine Reminder: ${med.name}`,
              `It's ${formattedMedTime}. Time to take your scheduled dose (${med.dosage || 'prescribed amount'}).`,
              'medicine',
              med.id
            );
          }
        });
      });

      // 2. Check upcoming appointments
      appointments.forEach((app) => {
        if (app.status !== 'upcoming' || app.date !== todayDateStr) return;

        const appTimeStr = app.time.slice(0, 5);
        const [appH, appM] = appTimeStr.split(':').map(Number);
        const appDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), appH, appM);

        const diffMinutes = Math.round((appDateTime.getTime() - now.getTime()) / (1000 * 60));

        let shouldAlert = false;
        let alertReason = '';

        if (app.reminder_time === '10 minutes before' && diffMinutes >= 8 && diffMinutes <= 11) {
          shouldAlert = true;
          alertReason = 'in 10 minutes';
        } else if (app.reminder_time === '30 minutes before' && diffMinutes >= 28 && diffMinutes <= 31) {
          shouldAlert = true;
          alertReason = 'in 30 minutes';
        } else if (app.reminder_time === '1 hour before' && diffMinutes >= 58 && diffMinutes <= 61) {
          shouldAlert = true;
          alertReason = 'in 1 hour';
        } else if (diffMinutes >= 0 && diffMinutes <= 2) {
          shouldAlert = true;
          alertReason = 'now';
        }

        const reminderKey = `app-${app.id}-${todayDateStr}-${alertReason}`;
        if (shouldAlert && !alertedRef.current.has(reminderKey)) {
          alertedRef.current.add(reminderKey);
          sendNotification(
            `Appointment Reminder: ${app.doctor_name}`,
            `Your appointment with Dr. ${app.doctor_name} (${app.specialty || 'General'}) is ${alertReason} at ${appTimeStr}.`,
            'appointment',
            app.id
          );
        }
      });
    };

    // Run check immediately and then every 30 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 30000);

    return () => clearInterval(interval);
  }, [medicines, appointments, sendNotification]);

  return (
    <DataContext.Provider
      value={{
        appointments,
        medicines,
        profile,
        loading,
        refreshData,
        updateProfileName,
        signOut,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        toggleAppointmentStatus,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        setMedicineStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
