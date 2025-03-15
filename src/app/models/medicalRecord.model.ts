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
}
