import { Patients } from './patient.model';

export interface Visit {
  type: any;
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
  date: Date;
  followUpRequired?: boolean;
  followUpDate?: Date;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    height?: number;
    weight?: number;
    bmi?: number;
  };

  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Diagnosis {
  id: number;
  visitId: number;
  code?: string;
  description?: string;
}

export interface LabResult {
  id: number;
  patientId: number;
  orderedBy: number;
  orderedByName: string;
  orderedDate: Date;
  testType: string;
  completedDate?: Date;
  results?: string;
  attachmentUrl?: string;
  status: 'ordered' | 'in-progress' | 'completed' | 'cancelled';
  normalRange?: string;
  abnormal?: boolean;
  notes?: string;
}
