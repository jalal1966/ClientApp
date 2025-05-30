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
import { HttpClient } from '@angular/common/http';
import { AgePipe } from '../../../pipes/age/age.pipe';
import { GenderPipe } from '../../../pipes/gender/gender.pipe';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { Patients } from '../../../models/patient.model';
import { User } from '../../../models/user';
import { Appointment } from '../../../models/appointment.model';
import { WaitingPatient } from '../../../models/waiting.model';
import { PatientService } from '../../../services/patient/patient.service';
import { AuthService } from '../../../services/auth/auth.service';
import { MapComponent } from '../../commonSection/map/map.component';
import { WaitingListComponent } from '../../commonSection/waiting-list/waiting-list.component';
import { AppointmentComponent } from '../../commonSection/appointment/appointment.component';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { PatientDetailComponent } from '../../patientsSection/patient-detail/patient-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AppointmentStatus,
  AppointmentType,
} from '../../../models/enums.model';
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';

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
    MapComponent,
    WaitingListComponent,
    AppointmentComponent,
  ],
  templateUrl: './clinic-dashboard.component.html',
  styleUrl: './clinic-dashboard.component.scss',
})
export class ClinicDashboardComponent
  extends PatientComponentBase
  implements OnInit
{
  error = '';
  patientForm!: FormGroup;
  // Form for new appointments
  appointmentForm!: FormGroup;
  loading = true;
  filteredPatients: Patients[] = [];
  patients: Patients[] = [];
  activeTab: string = 'waitingList';
  doctors: User[] = [];
  appointmentsDoctor: Appointment[] = [];
  appointment: Appointment | null = null;
  showNewAppointmentForm: boolean = false;
  selectedDoctor: number | null = null;
  selectedStatus: string = 'all';
  refreshInterval: any;
  appointmentStatus?: AppointmentStatus;
  appointmentTypes?: AppointmentType;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  tabs = [
    { key: 'waitingList', label: 'WaitingList' },
    { key: 'appointments', label: 'Appointments' },
    { key: 'mapSchedule', label: 'AppointmentsMap' },
    { key: 'appointmentsDoctor', label: 'Doctor schedule' },
    { key: 'patients', label: 'Patients' },
    { key: 'analytics', label: 'Analytics' },
  ];
  // Analytics data TODO
  totalAppointments: number = 148;
  noShowPercentage: number = 8;
  newPatients: number = 24;
  revenue: number = 42500;

  constructor(
    private http: HttpClient,
    private patientService: PatientService,
    private doctorsService: AuthService,
    private appointmentService: AppointmentService,
    private medicalRecordsService: MedicalRecordsService,
    authService: AuthService,
    router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    super(authService, router);
  }

  ngOnInit(): void {
    this.Initializing();
    this.loadPatients();
    this.loadDoctors();

    // Refresh every minute to update wait times
    this.refreshInterval = setInterval(() => {
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

  getTypeLabel(typeValue: string): string {
    const typeNumber = Number(typeValue);
    return AppointmentType[typeNumber] ?? typeValue;
  }

  getStatusLabel(statusValue: string): string {
    const typeNumber = Number(statusValue);
    return AppointmentStatus[typeNumber] ?? statusValue;
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

  openPatientDetailModal(patientId: number): void {
    const modalRef = this.modalService.open(PatientDetailComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.patientId = patientId;
  }

  Initializing(): void {
    this.initializeForm(); // Ensure form is initialized before using it
    this.initializeAppointmentForm();
  }
  initializeForm(): void {
    this.patientForm = this.fb.group({
      nursName: ['', Validators.required],
    });
  }

  openMap(patientId: number): void {
    this.router.navigate(['/patient-detail', patientId]);
  }

  openLabResults(patientId: number): void {
    this.router.navigate(['/patients/', patientId, 'lab-results']);
  }

  openMedicalRecords(patientId: number) {
    this.router.navigate(['/patients/', patientId, 'medical-records']);
  }

  openVisits(patientId: number) {
    this.router.navigate(['visits/', patientId]);
  }

  openPressure(patientId: number) {
    this.router.navigate(['pressur/', patientId]);
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
      error: (error) => {
        this.successMessage = '';
        this.errorMessage = 'Failed to load appointments Doctor';
        setTimeout(() => (this.errorMessage = null), 3000) +
          (error.message || 'Unknown error');
        this.loading = false;
      },
    });
  }

  onDoctorSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value ? +selectElement.value : null;
    this.loadAppointmentsDoctor(value);
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
      error: (error) => {
        this.successMessage = '';
        this.errorMessage = 'Failed to load patients. Please try again.';
        setTimeout(() => (this.errorMessage = null), 3000) +
          (error.message || 'Unknown error');
        this.loading = false;
      },
    });
  }

  loadDoctors(): void {
    this.loading = true;
    this.doctorsService.getDoctorsWithFullName().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
      },
      error: (error) => {
        this.successMessage = '';
        this.errorMessage = 'Failed to load Doctors. Please try again.';
        setTimeout(() => (this.errorMessage = null), 3000) +
          (error.message || 'Unknown error');
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

  openPatientRecord(id: number): void {
    console.log('Opening patient record for');

    // In a real application, this would navigate to the patient's record
    if (id) {
      this.router.navigate(['/patientRecord', id]);
    }
  }

  openMerge(patientId: number): void {
    // Set loading state if needed
    this.loading = true;

    // In a real application, this would navigate to the patient's record
    // Directly get the medical record ID from the patient service
    this.medicalRecordsService.getMedicalRecord(patientId).subscribe({
      next: (data) => {
        this.loading = false;

        if (data && data.id) {
          // Navigate to the merge page with both IDs
          this.router.navigate(['/merge', patientId], {
            queryParams: { medicalRecordId: data.id },
          });
        } else {
          // Handle case where medical record doesn't exist
          console.error('No medical record found for patient ID:', patientId);
          // Optionally show an alert or notification to the user
          alert(
            'No medical record found for this patient. Please create a medical record first.'
          );
        }
      },
      error: (error) => {
        this.successMessage = '';
        this.errorMessage = 'Error fetching medical record:';
        setTimeout(() => (this.errorMessage = null), 3000) +
          (error.message || 'Unknown error');
        this.loading = false;

        // Handle error case - maybe navigate without the medical record ID
        // or show an error message
        if (error.status === 404) {
          alert(
            'No medical record found for this patient. Please create a medical record first.'
          );
        } else {
          alert('Error accessing medical records. Please try again later.');
        }
      },
    });
  }

  viewPatientDetailsInfo(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/patients', id]);
    }
  }
  editPatientDetails(id: number | undefined): void {
    console.log('Editing patient ID', id);
    // In a real application, this would open a form to edit patient details
  }

  cancelAppointment(appointmentId: number | undefined): void {
    console.log('Scheduling appointment for appointment ID', appointmentId);
    const statusValue = '6';
    this.doUpdateStatus(appointmentId, statusValue.toString());
  }

  // do update
  doUpdateStatus(value1: number | undefined, value2: string): void {
    this.appointmentService.updateAppointmentStatus(value1!, value2).subscribe({
      next: () => {
        // Reload UI data
        this.loadDoctors();
      },
      error: (err: any) => {
        this.successMessage = '';
        this.errorMessage = 'Error updating status:';
        setTimeout(() => (this.errorMessage = null), 3000) +
          (err.message || 'Unknown error');
      },
    });
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

  // Then update your scheduleNewAppointment method

  showErrorAlert(message: string): void {
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
