export interface Visit {
  id: number;
  patientId: number;
  medicalRecordId: number;
  visitDate: Date;
  providerName?: string;
  providerId?: number;
  visitType?: string;
  reason?: string;
  assessment?: string;
  diagnosis: Diagnosis[];
  planTreatment?: string;
  medication: Medication[];
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  // UI state properties
  showDiagnosis?: boolean;
  showMedications?: boolean;
  // status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Diagnosis {
  id: number;
  visitId: number;
  diagnosisCode?: string;
  description?: string;
  diagnosisDate: Date;
  isActive: boolean;
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
