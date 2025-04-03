import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LabResult } from '../../../models/medicalRecord.model';
import { PatientLabResultsService } from '../../../services/patient-lab-results/patient-lab-results.service';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';

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

  constructor(
    private route: ActivatedRoute,
    private labResultsService: PatientLabResultsService,
    private fb: FormBuilder
  ) {
    super();
  }

  ngOnInit(): void {
    // Use consistent approach for getting patient ID - prefer the parent route approach
    this.route.parent?.params.subscribe((params) => {
      if (params['id']) {
        this.patientId = +params['id'];
      } else {
        // Fallback to direct route params if no parent
        this.patientId = +this.route.snapshot.params['id'];
      }

      console.log(
        `${this.getPatientIdString()} - Initializing lab results component`
      );
      this.initForm();
      this.loadLabResults();
    });
  }

  // Add error handling and loading state
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

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
}
