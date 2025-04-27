import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { catchError, finalize, switchMap, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CommonModule } from '@angular/common';
import {
  ContactInfoUpdate,
  InsuranceUpdate,
  PatientInfo,
  Patients,
} from '../../../models/patient.model';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { Location } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { PatientService } from '../../../services/patient/patient.service';
import { MedicalRecordUtilityService } from '../../../services/medicalRecordUtility/medical-record-utility.service';

@Component({
  selector: 'app-patient-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-info.component.html',
  styleUrl: './patient-info.component.scss',
})
export class PatientInfoComponent
  extends PatientComponentBase
  implements OnInit
{
  patientInfo: PatientInfo | null = null;
  patientForm: FormGroup;
  contactForm: FormGroup;
  insuranceForm: FormGroup;
  loading = false;
  currentUserID: any;
  error: string | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;
  showNoRecordMessage = false;

  @Input() isMainForm: boolean = true;
  @Input() patient: Patients | null = null;

  doctors: { firstName: string; lastName: string; fullName: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientInfoService: PatientService,
    private doctorsService: AuthService,
    private medicalRecordUtility: MedicalRecordUtilityService,
    authService: AuthService,
    router: Router,
    private location: Location
  ) {
    super(authService, router);

    // Initialize forms
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      genderID: [null, Validators.required],
      nursID: [null],
      nursName: [''],
      patientDoctorID: [null],
      patientDoctorName: [''],
    });

    this.contactForm = this.fb.group({
      contactNumber: ['', Validators.pattern(/^\+?[0-9\s\-()]+$/)],
      email: ['', Validators.email],
      address: [''],
      emergencyContactName: [''],
      emergencyContactNumber: ['', Validators.pattern(/^\+?[0-9\s\-()]+$/)],
    });

    this.insuranceForm = this.fb.group({
      insuranceProvider: [''],
      insuranceNumber: [''],
    });
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
            if (this.isMainForm) {
              this.successMessage = 'Download Patient Info successfully';
              setTimeout(() => (this.successMessage = null), 3000);
            }
            this.loadPatientInfo();
            this.loadDoctors();
          },
          error: (err) => {
            //console.error('Error retrieving medical record:', err);
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

  loadDoctors(): void {
    this.loading = true;
    this.doctorsService.getDoctorsWithFullName().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          'Failed to load Doctors. Please try again.' +
          (error.message || 'Unknown error');
        setTimeout(() => (this.errorMessage = null), 3000);
        this.loading = false;
      },
    });
  }

  loadPatientInfo(): void {
    this.loading = true;
    this.errorMessage = null;

    this.patientInfoService
      .getPatient(this.patientId)
      .pipe(
        catchError((err) => {
          this.errorMessage = `Error loading patient information: ${
            err.message || 'Unknown error'
          }`;
          setTimeout(() => (this.errorMessage = null), 3000);
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((info) => {
        if (info) {
          this.patientInfo = info;
          this.populatePatientForm(info);
        }
      });
  }
  // Updated function to handle date formatting correctly
  formatDateToLocalYMD(dateInput: Date | string): string {
    // If it's already a Date object
    if (dateInput instanceof Date) {
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateInput.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // If it's a string
    if (typeof dateInput === 'string') {
      // Try to parse the date string
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    // Return empty string if neither condition is met
    return '';
  }

  populatePatientForm(info: PatientInfo): void {
    this.patientForm.patchValue({
      firstName: info.firstName,
      lastName: info.lastName,
      dateOfBirth: this.formatDateToLocalYMD(info.dateOfBirth),
      genderID: info.genderID,
      nursID: info.nursID,
      nursName: info.nursName,
      patientDoctorID: info.patientDoctorID,
      patientDoctorName: info.patientDoctorName,
    });

    this.contactForm.patchValue({
      contactNumber: info.contactNumber,
      email: info.email,
      address: info.address,
      emergencyContactName: info.emergencyContactName,
      emergencyContactNumber: info.emergencyContactNumber,
    });

    this.insuranceForm.patchValue({
      insuranceProvider: info.insuranceProvider,
      insuranceNumber: info.insuranceNumber,
    });
  }

  updatePatientBasicInfo(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const updatedInfo = {
      ...this.patientInfo,
      ...this.patientForm.value,
    };

    this.patientInfoService
      .updatePatientInfo(this.patientId, updatedInfo)
      .pipe(
        catchError((error) => {
          this.errorMessage = `Failed to update patient information: ${
            error.message || 'Unknown error'
          }`;
          setTimeout(() => (this.errorMessage = null), 3000);
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(() => {
        this.successMessage = ' Information updated successfully!';
        setTimeout(() => (this.successMessage = null), 3000);
        this.loadPatientInfo();
      });
  }

  updateContactInfo(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const contactInfo: ContactInfoUpdate = this.contactForm.value;

    this.patientInfoService
      .updateContactInfo(this.patientId, contactInfo)
      .pipe(
        catchError((error) => {
          this.errorMessage = `Failed to update contact information: ${
            error.message || 'Unknown error'
          }`;
          setTimeout(() => (this.errorMessage = null), 3000);
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(() => {
        this.successMessage = ' Information updated successfully!';
        setTimeout(() => (this.successMessage = null), 3000);
        this.loadPatientInfo();
      });
  }

  updateInsuranceInfo(): void {
    if (this.insuranceForm.invalid) {
      this.insuranceForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const insuranceInfo: InsuranceUpdate = this.insuranceForm.value;

    this.patientInfoService
      .updateInsuranceInfo(this.patientId, insuranceInfo)
      .pipe(
        catchError((err) => {
          this.errorMessage = `Failed to update insurance information: ${
            err.message || 'Unknown error'
          }`;
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(() => {
        this.successMessage = ' Information updated successfully!';
        setTimeout(() => (this.successMessage = null), 3000);
        this.loadPatientInfo();
      });
  }

  // Helper method to check if a form control is invalid and touched
  isInvalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return (
      control !== null && control.invalid && (control.dirty || control.touched)
    );
  }

  // Helper method to get error message for a form control
  getErrorMessage(formGroup: FormGroup, controlName: string): string {
    const control = formGroup.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    return '';
  }

  backClicked() {
    this.location.back();
  }
}
