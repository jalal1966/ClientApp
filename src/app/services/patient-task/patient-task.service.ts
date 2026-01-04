import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreatePatientTaskDto,
  PatientTask,
  UpdatePatientTaskDto,
} from '../../models/patient-task.model';
import { environment } from '../../../environments/environment';
import { TaskStatus } from '../../models/enums.model';

@Injectable({
  providedIn: 'root',
})
export class PatientTaskService {
  private apiUrl = `${environment.apiUrl}/api/PatientTasks`;

  constructor(private http: HttpClient) {}

  // Get all tasks
  getAll(): Observable<PatientTask[]> {
    return this.http.get<PatientTask[]>(this.apiUrl);
  }

  // Get task by ID
  getById(id: number): Observable<PatientTask> {
    return this.http.get<PatientTask>(`${this.apiUrl}/${id}`);
  }

  // Get tasks by patient ID
  getByPatient(patientId: number): Observable<PatientTask[]> {
    return this.http.get<PatientTask[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  // Get tasks by assigned user/nurse ID - CORRECTED ENDPOINT
  getTasks(userId: number): Observable<PatientTask[]> {
    return this.http.get<PatientTask[]>(`${this.apiUrl}/assigned/${userId}`);
  }

  // Get overdue tasks
  getOverdueTasks(): Observable<PatientTask[]> {
    return this.http.get<PatientTask[]>(`${this.apiUrl}/overdue`);
  }

  // Create new task - CORRECTED TO USE DTO
  create(dto: CreatePatientTaskDto): Observable<PatientTask> {
    return this.http.post<PatientTask>(this.apiUrl, dto);
  }

  // Update existing task - CORRECTED TO USE DTO
  update(id: number, dto: UpdatePatientTaskDto): Observable<PatientTask> {
    return this.http.put<PatientTask>(`${this.apiUrl}/${id}`, dto);
  }

  // Complete task - USES PATCH ENDPOINT
  completeTask(taskId: number): Observable<PatientTask> {
    return this.http.patch<PatientTask>(
      `${this.apiUrl}/${taskId}/complete`,
      {}
    );
  }

  // Update task status (custom method for in-progress, etc.)
  updateTaskStatus(
    taskId: number,
    status: TaskStatus
  ): Observable<PatientTask> {
    // Get the task first, then update it with new status
    return new Observable((observer) => {
      this.getById(taskId).subscribe({
        next: (task) => {
          const updateDto: UpdatePatientTaskDto = {
            patientId: task.patientId,
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            assignedToUserId: task.assignedToUserId,
            status: status,
            isRecurring: task.isRecurring,
            recurringPattern: task.recurringPattern,
          };

          this.update(taskId, updateDto).subscribe({
            next: (updatedTask) => {
              observer.next(updatedTask);
              observer.complete();
            },
            error: (error) => observer.error(error),
          });
        },
        error: (error) => observer.error(error),
      });
    });
  }

  // Delete task
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
