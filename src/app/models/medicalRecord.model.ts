import { Patients } from './patient.model';
import { User } from './user';
import { Visit } from './visits.model';

// Interfaces for the medical records system
export interface MedicalRecord {
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
  orderedBy: any;
  tests: any;
  date: string | number | Date;
  id?: number;
  testDate?: Date;
  testName?: string;
  result?: string;
  referenceRange?: string;
  orderingProvider?: string;
  notes?: string;
  patientId?: number;
}
export interface Immunization {
  id: number;
  patientId: number;
  vaccineName: string;
  administrationDate: Date;
  lotNumber: string;
  administeringProvider: string;
  manufacturer: string;
}
