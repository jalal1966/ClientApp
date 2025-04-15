import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Allergy, MedicalRecord } from '../../../models/medicalRecord.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { Patients } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient/patient.service';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/user';
import { Location } from '@angular/common';
import { Diagnosis, Medication, Visit } from '../../../models/visits.model';
import { Immunization } from '../../../models/medicalRecord.model';
import { LabResult } from '../../../models/medicalRecord.model';
import { PatientVisitComponent } from '../patient-visits/patient-visits.component';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PatientVisitComponent,
  ],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.scss',
})
export class MedicalRecordsComponent
  extends PatientComponentBase
  implements OnInit
{
  medicalRecord: any = null;
  medicalRecordForm: FormGroup;
  loading = true;
  saving = false;
  saveSuccess = false;
  error: string | null = null;
  recordExists = false;
  patient: Patients | undefined;
  idToPass: number | null = null;

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
    // Initialize the form with the fields from the updated MedicalRecord interface

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
        this.loadMedicalRecord();
      } else {
        this.error = 'Patient ID is required';
        this.loading = false;
      }
    });

    // Watch for changes to the isFollowUpRequired field to validate followUpDate
    this.medicalRecordForm
      .get('isFollowUpRequired')
      ?.valueChanges.subscribe((isRequired) => {
        const followUpDateControl = this.medicalRecordForm.get('followUpDate');
        if (isRequired) {
          followUpDateControl?.setValidators([Validators.required]);
        } else {
          followUpDateControl?.clearValidators();
        }
        followUpDateControl?.updateValueAndValidity();
      });

    // Add listeners for height and weight to automatically update BMI
    this.medicalRecordForm.get('weight')?.valueChanges.subscribe(() => {
      this.updateBMI();
    });

    this.medicalRecordForm.get('height')?.valueChanges.subscribe(() => {
      this.updateBMI();
    });

    this.loadPatient(this.patientId);
  }

  loadPatient(value: number): void {
    this.loading = true;
    this.patientService.getPatient(value).subscribe({
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

  loadMedicalRecord(): void {
    this.loading = true;
    this.error = null;

    this.medicalRecordsService.getMedicalRecord(this.patientId).subscribe({
      next: (data) => {
        this.recordExists = true;
        console.log('Raw data from API:', data);
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
        // console.log('Form values after patch:', this.medicalRecord.value);
        this.loading = false;
      },
      error: (err) => {
        this.idToPass = null; // Reset on error
        // Check if it's a 404 (record doesn't exist yet)
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

  updateBMI(): void {
    // Get the raw values
    const heightValue = this.medicalRecordForm.get('height')?.value;
    const weightValue = this.medicalRecordForm.get('weight')?.value;

    // Convert to numbers and check if they're valid
    const height =
      typeof heightValue === 'string' ? parseFloat(heightValue) : heightValue;
    const weight =
      typeof weightValue === 'string' ? parseFloat(weightValue) : weightValue;

    if (
      height &&
      weight &&
      !isNaN(height) &&
      !isNaN(weight) &&
      height > 0 &&
      weight > 0
    ) {
      const bmi = this.calculateBMI(height, weight);
      console.log('Calculated BMI:', bmi);
      this.medicalRecordForm.patchValue({ bmi }, { emitEvent: false });
    } else {
      console.log('Invalid height or weight values for BMI calculation');
    }
  }

  // Move calculation to component to avoid unnecessary service dependency
  calculateBMI(height: number, weight: number): number {
    // BMI formula: weight (kg) / (height (m))^2
    // Assuming height is in cm and weight in kg
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }

  onSubmit(): void {
    if (this.medicalRecordForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.formControls).forEach((key) => {
        const control = this.medicalRecordForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Ensure BMI is calculated before submitting
    this.updateBMI();

    // Map form values to the model expected by the backend
    const formValues = this.medicalRecordForm.value;

    // Create a new Visit for the current entry
    const newVisit: Partial<Visit> = {
      visitDate: new Date(),
      patientId: this.patientId,
      providerId: this.currentUser.userID,
      providerName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
      visitType: 'Regular',
      reason: 'Medical record update',
      planTreatment: formValues.treatment,
      notes: formValues.notes,
      followUpRequired: formValues.isFollowUpRequired,
      followUpDate: formValues.isFollowUpRequired
        ? new Date(formValues.followUpDate)
        : undefined,
      diagnosis: [],
      medication: [],
    };

    // If diagnosis is provided, create diagnosis entries
    if (formValues.diagnosis) {
      const diagnosisEntry: Partial<Diagnosis> = {
        diagnosisDate: new Date(),
        description: formValues.diagnosis,
        isActive: true,
      };
      newVisit.diagnosis = [diagnosisEntry as Diagnosis];
    }

    // Create a Medication entry if medications are provided
    if (formValues.medications) {
      const medicationEntry: Partial<Medication> = {
        name: formValues.medications,
        dosage: '',
        frequency: '',
        startDate: new Date(),
        prescribingProvider: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
        purpose: formValues.diagnosis || '',
      };
      newVisit.medication = [medicationEntry as Medication];
    }

    const record: Partial<MedicalRecord> = {
      patientId: this.patientId,
      userID: this.currentUser.userID,

      // Physical Information
      height: formValues.height,
      weight: formValues.weight,
      bmi: formValues.bmi,
      bloodType: formValues.bloodType,

      // Medical History
      chronicConditions: formValues.chronicConditions,
      surgicalHistory: formValues.surgicalHistory,
      familyMedicalHistory: formValues.familyMedicalHistory,
      socialHistory: formValues.socialHistory,

      // Arrays - empty by default, to be populated by backend
      recentVisits: [newVisit as Visit],
      allergies: [],
      recentLabResults: [],
      immunizations: [],
    };

    console.log('Record to submit:', record);
    this.saving = true;
    this.saveSuccess = false;

    if (this.recordExists) {
      // Update existing record
      this.medicalRecordsService
        .updateMedicalRecord(this.patientId, record as MedicalRecord)
        .subscribe({
          next: () => {
            this.saving = false;
            this.saveSuccess = true;
            setTimeout(() => (this.saveSuccess = false), 3000);
          },
          error: (err) => {
            this.error =
              err.message || 'An error occurred while updating medical record';
            this.saving = false;
          },
        });
    } else {
      // Create new record
      this.medicalRecordsService
        .createMedicalRecord(this.patientId, record as MedicalRecord)
        .subscribe({
          next: () => {
            this.recordExists = true;
            this.saving = false;
            this.saveSuccess = true;
            setTimeout(() => (this.saveSuccess = false), 3000);
          },
          error: (err) => {
            this.error =
              err.message || 'An error occurred while creating medical record';
            this.saving = false;
          },
        });
    }
  }
  backClicked() {
    this.location.back();
  }
}
