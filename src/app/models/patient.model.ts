import { AppComponent } from '../app.component';
import { Allergy, LabResult, MedicalRecord } from './medicalRecord.model';
import { Medication, Visit } from './visits.model';

export interface Patients {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  genderID: number;
  contactNumber: string;
  email: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  insuranceProvider: string;
  insuranceNumber: string;
  address: string;
  nursID: number;
  nursName: string;
  patientDoctorID: number;
  patientDoctorName: string;
  registrationDate: Date;
  patientDetails: PatientDetail;
  lastVisitDate: Date | null; // Changed this to allow null;
  medicalRecord: MedicalRecord;
  appointment?: AppComponent;
}

export interface PatientDetail {
  roomNumber: string;
  bedNumber: string;
  dateOfBirth: Date;
  primaryDiagnosis: string;
  admissionDate: Date;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientBasicInfoUpdate {
  //id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  genderID: number;
  nursID?: number;
  nursName?: string;
  patientDoctorID?: number;
  patientDoctorName?: string;
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
  lastVisitDate?: Date | null;
}

/* export interface MedicalCondition {
  id: number;
  name: string;
  diagnosedDate: Date;
  notes?: string;
  status: 'active' | 'resolved' | 'managed';
} */
