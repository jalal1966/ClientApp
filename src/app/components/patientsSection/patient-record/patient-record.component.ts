import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient/patient.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientInfoComponent } from '../patient-info/patient-info.component';
import { PatientAllergiesComponent } from '../patient-allergies/patient-allergies.component';
import { PatientLabResultsComponent } from '../patient-lab-results/patient-lab-results.component';
import { PatientDetail, Patients } from '../../../models/patient.model';
import { Allergy } from '../../../models/medicalRecord.model';
import { PatientVisitComponent } from '../patient-visits/patient-visits.component';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-patient-record',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PatientInfoComponent,
    PatientLabResultsComponent,
    PatientAllergiesComponent,
    PatientVisitComponent,
  ],
  templateUrl: './patient-record.component.html',
  styleUrl: './patient-record.component.scss',
})
export class PatientRecordComponent
  extends PatientComponentBase
  implements OnInit
{
  patient: Patients | null = null;
  loading = true;
  today: Date = new Date();
  activeTab: string = 'info';
  allergies: Allergy[] = []; // <-- Ensure this is present

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    authService: AuthService,
    router: Router
  ) {
    super(authService, router);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.patientId = +params['id'];
      this.loadPatientDetailsData();
    });
  }

  loadPatientDetailsData(): void {
    this.loading = true;
    this.patientService.getPatient(this.patientId).subscribe({
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
