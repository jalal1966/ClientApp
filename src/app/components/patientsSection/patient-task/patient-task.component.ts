import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';

import {
  CreatePatientTaskDto,
  PatientTask,
  UpdatePatientTaskDto,
} from '../../../models/patient-task.model';
import { Patients } from '../../../models/patient.model';
import { TaskPriority, TaskStatus } from '../../../models/enums.model';
import { PatientTaskService } from '../../../services/patient-task/patient-task.service';
import { PatientService } from '../../../services/patient/patient.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/user';
import { Location } from '@angular/common';

@Component({
  selector: 'app-patient-task',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],

  templateUrl: './patient-task.component.html',
  styleUrls: ['./patient-task.component.scss'],
})
export class PatientTaskComponent implements OnInit {
  tasks: PatientTask[] = [];
  patients: Patients[] = [];
  filteredTasks: PatientTask[] = [];
  filteredPatients: Patients[] = [];
  selectedPatientId: number | null = null;
  currentNurseId: number = 0;
  loading = true;
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  error = '';
  selectedStatus: TaskStatus | null = null;
  selectedPriority: TaskPriority | null = null;

  // New task form - matching CreatePatientTaskDto
  newTask = {
    patientId: 0,
    title: '',
    description: '',
    priority: TaskPriority.Medium,
    dueDate: '',
    assignedToUserId: 0,
    isRecurring: false,
    recurringPattern: 'daily',
  };

  // Edit/View task
  selectedTask: PatientTask | null = null;

  constructor(
    private taskService: PatientTaskService,
    private patientService: PatientService,
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.getAllTasks();

    // Get current user
    this.authService.getCurrentUser().subscribe({
      next: (user: User | null) => {
        if (user && user.userID) {
          this.currentNurseId = user.userID;
          this.newTask.assignedToUserId = user.userID;
        }
      },
      error: (error) => console.error('Error getting current user', error),
    });
  }

  getAllTasks(): void {
    this.loading = true;
    console.log('Fetching all tasks...');
    this.taskService.getAll().subscribe({
      next: (data) => {
        console.log('Tasks received:', data);
        this.tasks = data;
        // Initialize filteredTasks with all tasks
        this.filteredTasks = [...data];
        this.loading = false;
        // Apply filters if any are already set
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error in getAllTasks:', err);
        this.error = 'Failed to load Tasks. Please try again.';
        this.loading = false;
      },
    });
  }

