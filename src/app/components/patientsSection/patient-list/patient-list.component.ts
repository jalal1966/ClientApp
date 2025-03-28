import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterModule } from '@angular/router';
import { PatientService } from '../../../services/patient/patient.service';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { Patients } from '../../../models/patient.model';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/auth/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GenderPipe } from '../../../pipes/gender/gender.pipe';

@Component({
  selector: 'app-patient-list',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GenderPipe],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListComponent implements OnInit {
  patientForm!: FormGroup;
  currentUser: User | null = null;
  patients: Patients[] = [];
  filteredPatients: Patients[] = [];
  appoment: AppointmentService | undefined;
  loading = true;
  error = '';

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router,
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
  // Method to navigate back
  goBack() {
    this.router.navigate(['/previous-route']); // Replace '/previous-route' with the desired route
  }
}
