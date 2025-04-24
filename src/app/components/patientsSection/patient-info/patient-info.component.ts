import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
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
  errorMessage: string | null = null;
  updateSuccess = false;
  currentUserID: any;
  error: string | null = null;

  doctors: { firstName: string; lastName: string; fullName: string }[] = [];
  @Input() patient: Patients | null = null;
  @Input() master: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private patientInfoService: PatientService,
    private location: Location,
    private doctorsService: AuthService,
    authService: AuthService,
    router: Router,
    private fb: FormBuilder
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

      // Get medical record ID directly from query parameters
      this.route.queryParams.subscribe((params) => {
        if (params['medicalRecordId']) {
          this.medicalRecordId = +params['medicalRecordId'];
          this.loadPatientInfo();
          this.loadDoctors();
        } else {
          console.warn('No medical record ID provided in query parameters');
          // Handle the case when no medicalRecordId is provided
        }
      });
    } else {
      this.error = 'Patient ID is required';
      this.loading = false;
    }
  }

  loadDoctors(): void {
    this.loading = true;
    this.doctorsService.getDoctorsWithFullName().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load Doctors. Please try again.';
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
    this.updateSuccess = false;

    const updatedInfo = {
      ...this.patientInfo,
      ...this.patientForm.value,
    };

    this.patientInfoService
      .updatePatientInfo(this.patientId, updatedInfo)
      .pipe(
        catchError((err) => {
          this.errorMessage = `Failed to update patient information: ${
            err.message || 'Unknown error'
          }`;
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(() => {
        this.updateSuccess = true;
        setTimeout(() => (this.updateSuccess = false), 3000);
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
    this.updateSuccess = false;

    const contactInfo: ContactInfoUpdate = this.contactForm.value;

    this.patientInfoService
      .updateContactInfo(this.patientId, contactInfo)
      .pipe(
        catchError((err) => {
          this.errorMessage = `Failed to update contact information: ${
            err.message || 'Unknown error'
          }`;
          return of(null);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(() => {
        this.updateSuccess = true;
        setTimeout(() => (this.updateSuccess = false), 3000);
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
    this.updateSuccess = false;

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
        this.updateSuccess = true;
        setTimeout(() => (this.updateSuccess = false), 3000);
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
