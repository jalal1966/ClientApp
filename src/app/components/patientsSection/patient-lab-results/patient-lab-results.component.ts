import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule],
  template: ``,
  styles: [],
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
    console.log(
      `${this.getPatientIdString()} - Lab results count: ${
        this.labResults?.length || 0
      }`
    );
    this.patientId = +this.route.snapshot.params['id'];
    this.initForm();
    this.loadLabResults();
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

  loadLabResults(): void {
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
      return;
    }

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
          },
          error: (error) => {
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
          },
          error: (error) => {
            console.error('Failed to create lab result', error);
          },
        });
    }
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
