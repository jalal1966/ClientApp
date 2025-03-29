// src/app/components/appointment/appointment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  Appointment,
  AppointmentUpdate,
} from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointment/appointment.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
})
export class AppointmentComponent implements OnInit {
  [x: string]: any;
  appointments: Appointment[] = [];
  appointmentForm!: FormGroup;
  appointment: Appointment | null = null;
  loading = true;
  error: string | null = null;
  isEditing = false;
  isNew = false;
  filteredAppointments: Appointment[] = [];

  selectedStatus: string = 'all';

  constructor(
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Determine if we're creating a new appointment or editing an existing one
    this.getAppointments();
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = id === 'new';
    this.isEditing = this.isNew;

    // Initialize the form with default values
    this.initializeForm();

    if (!this.isNew && id) {
      this.loadAppointment(+id);
    } else {
      this.loading = false;
    }
  }

  // Initialize the form with default values or existing appointment data
  initializeForm(): void {
    this.appointmentForm = new FormGroup({
      patientId: new FormControl(this.appointment?.patientId || '', [
        Validators.required,
      ]),
      providerId: new FormControl(this.appointment?.providerId || '', [
        Validators.required,
      ]),
      startTime: new FormControl(
        this.formatDateForInput(this.appointment?.startTime || new Date()),
        [Validators.required]
      ),
      endTime: new FormControl(
        this.formatDateForInput(this.appointment?.endTime || new Date()),
        [Validators.required]
      ),
      type: new FormControl(this.appointment?.type || '', [
        Validators.required,
      ]),
      status: new FormControl(this.appointment?.status || 'Scheduled'),
      notes: new FormControl(this.appointment?.notes || ''),
    });

    // Set form state based on current mode
    this.updateFormControlState();
  }

  // Update form control state based on editing mode
  updateFormControlState(): void {
    const formControls = this.appointmentForm.controls;

    if (this.isEditing) {
      // Enable all fields when editing
      Object.values(formControls).forEach((control) => control.enable());
    } else {
      // Disable all fields when not editing
      Object.values(formControls).forEach((control) => control.disable());
    }
  }

  // Load appointment data from the service
  loadAppointment(id: number): void {
    this.loading = true;
    this.appointmentService.getAppointment(id).subscribe({
      next: (data) => {
        this.appointment = data;

        // Update form with appointment data
        this.appointmentForm.patchValue({
          patientId: data.patientId,
          providerId: data.providerId,
          startTime: this.formatDateForInput(data.startTime),
          endTime: this.formatDateForInput(data.endTime),
          type: data.type,
          status: data.status,
          notes: data.notes,
        });

        // Update form control state
        this.updateFormControlState();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load appointment. Please try again.';
        this.loading = false;
        console.error(err);
      },
    });
  }

