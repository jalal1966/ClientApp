import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
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

  @Input() labResults: LabResult[] = [];
  @Input() loading = false;
  // @Input() medicalRecordId?: number;
  showNoRecordMessage = false;
  patient: Patients | undefined;
  error: string | null = null;
  // Add error handling and loading state

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private medicalRecordsService: MedicalRecordsService,
    authService: AuthService,
    router: Router,
    private labResultsService: PatientLabResultsService
  ) {
    super(authService, router);
  }

  ngOnInit(): void {
    // Use consistent approach for getting patient ID - prefer the parent route approach
    this.route.parent?.params.subscribe((parentParams) => {
      const currentParams = this.route.snapshot.params;
      this.patientId = +(parentParams['id'] ?? currentParams['id'] ?? 0);

      console.log('medicalRecordId', this.medicalRecordId);
      //this.initForm();
      this.checkMedicalRecord();
      //this.loadLabResults();
    });
  }
  // Add a new method to check if the medical record exists
  checkMedicalRecord(): void {
    this.loading = true;

    // Use the MedicalRecordsService to check if record exists
    this.medicalRecordsService.getMedicalRecord(this.patientId).subscribe({
      next: (data) => {
        this.loading = false;
        if (data && data.id) {
          this.medicalRecordId = data.id;
          this.showNoRecordMessage = false;
          this.initForm(); // Now medicalRecordId has a value
          this.loadLabResults(); // Only load visits if record exists
        } else {
          this.showNoRecordMessage = true;
        }
      },
      error: (err) => {
        this.loading = false;
        // Check if it's a 404 (record doesn't exist yet)
        if (err.status === 404 || err.message?.includes('Error Code: 404')) {
          this.showNoRecordMessage = true;
        } else {
          console.error('Error checking medical record:', err);
        }
      },
    });
  }

  loadLabResults(): void {
    this.loading = true;
    this.errorMessage = null;
    this.labResultsService.getLabResults(this.patientId).subscribe({
      next: (results) => {
        this.labResults = results;
      },
      error: (error) => {
        console.error('Failed to load lab results', error);
      },
    });
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
          },
          error: (error) => {
            this.errorMessage =
              'Failed to update lab result: ' +
              (error.message || 'Unknown error');
            this.loading = false;
            console.error('Failed to update lab result', error);
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
          },
          error: (error) => {
            this.errorMessage =
              'Failed to create lab result: ' +
              (error.message || 'Unknown error');
            this.loading = false;
            console.error('Failed to create lab result', error);
          },
        });
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
    this.isEditing = true;
    this.currentEditId = labResult.id;
    this.initForm(labResult);
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.currentEditId = undefined;
    this.initForm();
  }

  deleteLabResult(id?: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this lab result?')) {
      this.labResultsService.deleteLabResult(this.patientId, id).subscribe({
        next: () => {
          this.loadLabResults();
        },
        error: (error) => {
          console.error('Failed to delete lab result', error);
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
        error: (err) => {
          console.error('Error downloading lab results:', err);
          this.error = 'Failed to download lab results.';
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
        error: (err) => {
          console.error('Error emailing lab results:', err);
          this.error = 'Failed to email lab results.';
        },
      });
    }
  }
}
