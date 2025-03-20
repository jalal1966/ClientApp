import { Patient } from './patient.model';

export interface Appointment {
  [x: string]: any;
  patient: any;
  id: number;
  patientId: number;
  // patient: Patient;
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
}
export interface AppointmentCreate {
  patientId: number;
  providerId: number;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  notes: string;
  type: string;
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
