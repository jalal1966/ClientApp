import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Visit } from '../../../models/visits.model';
import { PatientVisitService } from '../../../services/patient-visits/patient-visits.service';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { AuthService } from '../../../services/auth/auth.service';
import { AppointmentType } from '../../../models/enums.model';
import { PatientService } from '../../../services/patient/patient.service';
import { Patients } from '../../../models/patient.model';
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';

@Component({
  selector: 'app-patient-visit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-visits.component.html',
  styleUrls: ['./patient-visits.component.scss'],
})
export class PatientVisitComponent
  extends PatientComponentBase
  implements OnInit
{
  @Input() visits: Visit[] = [];
  @Input() medicalRecordId: number | undefined;
  //@Input() medicalRecordId: number | undefined;
  selectedVisit: Visit | null = null;
  visitForm!: FormGroup; // Use definite assignment assertion
  showForm = false;
  viewMode = false;
  loading = false;
  isEditMode = false;

  showNoRecordMessage = false;
  doctorName: string | undefined;
  visitStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
  patient: Patients | null = null;

  appointmentTypeEnum = AppointmentType;
  appointmentTypes = Object.keys(AppointmentType)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      key,
      value: AppointmentType[key as keyof typeof AppointmentType],
    }));
  error: string | undefined;

  constructor(
    private patientVisitService: PatientVisitService,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private medicalRecordsService: MedicalRecordsService,

    authService: AuthService,
    router: Router,
    private fb: FormBuilder
  ) {
    super(authService, router);
    this.doctorName =
      this.currentUser.firstName + ' ' + this.currentUser.lastName;
    console.log('doctor', this.doctorName);
    this.visitForm = this.createVisitForm();
  }

  ngOnInit(): void {
    this.route.parent?.params.subscribe((parentParams) => {
      const currentParams = this.route.snapshot.params;

      this.patientId = +(parentParams['id'] ?? currentParams['id'] ?? 0);

      if (this.patientId) {
        //this.loadPatientVisits();
        this.loadPatient(this.patientId);
        this.checkMedicalRecord();
      }
    });
  }

  openMedicalRecordForm(): void {
    // You can either navigate to a medical record creation page
    this.router.navigate(['/patients/', this.patientId, 'medical-records']);

    // Or you could implement a modal form directly in this component
    // this.showMedicalRecordForm = true;
  }

  loadPatient(value: number) {
    this.loading = true;
    this.patientService.getPatient(value).subscribe({
      next: (data) => {
        this.loading = false;
        this.patient = data;
      },
      error: (error) => {
        console.error('Error loading patient:', error);
        this.loading = false;
      },
    });
  }

  // Add a new method to check if the medical record exists
  checkMedicalRecord(): void {
    this.loading = true;
    // this.medicalRecordId = 0; // Default to no record

    // Use the MedicalRecordsService to check if record exists
    this.medicalRecordsService.getMedicalRecord(this.patientId).subscribe({
      next: (data) => {
        this.loading = false;
        if (data && data.id) {
          this.medicalRecordId = data.id;
          this.showNoRecordMessage = false;
          this.loadPatientVisits(); // Only load visits if record exists
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

  loadPatientVisits(): void {
    this.loading = true;
    this.patientVisitService.getVisitsByPatient(this.patientId).subscribe({
      next: (visits) => {
        this.visits = visits;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading visits:', error);
        this.loading = false;
      },
    });
  }

  getVisitTypeLabel(type: string | number | undefined): string {
    const typeId = Number(type);
    return this.appointmentTypeEnum[typeId] ?? 'Unknown';
  }

  createVisitForm(): FormGroup {
    const form = this.fb.group({
      //id: [0],
      patientId: [this.patientId],
      medicalRecordId: [this.medicalRecordId],
      visitDate: [this.getCurrentDateTimeLocal(), Validators.required],
      providerName: [this.doctorName],
      providerId: [this.currentUser.userID],
      visitType: ['', Validators.required],
      reason: ['', Validators.required],
      assessment: [''],
      planTreatment: [''],
      notes: [''],
      followUpRequired: [false],
      followUpDate: [''],
      diagnosis: this.fb.array([]),
      medication: this.fb.array([]),
    });

    // Add a custom validator that requires followUpDate when followUpRequired is true
    form.get('followUpRequired')?.valueChanges.subscribe((required) => {
      const followUpDateControl = form.get('followUpDate');
      if (required) {
        followUpDateControl?.setValidators([Validators.required]);
      } else {
        followUpDateControl?.clearValidators();
      }
      followUpDateControl?.updateValueAndValidity();
    });

    return form;
  }

  // Helper to get current datetime in the format needed for datetime-local input
  getCurrentDateTimeLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Convenience getters for form arrays
  get diagnosisArray(): FormArray {
    return this.visitForm.get('diagnosis') as FormArray; // Removed optional chaining
  }

  get medicationsArray(): FormArray {
    return this.visitForm.get('medication') as FormArray; // Removed optional chaining
  }

  // Method to create a new visit
  newVisit(): void {
    this.selectedVisit = null;
    this.isEditMode = false;
    this.showForm = true;
    this.viewMode = false;
    this.visitForm = this.createVisitForm();
  }

  // Method to view visit details
  viewVisitDetails(visit: Visit): void {
    this.selectedVisit = visit;
    this.viewMode = true;
    this.showForm = false;
  }

  // Method to select a visit for editing
  selectVisit(visit: Visit): void {
    this.selectedVisit = visit;
    this.isEditMode = true;
    this.viewMode = false;
    this.showForm = true;

    // Reset form and populate with visit data
    this.visitForm = this.createVisitForm();
    this.visitForm.patchValue({
      id: visit.id,
      patientId: visit.patientId,
      medicalRecordId: visit.medicalRecordId,
      visitDate: this.formatDateForInput(visit.visitDate),
      providerName: visit.providerName,
      providerId: visit.providerId,
      visitType: visit.visitType,
      reason: visit.reason,
      assessment: visit.assessment,
      planTreatment: visit.planTreatment,
      notes: visit.notes,
      followUpRequired: visit.followUpRequired,
      followUpDate: visit.followUpDate
        ? this.formatDateForDateInput(visit.followUpDate)
        : '',
    });

    // Clear and repopulate diagnosis array
    this.diagnosisArray.clear();
    if (visit.diagnosis && visit.diagnosis.length > 0) {
      visit.diagnosis.forEach((diagnosis) => {
        this.diagnosisArray.push(this.createDiagnosisFormGroup(diagnosis));
      });
    }

    // Clear and repopulate medications array
    this.medicationsArray.clear();
    if (visit.medication && visit.medication.length > 0) {
      visit.medication.forEach((medication) => {
        this.medicationsArray.push(this.createMedicationFormGroup(medication));
      });
    }
  }

  // Format date for datetime-local input
  formatDateForInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const localDateStr = d.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
    return localDateStr;
  }

  // Format date for date input (without time)
  formatDateForDateInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const localDateStr = d.toISOString().split('T')[0]; // Format as YYYY-MM-DD // Format as YYYY-MM-DDThh:mm
    return localDateStr;
  }

  // Method to save a visit (create or update)
  saveVisit(): void {
    if (this.visitForm.invalid) {
      // Mark all controls as touched to show validation errors
      this.markFormGroupTouched(this.visitForm);
      return;
    }

    this.loading = true;
    const visitData = this.visitForm.value;

    // 🔥 Convert from string to number
    visitData.visitType = Number(visitData.visitType);

    // Ensure dates are properly formatted
    if (visitData.visitDate) {
      visitData.visitDate = new Date(visitData.visitDate).toISOString();
    }

    if (visitData.followUpDate) {
      visitData.followUpDate = new Date(visitData.followUpDate).toISOString();
    }

    // Format dates in diagnosis array
    if (visitData.diagnosis && visitData.diagnosis.length > 0) {
      visitData.diagnosis.forEach((diagnosis: any) => {
        if (diagnosis.diagnosisDate) {
          diagnosis.diagnosisDate = new Date(
            diagnosis.diagnosisDate
          ).toISOString();
        }
      });
    }

    // Format dates in medication array
    if (visitData.medication && visitData.medication.length > 0) {
      visitData.medication.forEach((medication: any) => {
        if (medication.startDate) {
          medication.startDate = new Date(medication.startDate).toISOString();
        }

        if (medication.endDate) {
          medication.endDate = new Date(medication.endDate).toISOString();
        }
      });
    }

    if (this.isEditMode) {
      this.patientVisitService.updateVisit(visitData).subscribe({
        next: () => {
          this.loading = false;
          this.loadPatientVisits();
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error updating visit:', error);
          this.loading = false;
        },
      });
    } else {
      [
        'followUpDate',
        'followUpReason',
        'followUpInstructions',
        'followUpProviderName',
        'followUpProviderId',
        'followUpType',
      ].forEach((key) => {
        if (!visitData[key]) {
          delete visitData[key];
        }
      });
      if (!visitData.medication) visitData.medication = [];

      visitData.medication.forEach((med: any) => {
        if (!med.endDate) {
          delete med.endDate;
        }
        med.isActive ??= true; // Ensure isActive is defined (backend expects it)
      });

      visitData.diagnosis ??= [];
      visitData.medication ??= [];

      // 🔥 Convert from string to number
      visitData.visitType = Number(visitData.visitType);
      // ✅ Wrap the data as expected by the backend
      const wrappedPayload = { visit: visitData };
      console.log(
        'Wrapped Payload:',
        JSON.stringify({ visit: visitData }, null, 2)
      );

      this.patientVisitService.createVisit(wrappedPayload).subscribe({
        next: () => {
          this.loading = false;
          this.loadPatientVisits();
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error creating visit:', error);
          this.loading = false;
        },
      });
    }
  }

  // Helper to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((c) => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  // Method to cancel editing
  cancelEdit(): void {
    this.selectedVisit = null;
    this.showForm = false;
    this.viewMode = false;
    this.isEditMode = false;
  }

  // Method to go back to the visit list
  backToList(): void {
    this.selectedVisit = null;
    this.viewMode = false;
    this.showForm = false;
  }

  // Method to delete a visit
  deleteVisit(visitId: number): void {
    if (confirm('Are you sure you want to delete this visit?')) {
      this.loading = true;
      this.patientVisitService.deleteVisit(visitId).subscribe({
        next: () => {
          this.loading = false;
          this.loadPatientVisits();
          if (this.selectedVisit?.id === visitId) {
            this.selectedVisit = null;
            this.showForm = false;
            this.viewMode = false;
          }
        },
        error: (error) => {
          console.error('Error deleting visit:', error);
          this.loading = false;
        },
      });
    }
  }

  // Methods for diagnosis form array
  createDiagnosisFormGroup(diagnosis: any = {}): FormGroup {
    return this.fb.group({
      id: [diagnosis.id || 0],
      diagnosisCode: [diagnosis.diagnosisCode || ''],
      description: [diagnosis.description || '', Validators.required],
      diagnosisDate: [
        diagnosis.diagnosisDate
          ? this.formatDateForDateInput(diagnosis.diagnosisDate)
          : this.formatDateForDateInput(new Date()),
      ],
      isActive: [diagnosis.isActive !== undefined ? diagnosis.isActive : true],
    });
  }

  addDiagnosis(): void {
    this.diagnosisArray.push(this.createDiagnosisFormGroup());
  }

  removeDiagnosis(index: number): void {
    this.diagnosisArray.removeAt(index);
  }

  // Methods for medications form array
  createMedicationFormGroup(medication: any = {}): FormGroup {
    return this.fb.group({
      id: [medication.id || 0],
      name: [medication.name || '', Validators.required],
      dosage: [medication.dosage || '', Validators.required],
      frequency: [medication.frequency || '', Validators.required],
      startDate: [
        medication.startDate
          ? this.formatDateForDateInput(medication.startDate)
          : this.formatDateForDateInput(new Date()),
        Validators.required,
      ],
      endDate: [
        medication.endDate
          ? this.formatDateForDateInput(medication.endDate)
          : '',
      ],
      prescribingProvider: [medication.prescribingProvider || this.doctorName],
      purpose: [medication.purpose || ''],
    });
  }

  addMedication(): void {
    this.medicationsArray.push(this.createMedicationFormGroup());
  }

  removeMedication(index: number): void {
    this.medicationsArray.removeAt(index);
  }
}
