export interface Appointment {
  patients: any;
  id: number;
  patientId: number;
  // patient: Patients;
  patientFirstName?: string;
  patientLastName?: string;
  providerId: number;
  providerFirstName?: string;
  providerLastName?: string;
  startTime: string | Date;
  endTime: string | Date;
  type: string;
  status: string;
  notes: string;
  lastVisitDate: string | Date;
  nextAppointment: string | Date;
}

// First, add this interface to your models if it doesn't exist already
export interface AppointmentCreate {
  patientId: number;
  providerId: number;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  notes?: string;
}

export interface AppointmentUpdate {
  providerId: number;
  patientId: number;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  status: string;
  notes: string;
  type: string;
}

export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'unavailable';
  patient?: string;
}

export interface DaySchedule {
  date: Date;
  slots: AppointmentSlot[];
}

export interface ScheduleSlot {
  time: string;
  appointments: { [providerId: string]: Appointment | null };
  isLunchTime?: boolean; // New property to mark lunch time
}

export interface Provider {
  id: number;
  name: string;
  namePatient?: string;
  lunchStart?: string; // Optional lunch start time
  lunchEnd?: string; // Optional lunch end time
}
