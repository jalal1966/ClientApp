import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Route,
  Router,
  RouterModule,
} from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LabResult } from '../../../models/medicalRecord.model';
import { PatientLabResultsService } from '../../../services/patient-lab-results/patient-lab-results.service';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { AuthService } from '../../../services/auth/auth.service';
import { Patients } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient/patient.service';
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';
import { LabTestName } from '../../../models/enums.model';
import { Location } from '@angular/common';
import { MedicalRecordUtilityService } from '../../../services/medicalRecordUtility/medical-record-utility.service';
import { filter, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-patient-lab-results',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './patient-lab-results.component.html',
  styleUrl: './patient-lab-results.component.scss',
})
export class PatientLabResultsComponent
  extends PatientComponentBase
  implements OnInit
{
  labResultForm!: FormGroup;
  isEditing = false;
  currentEditId?: number;

  testNames = Object.values(LabTestName);
  private destroy$ = new Subject<void>();
  @Input() labResults: LabResult[] = [];
  @Input() loading = false;
  @Input() isMainForm: boolean = true;

  // @Input() medicalRecordId?: number;
  showNoRecordMessage = false;
  patient: Patients | undefined;
  error: string | null = null;
  // Add error handling and loading state

  showForm: boolean = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private medicalRecordUtility: MedicalRecordUtilityService,
    private labResultsService: PatientLabResultsService,
    private medicalRecordsService: MedicalRecordsService,
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
            this.loadLabResults();
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
  // Add a new method to check if the medical record exists

  loadLabResults(): void {
    this.loading = true;
    this.errorMessage = null;
    this.labResultsService.getLabResults(this.patientId).subscribe({
      next: (results) => {
        this.labResults = results;
      },
      error: (error) => {
        this.errorMessage =
          'Failed to load lab results' + (error.message || 'Unknown error');
        setTimeout(() => (this.errorMessage = null), 3000);
        this.loading = false;
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
    this.showForm = false;
  }

  submitForm(): void {
    if (this.labResultForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.labResultForm.controls).forEach((key) => {
        this.labResultForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.labResultForm.value;
    const labResult: LabResult = {
      ...formData,
      patientId: this.patientId,
    };

    if (this.isEditing && this.currentEditId) {
      labResult.id = this.currentEditId;
      this.labResultsService
        .updateLabResult(this.patientId, this.currentEditId, labResult)
        .subscribe({
          next: () => {
            this.loadLabResults();
            this.cancelEdit();
            this.successMessage = 'Lab result updated successfully';
            setTimeout(() => (this.successMessage = null), 3000);
            this.showForm = false;
          },
          error: (error) => {
            this.errorMessage =
              'Failed to update lab result: ' +
              (error.message || 'Unknown error');
            this.loading = false;
          },
        });
    } else {
      this.labResultsService
        .createLabResult(this.patientId, labResult)
        .subscribe({
          next: () => {
            this.loadLabResults();
            this.labResultForm.reset();
            this.successMessage = 'New lab result added successfully';
            setTimeout(() => (this.successMessage = null), 3000);
            this.showForm = false;
          },
          error: (error) => {
            this.errorMessage =
              'Failed to create lab result: ' +
              (error.message || 'Unknown error');
            this.loading = false;
          },
        });
      this.showForm = false;
    }
  }

  initForm(labResult?: LabResult): void {
    this.labResultForm = this.fb.group({
      patientId: [null],
      medicalRecordId: [null],
      testDate: [
        labResult?.testDate
          ? new Date(labResult.testDate).toISOString().split('T')[0]
          : '',
        Validators.required,
      ],
      testName: [labResult?.testName || '', Validators.required],
      result: [labResult?.result || '', Validators.required],
      referenceRange: [labResult?.referenceRange || ''],
      orderingProvider: [labResult?.orderingProvider || ''],
      notes: [labResult?.notes || ''],
    });
  }

  editLabResult(labResult: LabResult): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentEditId = labResult.id;
    this.initForm(labResult);
  }

  deleteLabResult(id?: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this lab result?')) {
      this.labResultsService.deleteLabResult(this.patientId, id).subscribe({
        next: () => {
          this.loadLabResults();
        },
        error: (error) => {
          this.errorMessage =
            'Failed to delete lab result' + (error.message || 'Unknown error');
          setTimeout(() => (this.errorMessage = null), 3000);
        },
      });
    }
  }

  downloadLabResults(labId: number): void {
    if (this.patient) {
      this.patientService.downloadLabResults(labId).subscribe({
        next: (pdfBlob) => {
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `lab-results-${labId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error) => {
          this.errorMessage =
            'Error downloading lab results:' +
            (error.message || 'Unknown error');
          setTimeout(() => (this.errorMessage = null), 3000);
        },
      });
    }
  }

  emailLabResults(labId: number): void {
    if (this.patient && this.patient.email) {
      this.patientService.emailLabResults(labId, this.patient.email).subscribe({
        next: () => {
          alert('Lab results were successfully emailed to the patient.');
        },
        error: (error) => {
          this.errorMessage =
            'Error emailing lab results:' + (error.message || 'Unknown error');
          setTimeout(() => (this.errorMessage = null), 3000);
        },
      });
    }
  }

  backClicked() {
    this.location.back();
  }
}
