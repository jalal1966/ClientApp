import { Component, inject, Input, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Immunization } from '../../../models/medicalRecord.model';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ImmunizationService } from '../../../services/patient-immunization/immunization.service';
import { Patients } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient/patient.service';
import { MedicalRecordsService } from '../../../services/medical-records/medical-records.service';
import { filter, Subject, takeUntil } from 'rxjs';

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
  /* private http = inject(HttpClient);
  private modalService = inject(NgbModal); */

  immunizationForm!: FormGroup;
  isEditing = false;
  currentEditId?: number;
  showForm: boolean = false;

  @Input() immunizations: Immunization[] = [];
  @Input() loading = false;
  //@Input() medicalRecordId?: number;

  showNoRecordMessage = false;
  patient: Patients | undefined;
  error: string | null = null;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  selectedImmunization: any = null;
  /* newImmunization = {
    vaccineName: '',
    administrationDate: '',
    lotNumber: '',
    administeringProvider: '',
    nextDoseDate: '',
    manufacturer: '',
  }; */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private medicalRecordsService: MedicalRecordsService,
    authService: AuthService,
    router: Router,
    private immunizationsService: ImmunizationService
  ) {
    super(authService, router);
  }

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Get patient ID from route parameters
    const parentParams = this.route.parent?.snapshot.paramMap;
    const currentParams = this.route.snapshot.paramMap;
    const id = parentParams?.get('id') ?? currentParams.get('id');

    if (id) {
      this.patientId = +id;

      // Get medical record ID directly from query parameters
      this.route.queryParams.subscribe((params) => {
        if (params['medicalRecordId']) {
          this.medicalRecordId = +params['medicalRecordId'];
          this.initForm();
          this.loadImmunizations();
        } else {
          console.warn('No medical record ID provided in query parameters');
          // Handle the case when no medicalRecordId is provided
        }
      });
    } else {
      this.error = 'Patient ID is required';
      this.loading = false;
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
        console.error('Failed to load Immunizations results', error);
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
            console.error('Failed to create Immunizations result', error);
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

  cancelEdit(): void {
    this.isEditing = false;
    this.currentEditId = undefined;
    this.initForm();
    this.showForm = false; // Hide the form when canceling
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
            console.error('Failed to delete Immunization result', error);
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
        error: (err) => {
          console.error('Error downloading Immunizations results:', err);
          this.error = 'Failed to download Immunizations results.';
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
          error: (err) => {
            console.error('Error emailing Immunizations results:', err);
            this.error = 'Failed to email Immunizations results.';
          },
        });
    }
  }

  /* openModal(content: any, immunization: any = null) {
    this.selectedImmunization = immunization;
    if (immunization) {
      this.newImmunization = { ...immunization };
    } else {
      this.newImmunization = {
        vaccineName: '',
        administrationDate: '',
        lotNumber: '',
        administeringProvider: '',
        nextDoseDate: '',
        manufacturer: '',
      };
    }
    this.modalService.open(content, { centered: true });
  }

  saveImmunization(modalRef: any) {
    if (this.selectedImmunization) {
      // Update
      this.http
        .put(
          `/api/patients/${this.patientId}/immunizations/${this.selectedImmunization.id}`,
          {
            ...this.newImmunization,
            patientId: this.patientId,
            id: this.selectedImmunization.id,
          }
        )
        .subscribe(() => {
          this.loadImmunizations();
          modalRef.close();
        });
    } else {
      // Create
      this.http
        .post(`/api/patients/${this.patientId}/immunizations`, {
          ...this.newImmunization,
        })
        .subscribe(() => {
          this.loadImmunizations();
          modalRef.close();
        });
    }
  }

  deleteImmunization(id: number) {
    if (confirm('Are you sure you want to delete this immunization?')) {
      this.http
        .delete(`/api/patients/${this.patientId}/immunizations/${id}`)
        .subscribe(() => this.loadImmunizations());
    }
  } */
}
