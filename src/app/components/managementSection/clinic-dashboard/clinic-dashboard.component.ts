import { Component, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AgePipe } from '../../../pipes/age/age.pipe';
import { GenderPipe } from '../../../pipes/gender/gender.pipe';
import { StatusFilterComponent } from '../../commonSection/shared/status-filter/status-filter.component';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { Patients } from '../../../models/patient.model';
import { User } from '../../../models/user';
import {
  Appointment,
  AppointmentCreate,
} from '../../../models/appointment.model';
import { WaitingPatient } from '../../../models/waiting.model';
import {
  AppointmentStatus,
  AppointmentType,
} from '../../../models/enums.model';
import { PatientService } from '../../../services/patient/patient.service';
import { AuthService } from '../../../services/auth/auth.service';
import { MapComponent } from '../../commonSection/map/map.component';

@Component({
  selector: 'app-clinic-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AgePipe,
    GenderPipe,
    StatusFilterComponent,
    MapComponent,
  ],
  templateUrl: './clinic-dashboard.component.html',
  styleUrl: './clinic-dashboard.component.scss',
})
export class ClinicDashboardComponent implements OnInit {
  error = '';
  patientForm!: FormGroup;
  // Form for new appointments
  appointmentForm!: FormGroup;
  appointmentDoctorsForm!: FormGroup;
  appoment: AppointmentService | undefined;
  loading = true;
  filteredPatients: Patients[] = [];
  activeTab: string = 'waitingList';
  doctors: User[] = [];
  currentUser: User | null = null;
  appointments: Appointment[] = [];
  appointmentsDoctor: Appointment[] = [];

  waitingPatient: WaitingPatient[] = [];

  patients: Patients[] = [];
  searchTerm: string = '';
  showNewAppointmentForm: boolean = false;
  showNewAppointmentDoctorForm: boolean = false;
  showNewPatientForm: boolean = false;
  showNewWitingsForm: boolean = false;
  selectedPatient: number | null = null;
  selectedDoctor: number | null = null;
  // Analytics data
  totalAppointments: number = 148;
  noShowPercentage: number = 8;
  newPatients: number = 24;
  revenue: number = 42500;
  patient!: Patients[] | [];
  selectedStatus: string = 'all';
  refreshInterval: any;
  startTime: Date | undefined;
  endTid: Date | undefined;
  type: any;
  doctorID!: number;

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

  appointment: Appointment | null = null;

