export interface AppointmentDto {
  id: number;
  patientId: number;
  patientName: string;
  providerId: number;
  providerName: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  status: string;
  notes: string;
  type: string;
}

export interface AppointmentCreateDto {
  patientId: number;
  providerId: number;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  notes: string;
  type: string;
}

export interface AppointmentUpdateDto {
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  status: string;
  notes: string;
  type: string;
}
