import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Location } from '@angular/common';
import { VitalSignsService } from '../../../services/vital-signs-service';
import {
  VitalSigns,
  CreateVitalSigns,
  UpdateVitalSigns,
} from '../../../models/vital-signs.model';
import { BloodPressureService } from '../../../services/bloodPressure/blood-pressure.service';
import { Pressure } from '../../../models/medicalRecord.model';
import { MedicalRecordUtilityService } from '../../../services/medicalRecordUtility/medical-record-utility.service';
import { PatientService } from '../../../services/patient/patient.service';
import { Patients } from '../../../models/patient.model';
import { differenceInYears } from 'date-fns/differenceInYears';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-vital-signs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vital-signs.component.html',
  styleUrls: ['./vital-signs.component.scss'],
})
export class VitalSignsComponent implements OnInit {
  vitalSignsForm!: FormGroup;
  patientId!: number;
  loading = false;
  error = '';
  successMessage = '';
  recentVitalSigns: VitalSigns[] = [];
  allVitalSigns: VitalSigns[] = [];
  showFullHistory = false;

  // Pagination for full history
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  //Patient info for blood pressure calculations
  patient: Patients | undefined;
  patientAge: number = 0;
  patientWeight: number = 0;
  patientGender: string = '';
  medicalRecordId: number | undefined;
  filteredPatients: Patients[] = [];
  patients: Patients[] = [];

  // Patient search
  searchTerm: string = '';
  showDropdown: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private vitalSignsService: VitalSignsService,
    private bloodPressureService: BloodPressureService,
    private medicalRecordUtility: MedicalRecordUtilityService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const routePatientId = this.route.snapshot.paramMap.get('id');

    this.initializeForm();
    this.loadAllPatients();

