import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Allergy } from '../../../models/medicalRecord.model';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { AuthService } from '../../../services/auth/auth.service';
import { AllergyName, AllergyType } from '../../../models/enums.model';
import { MedicalRecordUtilityService } from '../../../services/medicalRecordUtility/medical-record-utility.service';
import { filter, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Location } from '@angular/common';
import { PatientAllergiesService } from '../../../services/patient-allergies/patient-allergies.service';

@Component({
  selector: 'app-patient-allergies',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-allergies.component.html',
  styleUrl: './patient-allergies.component.scss',
})
export class PatientAllergiesComponent
  extends PatientComponentBase
  implements OnInit
{
  allergyForm!: FormGroup;
  isEditing = false;
  currentAllergyId?: number;
  @Input() allergies: Allergy[] = [];
  @Input() loading = false;
  @Input() isMainForm: boolean = true;
  showNoRecordMessage = false;
  error: string | null = null;
  showForm: boolean = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  allergyTypes = Object.values(AllergyType);
  allergyName = Object.values(AllergyName);
  //medicalRecordId: number | undefined;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,

    private patientAllergiesService: PatientAllergiesService,
    private medicalRecordUtility: MedicalRecordUtilityService,
    authService: AuthService,
    router: Router,
    private location: Location
  ) {
    super(authService, router);
    this.initForm();
  }

  initForm() {
    this.allergyForm = this.fb.group({
      patientId: [this.patientId],
      medicalRecordId: [this.medicalRecordId],
      allergyType: ['', Validators.required],
      name: ['', Validators.required],
      reaction: ['', Validators.required],
      severity: ['', Validators.required],
      dateIdentified: ['', Validators.required],
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
            this.initForm();
            this.loadAllergies();
          },
          error: (error) => {
            this.loading = false;
            this.successMessage = null;
            this.errorMessage =
              'Failed to retrieve medical record information' +
              (error.message || 'Unknown error');
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

  loadAllergies(): void {
    // Use your service instead of calling http directly
    this.patientAllergiesService.getAllergies(this.patientId).subscribe({
      next: (data) => {
        this.allergies = data;
      },
      error: (error) => {
        this.errorMessage =
          'Error loading allergies:' + (error.message || 'Unknown error');
        setTimeout(() => (this.errorMessage = null), 3000);
      },
    });
  }

  openForm() {
    this.showForm = true;
    // Reset the form if needed
    if (this.isEditing) {
      this.cancelEdit();
    }
  }
  cancelEdit(): void {
    this.isEditing = false;
    this.currentAllergyId = undefined;
    this.allergyForm.reset();
    this.initForm();
    this.showForm = false; // Hide the form when canceling
  }

  saveAllergy(): void {
    if (this.allergyForm.invalid) {
      return;
    }

    const allergyData: Allergy = {
      patientId: this.patientId,
      medicalRecordId: this.medicalRecordId,
      allergyType: this.allergyForm.value.allergyType,
      name: this.allergyForm.value.name,
      reaction: this.allergyForm.value.reaction,
      severity: this.allergyForm.value.severity,
      dateIdentified: this.allergyForm.value.dateIdentified,
    };

    if (this.isEditing && this.currentAllergyId) {
      // Update existing allergy
      allergyData.id = this.currentAllergyId;
      this.patientAllergiesService
        .updateAllergy(this.patientId, this.currentAllergyId, allergyData)
        .subscribe({
          next: () => {
            this.loadAllergies();
            this.cancelEdit();
          },
          error: (error) => {
            this.errorMessage =
              'Error updating allergy:' + (error.message || 'Unknown error');
            setTimeout(() => (this.errorMessage = null), 3000);
          },
        });
    } else {
      // Create new allergy
      this.patientAllergiesService
        .createAllergy(this.patientId, allergyData)
        .subscribe({
          next: () => {
            this.loadAllergies();
            this.cancelEdit();
          },
          error: (error) => {
            this.errorMessage =
              'Error creating allergy:' + (error.message || 'Unknown error');
            setTimeout(() => (this.errorMessage = null), 3000);
          },
        });
    }
  }

  editAllergy(allergy: Allergy): void {
    this.isEditing = true;
    this.currentAllergyId = allergy.id;

    this.allergyForm.patchValue({
      allergyType: allergy.allergyType,
      name: allergy.name,
      reaction: allergy.reaction,
      severity: allergy.severity,
      dateIdentified: this.formatDateForInput(allergy.dateIdentified),
    });
  }

  deleteAllergy(id?: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this allergy?')) {
      this.patientAllergiesService.deleteAllergy(this.patientId, id).subscribe({
        next: () => {
          this.loadAllergies();
          if (this.currentAllergyId === id) {
            this.cancelEdit();
          }
        },
        error: (error) => {
          this.errorMessage =
            'Error deleting allergy:' + (error.message || 'Unknown error');
          setTimeout(() => (this.errorMessage = null), 3000);
        },
      });
    }
  }

  private formatDateForInput(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
  backClicked() {
    this.location.back();
  }
}
