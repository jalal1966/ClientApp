import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Patient, PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isEditMode = false;
  patientId: number;
  isSubmitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: [''],
      gender: [''],
      contactNumber: [''],
      email: [''],
      address: [''],
      emergencyContactName: [''],
      emergencyContactNumber: [''],
      insuranceProvider: [''],
      insuranceNumber: [''],
    });

    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = this.router.url.includes('/edit');
  }

  ngOnInit(): void {
    if (this.isEditMode && this.patientId) {
      this.patientService.getPatient(this.patientId).subscribe({
        next: (patient) => {
          this.patientForm.patchValue({
            ...patient,
            dateOfBirth: patient.dateOfBirth
              ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
              : '',
          });
        },
        error: (err) => {
          this.error = 'Failed to load patient data. Please try again.';
        },
      });
    }
  }

  onSubmit(): void {
    if (this.patientForm.invalid) return;

    this.isSubmitting = true;
    const patientData: Patient = {
      ...this.patientForm.value,
      id: this.isEditMode ? this.patientId : undefined,
    };

    if (this.isEditMode) {
      this.patientService.updatePatient(this.patientId, patientData).subscribe({
        next: () => {
          this.router.navigate(['/patients', this.patientId]);
        },
        error: (err) => {
          this.error = 'Failed to update patient. Please try again.';
          this.isSubmitting = false;
        },
      });
    } else {
      this.patientService.createPatient(patientData).subscribe({
        next: (newPatient) => {
          this.router.navigate(['/patients', newPatient.id]);
        },
        error: (err) => {
          this.error = 'Failed to create patient. Please try again.';
          this.isSubmitting = false;
        },
      });
    }
  }

  navigateBack(): void {
    if (this.isEditMode) {
      this.router.navigate(['/patients', this.patientId]);
    } else {
      this.router.navigate(['/patients']);
    }
  }

  // Getter methods for form controls
  get firstName() {
    return this.patientForm.get('firstName');
  }
  get lastName() {
    return this.patientForm.get('lastName');
  }
}
