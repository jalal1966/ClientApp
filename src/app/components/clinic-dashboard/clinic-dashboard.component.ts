import { Component, OnInit } from '@angular/core';
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
import { Observable } from 'rxjs';
import { Appointment, AppointmentCreate } from '../../models/appointment.model';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth/auth.service';
import { PatientService } from '../../services/patient/patient.service';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AgePipe } from '../../pipes/age/age.pipe';
import { GenderPipe } from '../../pipes/gender/gender.pipe';
import { WaitingPatient } from '../../models/waiting.model';
import { AppointmentType, AppointmentStatus } from '../../models/enums.model';

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
  ],
  templateUrl: './clinic-dashboard.component.html',
  styleUrl: './clinic-dashboard.component.scss',
})
export class ClinicDashboardComponent implements OnInit {
  error = '';
  patientForm!: FormGroup;
  // Form for new appointments
  appointmentForm!: FormGroup;
  appoment: AppointmentService | undefined;
  loading = true;
  filteredPatients: Patient[] = [];
  activeTab: string = 'waitingList';
  doctors: User[] = [];
  currentUser: User | null = null;
  appointments: Appointment[] = [];

  waitingPatient: WaitingPatient[] = [];

  patients: Patient[] = [];
  searchTerm: string = '';
  showNewAppointmentForm: boolean = false;
  showNewPatientForm: boolean = false;
  showNewWitingsForm: boolean = false;
  selectedPatient: number | null = null;
  selectedDoctor: number | null = null;
  // Analytics data
  totalAppointments: number = 148;
  noShowPercentage: number = 8;
  newPatients: number = 24;
  revenue: number = 42500;
  patient!: Patient[] | [];
  selectedStatus: string = 'all';
  refreshInterval: any;
  startTime: Date | undefined;
  endTime: Date | undefined;
  type: any;

  // Then update your appointment form initialization to use these enums
  appointmentTypes = [
    { value: AppointmentType.CheckUp, label: 'Check Up' },
    { value: AppointmentType.FollowUp, label: 'Follow Up' },
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
    { value: AppointmentStatus.InProgress, label: 'In Progress' },
    { value: AppointmentStatus.Completed, label: 'Completed' },
    { value: AppointmentStatus.CheckedIn, label: 'Checked In' },
    { value: AppointmentStatus.Cancelled, label: 'Cancelled' },
    { value: AppointmentStatus.NoShow, label: 'No Show' },
  ];

  appointment: Appointment | null = null;

  tabs = [
    { key: 'waitingList', label: 'WaitingList' },
    { key: 'appointments', label: 'Appointments' },
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
      this.updateWaitTimes();
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

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  loadAppointments(): void {
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

  loadWaitingList(): void {
    this.loading = true;
    const today = new Date();
    const tomorrow = new Date();
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
              app.status !== 'No-Show'
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
      if (patient.status === 'waiting' || patient.status === 'in-progress') {
        patient.waitTime = this.calculateWaitTime(patient.arrivalTime);
      }
    });
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
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

  filterWitings(): WaitingPatient[] {
    console.log('Selected status:', this.selectedStatus);
    const filtered =
      this.selectedStatus === 'all'
        ? this.waitingPatient
        : this.waitingPatient.filter(
            (patient) => patient.status === this.selectedStatus
          );
    console.log('Filtered patients:', filtered);
    return filtered;
  }

  filterPatients(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm)
    );
  }

  updateAppointmentStatus(
    id: number,
    status: 'completed' | 'cancelled' | 'no-show'
  ): void {
    // In a real application, this would be an API call
    const appointment = this.appointments.find((a) => a.id === id);
    if (appointment) {
      appointment.status = status;
    }
  }

  openPatientRecord(appointment: Appointment): void {
    console.log('Opening patient record for');
    // In a real application, this would navigate to the patient's record
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
    patient.status = 'waiting';
  }

  changeStatus(
    patient: WaitingPatient,
    newStatus: 'in-progress' | 'completed' | 'no-show'
  ): void {
    patient.status = newStatus;

    // Update the appointment status in the backend
    this.appointmentService
      .updateAppointmentStatus(patient.appointment.id, newStatus)
      .subscribe({
        next: () => {
          console.log(
            `Status updated to ${newStatus} for patient ${patient.patientFirstName}`
          );
        },
        error: (err: any) => {
          console.error('Failed to update status:', err);
          // Revert the status change in case of error
          patient.status =
            patient.status === newStatus ? 'waiting' : patient.status;
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
      },
      error: (err) => {
        console.error('Error creating appointment:', err);
        console.error('Error details:', err.error); // This will show the server response
        console.error('Attempted to send:', appointment); // This will show what you sent
        this.error = 'Failed to schedule appointment. Please try again.';
      },
    });
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
