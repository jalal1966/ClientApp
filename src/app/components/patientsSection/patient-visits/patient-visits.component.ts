import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Visit } from '../../../models/visits.model';
import { PatientVisitService } from '../../../services/patient-visits/patient-visits.service';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { AuthService } from '../../../services/auth/auth.service';

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
  @Input() visits: Visit[] = []; // Add this input
  selectedVisit: Visit | null = null;
  visitForm: FormGroup;
  loading = false;
  isEditMode = false;

  constructor(
    private patientVisitService: PatientVisitService,
    private route: ActivatedRoute,
    authService: AuthService,
    router: Router,
    private fb: FormBuilder
  ) {
    super(authService, router);
    this.visitForm = this.createVisitForm();
  }

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.patientId) {
      this.loadPatientVisits();
    }
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

  createVisitForm(): FormGroup {
    return this.fb.group({
      id: [0],
      patientId: [this.patientId],
      visitDate: [new Date(), Validators.required],
      providerName: [''],
      providerId: [null],
      visitType: ['', Validators.required],
      reason: ['', Validators.required],
      assessment: [''],
      plan: [''],
      notes: [''],
      diagnoses: this.fb.array([]),
    });
  }

  selectVisit(visit: Visit): void {
    this.selectedVisit = visit;
    this.isEditMode = true;

    // Update form with selected visit data
    this.visitForm.patchValue({
      id: visit.id,
      patientId: visit.patientId,
      visitDate: new Date(visit.visitDate),
      providerName: visit.providerName,
      providerId: visit.providerId,
      visitType: visit.visitType,
      reason: visit.reason,
      assessment: visit.assessment,
      plan: visit.planTreatment,
      notes: visit.notes,
    });

    // Handle diagnoses in a more complex component
  }

  newVisit(): void {
    this.selectedVisit = null;
    this.isEditMode = false;
    this.visitForm = this.createVisitForm();
    this.visitForm.patchValue({ patientId: this.patientId });
  }

  saveVisit(): void {
    if (this.visitForm.invalid) {
      return;
    }

    const visitData = this.visitForm.value as Visit;
    this.loading = true;

    if (this.isEditMode) {
      this.patientVisitService.updateVisit(visitData).subscribe({
        next: () => {
          this.loading = false;
          this.loadPatientVisits();
          this.selectedVisit = null;
        },
        error: (error) => {
          console.error('Error updating visit:', error);
          this.loading = false;
        },
      });
    } else {
      this.patientVisitService.createVisit(visitData).subscribe({
        next: () => {
          this.loading = false;
          this.loadPatientVisits();
          this.selectedVisit = null;
        },
        error: (error) => {
          console.error('Error creating visit:', error);
          this.loading = false;
        },
      });
    }
  }

  deleteVisit(id: number): void {
    if (confirm('Are you sure you want to delete this visit?')) {
      this.loading = true;
      this.patientVisitService.deleteVisit(id).subscribe({
        next: () => {
          this.loading = false;
          this.loadPatientVisits();
          if (this.selectedVisit?.id === id) {
            this.selectedVisit = null;
          }
        },
        error: (error) => {
          console.error('Error deleting visit:', error);
          this.loading = false;
        },
      });
    }
  }
}
