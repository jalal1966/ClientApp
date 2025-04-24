// merged-patient.component.ts
import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Patients, PatientDetail } from '../../../models/patient.model';
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
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';
import {
  Allergy,
  Immunization,
  LabResult,
  MedicalRecord,
} from '../../../models/medicalRecord.model';
import { Observable } from 'rxjs';
import { Diagnosis, Medication } from '../../../models/visits.model';
import { PatientInfoComponent } from '../patient-info/patient-info.component';
import { PatientAllergiesComponent } from '../patient-allergies/patient-allergies.component';
import { PatientLabResultsComponent } from '../patient-lab-results/patient-lab-results.component';
import { ImmunizationsComponent } from '../immunzations/immunizations.component';
import { BloodPressureComponent } from '../blood-pressure/blood-pressure.component';
import { MedicalRecordsComponent } from '../medical-records/medical-records.component';

@Component({
  selector: 'app-merged-patient',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PatientInfoComponent,
    MedicalRecordsComponent,
    PatientAllergiesComponent,
    PatientLabResultsComponent,
    ImmunizationsComponent,
    BloodPressureComponent,
  ],
  templateUrl: './merged-patient.component.html',
})
export class MergedPatientComponent
  extends PatientComponentBase
  implements OnInit
{
  ////////////////////////////////
  patient: Patients | null = null;
  loading = true;
  today: Date = new Date();
  activeTab: string = 'info';
  allergies: Allergy[] = []; // <-- Ensure this is present
  labResults: LabResult[] = [];
  immunizations: Immunization[] = [];

  recordExists = false;
  filteredPatients: Patients[] = [];

  @ViewChild('noMedications', { static: true })
  noMedications!: TemplateRef<any>;
  @ViewChild('noAllergies', { static: true }) noAllergies!: TemplateRef<any>;
  @ViewChild('noVisits', { static: true }) noVisits!: TemplateRef<any>;
  @ViewChild('noLabResults', { static: true }) noLabResults!: TemplateRef<any>;

  showNoRecordMessage = false;
  idToPass: number | null = null;
  medicalRecord: any = null;
  medicalRecordForm: FormGroup;
  isEditingMedical = false;
  error: string | null = null;
  // UI state properties
  showDiagnosis = false;
  showMedications = false;
  expandedVisitId: number | null = null;
  visit: any;
  bpSystolic: any;
  bpDiastolic: any;

  /////////////////////////////////////////

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private medicalRecordsService: MedicalRecordsService,
    private patientService: PatientService,
    authService: AuthService,
    router: Router,
    private location: Location
  ) {
    super(authService, router);
    this.medicalRecordForm = this.fb.group({
      // Physical Information
      idToPass: [this.medicalRecordId],
      id: [''],
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
      immunizations: [''],
      labResults: [''],

      notes: [''],
      isFollowUpRequired: [false],
      followUpDate: [null],
    });
  }

  ngOnInit(): void {
    // Get patient ID from route parameters
    const parentParams = this.route.parent?.snapshot.paramMap;
    const currentParams = this.route.snapshot.paramMap;
    const id = parentParams?.get('id') ?? currentParams.get('id');

    if (id) {
      this.patientId = +id;

      // Get medical record ID directly from query parameters
      this.route.queryParams.subscribe((params) => {
        if (params['medicalRecordId']) {
          this.medicalRecordId = +params['medicalRecordId'];
          this.loadPatientDetailsData();
          this.loadMedicalRecord();
        } else {
          console.warn('No medical record ID provided in query parameters');
          // Handle the case when no medicalRecordId is provided
        }
      });
    } else {
      this.error = 'Patient ID is required';
      this.loading = false;
    }

    console.log('medicalRecordId', this.medicalRecordId);
  }

  getBloodPressureStatus(bp: string | undefined) {
    if (!bp) return { class: '', label: '-' };

    const [systolic, diastolic] = bp.split('/').map(Number);

    if (systolic < 120 && diastolic < 80) {
      return { class: 'bg-success', label: 'Normal' };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { class: 'bg-danger', label: 'High' };
    } else {
      return { class: 'bg-warning text-dark', label: 'Elevated' };
    }
  }

  // In component.ts
  isDoseOverdue(nextDoseDate: Date | string | null): boolean {
    if (!nextDoseDate) return false;

    const nextDose = new Date(nextDoseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare only dates without time

    return nextDose < today;
  }

  get formControls() {
    return this.medicalRecordForm.controls;
  }
  openMedicalRecordForm(): void {
    // You can either navigate to a medical record creation page
    this.router.navigate(['/patients/', this.patientId, 'medical-records']);
  }

  // Merged loading method
  loadPatientDetailsData(): void {
    this.loading = true;
    this.patientService.getPatient(this.patientId).subscribe({
      next: (data) => {
        this.patient = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading patient data', err);
        this.error = 'Failed to load patient data. Please try again.';
        this.loading = false;
      },
    });
  }

  loadMedicalRecord() {
    this.loading = true;
    this.error = null;
    this.medicalRecordsService.getMedicalRecord(this.patientId).subscribe({
      next: (data) => {
        this.recordExists = true;
        this.idToPass = data.id ?? null;

        // Extract common diagnoses and treatments for summary views
        const allDiagnoses: Diagnosis[] = [];
        const allTreatments: string[] = [];
        const allMedications: Medication[] = [];
        const allNotes: string[] = [];

        // Process visit data
        data.recentVisits?.forEach((visit) => {
          if (visit.diagnosis?.length) {
            allDiagnoses.push(...visit.diagnosis);
          }

          if (visit.planTreatment) {
            allTreatments.push(visit.planTreatment);
          }

          if (visit.medication?.length) {
            allMedications.push(...visit.medication);
          }

          if (visit.notes) {
            allNotes.push(visit.notes);
          }
        });

        // Store arrays in component for reuse
        this.allergies = data.allergies || [];
        this.immunizations = data.immunizations || [];
        this.labResults = data.labResults || [];

        this.medicalRecord = data;
        this.patchMedicalRecordForm();
        this.loading = false;
      },
      error: (err) => {
        this.idToPass = null; // Reset on error
        if (err.status === 404 || err.message?.includes('Error Code: 404')) {
          this.medicalRecord = null;
          this.recordExists = false;
          this.loading = false;
        } else {
          this.error =
            err.message || 'An error occurred while loading medical record';
          this.loading = false;
        }
      },
    });
  }

  patchMedicalRecordForm() {
    if (this.medicalRecord) {
      this.medicalRecordForm?.patchValue({
        // Physical Information
        id: this.medicalRecord.id,
        idToPass: this.medicalRecord.id,
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

  // Helper methods
  hasItems(arr: any[] | null | undefined): boolean {
    return !!arr && Array.isArray(arr) && arr.length > 0;
  }

  getDetails(diagnosis: any[]): string {
    if (!diagnosis || diagnosis.length === 0) return 'None';
    return diagnosis
      .map(
        (d) =>
          `Code: ${d.diagnosisCode}, Desc: ${d.description}, Date: ${new Date(
            d.diagnosisDate
          ).toLocaleDateString()}, Active: ${d.isActive}`
      )
      .join('\n');
  }

  // Toggle edit mode for medical record
  toggleEditMedical() {
    this.isEditingMedical = !this.isEditingMedical;
    if (this.isEditingMedical && !this.medicalRecordForm) {
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
      },
      error: (err) => {
        console.error('Error saving medical record:', err);
        this.error = 'Failed to save medical record. Please try again.';
      },
    });
  }

  // Create empty objects to prevent undefined errors
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
      medicalRecord: this.createEmptyMedicalRecord(),
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
      labResults: [],
      immunizations: [],
      followUpDate: undefined,
      isFollowUpRequired: false,
    };
  }

  setMedicalRecordIdInUrl(id: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { medicalRecordId: id },
      queryParamsHandling: 'merge',
    });
  }

  // Tab handling
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
      this.router.navigate(['visits/', this.patientId]);
    }
  }

  viewVisitDetails(visitId: number): void {
    if (this.patient) {
      this.router.navigate(['/visits/', this.patientId]);
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
    if (this.patientId) {
      // Changed from this.patient to this.patientId
      this.router.navigate(['/patients', this.patientId, 'lab-results']); // Fixed path segments
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

  // Getters for UI
  get patientAge(): number {
    if (!this.patient?.dateOfBirth) return 0;
    const birthDate = new Date(this.patient.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  get hasRecentLabResults(): boolean {
    return this.hasItems(this.labResults);
  }

  get hasCurrentImmunization(): boolean {
    const visits = this.patient?.medicalRecord?.recentVisits || [];
    const meds = visits.flatMap((v) => v.medication || []);
    return this.hasItems(meds);
  }

  // Navigation
  backClicked() {
    this.location.back();
  }
}
