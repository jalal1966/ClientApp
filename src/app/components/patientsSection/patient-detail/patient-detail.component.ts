import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
import {
  Allergy,
  Immunization,
  LabResult,
  MedicalRecord,
} from '../../../models/medicalRecord.model';
import { Observable } from 'rxjs';
import { Diagnosis, Medication } from '../../../models/visits.model';

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

  // Default tab
  recordExists = false;
  activeTab = 'overview';
  loading = true;
  filteredPatients: Patients[] = [];
  /* noImmunizations: TemplateRef<NgIfContext<boolean>> | null = null;
  noAllergies: TemplateRef<NgIfContext<boolean>> | null = null;
  noVisits: TemplateRef<NgIfContext<boolean>> | null = null;
  noLabResults: TemplateRef<NgIfContext<boolean>> | null = null; */
  @ViewChild('noMedications', { static: true })
  noMedications!: TemplateRef<any>;
  @ViewChild('noAllergies', { static: true }) noAllergies!: TemplateRef<any>;
  @ViewChild('noVisits', { static: true }) noVisits!: TemplateRef<any>;
  @ViewChild('noLabResults', { static: true }) noLabResults!: TemplateRef<any>;

  idToPass: number | null = null;
  medicalRecord: any = null;
  medicalRecordForm: FormGroup;
  isEditingMedical = false;
  error: string | null = null;
  // UI state properties
  showDiagnosis = false;
  showMedications = false;
  expandedVisitId: number | null = null;
  isMainForm = false;
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
      idToPass: [null], // Add this to your form group if missing
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

  get formControls() {
    return this.medicalRecordForm.controls;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.patientId = +id;
        this.loadPatient(this.patientId); // Add this
        this.loadMedicalRecord();
      } else {
        this.error = 'Patient ID is required';
        this.loading = false;
      }
    });
  }

  loadPatient(value: number): void {
    this.loading = true;
    this.patientService.getPatientById(value).subscribe({
      next: (data) => {
        this.patient = data;
        console.log('this.patients', this.patient);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load patients. Please try again.';
        this.loading = false;
      },
    });
  }

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

  // Load medical record for the patient
  loadMedicalRecord() {
    this.loading = true;
    this.error = null;
    this.medicalRecordsService.getMedicalRecord(this.patientId).subscribe({
      next: (data) => {
        this.recordExists = true;
        console.log('Raw data from API:', data);
        console.log(this.medicalRecord?.labResults);
        this.idToPass = data.id ?? null; // <-- Set the ID here

        // Prepare flattened arrays manually
        const allDiagnoses: Diagnosis[] = [];
        const allTreatments: string[] = [];
        const allMedications: Medication[] = [];
        const allImmunizations: Immunization[] = [];
        const allLabResults: LabResult[] = [];
        const allAllergies: Allergy[] = [];
        const allNotes: string[] = [];

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

        data.allergies?.forEach((allergie) => {
          if (allergie) {
            allAllergies.push(...[allergie]);
          }
        });

        data.immunizations?.forEach((imm) => {
          if (imm) {
            allImmunizations.push(...[imm]);
          }
        });

        data.labResults?.forEach((lap) => {
          if (lap) {
            allLabResults.push(...[lap]);
          }
        });

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
        // Could add a success message here
      },
      error: (err) => {
        console.error('Error saving medical record:', err);
        this.error = 'Failed to save medical record. Please try again.';
      },
    });
  }

  // Update form with medical record data

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
      labResults: [],
      immunizations: [],
      followUpDate: undefined,
      isFollowUpRequired: false,
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
    if (this.patient) {
      this.router.navigate(['/order-lab', this.patientId]);
    }
  }

  downloadLabResults(labId: number): void {
    if (this.patient) {
      this.patientService.downloadLabResults(this.patientId, labId).subscribe({
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
      this.patientService
        .emailLabResults(this.patientId, labId, this.patient.email)
        .subscribe({
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
    const results = this.patient?.medicalRecord?.labResults;
    return this.hasItems(results);
  }

  get hasCurrentImmunization(): boolean {
    const visits = this.patient?.medicalRecord?.recentVisits || [];
    const meds = visits.flatMap((v) => v.medication || []);
    return this.hasItems(meds);
  }

  backClicked() {
    this.location.back();
  }
}
