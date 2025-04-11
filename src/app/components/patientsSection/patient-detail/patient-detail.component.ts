import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  NgIf,
  NgFor,
  DatePipe,
  CommonModule,
  NgIfContext,
  NgClass,
} from '@angular/common';
import { Patients } from '../../../models/patient.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PatientService } from '../../../services/patient/patient.service';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { AuthService } from '../../../services/auth/auth.service';
import { Location } from '@angular/common';
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';
import { MedicalRecord } from '../../../models/medicalRecord.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgClass,
  ],
  templateUrl: './patient-detail.component.html',
})
export class PatientDetailComponent
  extends PatientComponentBase
  implements OnInit
{
  patient: Patients | undefined;
  isLoading = true;
  // Default tab
  activeTab = 'overview';
  loading = true;
  filteredPatients: Patients[] = [];
  error = '';
  noMedications: TemplateRef<NgIfContext<boolean>> | null = null;
  noAllergies: TemplateRef<NgIfContext<boolean>> | null = null;
  noVisits: TemplateRef<NgIfContext<boolean>> | null = null;
  noLabResults: TemplateRef<NgIfContext<boolean>> | null = null;

  medicalRecord: any = null;
  medicalRecordForm?: FormGroup;
  isEditingMedical = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    authService: AuthService,
    router: Router,
    private location: Location,
    private fb: FormBuilder,
    private patientService: PatientService,
    private medicalRecordsService: MedicalRecordsService
  ) {
    super(authService, router);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.patientId = +id; // Convert string to number with + operator
        this.loadPatient();
        this.loadMedicalRecord(); // Add this line to load medical record
        // Check for tab parameter in query params
        this.route.queryParams.subscribe((queryParams) => {
          if (
            queryParams['tab'] &&
            ['overview', 'medical', 'visits', 'labs'].includes(
              queryParams['tab']
            )
          ) {
            this.activeTab = queryParams['tab'];
          }
        });
      } else {
        this.error = 'Invalid patient ID';
        this.loading = false;
        this.isLoading = false;
      }
    });
    this.initMedicalRecordForm();
  }

  hasItems(arr: any[] | null | undefined): boolean {
    return !!arr && Array.isArray(arr) && arr.length > 0;
  }

  // Initialize the form in the constructor or in ngOnInit
  initMedicalRecordForm() {
    this.medicalRecordForm = this.fb.group({
      // Physical Information
      height: ['', [Validators.required]],
      weight: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      bmi: [''],
      bloodType: [''],
      userID: [''],

      // Medical History
      chronicConditions: [''],
      surgicalHistory: [''],
      familyMedicalHistory: [''],
      socialHistory: [''],

      // Current Visit
      recordDate: [new Date()],
      diagnosis: [''],
      treatment: [''],
      medications: [''],
      notes: [''],
      isFollowUpRequired: [false],
      followUpDate: [null],
    });
  }
  // Load medical record for the patient
  loadMedicalRecord() {
    this.medicalRecordsService.getMedicalRecord(this.patientId).subscribe({
      next: (data) => {
        this.medicalRecord = data;
        this.patchMedicalRecordForm();
      },
      error: (err) => {
        if (err.status === 404) {
          // No medical record exists for this patient yet
          this.medicalRecord = null;
        } else {
          console.error('Error loading medical record:', err);
          this.error = 'Failed to load medical record. Please try again.';
        }
      },
    });
  }

  // Toggle edit mode for medical record
  toggleEditMedical() {
    this.isEditingMedical = !this.isEditingMedical;
    if (this.isEditingMedical && !this.medicalRecordForm) {
      this.initMedicalRecordForm();
      this.patchMedicalRecordForm();
    }
  }

  // Calculate BMI when height or weight changes
  calculateBMI() {
    const height = this.medicalRecordForm?.get('height')?.value;
    const weight = this.medicalRecordForm?.get('weight')?.value;

    if (height && weight && height > 0) {
      // BMI formula: weight (kg) / (height (m))²
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      this.medicalRecordForm?.get('bmi')?.setValue(bmi.toFixed(2));
    }
  }

  // Save medical record
  saveMedicalRecord() {
    if (this.medicalRecordForm?.invalid) {
      return;
    }

    const formData = this.medicalRecordForm?.value;

    // Add current date if creating a new record
    if (!this.medicalRecord) {
      formData.recordDate = new Date().toISOString();
    }

    const saveObservable: Observable<MedicalRecord> = this.medicalRecord
      ? this.medicalRecordsService.updateMedicalRecord(this.patientId, formData)
      : this.medicalRecordsService.createMedicalRecord(
          this.patientId,
          formData
        );

    saveObservable.subscribe({
      next: (data) => {
        this.loadMedicalRecord();
        this.isEditingMedical = false;
        // Show success message
        this.error = ''; // Clear any previous errors
        // Could add a success message here
      },
      error: (err) => {
        console.error('Error saving medical record:', err);
        this.error = 'Failed to save medical record. Please try again.';
      },
    });
  }

  // Update form with medical record data
  patchMedicalRecordForm() {
    if (this.medicalRecord) {
      this.medicalRecordForm?.patchValue({
        // Physical Information
        height: this.medicalRecord.height,
        weight: this.medicalRecord.weight,
        bmi: this.medicalRecord.bmi,
        bloodType: this.medicalRecord.bloodType,
        userID: this.currentUser.userID,
        patientId: this.patientId,
        // Medical History
        chronicConditions: this.medicalRecord.chronicConditions,
        surgicalHistory: this.medicalRecord.surgicalHistory,
        familyMedicalHistory: this.medicalRecord.familyMedicalHistory,
        socialHistory: this.medicalRecord.socialHistory,

        // Current Visit
        recordDate: this.medicalRecord.recordDate,
        diagnosis: this.medicalRecord.diagnosis,
        treatment: this.medicalRecord.treatment,
        medications: this.medicalRecord.medications,
        notes: this.medicalRecord.notes,
        isFollowUpRequired: this.medicalRecord.isFollowUpRequired,
        followUpDate: this.medicalRecord.followUpDate
          ? new Date(this.medicalRecord.followUpDate)
              .toISOString()
              .split('T')[0]
          : null,
      });
    }
  }

  loadPatient(): void {
    this.loading = true;
    this.isLoading = true;
    this.patientService.getPatient(this.patientId).subscribe({
      next: (data) => {
        this.patient = data;
        // Ensure patientDetails exists to prevent undefined errors
        if (this.patient && !this.patient.patientDetails) {
          this.patient.patientDetails = this.createEmptyPatientDetails();
        }

        // Initialize arrays to prevent length errors
        if (this.patient?.patientDetails) {
          this.patient.patientDetails.medicalRecord.allergies =
            this.patient.patientDetails.medicalRecord?.allergies || [];
          this.patient.patientDetails.medicalConditions =
            this.patient.patientDetails.medicalConditions || [];
          this.patient.patientDetails.medicalRecord.recentVisits.flatMap(
            (visit) => visit.currentMedications || []
          );
          this.patient.patientDetails.medicalRecord.immunizations =
            this.patient.patientDetails.medicalRecord.immunizations || [];
          this.patient.patientDetails.medicalRecord.recentVisits =
            this.patient.patientDetails.medicalRecord.recentVisits || [];
          this.patient.patientDetails.medicalRecord.recentLabResults =
            this.patient.patientDetails.medicalRecord.recentLabResults || [];
        }
        console.log(
          'blod',
          this.patient.patientDetails.medicalRecord.immunizations
        );

        this.loading = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading patient:', err);
        this.error = 'Failed to load patient. Please try again.';
        this.loading = false;
        this.isLoading = false;
      },
    });
  }

  // Create empty patient details to prevent undefined errors
  createEmptyPatientDetails() {
    return {
      roomNumber: '',
      bedNumber: '',
      dateOfBirth: new Date(),
      primaryDiagnosis: '',
      admissionDate: new Date(),
      familyMedicalHistory: '',
      socialHistory: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      medicalRecord: this.createEmptyMedicalRecord(), // 👈 include this
    };
  }
  createEmptyMedicalRecord(): MedicalRecord {
    return {
      patientId: 0,
      userID: 0,
      height: 0,
      weight: 0,
      bmi: 0,
      bloodType: '',
      chronicConditions: '',
      surgicalHistory: '',
      socialHistory: '',
      familyMedicalHistory: '',
      recentVisits: [],
      allergies: [],
      recentLabResults: [],
      immunizations: [],
    };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Update URL without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
  }

  // Methods for Recent Visits tab
  scheduleNewVisit(): void {
    if (this.patient) {
      this.router.navigate(['/schedule-visit', this.patientId]);
    }
  }

  viewVisitDetails(visitId: number): void {
    if (this.patient) {
      this.router.navigate(['/patients', this.patientId, 'visits', visitId]);
    }
  }

  printVisitSummary(visitId: number): void {
    if (this.patient) {
      this.patientService.generateVisitSummary(visitId).subscribe({
        next: (pdfBlob) => {
          const url = window.URL.createObjectURL(pdfBlob);
          window.open(url, '_blank');
        },
        error: (err) => {
          console.error('Error generating PDF:', err);
          this.error = 'Failed to generate visit summary PDF.';
        },
      });
    }
  }

  // Methods for Lab Results tab
  orderNewLab(): void {
    if (this.patient) {
      this.router.navigate(['/order-lab', this.patientId]);
    }
  }

  downloadLabResults(labId: number): void {
    if (this.patient) {
      this.patientService.downloadLabResults(labId).subscribe({
        next: (pdfBlob) => {
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `lab-results-${labId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (err) => {
          console.error('Error downloading lab results:', err);
          this.error = 'Failed to download lab results.';
        },
      });
    }
  }

  emailLabResults(labId: number): void {
    if (this.patient && this.patient.email) {
      this.patientService.emailLabResults(labId, this.patient.email).subscribe({
        next: () => {
          alert('Lab results were successfully emailed to the patient.');
        },
        error: (err) => {
          console.error('Error emailing lab results:', err);
          this.error = 'Failed to email lab results.';
        },
      });
    }
  }

  get hasRecentLabResults(): boolean {
    const results =
      this.patient?.patientDetails?.medicalRecord?.recentLabResults;
    return this.hasItems(results);
  }

  get hasCurrentMedications(): boolean {
    const visits =
      this.patient?.patientDetails?.medicalRecord?.recentVisits || [];
    const meds = visits.flatMap((v) => v.currentMedications || []);
    return this.hasItems(meds);
  }

  backClicked() {
    this.location.back();
  }
}
