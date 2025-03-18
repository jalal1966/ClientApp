// src/app/components/appointment/appointment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import {
  AppointmentDto,
  AppointmentCreateDto,
  AppointmentUpdateDto,
} from '../../models/appointment.model';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
})
export class AppointmentComponent implements OnInit {
  appointment: AppointmentDto | null = null;
  appointmentForm: FormGroup;
  isEditing = false;
  isNew = false;
  appointmentId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.appointmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id'] === 'new') {
        this.isNew = true;
        this.isEditing = true;
      } else if (params['id']) {
        this.appointmentId = +params['id'];
        this.loadAppointment(this.appointmentId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      patientId: [null, Validators.required],
      providerId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      notes: [''],
      type: ['', Validators.required],
      status: ['Scheduled'],
    });
  }

  loadAppointment(id: number): void {
    this.loading = true;
    this.appointmentService.getAppointment(id).subscribe({
      next: (data) => {
        this.appointment = data;
        this.appointmentForm.patchValue({
          patientId: data.patientId,
          providerId: data.providerId,
          startTime: this.formatDateForInput(data.startTime),
          endTime: this.formatDateForInput(data.endTime),
          notes: data.notes,
          type: data.type,
          status: data.status,
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading appointment: ' + err.message;
        this.loading = false;
      },
    });
  }

  formatDateForInput(dateString: string): string {
    // Format ISO date string to work with datetime-local input
    return dateString.slice(0, 16);
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.appointment) {
      // Reset form to original values if canceling edit
      this.appointmentForm.patchValue({
        patientId: this.appointment.patientId,
        providerId: this.appointment.providerId,
        startTime: this.formatDateForInput(this.appointment.startTime),
        endTime: this.formatDateForInput(this.appointment.endTime),
        notes: this.appointment.notes,
        type: this.appointment.type,
        status: this.appointment.status,
      });
    }
  }

  saveAppointment(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.appointmentForm.value;

    if (this.isNew) {
      const newAppointment: AppointmentCreateDto = {
        patientId: formValue.patientId,
        providerId: formValue.providerId,
        startTime: new Date(formValue.startTime).toISOString(),
        endTime: new Date(formValue.endTime).toISOString(),
        notes: formValue.notes,
        type: formValue.type,
      };

      this.appointmentService.createAppointment(newAppointment).subscribe({
        next: (result) => {
          this.router.navigate(['/api/appointments', result.id]);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error creating appointment: ' + err.message;
          this.loading = false;
        },
      });
    } else if (this.appointmentId) {
      const updatedAppointment: AppointmentUpdateDto = {
        startTime: new Date(formValue.startTime).toISOString(),
        endTime: new Date(formValue.endTime).toISOString(),
        status: formValue.status,
        notes: formValue.notes,
        type: formValue.type,
      };

      this.appointmentService
        .updateAppointment(this.appointmentId, updatedAppointment)
        .subscribe({
          next: (result) => {
            this.appointment = result;
            this.isEditing = false;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error updating appointment: ' + err.message;
            this.loading = false;
          },
        });
    }
  }

  cancelAppointment(): void {
    if (!this.appointmentId) return;

    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.loading = true;
      this.appointmentService.cancelAppointment(this.appointmentId).subscribe({
        next: (result) => {
          this.appointment = result;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error canceling appointment: ' + err.message;
          this.loading = false;
        },
      });
    }
  }

  completeAppointment(): void {
    if (!this.appointmentId) return;

    if (confirm('Mark this appointment as completed?')) {
      this.loading = true;
      this.appointmentService
        .completeAppointment(
          this.appointmentId,
          this.appointmentForm.value.notes
        )
        .subscribe({
          next: (result) => {
            this.appointment = result;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Error completing appointment: ' + err.message;
            this.loading = false;
          },
        });
    }
  }
}
