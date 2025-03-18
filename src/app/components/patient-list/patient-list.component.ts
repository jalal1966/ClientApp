import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  appoment: AppointmentService | undefined;
  loading = true;
  error = '';

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load patients. Please try again.';
        this.loading = false;
      },
    });
  }

  filterPatients(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchTerm) ||
        patient.lastName.toLowerCase().includes(searchTerm)
    );
  }

  deletePatient(id: number, event: Event): void {
    event.stopPropagation();
    if (
      confirm(
        'Are you sure you want to delete this patient? This action cannot be undone.'
      )
    ) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.patients = this.patients.filter((p) => p.id !== id);
          this.filteredPatients = this.filteredPatients.filter(
            (p) => p.id !== id
          );
        },
        error: (err) => {
          this.error = 'Failed to delete patient. Please try again.';
        },
      });
    }
  }
}
