export interface Profile {
  id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  created_at?: string;
}

export type AppointmentReminder =
  | 'none'
  | '10 minutes before'
  | '30 minutes before'
  | '1 hour before'
  | '1 day before';

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  user_id?: string;
  doctor_name: string;
  specialty: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or HH:mm:ss
  location: string | null;
  notes: string | null;
  status: AppointmentStatus;
  reminder_time: AppointmentReminder;
  created_at?: string;
}

export type MedicineStatus = 'active' | 'taken' | 'skipped' | 'stopped';

export interface Medicine {
  id: string;
  user_id?: string;
  name: string;
  dosage: string | null;
  times: string[];
  status: MedicineStatus;
  notes: string | null;
  created_at?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'medicine' | 'system';
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  disclaimer?: string | null;
  isRefusal?: boolean;
  isConfigError?: boolean;
  timestamp: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'appointments'
  | 'medicines'
  | 'ai-assistant'
  | 'settings';
