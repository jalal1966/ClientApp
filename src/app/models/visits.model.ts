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
