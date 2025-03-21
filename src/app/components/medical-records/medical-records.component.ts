import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { MedicalRecord } from '../../models/medicalRecord.model';
import { PatientService } from '../../services/patient/patient.service';
/*import {
  MedicalRecord,
  Patient,
  PatientService,
} from '../../services/patient/patient.service';*/

@Component({
  selector: 'app-medical-records',
  imports: [CommonModule, RouterModule],
  templateUrl: './medical-records.component.html',
  styleUrl: './medical-records.component.scss',
})
export class MedicalRecordsComponent implements OnInit {
  patientId: number;
  patient: Patient | null = null;
  records: MedicalRecord[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadPatient();
    this.loadRecords();
  }

  loadPatient(): void {
    this.patientService.getPatient(this.patientId).subscribe({
      next: (data) => {
        this.patient = data;
      },
      error: (err) => {
        this.error = 'Failed to load patient details.';
      },
    });
  }

  loadRecords(): void {
    this.loading = true;
    this.patientService.getPatientRecords(this.patientId).subscribe({
      next: (data) => {
        this.records = data.sort(
          (a, b) =>
            new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load medical records.';
        this.loading = false;
      },
    });
  }

  deleteRecord(id: number): void {
    if (
      confirm(
        'Are you sure you want to delete this medical record? This action cannot be undone.'
      )
    ) {
      this.patientService.deleteRecord(id).subscribe({
        next: () => {
          this.records = this.records.filter((r) => r.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete record. Please try again.';
        },
      });
    }
  }
}
