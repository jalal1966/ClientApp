import { Directive, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from './base.component';
import { AuthService } from '../../services/auth/auth.service';

@Directive()
export abstract class PatientComponentBase extends BaseComponent {
  @Input() patientId: number = 0;
  @Input() medicalRecordId?: number; // Added back with optional type

  constructor(authService: AuthService, router: Router) {
    super(authService, router);
  }

  protected getPatientIdString(): string {
    return `Patient ID: ${this.patientId}`;
  }

  protected getMedicalRecordIdString(): string {
    return this.medicalRecordId
      ? `Medical Record ID: ${this.medicalRecordId}`
      : 'No Medical Record ID';
  }
}
