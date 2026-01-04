// patient-task.model.ts

import { TaskPriority, TaskStatus } from './enums.model';

export interface PatientTask {
  id: number;
  patientId: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date;
  assignedToUserId: number;
  createdByUserId: number;
  createdAt: Date;
  lastModifiedDate?: Date;
  completedDate?: Date;
  isRecurring: boolean;
  recurringPattern?: string; // e.g., "daily", "every 4 hours"
}

// DTOs matching backend - CreatePatientTaskDto should NOT include status
export interface CreatePatientTaskDto {
  patientId: number;
  title: string;
  description?: string;
  priority: number;
  dueDate: Date | string;
  assignedToUserId: number;
  isRecurring: boolean;
  recurringPattern?: string;
  // Note: status is NOT included - backend sets it to NotStarted automatically
  // Note: createdByUserId is taken from JWT token by backend
}

export interface UpdatePatientTaskDto {
  patientId: number;
  title: string;
  description?: string;
  priority: number;
  dueDate: Date | string;
  assignedToUserId: number;
  status: number;
  isRecurring: boolean;
  recurringPattern?: string;
}