  // Format date for datetime-local input
  formatDateForInput(dateValue: string | Date): string {
    if (!dateValue) {
      return '';
    }

    const date =
      typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    // Format date as YYYY-MM-DDThh:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Format date from input to ISO string for API
  formatDateForApi(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toISOString();
  }

  // Toggle edit mode
  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      // When entering edit mode, enable form fields
      this.updateFormControlState();
    } else if (!this.isNew && this.appointment) {
      // When cancelling edit, reset form to original values
      this.appointmentForm.patchValue({
        patientId: this.appointment.patientId,
        providerId: this.appointment.providerId,
        startTime: this.formatDateForInput(this.appointment.startTime),
        endTime: this.formatDateForInput(this.appointment.endTime),
        type: this.appointment.type,
        status: this.appointment.status,
        notes: this.appointment.notes,
      });

      // Update form control state
      this.updateFormControlState();
    }
  }

  // Save appointment (create new or update existing)

  saveAppointment(): void {
    console.log('this.appointmentForm.invalid', this.appointmentForm.invalid);
    if (this.appointmentForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.values(this.appointmentForm.controls).forEach((control) =>
        control.markAsTouched()
      );

      return;
    }

    // Get form values
    const formValue = this.appointmentForm.getRawValue();

    // Ensure dates are in proper string format for API
    const appointmentData = {
      ...formValue,
      startTime: this.formatDateForApi(formValue.startTime),
      endTime: this.formatDateForApi(formValue.endTime),
    };
    console.log('appointmentData', appointmentData);
    this.loading = true;

    if (this.isNew) {
      // Create new appointment
      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (data) => {
          this.router.navigate(['/appointments', data.id]);
          this.loading = false;
        },
        error: (err) => {
          this.error = `Failed to create appointment: ${err.message || err}`;
          this.loading = false;
          console.error(err);
        },
      });
    } else if (this.appointment) {
      // Update existing appointment
      this.appointmentService
        .updateAppointment(this.appointment.id, appointmentData)
        .subscribe({
          next: () => {
            this.loadAppointment(this.appointment!.id);
            this.isEditing = false;
            this.loading = false;
          },
          error: (err) => {
            this.error = `Failed to update appointment: ${err.message || err}`;
            this.loading = false;
            console.error(err);
          },
        });
    }
  }

  // Cancel an appointment
  cancelAppointment(appointment: any): void {
    if (!appointment) return;
    this.appointment = appointment;
    if (!this.appointment) return;
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.loading = true;

      // Create update payload with string dates
      const appointmentData: AppointmentUpdate = {
        patientId: this.appointment.patientId,
        providerId: this.appointment.providerId,
        startTime:
          typeof this.appointment.startTime === 'string'
            ? this.appointment.startTime
            : this.appointment.startTime.toISOString(),
        endTime:
          typeof this.appointment.endTime === 'string'
            ? this.appointment.endTime
            : this.appointment.endTime.toISOString(),
        type: this.appointment.type,
        status: 'Cancelled',
        notes: this.appointment.notes,
      };

      this.appointmentService
        .updateAppointment(this.appointment.id, appointmentData)
        .subscribe({
          next: () => {
            this.loadAppointment(this.appointment!.id);
            this.loading = false;
          },
          error: (err) => {
            this.error = `Failed to cancel appointment: ${err.message || err}`;
            this.loading = false;
            console.error(err);
          },
        });
    }
  }

  // Mark an appointment as completed
  completeAppointment(): void {
    if (!this.appointment) return;

    if (
      confirm('Are you sure you want to mark this appointment as completed?')
    ) {
      this.loading = true;

      // Create update payload with string dates
      const appointmentData: AppointmentUpdate = {
        patientId: this.appointment.patientId,
        providerId: this.appointment.providerId,
        startTime:
          typeof this.appointment.startTime === 'string'
            ? this.appointment.startTime
            : this.appointment.startTime.toISOString(),
        endTime:
          typeof this.appointment.endTime === 'string'
            ? this.appointment.endTime
            : this.appointment.endTime.toISOString(),
        type: this.appointment.type,
        status: 'Completed',
        notes: this.appointment.notes,
      };

      this.appointmentService
        .updateAppointment(this.appointment.id, appointmentData)
        .subscribe({
          next: () => {
            this.loadAppointment(this.appointment!.id);
            this.loading = false;
          },
          error: (err) => {
            this.error = `Failed to complete appointment: ${
              err.message || err
            }`;
            this.loading = false;
            console.error(err);
          },
        });
    }
  }

  // Fetch all appointments
  getAppointments(): void {
    this.loading = true;
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load appointments';
        this.loading = false;
        console.error(err);
      },
    });
  }

  filterAppointments(): Appointment[] {
    console.log('Selected status:', this.selectedStatus);
    const filtered =
      this.selectedStatus === 'all'
        ? this.appointments
        : this.appointments.filter(
            (appointment) => appointment.status === this.selectedStatus
          );
    console.log('Filtered appointments:', filtered);
    return filtered;
  }
}
