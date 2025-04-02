import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PatientDetail, Patients } from '../../../models/patient.model';
import { MedicalRecord } from '../../../models/medicalRecord.model';
import { PatientService } from '../../../services/patient/patient.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';

@Component({
  selector: 'app-medical-records',
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
  }

  loadMedicalRecord(): void {
    this.loading = true;
    this.error = null;

    this.medicalRecordsService.getMedicalRecord(this.patientId).subscribe({
      next: (data) => {
        this.recordExists = true;

        // Map the backend model to the form model
        // Note: Be careful with casing differences between backend and frontend
        this.medicalRecordForm.patchValue({
          // Physical Information (note the capital letters from backend)
          height: data.Height,
          weight: data.Weight,
          bmi: data.bMI,
          bloodType: data.BloodType,

          // Medical History
          chronicConditions: data.ChronicConditions,
          surgicalHistory: data.SurgicalHistory,
          familyMedicalHistory: data.patientDetail?.familyMedicalHistory || '',
          socialHistory: data.patientDetail?.socialHistory || '',

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
        if (err.message.includes('Error Code: 404')) {
          this.recordExists = false;
          this.loading = false;
        } else {
          this.error = err.message;
          this.loading = false;
        }
      },
    });
  }

  updateBMI(): void {
    const height = this.medicalRecordForm.value.height;
    const weight = this.medicalRecordForm.value.weight;

    const bmi = this.medicalRecordsService.calculateBMI(height, weight);
    this.medicalRecordForm.patchValue({ bmi }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.medicalRecordForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.formControls).forEach((key) => {
        const control =
          this.formControls[key as keyof typeof this.formControls];
        control.markAsTouched();
      });
      return;
    }

    // Ensure BMI is calculated before submitting
    this.updateBMI();

    // Map form values to the model expected by the backend
    const formValues = this.medicalRecordForm.value;

    const record: Partial<MedicalRecord> = {
      // Make sure we're using the right property names for the backend
      patientId: this.patientId,
      Height: formValues.height,
      Weight: formValues.weight,
      bMI: formValues.bmi,
      BloodType: formValues.bloodType,
      ChronicConditions: formValues.chronicConditions,
      SurgicalHistory: formValues.surgicalHistory,

      // Keep existing patientDetail and just update specific fields
      patientDetail: {
        familyMedicalHistory: formValues.familyMedicalHistory,
        socialHistory: formValues.socialHistory,
      } as PatientDetail,

      // Current visit info
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
            this.error = err.message;
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
            this.error = err.message;
            this.saving = false;
          },
        });
    }
  }
}
