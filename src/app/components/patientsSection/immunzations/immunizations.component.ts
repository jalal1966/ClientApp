import { Component, inject, Input, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Immunization } from '../../../models/medicalRecord.model';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ImmunizationService } from '../../../services/patient-immunization/immunization.service';
import { Patients } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient/patient.service';
import { filter, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { MedicalRecordUtilityService } from '../../../services/medicalRecordUtility/medical-record-utility.service';
import { Location } from '@angular/common';
import {
  VaccineLotNumber,
  VaccineManufacturer,
  VaccineNames,
} from '../../../models/enums.model';

@Component({
  selector: 'app-immunizations',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule, ReactiveFormsModule],
  templateUrl: './immunizations.component.html',
  styleUrls: ['./immunizations.component.scss'],
})
export class ImmunizationsComponent
  extends PatientComponentBase
  implements OnInit
{
  vaccineNames = Object.values(VaccineNames);
  vaccineLotNumbers = Object.values(VaccineLotNumber);
  vaccineManufacturers = Object.values(VaccineManufacturer);

  immunizationForm!: FormGroup;
  isEditing = false;
  currentEditId?: number;
  showForm: boolean = false;

  private destroy$ = new Subject<void>();
  @Input() immunizations: Immunization[] = [];
  @Input() loading = false;
  @Input() isMainForm: boolean = true;

  showNoRecordMessage = false;
  patient: Patients | undefined;
  error: string | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  selectedImmunization: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private medicalRecordUtility: MedicalRecordUtilityService,
    private immunizationsService: ImmunizationService,
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
            this.initForm();
            this.loadImmunizations();
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

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.showForm = false; // Hide form when tab changes
      });
  }

  initForm(Immniz?: Immunization): void {
    this.immunizationForm = this.fb.group({
      patientId: [this.patientId],
      medicalRecordId: [this.medicalRecordId],
      vaccineName: [Immniz?.vaccineName || '', Validators.required],
      administrationDate: [
        Immniz?.administrationDate
          ? new Date(Immniz.administrationDate).toISOString().split('T')[0]
          : '',
        Validators.required,
      ],

      lotNumber: [Immniz?.lotNumber || '', Validators.required],
      nextDoseDate: [
        Immniz?.nextDoseDate
          ? new Date(Immniz.nextDoseDate).toISOString().split('T')[0]
          : '',
        Validators.required,
      ],
      administeringProvider: [
        Immniz?.administeringProvider || '',
        Validators.required,
      ],
      manufacturer: [Immniz?.manufacturer || ''],
    });
  }

  loadImmunizations() {
    this.loading = true;
    this.errorMessage = null;
    this.immunizationsService.getImmunizations(this.patientId).subscribe({
      next: (results) => {
        this.immunizations = results;
        this.loading = false; // Set loading to false
      },
      error: (error) => {
        this.loading = false; // Set loading to false
        this.errorMessage =
          'Failed to load immunizations: ' + (error.message || 'Unknown error');
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
    this.currentEditId = undefined;
    this.initForm();
    this.showForm = false; // Hide the form when canceling
  }

  submitForm(): void {
    if (this.immunizationForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.immunizationForm.controls).forEach((key) => {
        this.immunizationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Make a copy of the form data to ensure proper date formatting
    const formData = { ...this.immunizationForm.value };

    // Ensure dates are in the correct format for the API
    if (formData.administrationDate) {
      // Make sure it's a proper date string in ISO format
      formData.administrationDate = new Date(
        formData.administrationDate
      ).toISOString();
    }

    if (formData.nextDoseDate) {
      // Make sure it's a proper date string in ISO format
      formData.nextDoseDate = new Date(formData.nextDoseDate).toISOString();
    }

    const immunization: Immunization = {
      ...formData,
      patientId: this.patientId,
      // Add medicalRecordId if required by your API
      medicalRecordId: this.medicalRecordId || null,
    };

    console.log('Submitting immunization data:', immunization); // Debug log

    if (this.isEditing && this.currentEditId) {
      immunization.id = this.currentEditId;
      this.immunizationsService
        .updateImmunization(this.patientId, this.currentEditId, immunization)
        .subscribe({
          next: () => {
            this.loading = false; // Set loading to false
            this.loadImmunizations();
            this.cancelEdit();
            this.successMessage = 'Lab result updated successfully';
            setTimeout(() => (this.successMessage = null), 3000);
            this.showForm = false; // Hide form after successful update
          },
          error: (error) => {
            this.loading = false; // Set loading to false
            this.errorMessage =
              'Failed to update Immunizations result: ' +
              (error.message || 'Unknown error');
            this.loading = false;
            console.error('Failed to update Immunizations result', error);
          },
        });
    } else {
      this.immunizationsService
        .createImmunization(this.patientId, immunization)
        .subscribe({
          next: () => {
            this.loading = false; // Set loading to false
            this.loadImmunizations();
            this.immunizationForm.reset();
            this.successMessage = 'New Immunizations result added successfully';
            setTimeout(() => (this.successMessage = null), 3000);
            this.showForm = false;
          },
          error: (error) => {
            this.loading = false; // Set loading to false
            this.errorMessage =
              'Failed to create Immunizations result: ' +
              (error.message || 'Unknown error');
            this.loading = false;
          },
        });
      this.showForm = false;
    }
  }

  editImmunization(immunization: Immunization): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentEditId = immunization.id;
    this.initForm(immunization);
  }

  deleteImmunization(id?: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this Immunization result?')) {
      this.immunizationsService
        .deleteImmunization(this.patientId, id)
        .subscribe({
          next: () => {
            this.loadImmunizations();
          },
          error: (error) => {
            this.errorMessage =
              'Failed to delete Immunization result' +
              (error.message || 'Unknown error');
          },
        });
    }
  }

  downloadImmunization(immzId: number): void {
    if (this.patient) {
      this.patientService.downloadImmunizationsResults(immzId).subscribe({
        next: (pdfBlob) => {
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Immunizations-results-${immzId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error) => {
          this.errorMessage =
            'Error downloading Immunizations results' +
            (error.message || 'Unknown error');
        },
      });
    }
  }

  emailImmunizationResults(immzId: number): void {
    if (this.patient && this.patient.email) {
      this.patientService
        .emailImmunizationsResults(immzId, this.patient.email)
        .subscribe({
          next: () => {
            alert('Lab results were successfully emailed to the patient.');
          },
          error: (error) => {
            this.errorMessage =
              'Error emailing Immunizations results' +
              (error.message || 'Unknown error');
          },
        });
    }
  }

  backClicked() {
    this.location.back();
  }
}
