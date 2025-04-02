import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  ContactInfoUpdate,
  InsuranceUpdate,
  PatientInfo,
} from '../../../models/patientInfo';
import { PatientInfoService } from '../../../services/patientinfo/patient-info.service';
import { CommonModule } from '@angular/common';
import { PatientDetail } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-info',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './patient-info.component.html',
  styleUrls: ['./patient-info.component.scss'],
})
export class PatientInfoComponent implements OnInit {
  patientId: number;
  patientInfo: PatientInfo | null = null;
  patientForm: FormGroup;
  contactForm: FormGroup;
  insuranceForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  updateSuccess = false;
  @Input() patient: PatientDetail | null = null;

  constructor(
    private route: ActivatedRoute,
    private patientInfoService: PatientInfoService,
    private fb: FormBuilder
  ) {
    this.patientId = 0;

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
    this.route.parent?.params.subscribe((params) => {
      this.patientId = +params['id'];
      this.loadPatientInfo();
    });
  }

  loadPatientInfo(): void {
    this.loading = true;
    this.errorMessage = null;

    this.patientInfoService
      .getPatientInfo(this.patientId)
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

  populatePatientForm(info: PatientInfo): void {
    this.patientForm.patchValue({
      firstName: info.firstName,
      lastName: info.lastName,
      dateOfBirth: info.dateOfBirth,
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
}
