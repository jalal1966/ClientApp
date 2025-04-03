import { Patients } from './patient.model';
import { User } from './user';

// Interfaces for the medical records system
export interface MedicalRecord {
  // Record identifiers
  id?: number;
  patientId: number;
  userID: number;

  // Basic record info
  recordDate: Date;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;

  // Follow-up information
  isFollowUpRequired: boolean;
  followUpDate?: Date;

  // Physical information
  height: number;
  weight: number;
  bMI: number;
  bloodType: string;

  // Medical history
  chronicConditions: string;
  surgicalHistory: string;
  socialHistory: string;
  familyMedicalHistory: string;

  // Related entities - typically used for join operations
  patient?: Patients;
  user?: User;
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
