// src/app/components/appointment/appointment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormControl,
  FormBuilder,
} from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
} from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { StatusFilterComponent } from '../shared/status-filter/status-filter.component';
import { Patients } from '../../../models/patient.model';
import { User } from '../../../models/user';
import {
  AppointmentStatus,
  AppointmentType,
} from '../../../models/enums.model';
import { FilterService } from '../../../services/filterService/filter.service';
import { WaitingPatient } from '../../../models/waiting.model';
import { PatientService } from '../../../services/patient/patient.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UsersService } from '../../../services/usersService/users.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    StatusFilterComponent,
  ],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
})
export class AppointmentComponent implements OnInit {
  filterStatuses(arg0: string): any {
    throw new Error('Method not implemented.');
  }
  // Form for new appointments
  appointmentForm!: FormGroup;
  appointments: Appointment[] = [];
  selectedStatus: string = 'all';
  showNewAppointmentForm: boolean = false;
  patients: Patients[] = [];
  filteredPatients: Patients[] = [];
  doctors: User[] = [];
  loading = true;
  currentUser: User | null = null;
  refreshInterval: any;
  patientForm!: FormGroup;
  error = '';

  // Then update your appointment form initialization to use these enums
  appointmentTypes = [
    { value: AppointmentType.CheckUp, label: 'CheckUp' },
    { value: AppointmentType.FollowUp, label: 'FollowUp' },
    { value: AppointmentType.Consultation, label: 'Consultation' },
    { value: AppointmentType.Emergency, label: 'Emergency' },
    { value: AppointmentType.Vaccination, label: 'Vaccination' },
    { value: AppointmentType.Procedure, label: 'Procedure' },
    { value: AppointmentType.Regular, label: 'Regular' },
    { value: AppointmentType.Urgent, label: 'Urgent' },
  ];

  appointmentStatuses = [
    { value: AppointmentStatus.Scheduled, label: 'Scheduled' },
    { value: AppointmentStatus.Confirmed, label: 'Confirmed' },
    { value: AppointmentStatus.Waiting, label: 'Waiting' },
    { value: AppointmentStatus.InProgress, label: 'InProgress' },
    { value: AppointmentStatus.Completed, label: 'Completed' },
    { value: AppointmentStatus.CheckedIn, label: 'Checked In' },
    { value: AppointmentStatus.Cancelled, label: 'Cancelled' },
    { value: AppointmentStatus.NoShow, label: 'NoShow' },
  ];