  tabs = [
    { key: 'waitingList', label: 'WaitingList' },
    { key: 'appointments', label: 'Appointments' },
    { key: 'mapSchedule', label: 'AppointmentsMap' },
    { key: 'appointmentsDoctor', label: 'Doctor schedule' },
    { key: 'patients', label: 'Patients' },
    { key: 'analytics', label: 'Analytics' },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private patientService: PatientService,
    private docorsService: AuthService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.Initializing();
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();
    this.loadWaitingList();
    // Refresh every minute to update wait times
    this.refreshInterval = setInterval(() => {
      this.loadWaitingList();
      this.updateWaitTimes();
      this.Initializing();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'appointmentsDoctor') {
      this.loadDoctors();
    } else {
      // Clear doctor appointments and reset selection
      this.appointmentsDoctor = [];
      this.selectedDoctor = null;
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
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          console.log('Full user object:', JSON.stringify(user)); // This will show all properties
          console.log('Current user loaded:', user);
          this.currentUser = user;

          // Update form with nurse information
          this.patientForm.patchValue({
            // nursID: user.userID,
            nursName: `${user.firstName} ${user.lastName}`,
          });

          // Now fetch doctor info after we have user info
          // this.loadDoctorInformation();
        }
      },
      error: (err) => {
        console.error('Error getting current user:', err);
        this.error = 'Failed to load user information';
      },
    });
  }
  initializeForm(): void {
    this.patientForm = this.fb.group({
      nursName: ['', Validators.required],
    });
  }

  openMap(): void {
    this.router.navigate(['/doctor-map']);
    //this.router.navigate(['/doctor-schedule']);
  }

  loadAppointments(): void {
    this.selectedStatus = 'All';
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
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

  loadAppointmentsDoctor(value: number | null): void {
    if (!value) return; // Prevent API call if no doctor is selected

    this.selectedStatus = 'All';
    this.loading = true;

    this.appointmentService.getAppointmentsByProvider(value).subscribe({
      next: (appointments) => {
        this.appointmentsDoctor = appointments;
        this.loading = false;
        console.log('Appointments Loaded:', this.appointmentsDoctor);
      },
      error: (err) => {
        this.error = 'Failed to load appointments Doctor';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onDoctorSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value ? +selectElement.value : null;
    this.loadAppointmentsDoctor(value);
  }

  loadWaitingList(): void {
    this.loading = true;
    const today = new Date();
    const tomorrow = new Date();
    this.selectedStatus = 'All';
    tomorrow.setDate(today.getDate() + 1);

    // Format dates as ISO strings for the API call
    const formattedStartDate = today.toISOString();
    const formattedEndDate = tomorrow.toISOString();

    this.appointmentService
      .getAppointmentsByDateRange(formattedStartDate, formattedEndDate)
      .subscribe({
        next: (appointments) => {
          // Filter to only include today's confirmed appointments
          const todaysAppointments = appointments.filter((app) => {
            const appDate = new Date(app.startTime);
            return (
              appDate.toDateString() === today.toDateString() &&
              app.status !== 'Cancelled' &&
              app.status !== 'NoShow'
            );
          });

          console.log('Filtered appointments:', todaysAppointments);

          // Map appointments to waiting patients
          this.waitingPatient = todaysAppointments.map((app) => ({
            appointment: app,
            arrivalTime: new Date(app.startTime),
            waitTime: this.calculateWaitTime(new Date(app.startTime)),
            status: 'waiting', // Default status
            patientFirstName: app.patientFirstName || '', // Access directly from appointment
            patientLastName: app.patientLastName || '', // Access directly from appointment
          }));

          console.log('Waiting patients created:', this.waitingPatient);
          this.updateWaitTimes();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load appointments. Please try again later.';
          this.loading = false;
        },
      });
  }

  calculateWaitTime(arrivalTime: Date): number {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - arrivalTime.getTime()) / 60000
    );
    return diffInMinutes > 0 ? diffInMinutes : 0;
  }

  updateWaitTimes(): void {
    const now = new Date();
    this.waitingPatient.forEach((patient) => {
      if (
        patient.appointment &&
        (patient.appointment.status === 'Waiting' ||
          patient.appointment.status === 'InProgress')
      ) {
        patient.waitTime = this.calculateWaitTime(patient.arrivalTime);
      }
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

  // Filtering

  filterStatuses(type: 'waiting'): WaitingPatient[];
  filterStatuses(type: 'appointments'): Appointment[];
  filterStatuses(
    type: 'waiting' | 'appointments'
  ): WaitingPatient[] | Appointment[] {
    if (type === 'waiting') {
      if (!this.waitingPatient || this.waitingPatient.length === 0) {
        console.warn('No waiting patients found');
        return [];
      }

      const filteredPatients =
        this.selectedStatus === 'All'
          ? this.waitingPatient
          : this.waitingPatient.filter(
              (patient) =>
                patient.appointment &&
                patient.appointment.status === this.selectedStatus
            );

      console.log('Filtered Waiting Patients:', filteredPatients); // Debugging line
      return filteredPatients;
    } else {
      if (!this.appointments || this.appointments.length === 0) {
        console.warn('No appointments found');
        return [];
      }

      const filteredAppointments =
        this.selectedStatus === 'All'
          ? this.appointments
          : this.appointments.filter(
              (appointment) => appointment.status === this.selectedStatus
            );

      return filteredAppointments;
    }
  }

  filterPatients(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm)
    );
  }

  findAppointmentStatus(status: string): AppointmentStatus | 'Not Found' {
    return (
      this.appointmentStatuses.find((item) => item.label === status)?.value ||
      'Not Found'
    );
  }
  openPatientRecord(appointment: Appointment): void {
    console.log('Opening patient record for');
    // In a real application, this would navigate to the patient's record
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

  scheduleAppointment(patientId: number | undefined): void {
    console.log('Scheduling appointment for patient ID', patientId);
    this.showNewAppointmentForm = true;
    // In a real application, this would pre-select the patient in the form
  }

  editDoctorDetails(id: number | undefined): void {
    console.log('Editing doctor ID', id);
    // In a real application, this would open a form to edit doctor details
  }

  viewDoctorSchedule(id: number | undefined): void {
    console.log('Viewing schedule for doctor ID', id);
    // In a real application, this would navigate to doctor's schedule
  }

  // Helper method to manually check in a patient who has arrived
  checkInPatient(patient: WaitingPatient): void {
    patient.arrivalTime = new Date();
    patient.waitTime = 0;
    this.appointment!.patients.status = 'Waiting';
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

  // do update
  doUpdateStatus(value1: number | undefined, value2: string): void {
    this.appointmentService.updateAppointmentStatus(value1!, value2).subscribe({
      next: () => {
        // Reload UI data
        this.loadAppointments();
        this.loadWaitingList();
        this.loadDoctors();
      },
      error: (err: any) => {
        console.error('Error updating status:', err);
      },
    });
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

  // Helper methods to get patient and doctor names
  getPatientFirstName(patientId: number): string {
    const patient = this.patients.find((p) => p.id === patientId);
    return patient ? patient.firstName : '';
  }

  getPatientLastName(patientId: number): string {
    const patient = this.patients.find((p) => p.id === patientId);
    return patient ? patient.lastName : '';
  }

  getDoctorFirstName(doctorId: number): string {
    const doctor = this.doctors.find((d) => d.userID === doctorId);
    return doctor ? doctor.firstName : '';
  }

  getDoctorLastName(doctorId: number): string {
    const doctor = this.doctors.find((d) => d.userID === doctorId);
    return doctor ? doctor.lastName : '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
