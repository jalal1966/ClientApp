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
  assignedToNurseId: number;
  createdByNurseId: number;
  createdDate: Date;
  lastModifiedDate?: Date;
  completedDate?: Date;
  isRecurring: boolean;
  recurringPattern?: string; // e.g., "daily", "every 4 hours"
}
