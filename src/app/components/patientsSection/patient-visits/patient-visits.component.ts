import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';

import { Visit } from '../../../models/visits.model';
import { Patients } from '../../../models/patient.model';
import { AppointmentType } from '../../../models/enums.model';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';

import { PatientVisitService } from '../../../services/patient-visits/patient-visits.service';
import { AuthService } from '../../../services/auth/auth.service';
import { PatientService } from '../../../services/patient/patient.service';
import { MedicalRecordUtilityService } from '../../../services/medicalRecordUtility/medical-record-utility.service';
import { PrescriptionService } from '../../../services/prescription/prescription.service';

@Component({
  selector: 'app-patient-visit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-visits.component.html',
  styleUrls: ['./patient-visits.component.scss'],
})
export class PatientVisitComponent
  extends PatientComponentBase
  implements OnInit, OnDestroy
{
  // Component properties
  private destroy$ = new Subject<void>();

  // Inputs
  @Input() visits: Visit[] = [];
  @Input() loading = false;
  @Input() isMainForm: boolean = true;

  // Form related properties
  visitForm!: FormGroup;
  selectedVisit: Visit | null = null;
  showForm = false;
  viewMode = false;
  isEditMode = false;
  medicationForm: any;

  // Patient data
  patient: Patients | null = null;

  // UI state properties
  showNoRecordMessage = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  canEdit: any;
  showSummary: any;
  lastUpdated?: string | number | Date;
  error: string | undefined;
  doctorName: string | undefined;

  // Constants and enums
  visitStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
  appointmentTypeEnum = AppointmentType;
  appointmentTypes = Object.keys(AppointmentType)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      key,
      value: AppointmentType[key as keyof typeof AppointmentType],
    }));

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private patientVisitService: PatientVisitService,
    private medicalRecordUtility: MedicalRecordUtilityService,
    private prescriptionService: PrescriptionService,
    authService: AuthService,
    router: Router,
    private location: Location
  ) {
    super(authService, router);
    this.doctorName =
      this.currentUser.firstName + ' ' + this.currentUser.lastName;
  }

  // Lifecycle hooks
  ngOnInit(): void {
    this.initializeComponent();
    this.setupNavigationListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialization methods
  private initializeComponent(): void {
    const parentParams = this.route.parent?.snapshot.paramMap;
    const currentParams = this.route.snapshot.paramMap;
    const id = parentParams?.get('id') ?? currentParams.get('id');

    if (id) {
      this.patientId = +id;
      this.loadMedicalRecord();
    } else {
      this.handleError('Patient ID is required');
    }
  }

  private loadMedicalRecord(): void {
    this.loading = true;
    this.route.queryParams
      .pipe(
        take(1),
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
        next: () => this.handleMedicalRecordSuccess(),
        error: () =>
          this.handleError('Failed to retrieve medical record information'),
        complete: () => {
          if (!this.medicalRecordId) {
            this.handleError('No medical record ID found');
          }
        },
      });
  }

  private handleMedicalRecordSuccess(): void {
    this.loading = false;
    this.errorMessage = null;
    this.showSuccessMessage('Download Patient Visits successfully');
    this.initForm();
    this.loadPatient(this.patientId);
    this.loadPatientVisits(this.patientId);
  }

  private setupNavigationListener(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.showForm = false; // Hide form when tab changes
      });
  }

  // Form initialization and management
  initForm(): FormGroup {
    const form = this.fb.group({
      id: [0],
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

    this.setupFollowUpValidation(form);
    return form;
  }

  private setupFollowUpValidation(form: FormGroup): void {
    form.get('followUpRequired')?.valueChanges.subscribe((required) => {
      const followUpDateControl = form.get('followUpDate');
      if (required) {
        followUpDateControl?.setValidators([Validators.required]);
      } else {
        followUpDateControl?.clearValidators();
      }
      followUpDateControl?.updateValueAndValidity();
    });
  }

  // Data loading methods
  loadPatient(patientId: number): void {
    this.loading = true;
    this.patientService.getPatientById(patientId).subscribe({
      next: (data) => {
        this.loading = false;
        this.patient = data;
      },
      error: (error) => {
        this.handleError(
          'Error loading patient: ' + (error.message || 'Unknown error')
        );
      },
    });
  }

  loadPatientVisits(patientId: number): void {
    this.loading = true;
    this.patientVisitService.getVisitsByPatient(patientId).subscribe({
      next: (visits) => {
        this.visits = visits;
        this.loading = false;
      },
      error: (error) => {
        this.handleError(
          'Error loading visits: ' + (error.message || 'Unknown error')
        );
      },
    });
  }

  // Form getters
  get diagnosisArray(): FormArray {
    return this.visitForm.get('diagnosis') as FormArray;
  }

  get medicationsArray(): FormArray {
    return this.visitForm.get('medication') as FormArray;
  }

  // Visit management
  newVisit(): void {
    this.selectedVisit = null;
    this.isEditMode = false;
    this.showForm = true;
    this.viewMode = false;
    this.visitForm = this.initForm();
  }

  viewVisitDetails(visit: Visit): void {
    this.selectedVisit = visit;
    this.viewMode = true;
    this.showForm = false;
  }

  selectVisit(visit: Visit): void {
    this.selectedVisit = visit;
    this.isEditMode = true;
    this.viewMode = false;
    this.showForm = true;

    // Reset form and populate with visit data
    this.visitForm = this.initForm();
    this.populateVisitForm(visit);
  }

  private populateVisitForm(visit: Visit): void {
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

    this.populateDiagnosisArray(visit);
    this.populateMedicationsArray(visit);
  }

  private populateDiagnosisArray(visit: Visit): void {
    this.diagnosisArray.clear();
    if (visit.diagnosis && visit.diagnosis.length > 0) {
      visit.diagnosis.forEach((diagnosis) => {
        this.diagnosisArray.push(this.createDiagnosisFormGroup(diagnosis));
      });
    }
  }

  private populateMedicationsArray(visit: Visit): void {
    this.medicationsArray.clear();
    if (visit.medication && visit.medication.length > 0) {
      visit.medication.forEach((medication) => {
        this.medicationsArray.push(this.createMedicationFormGroup(medication));
      });
    }
  }

  saveVisit(): void {
    if (this.visitForm.invalid) {
      this.markFormGroupTouched(this.visitForm);
      return;
    }

    this.loading = true;
    const visitData = this.prepareVisitData();

    if (this.isEditMode) {
      this.updateVisit(visitData);
    } else {
      this.createVisit(visitData);
    }
  }

  private prepareVisitData(): any {
    const visitData = this.visitForm.value;

    // Convert types and format dates
    visitData.visitType = Number(visitData.visitType);

    if (visitData.visitDate) {
      visitData.visitDate = new Date(visitData.visitDate).toISOString();
    }

    if (visitData.followUpDate) {
      visitData.followUpDate = new Date(visitData.followUpDate).toISOString();
    }

    this.formatDiagnosisDates(visitData);
    this.formatMedicationDates(visitData);
    this.cleanupOptionalFields(visitData);

    return visitData;
  }

  private formatDiagnosisDates(visitData: any): void {
    if (visitData.diagnosis && visitData.diagnosis.length > 0) {
      visitData.diagnosis.forEach((diagnosis: any) => {
        if (diagnosis.diagnosisDate) {
          diagnosis.diagnosisDate = new Date(
            diagnosis.diagnosisDate
          ).toISOString();
        }
      });
    }
  }

  private formatMedicationDates(visitData: any): void {
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
  }

  private cleanupOptionalFields(visitData: any): void {
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

    // Ensure medication array is initialized
    if (!visitData.medication) visitData.medication = [];
    visitData.medication.forEach((med: any) => {
      if (!med.endDate) {
        delete med.endDate;
      }
      med.isActive ??= true;
    });

    // Ensure diagnosis array is initialized
    visitData.diagnosis ??= [];
  }

  private updateVisit(visitData: any): void {
    this.patientVisitService.updateVisit(visitData).subscribe({
      next: () => this.handleSaveSuccess(),
      error: (error) =>
        this.handleError(
          'Error updating visit: ' + (error.message || 'Unknown error')
        ),
    });
  }

  private createVisit(visitData: any): void {
    const wrappedPayload = { visit: visitData };

    this.patientVisitService.createVisit(wrappedPayload).subscribe({
      next: () => this.handleSaveSuccess(),
      error: (error) =>
        this.handleError(
          'Error creating visit: ' + (error.message || 'Unknown error')
        ),
    });
  }

  private handleSaveSuccess(): void {
    this.loading = false;
    this.loadPatientVisits(this.patientId);
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.selectedVisit = null;
    this.showForm = false;
    this.viewMode = false;
    this.isEditMode = false;
  }

  backToList(): void {
    this.selectedVisit = null;
    this.viewMode = false;
    this.showForm = false;
  }

  deleteVisit(visitId: number): void {
    if (confirm('Are you sure you want to delete this visit?')) {
      this.loading = true;
      this.patientVisitService.deleteVisit(visitId).subscribe({
        next: () => {
          this.loading = false;
          this.loadPatientVisits(this.patientId);
          if (this.selectedVisit?.id === visitId) {
            this.cancelEdit();
          }
        },
        error: (error) => {
          this.handleError(
            'Error deleting visit: ' + (error.message || 'Unknown error')
          );
        },
      });
    }
  }

  // Diagnosis form management
  createDiagnosisFormGroup(diagnosis: any = {}): FormGroup {
    return this.fb.group({
      id: [diagnosis.id || 0],
      diagnosisCode: [diagnosis.diagnosisCode || ''],
      description: [diagnosis.description || '', Validators.required],
      isActive: [diagnosis.isActive !== undefined ? diagnosis.isActive : true],
      treatmentPlan: [''],
      followUpNeeded: [
        diagnosis.followUpNeeded !== undefined
          ? diagnosis.followUpNeeded
          : true,
      ],
      followUpDate: [
        diagnosis.followUpDate
          ? this.formatDateForDateInput(diagnosis.followUpDate)
          : this.formatDateForDateInput(new Date()),
      ],
      treatmentNotes: [''],
      createdAt: [
        diagnosis.createdAt
          ? this.formatDateForDateInput(diagnosis.createdAt)
          : this.formatDateForDateInput(new Date()),
      ],
      updatedAt: [
        diagnosis.updatedAt
          ? this.formatDateForDateInput(diagnosis.updatedAt)
          : this.formatDateForDateInput(new Date()),
      ],
    });
  }

  addDiagnosis(): void {
    this.diagnosisArray.push(this.createDiagnosisFormGroup());
  }

  removeDiagnosis(index: number): void {
    this.diagnosisArray.removeAt(index);
  }

  // Medication form management
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

  // Print prescription functionality
  PrintPrescription(visit: Visit): void {
    // Reset form and populate with visit data
    this.visitForm = this.initForm();
    this.populateVisitForm(visit);

    // Validate form for printing
    if (!this.visitForm) {
      this.handleError(
        'No active visit form. Please select or create a visit first.'
      );
      return;
    }

    // Check if medications exist
    const medicationsArray = this.visitForm.get('medication') as FormArray;
    if (!medicationsArray || medicationsArray.length === 0) {
      this.handleError('No medications to print');
      return;
    }
    const prescriptionWindow = window.open('', '_blank');
    const html = this.prescriptionService.generateHtml(
      visit,
      this.patient,
      this.doctorName
    ); // build this HTML separately
    if (prescriptionWindow) {
      prescriptionWindow.document.write(html);
      prescriptionWindow.document.close();
    }

    /* // Create print window
    const printWindow = this.createPrintWindow();
    if (!printWindow) {
      this.handleError(
        'Unable to open print window. Please check your popup blocker settings.'
      );
      return;
    }

    // Generate and print prescription
    const prescriptionHtml = this.generatePrescriptionHtml(medicationsArray);
    this.printPrescription(printWindow, prescriptionHtml); */
  }

  private createPrintWindow(): Window | null {
    return window.open('', '_blank', 'width=800,height=600');
  }

  /* private generatePrescriptionHtml(medicationsArray: FormArray): string {
    // Get current date for prescription
    const currentDate = new Date().toLocaleDateString();

    // Format medication information
    const medicationsHtml = this.formatMedicationsHtml(medicationsArray);

    // Create and return the full HTML content
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Medical Prescription</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #333;
        }
        .doctor-info {
          float: right;
          text-align: right;
          margin-bottom: 20px;
        }
        .patient-info {
          float: left;
          margin-bottom: 20px;
        }
        .prescription-date {
          clear: both;
          text-align: right;
          margin-bottom: 30px;
        }
        .prescription-title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 30px 0 20px;
          text-decoration: underline;
        }
        .medication-item {
          margin-bottom: 15px;
        }
        .medication-item h4 {
          margin-bottom: 5px;
        }
        .medication-item p {
          margin: 3px 0;
        }
        .signature {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #333;
          text-align: right;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          text-align: center;
        }
        .divider {
          border-top: 1px dashed #ccc;
          margin: 20px 0;
        }
        .no-print-button {
          text-align: center;
          margin: 20px 0;
        }
        @media print {
          .no-print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>MEDICAL PRESCRIPTION</h2>
      </div>
      
      <div class="doctor-info">
        <p><strong>Provider:</strong> ${this.doctorName || 'N/A'}</p>
      </div>
      
      <div class="patient-info">
        <p><strong>Patient:</strong> ${this.patient?.firstName || ''} ${
      this.patient?.lastName || ''
    }</p>
        <p><strong>Patient ID:</strong> ${this.patientId || 'N/A'}</p>
        <p><strong>DOB:</strong> ${
          this.patient?.dateOfBirth
            ? new Date(this.patient.dateOfBirth).toLocaleDateString()
            : 'N/A'
        }</p>
      </div>
      
      <div class="prescription-date">
        <p><strong>Date:</strong> ${currentDate}</p>
      </div>
      
      <div class="prescription-title">PRESCRIBED MEDICATIONS</div>
      
      ${medicationsHtml}
      
      <div class="signature">
        <p>Provider's Signature: __________________________</p>
        <p>${this.doctorName || ''}</p>
      </div>
      
      <div class="footer">
        <p>This prescription is valid for 30 days from the date of issue.</p>
      </div>
      
      <div class="no-print-button">
        <button onclick="window.print(); setTimeout(() => window.close(), 500);">
          Print Prescription
        </button>
      </div>
    </body>
    </html>
  `;
  } */

  private formatMedicationsHtml(medicationsArray: FormArray): string {
    let medicationsHtml = '';
    medicationsArray.controls.forEach((med, index) => {
      const medication = med.value;

      medicationsHtml += `
      <div class="medication-item">
        <h4>${index + 1}. ${medication.name}</h4>
        <p><strong>Dosage:</strong> ${medication.dosage}</p>
        <p><strong>Frequency:</strong> ${medication.frequency}</p>
        <p><strong>Start Date:</strong> ${new Date(
          medication.startDate
        ).toLocaleDateString()}</p>
        ${
          medication.endDate
            ? `<p><strong>End Date:</strong> ${new Date(
                medication.endDate
              ).toLocaleDateString()}</p>`
            : ''
        }
        ${
          medication.purpose
            ? `<p><strong>Purpose:</strong> ${medication.purpose}</p>`
            : ''
        }
      </div>
      <hr>
    `;
    });
    return medicationsHtml;
  }

  private printPrescription(
    printWindow: Window,
    prescriptionHtml: string
  ): void {
    // Write HTML to the new window and trigger print
    printWindow.document.write(prescriptionHtml);
    printWindow.document.close();

    // Add event listener to close window after printing
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  }

  // Navigation methods
  openMedicalRecordForm(): void {
    this.router.navigate(['/patients/', this.patientId, 'medical-records']);
  }

  backClicked(): void {
    this.location.back();
  }

  // Utility methods
  getVisitTypeLabel(type: string | number | undefined): string {
    const typeId = Number(type);
    return this.appointmentTypeEnum[typeId] ?? 'Unknown';
  }

  getCurrentDateTimeLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatDateForInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const localDateStr = d.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
    return localDateStr;
  }

  formatDateForDateInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const localDateStr = d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    return localDateStr;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
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

  private handleError(message: string): void {
    this.loading = false;
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = null), 3000);
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = null), 3000);
  }
}
