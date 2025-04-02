import { Component, Input } from '@angular/core';
import { Medication, VisitSummary } from '../../../models/medicalRecord.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-visits',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-visits.component.html',
  styleUrl: './patient-visits.component.scss',
})
export class PatientVisitsComponent {
  @Input() visits: VisitSummary[] = []; // Add this input
  @Input() patientId!: number;
}