  private originalScheduleNewAppointment: (() => void) | undefined; // Add this property to store the original implementation
  constructor(
    private filterService: FilterService,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private docorsService: AuthService,
    private usersService: UsersService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Initialize data
    this.filterService.setWaitingPatients([]);
    this.filterService.setAppointments(this.appointments);
    this.filterService.setPatients(this.patients);
  }
  ngOnInit(): void {
    this.Initializing();
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();

    // Store the original implementation
    if (this.originalScheduleNewAppointment) {
      this.scheduleNewAppointment = this.originalScheduleNewAppointment;
    }

    // Refresh every minute to update wait times
    this.refreshInterval = setInterval(() => {
      // this.updateWaitTimes();
      this.loadAppointments();
      this.Initializing();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
  // Initialize the appointment form in ngOnInit or in a dedicated method
  initializeAppointmentForm(): void {
    this.appointmentForm = this.fb.group({
      patientId: [null, Validators.required],
      doctorId: [null, Validators.required],
      appointmentDate: [
        new Date().toISOString().split('T')[0],
        Validators.required,
      ],
      appointmentTime: ['09:00', Validators.required],
      appointmentType: [null, Validators.required],
      appointmentStatus: ['Scheduled', Validators.required],
      notes: [''],
    });
  }

  Initializing(): void {
    this.initializeForm(); // Ensure form is initialized before using it
    this.initializeAppointmentForm();
    // this.initializeForm();
    // Get current user (nurse) from AuthService

    this.usersService.loadCurrentUserAndPatchForm(this.patientForm);
  }
  initializeForm(): void {
    this.patientForm = this.fb.group({
      nursName: ['', Validators.required],
    });
  }

  scheduleAppointment(patientId: number | undefined): void {
    console.log('Scheduling appointment for patient ID', patientId);
    this.showNewAppointmentForm = true;
    // In a real application, this would pre-select the patient in the form
  }
  // Then update your scheduleNewAppointment method
  scheduleNewAppointment(): void {
    if (this.appointmentForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.appointmentForm.controls).forEach((key) => {
        const control = this.appointmentForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValues = this.appointmentForm.value;

    // Create ISO string date directly
    const dateStr = formValues.appointmentDate; // "2025-03-22"
    const timeStr = formValues.appointmentTime; // "09:00"
    const startTimeISO = `${dateStr}T${timeStr}:00.000Z`;

    // Calculate end time (30 min later)
    const startDate = new Date(startTimeISO);
    const endTimeISO = new Date(startDate.getTime() + 30 * 60000).toISOString();

    // Get patient and doctor data
    const patient = this.patients.find((p) => p.id === formValues.patientId);
    const doctor = this.doctors.find((d) => d.userID === formValues.doctorId);

    if (!patient || !doctor) {
      this.error = 'Invalid patient or doctor selection';
      return;
    }

    // Create appointment object with ISO string dates
    const appointment: AppointmentCreate = {
      patientId: formValues.patientId,
      providerId: formValues.doctorId,
      startTime: startTimeISO,
      endTime: endTimeISO,
      type: formValues.appointmentType.value.toString(),
      status: formValues.appointmentStatus.value.toString(),
      notes: formValues.notes || '',
    };

    console.log('appointment', appointment);
    // Call your service to create appointment
    this.appointmentService.createAppointment(appointment).subscribe({
      next: (newAppointment) => {
        console.log('Appointment created successfully:', newAppointment);
        this.loadAppointments();
        this.showNewAppointmentForm = false;
        this.appointmentForm.reset({
          appointmentDate: new Date().toISOString().split('T')[0],
          appointmentTime: '09:00',
          appointmentStatus: 'Scheduled',
        });
        // Clear any previous errors
        this.error = '';
      },
      error: (err) => {
        console.error('Error creating appointment:', err);

        // Check for specific time slot unavailability error
        if (err.error && err.error.includes('time slot is not available')) {
          this.error =
            'The requested time slot is not available. Please choose another time.';
        } else {
          // Generic error for other types of failures
          this.error = 'Failed to schedule appointment. Please try again.';
        }

        // Optional: you might want to add a method to show an alert
        this.showErrorAlert(this.error);
      },
    });
  }

  showErrorAlert(message: string): void {
    // Example using Angular Material snackbar
    // this.snackBar.open(message, 'Close', { duration: 5000 });

    // Or using a custom alert method
    alert(message);
  }

  onStatusChange(status: string) {
    this.filterService.setSelectedStatus(status);
    // Get filtered waiting patients
    //const waitingPatients = this.filterService.filterStatuses('waiting');
    // Or get filtered appointments
    const appointments = this.filterService.filterStatuses('appointments');
    return appointments;
  }

  onSearch(event: Event): void {
    this.filteredPatients = this.filterService.filterPatients(event);
  }

  updateStatus(
    patientOrId: WaitingPatient | number,
    newStatus: 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow'
  ): void {
    let appointmentId: number | undefined;

    // Determine the appointment ID based on input type
    if (typeof patientOrId === 'number') {
      appointmentId = patientOrId;
    } else if ('appointment' in patientOrId) {
      appointmentId = patientOrId.appointment.id;
      patientOrId.appointment!.status = newStatus; // Update status for UI
    }

    if (appointmentId !== undefined) {
      const statusValue = this.findAppointmentStatus(newStatus);
      console.log(
        `Updating status to ${newStatus} for appointment ID: ${appointmentId}`
      );
      this.doUpdateStatus(appointmentId, statusValue.toString());
    } else {
      console.error('Invalid appointment data!');
    }
  }

  doUpdateStatus(value1: number | undefined, value2: string): void {
    this.appointmentService.updateAppointmentStatus(value1!, value2).subscribe({
      next: () => {
        // Reload UI data
        this.loadAppointments();
        //this.loadWaitingList();
        //this.loadDoctors();
      },
      error: (err: any) => {
        console.error('Error updating status:', err);
      },
    });
  }

  // ToDo Update date Appointment and Time
  updateAppointment(appointment: Appointment): void {
    // Show the form for editing
    this.showNewAppointmentForm = true;

    // Find the patient and doctor in the collections
    const patient = this.patients.find((p) => p.id === appointment.patientId);
    const doctor = this.doctors.find(
      (d) => d.userID === appointment.providerId
    );

    // Find the appointment type and status in the collections
    const appointmentType = this.appointmentTypes.find(
      (t) => t.value.toString() === appointment.type
    );
    const appointmentStatus = this.appointmentStatuses.find(
      (s) => s.value.toString() === appointment.status
    );

    // Extract date and time from startTime
    const startDate = new Date(appointment.startTime);
    const formattedDate = startDate.toISOString().split('T')[0];
    const formattedTime = startDate.toTimeString().slice(0, 5);

    // Populate the form with existing appointment data
    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      doctorId: appointment.providerId,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      appointmentType: appointmentType || null,
      appointmentStatus: appointmentStatus || null,
      notes: appointment.notes || '',
    });

    // Store the appointment ID for update operation
    const appointmentId = appointment.id;

    // Create a new method for handling updates
    this.scheduleNewAppointment = () => {
      this.updateExistingAppointment(appointmentId);
    };
  }

  // Add this new method to handle appointment updates
  updateExistingAppointment(appointmentId: number): void {
    if (this.appointmentForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.appointmentForm.controls).forEach((key) => {
        const control = this.appointmentForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValues = this.appointmentForm.value;

    // Create ISO string date directly
    const dateStr = formValues.appointmentDate;
    const timeStr = formValues.appointmentTime;
    const startTimeISO = `${dateStr}T${timeStr}:00.000Z`;

    // Calculate end time (30 min later)
    const startDate = new Date(startTimeISO);
    const endTimeISO = new Date(startDate.getTime() + 30 * 60000).toISOString();

    // Create appointment object with ISO string dates
    const updatedAppointment: AppointmentUpdate = {
      patientId: formValues.patientId,
      providerId: formValues.doctorId,
      startTime: startTimeISO,
      endTime: endTimeISO,
      type: formValues.appointmentType.value.toString(),
      status: formValues.appointmentStatus.value.toString(),
      notes: formValues.notes || '',
    };

    // Call service to update appointment
    this.appointmentService
      .updateAppointment(appointmentId, updatedAppointment)
      .subscribe({
        next: () => {
          console.log('Appointment updated successfully');
          this.loadAppointments();
          this.showNewAppointmentForm = false;
          // Reset the scheduleNewAppointment method to its original implementation
          if (this.originalScheduleNewAppointment) {
            this.scheduleNewAppointment = this.originalScheduleNewAppointment;
          }
        },
        error: (err) => {
          console.error('Error updating appointment:', err);
          if (err.error && err.error.includes('time slot is not available')) {
            this.error =
              'The requested time slot is not available. Please choose another time.';
          } else {
            this.error = 'Failed to update appointment. Please try again.';
          }
          this.showErrorAlert(this.error);
        },
      });
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        console.log('this.patients', this.patients);
        this.filteredPatients = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load patients. Please try again.';
        this.loading = false;
      },
    });
  }

  loadDoctors(): void {
    // In a real application, this would be an API call
    this.loading = true;
    this.docorsService.getCurrentUserByJop(1).subscribe({
      next: (data) => {
        this.doctors = data || [];
        //this.filteredPatients = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load Doctors. Please try again.';
        this.loading = false;
      },
    });
    //this.doctors;
  }

  loadAppointments(): void {
    this.selectedStatus = 'All';
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.filterService.setAppointments(this.appointments); // Add this line
        this.loading = false;
        console.log('Appointments Loaded:', this.appointments);
      },
      error: (err) => {
        this.error = 'Failed to load appointments';
        this.loading = false;
        console.error(err);
      },
    });
  }

  openPatientRecord(appointments: Appointment): void {
    console.log('Opening patient record for');

    if (appointments?.patientId) {
      this.router.navigate([
        '/patients',
        appointments.patientId,
        'medical-records',
      ]);
    }
    // In a real application, this would navigate to the patient's record
  }

  findAppointmentStatus(status: string): AppointmentStatus | 'Not Found' {
    return (
      this.appointmentStatuses.find((item) => item.label === status)?.value ||
      'Not Found'
    );
  }
  cancelAppointment(appointmentId: number | undefined): void {
    console.log('Scheduling appointment for appointment ID', appointmentId);
    const statusValue = '6';
    this.doUpdateStatus(appointmentId, statusValue.toString());
  }

  viewPatientDetails(id: number | undefined): void {
    console.log('Viewing details for patient ID', id);
    // In a real application, this would navigate to patient details
  }

  editPatientDetails(id: number | undefined): void {
    console.log('Editing patient ID', id);
    // In a real application, this would open a form to edit patient details
  }

  /*appointments: Appointment[] = [];
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
  }*/
}
