import { Directive, Input } from '@angular/core';

@Directive()
export class PatientComponentBase {
  @Input() patientId: number = 0;

  // Optional common functionality for all patient-related components
  protected getPatientIdString(): string {
    return `Patient ID: ${this.patientId}`;
  }
}
