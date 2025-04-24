// blood-pressure.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbTooltipModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { Pressure } from '../../../models/medicalRecord.model';
import { BloodPressureService } from '../../../services/bloodPressure/blood-pressure.service';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../services/patient/patient.service';
import { Patients } from '../../../models/patient.model';
import { differenceInYears } from 'date-fns/differenceInYears';
import { MedicalRecordUtilityService } from '../../../services/medicalRecordUtility/medical-record-utility.service';
import { Location } from '@angular/common';
import { filter, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-blood-pressure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    NgbAlertModule,
  ],
  templateUrl: './blood-pressure.component.html',
  styleUrls: ['./blood-pressure.component.scss'],
})
export class BloodPressureComponent
  extends PatientComponentBase
  implements OnInit
{
  @Input() pressure: Pressure[] = [];
  @Input() loading = false;
  @Input() isMainForm: boolean = true;

  // @Input() medicalRecordId: number | undefined;
  bloodPressureForm!: FormGroup;
  pressureRecords: Pressure[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  selectedRecord: Pressure | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  patientAge: any;
  patientWeight: any;
  patientGender!: string;

  patient: Patients | undefined;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private medicalRecordUtility: MedicalRecordUtilityService,
    private bloodPressureService: BloodPressureService,
    authService: AuthService,
    router: Router,
    private location: Location
  ) {
    super(authService, router);
  }

  ngOnInit(): void {
    // Get patient ID from route parameters
    const parentParams = this.route.parent?.snapshot.paramMap;
    const currentParams = this.route.snapshot.paramMap;
    const id = parentParams?.get('id') ?? currentParams.get('id');

    if (id) {
      this.patientId = +id;
      this.route.queryParams
        .pipe(
          take(1), // Only take the first emission to avoid multiple subscriptions
          switchMap((params) => {
            if (params['medicalRecordId']) {
              this.medicalRecordId = +params['medicalRecordId'];
              return of(this.medicalRecordId);
            } else {
              return this.medicalRecordUtility
                .checkMedicalRecord(this.patientId)
                .pipe(
                  tap((recordId) => {
                    this.medicalRecordId = recordId;
                  })
                );
            }
          })
        )
        .subscribe({
          next: () => {
            this.loading = false;
            this.errorMessage = null;
            this.successMessage = 'Download Patient Info successfully';
            setTimeout(() => (this.successMessage = null), 3000);
            this.loadPatient(this.patientId);
            this.initForm();
            this.loadPressureRecords();
          },
          error: () => {
            this.loading = false;
            this.successMessage = null;
            this.errorMessage = 'Failed to retrieve medical record information';
            setTimeout(() => (this.errorMessage = null), 3000);
          },
          complete: () => {
            // Handle the case when no medicalRecordId is available
            if (!this.medicalRecordId) {
              this.errorMessage = 'No medical record ID found';
              setTimeout(() => (this.errorMessage = null), 3000);
            }
          },
        });
    } else {
      this.loading = false;
      this.errorMessage = 'Patient ID is required';
      setTimeout(() => (this.errorMessage = null), 3000);
      this.successMessage = null;
    }
  }

  loadPatient(value: number): void {
    this.loading = true;
    this.patientService.getPatient(value).subscribe({
      next: (data) => {
        this.patient = data;
        this.patientAge = differenceInYears(
          new Date(),
          new Date(this.patient.dateOfBirth)
        );
        this.patientGender = this.patient.genderID === 1 ? 'male' : 'female';
        this.patientWeight = this.patient.medicalRecord.weight;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load patients. Please try again.';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.loading = false;
      },
    });
  }

  initForm(): void {
    this.bloodPressureForm = this.fb.group({
      systolicPressure: [
        null,
        [Validators.required, Validators.min(60), Validators.max(250)],
      ],
      diastolicPressure: [
        null,
        [Validators.required, Validators.min(40), Validators.max(150)],
      ],
    });
  }

  loadPressureRecords(): void {
    this.isLoading = true;
    this.bloodPressureService.getPressureById(this.patientId).subscribe({
      next: (records) => {
        this.pressureRecords = records;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load blood pressure records.';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.bloodPressureForm.invalid) {
      this.bloodPressureForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const systolicPressure =
      this.bloodPressureForm.get('systolicPressure')?.value;
    const diastolicPressure =
      this.bloodPressureForm.get('diastolicPressure')?.value;

    if (this.selectedRecord) {
      // Update existing record
      const updatedPressure: Pressure = {
        ...this.selectedRecord,
        systolicPressure,
        diastolicPressure,
      };

      this.bloodPressureService
        .updatePressure(updatedPressure.id!, updatedPressure)
        .subscribe({
          next: () => {
            this.handleSuccessfulSubmission(
              'Blood pressure record updated successfully!'
            );
          },
          error: (error) => this.handleSubmissionError(error),
        });
    } else {
      // Create new comprehensive record
      this.bloodPressureService
        .createComprehensivePressureRecord(
          this.patientId,
          this.medicalRecordId ?? 0,
          systolicPressure,
          diastolicPressure,
          this.patientAge,
          this.patientWeight,
          this.patientGender
        )
        .subscribe({
          next: (newRecord) => {
            this.handleSuccessfulSubmission(
              'Blood pressure record created successfully!'
            );
          },
          error: (error) => this.handleSubmissionError(error),
        });
    }
  }

  private handleSuccessfulSubmission(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;
    this.isSubmitting = false;
    this.resetForm();
    this.loadPressureRecords();

    // Clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  private handleSubmissionError(error: any): void {
    this.errorMessage = 'Failed to save blood pressure record.';
    setTimeout(() => (this.errorMessage = null), 3000);
    this.successMessage = null;
    this.isSubmitting = false;
  }

  editRecord(record: Pressure): void {
    this.selectedRecord = record;
    this.bloodPressureForm.patchValue({
      systolicPressure: record.systolicPressure,
      diastolicPressure: record.diastolicPressure,
    });
  }

  deleteRecord(id: number): void {
    if (
      confirm('Are you sure you want to delete this blood pressure record?')
    ) {
      this.bloodPressureService.deletePressure(id).subscribe({
        next: () => {
          this.successMessage = 'Record deleted successfully';
          setTimeout(() => (this.successMessage = null), 3000);
          this.loadPressureRecords();
        },
        error: () => {
          this.errorMessage = 'Failed to delete record';
          setTimeout(() => (this.errorMessage = null), 3000);
        },
      });
    }
  }

  resetForm(): void {
    this.bloodPressureForm.reset();
    this.selectedRecord = null;
  }

  getBloodPressureCategory(record: Pressure): string {
    return this.bloodPressureService.getBloodPressureCategory(
      record.systolicPressure,
      record.diastolicPressure
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }

  backClicked() {
    this.location.back();
  }
}
