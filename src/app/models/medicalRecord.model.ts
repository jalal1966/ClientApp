import { Patients } from './patient.model';
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
  recentLabResults: LabResult[];
  immunizations?: Immunization[];
  labResults?: LabResult[];
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

export interface LabResult {
  id: number;
  patientId: number;
  testDate?: Date;
  testName?: string;
  result?: string;
  referenceRange?: string;
  orderingProvider?: string;
  notes?: string;
  medicalRecordId: number;
}
export interface Immunization {
  id: number;
  patientId: number;
  medicalRecordId: number;
  vaccineName: string;
  administrationDate: string;
  lotNumber?: string;
  administeringProvider?: string;
  nextDoseDate: string;
  manufacturer?: string;
}
