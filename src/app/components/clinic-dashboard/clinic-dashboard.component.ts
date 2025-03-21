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
import { Appointment } from '../../models/appointment.model';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth/auth.service';
import { PatientService } from '../../services/patient/patient.service';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AgePipe } from '../../pipes/age/age.pipe';
import { GenderPipe } from '../../pipes/gender/gender.pipe';
import { WaitingPatient } from '../../models/waiting.model';

@Component({
  selector: 'app-clinic-dashboard',
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
  appoment: AppointmentService | undefined;
  loading = true;
  filteredPatients: Patient[] = [];
  activeTab: string = 'waitingList';
  currentUser: User | null = null;
  appointments: Appointment[] = [];

  waitingPatient: WaitingPatient[] = [];

  patients: Patient[] = [];
  doctors: User[] = [];
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
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();
    this.loadWaitingList();
    this.Initializing();
    // Refresh every minute to update wait times
    this.refreshInterval = setInterval(() => {
      this.updateWaitTimes();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  Initializing(): void {
    this.initializeForm(); // Ensure form is initialized before using it
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
    this.doctors;
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