    // If patient ID is in route, load that patient
    if (routePatientId && routePatientId !== 'vital-signs') {
      this.patientId = Number(routePatientId);
      this.loadPatientData();
      this.loadRecentVitalSigns();
    } else {
      // No patient selected - show search prompt
      console.log('No patient selected. Please search for a patient.');
    }
  }

  loadAllPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = [];
      },
      error: (err) => {
        console.error('Failed to load patients', err);
      },
    });
  }

  loadPatientData(): void {
    this.loading = true;

    // Load patient details
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (data) => {
        this.patient = data;
        this.searchTerm = `${data.firstName} ${data.lastName}`;
        this.patientAge = differenceInYears(
          new Date(),
          new Date(this.patient.dateOfBirth)
        );
        this.patientGender = this.patient.genderID === 1 ? 'male' : 'female';
        this.patientWeight = this.patient.medicalRecord?.weight || 0;

        // Get medical record ID
        this.medicalRecordUtility.checkMedicalRecord(this.patientId).subscribe({
          next: (recordId) => {
            this.medicalRecordId = recordId;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to get medical record ID', err);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('Failed to load patient data', err);
        this.loading = false;
      },
    });
  }

  initializeForm(): void {
    this.vitalSignsForm = this.fb.group({
      temperature: [
        '',
        [Validators.required, Validators.min(35), Validators.max(42)],
      ],
      bloodPressureSystolic: [
        '',
        [Validators.required, Validators.min(70), Validators.max(200)],
      ],
      bloodPressureDiastolic: [
        '',
        [Validators.required, Validators.min(40), Validators.max(130)],
      ],
      heartRate: [
        '',
        [Validators.required, Validators.min(40), Validators.max(200)],
      ],
      respiratoryRate: [
        '',
        [Validators.required, Validators.min(8), Validators.max(40)],
      ],
      oxygenSaturation: [
        '',
        [Validators.required, Validators.min(70), Validators.max(100)],
      ],
      weight: ['', [Validators.min(1), Validators.max(300)]],
      remarks: [''],
    });
  }

  loadRecentVitalSigns(): void {
    this.vitalSignsService.getPatientVitalSigns(this.patientId).subscribe({
      next: (data) => {
        this.allVitalSigns = data;
        this.recentVitalSigns = data.slice(0, 5); // Get last 5 records
        this.totalPages = Math.ceil(data.length / this.itemsPerPage);
      },
      error: (err) => {
        console.error('Failed to load vital signs history', err);
      },
    });
  }

  get paginatedVitalSigns(): VitalSigns[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allVitalSigns.slice(startIndex, endIndex);
  }

  filterPatients(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue;

    if (searchValue.trim().length === 0) {
      this.filteredPatients = [];
      this.showDropdown = false;
      return;
    }

    const searchLower = searchValue.toLowerCase();
    this.filteredPatients = this.patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(searchLower)
    );
    this.showDropdown = this.filteredPatients.length > 0;
  }

  selectPatient(patient: Patients): void {
    this.patient = patient;
    this.patientId = patient.id;
    this.searchTerm = `${patient.firstName} ${patient.lastName}`;
    this.showDropdown = false;
    this.filteredPatients = [];

    // Load patient data and vital signs
    this.loadPatientData();
    this.loadRecentVitalSigns();

    // Reset form
    this.vitalSignsForm.reset();
    this.error = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (this.vitalSignsForm.invalid) {
      this.error = 'Please fill in all required fields with valid values.';
      return;
    }

    if (!this.patientId) {
      this.error = 'Please select a patient first.';
      return;
    }

    if (!this.medicalRecordId) {
      this.error = 'Medical record ID is required. Please try again.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const formValues = this.vitalSignsForm.value;
    const systolic = formValues.bloodPressureSystolic;
    const diastolic = formValues.bloodPressureDiastolic;

    // Prepare vital signs data
    const vitalSigns: VitalSigns = {
      patientId: this.patientId,
      temperature: formValues.temperature,
      bloodPressureSystolic: systolic,
      bloodPressureDiastolic: diastolic,
      heartRate: formValues.heartRate,
      respiratoryRate: formValues.respiratoryRate,
      oxygenSaturation: formValues.oxygenSaturation,
      weight: formValues.weight || undefined,
      recordedAt: new Date(),
      remarks: formValues.remarks || undefined,
      status: this.getVitalSignStatusFromForm(formValues),
    };

    // Save both vital signs and blood pressure records
    const vitalSigns$ = this.vitalSignsService.recordVitalSigns(vitalSigns);
    const bloodPressure$ =
      this.bloodPressureService.createComprehensivePressureRecord(
        this.patientId,
        this.medicalRecordId,
        systolic,
        diastolic,
        this.patientAge,
        this.patientWeight || formValues.weight || 0,
        this.patientGender
      );

    // Execute both save operations
    forkJoin({
      vitalSigns: vitalSigns$,
      bloodPressure: bloodPressure$,
    }).subscribe({
      next: (response) => {
        this.successMessage =
          'Vital signs and blood pressure recorded successfully!';
        this.loading = false;
        this.vitalSignsForm.reset();
        this.loadRecentVitalSigns();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving records:', err);
        this.error =
          'Failed to record vital signs and blood pressure. Please try again.';
        this.loading = false;
      },
    });
  }

  getVitalSignStatus(vitalSign: VitalSigns): string {
    // Blood Pressure Status
    if (
      vitalSign.bloodPressureSystolic >= 140 ||
      vitalSign.bloodPressureDiastolic >= 90
    ) {
      return 'High BP';
    }
    if (
      vitalSign.bloodPressureSystolic < 90 ||
      vitalSign.bloodPressureDiastolic < 60
    ) {
      return 'Low BP';
    }

    // Temperature Status
    if (vitalSign.temperature > 38) {
      return 'Fever';
    }
    if (vitalSign.temperature < 36) {
      return 'Hypothermia';
    }

    // Oxygen Saturation
    if (vitalSign.oxygenSaturation < 95) {
      return 'Low O2';
    }

    return 'Normal';
  }

  getVitalSignStatusFromForm(formValues: any): string {
    // Blood Pressure Status
    if (
      formValues.bloodPressureSystolic >= 140 ||
      formValues.bloodPressureDiastolic >= 90
    ) {
      return 'High BP';
    }
    if (
      formValues.bloodPressureSystolic < 90 ||
      formValues.bloodPressureDiastolic < 60
    ) {
      return 'Low BP';
    }

    // Temperature Status
    if (formValues.temperature > 38) {
      return 'Fever';
    }
    if (formValues.temperature < 36) {
      return 'Hypothermia';
    }

    // Oxygen Saturation
    if (formValues.oxygenSaturation < 95) {
      return 'Low O2';
    }

    return 'Normal';
  }

  getBloodPressureCategory(systolic: number, diastolic: number): string {
    return this.bloodPressureService.getBloodPressureCategory(
      systolic,
      diastolic
    );
  }

  getBPCategoryClass(category: string): string {
    switch (category) {
      case 'Low Blood Pressure':
        return 'text-info';
      case 'Normal':
        return 'text-success';
      case 'Elevated':
        return 'text-warning';
      case 'Hypertension Stage 1':
        return 'text-warning';
      case 'Hypertension Stage 2':
        return 'text-danger';
      case 'Hypertensive Crisis':
        return 'text-danger fw-bold';
      default:
        return '';
    }
  }

  goBack(): void {
    this.location.back();
  }

  viewFullHistory(): void {
    this.showFullHistory = !this.showFullHistory;
    if (this.showFullHistory) {
      this.currentPage = 1; // Reset to first page when opening
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }
}