  filterPatients(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm)
    );
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        console.log('Patients loaded:', patients);
      },
      error: (error) => console.error('Error loading patients', error),
    });
  }

  applyFilters(): void {
    console.log('Applying filters...');
    console.log('Selected Patient ID:', this.selectedPatientId);
    console.log('Selected Status:', this.selectedStatus);
    console.log('Selected Priority:', this.selectedPriority);
    console.log('Total tasks:', this.tasks.length);

    // Start with all tasks
    this.filteredTasks = [...this.tasks];

    // Apply patient filter
    if (
      this.selectedPatientId !== null &&
      this.selectedPatientId !== undefined
    ) {
      this.filteredTasks = this.filteredTasks.filter(
        (task) => task.patientId === Number(this.selectedPatientId)
      );
      console.log('After patient filter:', this.filteredTasks.length);
    }

    // Apply status filter
    if (this.selectedStatus !== null && this.selectedStatus !== undefined) {
      this.filteredTasks = this.filteredTasks.filter(
        (task) => task.status === this.selectedStatus
      );
      console.log('After status filter:', this.filteredTasks.length);
    }

    // Apply priority filter
    if (this.selectedPriority !== null && this.selectedPriority !== undefined) {
      this.filteredTasks = this.filteredTasks.filter(
        (task) => task.priority === this.selectedPriority
      );
      console.log('After priority filter:', this.filteredTasks.length);
    }

    console.log('Final filtered tasks:', this.filteredTasks.length);
  }

  // Task status methods
  isTaskCompleted(task: PatientTask): boolean {
    return task.status === TaskStatus.Completed;
  }

  isTaskStartable(task: PatientTask): boolean {
    return task.status === TaskStatus.NotStarted;
  }

  isTaskCompletable(task: PatientTask): boolean {
    return (
      task.status === TaskStatus.InProgress ||
      task.status === TaskStatus.Overdue
    );
  }

  updateTaskStatus(task: PatientTask, newStatus: TaskStatus): void {
    // Use complete endpoint for completed status
    if (newStatus === TaskStatus.Completed) {
      this.taskService.completeTask(task.id).subscribe({
        next: (updatedTask) => {
          const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
            this.applyFilters();
          }
        },
        error: (error) => console.error('Error completing task', error),
      });
    } else {
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
  }

  // Create new task
  createTask(): void {
    // Validation
    if (!this.newTask.patientId || this.newTask.patientId === 0) {
      alert('Please select a patient');
      return;
    }

    if (!this.newTask.title || this.newTask.title.trim() === '') {
      alert('Please enter a task title');
      return;
    }

    if (!this.newTask.dueDate) {
      alert('Please select a due date');
      return;
    }

    // Create DTO matching backend expectations
    const createDto: CreatePatientTaskDto = {
      patientId: this.newTask.patientId,
      title: this.newTask.title,
      description: this.newTask.description || undefined,
      priority: this.newTask.priority,
      dueDate: new Date(this.newTask.dueDate).toISOString(),
      assignedToUserId: this.newTask.assignedToUserId || this.currentNurseId,
      isRecurring: this.newTask.isRecurring,
      recurringPattern: this.newTask.isRecurring
        ? this.newTask.recurringPattern
        : undefined,
    };

    console.log('Creating task with DTO:', createDto);

    this.taskService.create(createDto).subscribe({
      next: (createdTask) => {
        console.log('Task created successfully:', createdTask);
        this.tasks.push(createdTask);
        this.applyFilters();
        this.resetNewTaskForm();
        this.closeModal('newTaskModal');
      },
      error: (error) => {
        console.error('Error creating task:', error);
        alert(
          `Failed to create task: ${
            error.error?.message || error.message || 'Unknown error'
          }`
        );
      },
    });
  }

  // Edit task
  openEditModal(task: PatientTask): void {
    this.selectedTask = { ...task };
  }

  // Update task
  updateTask(): void {
    if (!this.selectedTask) return;

    const updateDto: UpdatePatientTaskDto = {
      patientId: this.selectedTask.patientId,
      title: this.selectedTask.title,
      description: this.selectedTask.description || undefined,
      priority: this.selectedTask.priority,
      dueDate: new Date(this.selectedTask.dueDate).toISOString(),
      assignedToUserId: this.selectedTask.assignedToUserId,
      status: this.selectedTask.status,
      isRecurring: this.selectedTask.isRecurring,
      recurringPattern: this.selectedTask.isRecurring
        ? this.selectedTask.recurringPattern
        : undefined,
    };

    this.taskService.update(this.selectedTask.id, updateDto).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.applyFilters();
        }
        this.closeModal('editTaskModal');
      },
      error: (error) => {
        console.error('Error updating task:', error);
        alert(
          `Failed to update task: ${
            error.error?.message || error.message || 'Unknown error'
          }`
        );
      },
    });
  }

  // View task details
  openViewModal(task: PatientTask): void {
    this.selectedTask = task;
  }

  // Delete task
  deleteTask(taskId: number): void {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.delete(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== taskId);
        this.applyFilters();
      },
      error: (error) => console.error('Error deleting task', error),
    });
  }

  // Helper methods
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

  resetNewTaskForm(): void {
    this.newTask = {
      patientId: 0,
      title: '',
      description: '',
      priority: TaskPriority.Medium,
      dueDate: '',
      assignedToUserId: this.currentNurseId,
      isRecurring: false,
      recurringPattern: 'daily',
    };
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  refreshTasks(): void {
    // Reset all filters to default values
    this.selectedPatientId = null;
    this.selectedStatus = null;
    this.selectedPriority = null;

    this.getAllTasks();
  }
  backClicked() {
    this.location.back();
  }
}
