import { PatientDetail, Patients } from './patient.model';
import { User } from './user';

export interface MedicalRecord {
  id?: number;
  recordDate: Date;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;
  isFollowUpRequired: boolean;
  followUpDate?: Date;
  patientId: number;
  patient: Patients;
  userID: number;
  user: User;

  Height: number;
  Weight: number;
  bMI: number;
  BloodType: string;
  ChronicConditions: string;
  SurgicalHistory: string;
  patientDetail: PatientDetail;
}

export interface Allergy {
  id?: number;
  patientId: number;
  allergyType: string;
  name: string;
  reaction: string;
  severity: string;
  dateIdentified: Date;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribingProvider: string;
  purpose: string;
}

export interface VisitSummary {
  id: number;
  visitDate: Date;
  providerName: string;
  visitType: string;
  reason: string;
}

export interface LabResult {
  id?: number;
  testDate?: Date;
  testName?: string;
  result?: string;
  referenceRange?: string;
  orderingProvider?: string;
  notes?: string;
  patientId?: number;
}
