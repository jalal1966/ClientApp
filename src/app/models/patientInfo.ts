import { Appointment } from './appointment.model';
import { PatientDetail } from './patient.model';

export interface PatientInfo {
  id: number;
  firstName?: string;
  lastName?: string;
  dateOfBirth: Date;
  genderID: number;
  genderName?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  nursID?: number;
  nursName?: string;
  patientDoctorName?: string;
  patientDoctorID?: number;
  registrationDate: Date;
  lastVisitDate?: Date;
  patientDetailDto: PatientDetail;
  appointment: Appointment;
}

export interface ContactInfoUpdate {
  contactNumber?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
}

export interface InsuranceUpdate {
  insuranceProvider?: string;
  insuranceNumber?: string;
}
