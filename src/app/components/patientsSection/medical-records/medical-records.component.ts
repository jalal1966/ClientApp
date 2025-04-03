import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Patients } from '../../../models/patient.model';
import { MedicalRecord } from '../../../models/medicalRecord.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.scss',
})
export class MedicalRecordsComponent implements OnInit {
  patientId: number = 0;
  medicalRecordForm: FormGroup;
  loading = true;
  saving = false;
  saveSuccess = false;
  error: string | null = null;
  recordExists = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private medicalRecordsService: MedicalRecordsService
  ) {
    // Initialize the form with the fields from the updated MedicalRecord interface
    this.medicalRecordForm = this.fb.group({
      // Physical Information
      height: ['', [Validators.required]],
      weight: ['', [Validators.required]],
      bmi: [''],
      bloodType: [''],

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

  get formControls() {
    return this.medicalRecordForm.controls;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('patientId');
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
    this.medicalRecordForm.get('height')?.valueChanges.subscribe(() => {
      this.updateBMI();
    });

    this.medicalRecordForm.get('weight')?.valueChanges.subscribe(() => {
      this.updateBMI();
    });
  }

  loadMedicalRecord(): void {
    this.loading = true;
    this.error = null;

    this.medicalRecordsService.getMedicalRecord(this.patientId).subscribe({
      next: (data) => {
        this.recordExists = true;

        // Map the backend model to the form model
        this.medicalRecordForm.patchValue({
          // Physical Information
          height: data.height,
          weight: data.weight,
          bmi: data.bMI, // Note: case difference between backend and form
          bloodType: data.bloodType,

          // Medical History
          chronicConditions: data.chronicConditions,
          surgicalHistory: data.surgicalHistory,
          familyMedicalHistory: data.familyMedicalHistory,
          socialHistory: data.socialHistory,

          // Current Visit
          recordDate: data.recordDate,
          diagnosis: data.diagnosis,
          treatment: data.treatment,
          medications: data.medications,
          notes: data.notes,
          isFollowUpRequired: data.isFollowUpRequired,
          followUpDate: data.followUpDate,
        });

        this.loading = false;
      },
      error: (err) => {
        // Check if it's a 404 (record doesn't exist yet)
        if (err.status === 404 || err.message?.includes('Error Code: 404')) {
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

  updateBMI(): void {
    const height = this.medicalRecordForm.get('height')?.value;
    const weight = this.medicalRecordForm.get('weight')?.value;

    if (height && weight) {
      const bmi = this.calculateBMI(height, weight);
      this.medicalRecordForm.patchValue({ bmi }, { emitEvent: false });
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

    const record: Partial<MedicalRecord> = {
      patientId: this.patientId,
      // Physical Information
      height: formValues.height,
      weight: formValues.weight,
      bMI: formValues.bmi, // Note: case difference between form and backend
      bloodType: formValues.bloodType,

      // Medical History
      chronicConditions: formValues.chronicConditions,
      surgicalHistory: formValues.surgicalHistory,
      familyMedicalHistory: formValues.familyMedicalHistory,
      socialHistory: formValues.socialHistory,

      // Current Visit
      recordDate: formValues.recordDate,
      diagnosis: formValues.diagnosis,
      treatment: formValues.treatment,
      medications: formValues.medications,
      notes: formValues.notes,
      isFollowUpRequired: formValues.isFollowUpRequired,
      followUpDate: formValues.isFollowUpRequired
        ? formValues.followUpDate
        : null,
    };

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
}
