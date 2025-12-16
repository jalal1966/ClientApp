import { User } from './user';
import { Visit } from './visits.model';

// Interfaces for the medical records system
export interface MedicalRecord {
  followUpDate: any;
  isFollowUpRequired: boolean;

  // Record identifiers
  id?: number;
  patientId: number;
  userID: number;
  recordDate?: Date;

  recentVisits: Visit[];

  // Physical information
  height: number;
  weight: number;
  bmi: number;
  bloodType: string;

  // Medical history
  chronicConditions: string;
  surgicalHistory: string;
  socialHistory: string;
  familyMedicalHistory: string;

  // Related entities - typically used for join operations

  user?: User;
  allergies: Allergy[];

  immunizations?: Immunization[];
  labResults?: LabResult[];
  pressure?: Pressure[];
}

export interface Pressure {
  id?: number;
  patientId: number;
  medicalRecordId: number;
  systolicPressure: number | null;
  diastolicPressure: number | null;
  bloodPressureRatio: number | null;
  isBloodPressureNormal: boolean;
  createdAt?: Date;
  updatedAt?: Date | null;
}
export interface Allergy {
  id?: number;
  patientId: number;
  medicalRecordId?: number;
  allergyType: string;
  name: string;
  reaction: string;
  severity: string;
  dateIdentified: Date;
}

export interface LabResult {
  id?: number;
  patientId: number;
  medicalRecordId?: number;
  testDate: Date;
  testName: string;
  result: string;
  referenceRange?: string;
  orderingProvider?: string;
  notes?: string;
}

export interface Immunization {
  id: number;
  patientId: number;
  medicalRecordId: number;
  vaccineName: string;
  administrationDate: string;
  lotNumber?: string;
  administeringProvider: string;
  nextDoseDate: string;
  manufacturer?: string;
}

export interface Medicine {
  id?: number;
  name: string;
  packaging?: string;
  company?: string;
  composition?: string;
  note?: string;
}

export interface ImportResult {
  added: number;
  duplicates: number;
}

// Update in medicine.service.ts
export interface MedicineCheckResult {
  exists: boolean;
  message: string;
  existingMedicineId?: number;
  createdMedicineId?: number;
}
