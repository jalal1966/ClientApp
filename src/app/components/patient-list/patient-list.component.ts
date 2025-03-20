import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';
import { Patient } from '../../models/patient.model';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-patient-list',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListComponent implements OnInit {
  patientForm!: FormGroup;
  currentUser: User | null = null;
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  appoment: AppointmentService | undefined;
  loading = true;
  error = '';

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private fb: FormBuilder // Inject FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.Initializing();
  }

  Initializing(): void {
    this.initializeForm(); // Ensure form is initialized before using it
    // this.initializeForm();
    // Get current user (nurse) from AuthService
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          console.log('Full user object:', JSON.stringify(user)); // This will show all properties
          console.log('Current user loaded:', user);
          this.currentUser = user;

          // Update form with nurse information
          this.patientForm.patchValue({
            // nursID: user.userID,
            nursName: `${user.firstName} ${user.lastName}`,
          });

          // Now fetch doctor info after we have user info
          // this.loadDoctorInformation();
        }
      },
      error: (err) => {
        console.error('Error getting current user:', err);
        this.error = 'Failed to load user information';
      },
    });
  }
  initializeForm(): void {
    this.patientForm = this.fb.group({
      nursName: ['', Validators.required],
    });
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
