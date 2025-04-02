import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient/patient.service';
import { ActivatedRoute } from '@angular/router';
import { PatientInfoComponent } from '../patient-info/patient-info.component';
import { PatientAllergiesComponent } from '../patient-allergies/patient-allergies.component';
import { PatientMedicationsComponent } from '../patient-medications/patient-medications.component';
import { PatientVisitsComponent } from '../patient-visits/patient-visits.component';
import { PatientLabResultsComponent } from '../patient-lab-results/patient-lab-results.component';
import { PatientDetail } from '../../../models/patient.model';
import { Allergy } from '../../../models/medicalRecord.model';

@Component({
  selector: 'app-patient-record',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PatientInfoComponent,
    PatientVisitsComponent,
    PatientLabResultsComponent,
    PatientAllergiesComponent,
  ],
  templateUrl: './patient-record.component.html',
  styleUrl: './patient-record.component.scss',
})
export class PatientRecordComponent implements OnInit {
  patient: PatientDetail | null = null;
  loading = true;
  today: Date = new Date();
  activeTab: string = 'info';
  patientId!: number; // <-- Ensure this is present
  allergies: Allergy[] = []; // <-- Ensure this is present

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.patientId = +params['id'];
      this.loadPatientData();
    });
  }

  loadPatientData(): void {
    this.loading = true;
    this.patientService.getPatientDetails(this.patientId).subscribe({
      next: (data) => {
        this.patient = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading patient data', err);
        this.loading = false;
      },
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  get patientAge(): number {
    if (!this.patient?.dateOfBirth) return 0;
    const birthDate = new Date(this.patient.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
