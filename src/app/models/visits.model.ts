import { Patients } from './patient.model';

export interface Visit {
  id: number;
  patientId: number;
  visitDate: Date;
  providerName?: string;
  providerId?: number;
  visitType?: string;
  reason?: string;
  assessment?: string;
  plan?: string;
  notes?: string;
  patient?: Patients;
  diagnoses: Diagnosis[];
}

export interface Diagnosis {
  id: number;
  visitId: number;
  code?: string;
  description?: string;
}
