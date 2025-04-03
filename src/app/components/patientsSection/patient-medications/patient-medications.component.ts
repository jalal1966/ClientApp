import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Medication } from '../../../models/medicalRecord.model';
import { PatientMedicationsService } from '../../../services/patient-medications/patient-medications.service';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';

@Component({
  selector: 'app-patient-medications',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './patient-medications.component.html',
  styleUrls: ['./patient-medications.component.css'],
})
export class PatientMedicationsComponent
  extends PatientComponentBase
  implements OnInit
{
  medicationForm: FormGroup;
  editMode = false;
  currentMedicationId: number | null = null;
  showActive = true;
  @Input() medications: Medication[] = [];

  constructor(
    private medicationService: PatientMedicationsService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    super();
    this.medicationForm = this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      prescribingProvider: ['', Validators.required],
      purpose: [''],
    });
  }

  ngOnInit(): void {
    this.route.parent?.params.subscribe((params) => {
      this.patientId = +params['id'];
      this.loadMedications();
    });
  }

  loadMedications(): void {
    if (this.showActive) {
      this.medicationService
        .getActiveMedications(this.patientId)
        .subscribe((data) => {
          this.medications = data;
        });
    } else {
      this.medicationService
        .getMedications(this.patientId)
        .subscribe((data) => {
          this.medications = data;
        });
    }
  }

  toggleActiveFilter(): void {
    this.showActive = !this.showActive;
    this.loadMedications();
  }

  onSubmit(): void {
    if (this.medicationForm.valid) {
      const medicationData = this.medicationForm.value;

      if (this.editMode && this.currentMedicationId) {
        const updatedMedication: Medication = {
          ...medicationData,
          id: this.currentMedicationId,
          patientId: this.patientId,
        };

        this.medicationService
          .updateMedication(this.patientId, updatedMedication)
          .subscribe(() => {
            this.resetForm();
            this.loadMedications();
          });
      } else {
        this.medicationService
          .createMedication(this.patientId, medicationData)
          .subscribe(() => {
            this.resetForm();
            this.loadMedications();
          });
      }
    }
  }

  editMedication(medication: Medication): void {
    this.editMode = true;
    this.currentMedicationId = medication.id;

    this.medicationForm.setValue({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: new Date(medication.startDate),
      endDate: medication.endDate ? new Date(medication.endDate) : null,
      prescribingProvider: medication.prescribingProvider,
      purpose: medication.purpose || '',
    });
  }

  deleteMedication(medicationId: number): void {
    if (confirm('Are you sure you want to delete this medication?')) {
      this.medicationService
        .deleteMedication(this.patientId, medicationId)
        .subscribe(() => {
          this.loadMedications();
        });
    }
  }

  resetForm(): void {
    this.medicationForm.reset({
      startDate: new Date(),
    });
    this.editMode = false;
    this.currentMedicationId = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  isMedicationActive(medication: Medication): boolean {
    if (!medication.endDate) return true;
    return new Date(medication.endDate) > new Date();
  }
}
