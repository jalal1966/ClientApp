// task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientTask } from '../../models/patient-task.model';
import { TaskStatus } from '../../models/enums.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTasks(nurseId: number): Observable<PatientTask[]> {
    return this.http.get<PatientTask[]>(`${this.apiUrl}/nurse/${nurseId}`);
  }

  getTasksByPatient(patientId: number): Observable<PatientTask[]> {
    return this.http.get<PatientTask[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  createTask(task: Omit<PatientTask, 'id'>): Observable<PatientTask> {
    return this.http.post<PatientTask>(this.apiUrl, task);
  }

  updateTaskStatus(
    taskId: number,
    status: TaskStatus
  ): Observable<PatientTask> {
    return this.http.patch<PatientTask>(`${this.apiUrl}/${taskId}/status`, {
      status,
    });
  }

  updateTask(task: PatientTask): Observable<PatientTask> {
    return this.http.put<PatientTask>(`${this.apiUrl}/${task.id}`, task);
  }

  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
  }
}
