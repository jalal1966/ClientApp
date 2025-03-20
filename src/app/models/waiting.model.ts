import { Appointment } from './appointment.model';

export interface WaitingPatient {
  appointment: Appointment;
  arrivalTime: Date;
  waitTime: number; // in minutes
  status: string;
  patientFirstName: string;
  patientLastName: string;
}
