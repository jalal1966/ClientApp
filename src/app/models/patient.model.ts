import { AppComponent } from '../app.component';
import { Allergy, LabResult, MedicalRecord } from './medicalRecord.model';
import { Medication, Visit } from './visits.model';

export interface Patients {
  id?: number;
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
}

export interface PatientDetail {
  roomNumber: string;
  bedNumber: string;
  dateOfBirth: Date;
  primaryDiagnosis: string;
  admissionDate: Date;
  profileImageUrl?: string;
  // Medical history specific to the patient
  //familyMedicalHistory: string;
  //socialHistory: string;

  // Related medical information
  //  medicalConditions?: MedicalCondition[];
  medicalRecord: MedicalRecord;

  // to do

  appointment?: AppComponent;

  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalCondition {
  id: number;
  name: string;
  diagnosedDate: Date;
  notes?: string;
  status: 'active' | 'resolved' | 'managed';
}
