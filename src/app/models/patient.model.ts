import { AppComponent } from '../app.component';
import {
  Allergy,
  LabResult,
  Medication,
  VisitSummary,
} from './medicalRecord.model';

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

export interface PatientDetail extends Patients {
  socialHistory: string;
  familyMedicalHistory: string;
  surgicalHistory: string;
  chronicConditions: string;
  genderName: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: string;
  allergies?: Allergy[];
  currentMedications: Medication[];
  recentVisits: VisitSummary[];
  recentLabResults?: LabResult[];
  appointment?: AppComponent;
}
