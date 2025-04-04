import { AppComponent } from '../app.component';
import {
  Allergy,
  LabResult,
  MedicalRecord,
  Medication,
} from './medicalRecord.model';
import { Visit } from './visits.model';

export interface Patients {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  genderID: number;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  insuranceProvider: string;
  insuranceNumber: string;
  nursID: number;
  nursName: string;
  patientDoctorID: number;
  patientDoctorName: string;
  registrationDate: Date;
  patientDetails: PatientDetails;
  lastVisitDate: Date;
}

export interface PatientDetails {
  id?: number;
  PatientId: number;
  firstName: string;
  lastName: string;
  roomNumber: string;
  bedNumber: string;
  dateOfBirth: Date;
  primaryDiagnosis: string;
  admissionDate: Date;
  profileImageUrl?: string;
}

export interface PatientDetail {
  // Basic patient info (from Patients)
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  genderID: number;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  insuranceProvider: string;
  insuranceNumber: string;
  nursID: number;
  nursName: string;
  patientDoctorID: number;
  patientDoctorName: string;
  registrationDate: Date;
  lastVisitDate: Date;

  // Medical history specific to the patient
  familyMedicalHistory: string;
  socialHistory: string;

  // Related medical information
  medicalRecord?: MedicalRecord;
  bloodType?: string;
  bmi: number;
  weight: number;
  allergies?: Allergy[];
  currentMedications?: Medication[];
  recentVisits?: Visit[];
  recentLabResults?: LabResult[];
  appointment?: AppComponent;
}
