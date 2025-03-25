import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientTask } from '../../models/patient-task.model';
import { PatientDetails, Patients } from '../../models/patient.model';
import { TaskService } from '../../services/task/task.service';
import { PatientService } from '../../services/patient/patient.service';
import { AuthService } from '../../services/auth/auth.service';
import { TaskPriority, TaskStatus } from '../../models/enums.model';
import { User } from '../../models/user';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-task-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    //NgbModule,
  ],
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss'],
})
export class TaskDashboardComponent implements OnInit {
  tasks: PatientTask[] = [];
  patients: Patients[] = [];
  patientDetails: PatientDetails[] = [];
  filteredTasks: PatientTask[] = [];
  selectedPatientId: number | null = null;
  currentNurseId: number = 0;

  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  selectedStatus: TaskStatus | null = null;
  selectedPriority: TaskPriority | null = null;

  constructor(
    private taskService: TaskService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  // Method to check if task is completed
  isTaskCompleted(task: PatientTask): boolean {
    return task.status === TaskStatus.Completed;
  }

  // Method to check if task can be started
  isTaskStartable(task: PatientTask): boolean {
    return task.status === TaskStatus.NotStarted;
  }

  // Method to check if task can be completed
  isTaskCompletable(task: PatientTask): boolean {
    return (
      task.status === TaskStatus.InProgress ||
      task.status === TaskStatus.Overdue
    );
  }

  ngOnInit(): void {
    this.authService
      .getCurrentUser()
      .pipe(
        switchMap((user: User | null) => {
          if (user && user.userID) {
            this.currentNurseId = user.userID;
            this.loadTasks();
            return this.patientService.getPatients();
          } else {
            console.error('No user found or invalid user ID');
            return [];
          }
        })
      )
      .subscribe({
        next: (patients) => {
          this.patients = patients;
          this.patientDetails = patients.map((patient) =>
            this.mapToPatientDetails(patient)
          );
        },
        error: (error) => console.error('Error in initialization', error),
      });
    this.loadTasks();
    this.loadPatients();
  }
  // Helper method to map Patients to PatientDetails
  private mapToPatientDetails(patient: Patients): PatientDetails {
    return {
      PatientId: patient.id ?? 0, // Provide a default value if id is undefined
      firstName: patient.firstName,
      lastName: patient.lastName,
      roomNumber: patient.patientDetails.roomNumber ?? 'N/A',
      bedNumber: patient.patientDetails.bedNumber ?? 'N/A',
      dateOfBirth: patient.dateOfBirth ?? new Date(), // Provide a default date if undefined
      primaryDiagnosis:
        patient.patientDetails.primaryDiagnosis ?? 'Not Specified',
      admissionDate: patient.patientDetails.admissionDate ?? new Date(), // Provide a default date if undefined
      // Add any other required properties with default values
    };
  }
  loadTasks(): void {
    this.taskService.getTasks(this.currentNurseId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
      },
      error: (error) => console.error('Error loading tasks', error),
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        // Populate patientDetails for the patient filter dropdown
        this.patientDetails = patients.map((patient) => ({
          PatientId: patient.id ?? 0,
          firstName: patient.firstName,
          lastName: patient.lastName,
          roomNumber: patient.patientDetails?.roomNumber || 'N/A',
          bedNumber: patient.patientDetails?.bedNumber || 'N/A',
          dateOfBirth: patient.patientDetails?.dateOfBirth || new Date(),
          primaryDiagnosis:
            patient.patientDetails?.primaryDiagnosis || 'Not Specified',
          admissionDate: patient.patientDetails?.admissionDate || new Date(),
        }));
      },
      error: (error) => console.error('Error loading patients', error),
    });
  }

  updateTaskStatus(task: PatientTask, newStatus: TaskStatus): void {
    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.applyFilters();
        }
      },
      error: (error) => console.error('Error updating task status', error),
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter((task) => {
      let matches = true;

      if (this.selectedStatus !== null) {
        matches = matches && task.status === this.selectedStatus;
      }

      if (this.selectedPriority !== null) {
        matches = matches && task.priority === this.selectedPriority;
      }

      if (this.selectedPatientId !== null) {
        matches = matches && task.patientId === this.selectedPatientId;
      }

      return matches;
    });
  }

  getPatientName(patientId: number): string {
    const patient = this.patients.find((p) => p.id === patientId);
    return patient
      ? `${patient.firstName} ${patient.lastName}`
      : 'Unknown Patient';
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'bg-success';
      case TaskPriority.Medium:
        return 'bg-info';
      case TaskPriority.High:
        return 'bg-warning';
      case TaskPriority.Critical:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.NotStarted:
        return 'text-secondary';
      case TaskStatus.InProgress:
        return 'text-primary';
      case TaskStatus.Completed:
        return 'text-success';
      case TaskStatus.Overdue:
        return 'text-danger';
      default:
        return '';
    }
  }
}
