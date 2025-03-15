import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  currentUser: User | null = null;
  errorMessage: string | null = null; // For single error messages
  errorMessages: string[] = []; // For multiple error messages
  isSubmitting: boolean = false;
  doctorRecords: User[] = [];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Correct injection
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      dateOfBirth: ['', Validators.required],
      genderID: [null, [Validators.required, this.oneOf([1, 2])]], // Apply custom validator
      contactNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      emergencyContactName: [''],
      emergencyContactNumber: [''],
      insuranceProvider: [''],
      insuranceNumber: [''],
      address: [''],
      nursID: ['', Validators.required],
      nursName: ['', Validators.required],
      patientDoctorID: ['', Validators.required],
      patientDoctor: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Get current user (nurse) from AuthService
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          console.log('Full user object:', JSON.stringify(user)); // This will show all properties
          console.log('Current user loaded:', user);
          this.currentUser = user;

          // Update form with nurse information
          this.patientForm.patchValue({
            nursID: user.userID,
            nursName: `${user.firstName} ${user.lastName}`,
          });

          // Now fetch doctor info after we have user info
          // this.loadDoctorInformation();
        }
      },
      error: (err) => {
        console.error('Error getting current user:', err);
        this.errorMessage = 'Failed to load user information';
      },
    });
    // For debugging the form
    if (typeof window !== 'undefined') {
      // Check for SSR
      console.log('Form initialized');
      this.patientForm.valueChanges.subscribe((val) => {
        console.log('Form values:', val);
        console.log('Form valid:', this.patientForm.valid);
        console.log('Form errors:', this.patientForm.errors);
        console.log('Form control errors:', {
          firstName: this.firstName?.errors,
          lastName: this.lastName?.errors,
          dateOfBirth: this.dateOfBirth?.errors,
          genderID: this.genderID?.errors,
          contactNumber: this.contactNumber?.errors,
          email: this.email?.errors,
          nursID: this.nursID?.errors,
          nursName: this.nursName?.errors,
          patientDoctorID: this.patientDoctorID?.errors,
          patientDoctor: this.patientDoctor?.errors,
        });
      });
      // Fetch doctor list
      this.patientService.getDoctorList(1).subscribe({
        next: (doctors) => {
          console.log('Doctors loaded:', doctors);
          this.doctorRecords = doctors;

          if (this.doctorRecords.length > 0) {
            const firstDoctor = this.doctorRecords[0];
            this.patientForm.patchValue({
              patientDoctorID: firstDoctor.userID,
              patientDoctor: `${firstDoctor.firstName} ${firstDoctor.lastName}`,
            });
          }
        },
        error: (err) => {
          console.error('Error loading doctors:', err);
          this.doctorRecords = [];
        },
      });
    }
  }

  // Custom validator for oneOf
  oneOf(validOptions: any[]) {
    return (control: any) => {
      return validOptions.includes(control.value) ? null : { oneOf: true };
    };
  }

  // Getter methods for form controls
  get firstName() {
    return this.patientForm.get('firstName');
  }
  get lastName() {
    return this.patientForm.get('lastName');
  }
  get dateOfBirth() {
    return this.patientForm.get('dateOfBirth');
  }
  get genderID() {
    return this.patientForm.get('genderID');
  }
  get contactNumber() {
    return this.patientForm.get('contactNumber');
  }
  get email() {
    return this.patientForm.get('email');
  }
  get address() {
    return this.patientForm.get('address');
  }
  get emergencyContactName() {
    return this.patientForm.get('emergencyContactName');
  }
  get emergencyContactNumber() {
    return this.patientForm.get('emergencyContactNumber');
  }
  get insuranceProvider() {
    return this.patientForm.get('insuranceProvider');
  }
  get insuranceNumber() {
    return this.patientForm.get('insuranceNumber');
  }
  get nursID() {
    return this.patientForm.get('nursID');
  }
  get nursName() {
    return this.patientForm.get('nursName');
  }
  get patientDoctorID() {
    return this.patientForm.get('patientDoctorID');
  }
  get patientDoctor() {
    return this.patientForm.get('patientDoctor');
  }

  // Form submission
  onSubmit(): void {
    // Mark all fields as touched to trigger validation display
    this.patientForm.markAllAsTouched();

    if (this.patientForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = null;
      this.errorMessages = [];

      const patientData: Patient = {
        ...this.patientForm.value,
      };

      this.patientService.createPatient(patientData).subscribe({
        next: (response) => {
          console.log('Registration Patient successful:', response);
          // ToDo Update return URL
          this.router.navigate(['/patients']);
        },
        error: (errors) => {
          console.log('Registration Patient errors:', errors);

          this.errorMessages = Array.isArray(errors)
            ? errors
            : [errors.toString()];
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    } else {
      // Form validation handling
      this.collectFormErrors();
    }
  }

  navigateBack(): void {
    this.router.navigate(['/patients']);
  }

  private collectFormErrors() {
    const controls = this.patientForm.controls;
    for (const name in controls) {
      if (
        controls[name].invalid &&
        controls[name].errors &&
        controls[name].touched
      ) {
        const fieldName = name.charAt(0).toUpperCase() + name.slice(1);

        if (controls[name].errors['required']) {
          this.errorMessages.push(`${fieldName} is required`);
        }
        if (controls[name].errors['minlength']) {
          const minLength = controls[name].errors['minlength'].requiredLength;
          this.errorMessages.push(
            `${fieldName} must be at least ${minLength} characters`
          );
        }
        if (controls[name].errors['email']) {
          this.errorMessages.push(`Please enter a valid email address`);
        }
        if (controls[name].errors['oneOf']) {
          this.errorMessages.push(
            `Please select a valid option for ${fieldName}`
          );
        }
      }
    }
  }
  // Method to get current user
  getCurrentUser(): void {
    // This assumes your AuthService has a getCurrentUser method
    // Adjust this based on your actual AuthService implementation
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;

        // Pre-populate the nurse fields
        if (user) {
          this.patientForm.patchValue({
            nursID: user.userID,
            nursName: `${user.firstName} ${user.lastName}`,
          });
          console.log('nursData ', this.nursID, this.nursName);
        }
      },
      error: (error) => {
        console.error('Error fetching current user:', error);
      },
    });
  }
  // Load doctor information
  /* loadDoctorInformation(): void {
    this.patientService.getDoctorList(1).subscribe({
      next: (doctor) => {
        console.log('Doctor loaded:', doctor);
        this.doctorRecords = doctor;

        // Update form with doctor information
        if (doctor) {
          this.patientForm.patchValue({
            patientDoctorID: doctor.userID,
            patientDoctor: `${doctor.firstName} ${doctor.lastName}`,
          });
        }

        // Check form validity after updating values
        this.checkFormValidity();
      },
      error: (err) => {
        console.error('Error loading doctor:', err);
      },
    });
  } */
  // Debug method to check form validity
  checkFormValidity(): void {
    console.log('Checking form validity:');
    console.log(`Form valid overall: ${this.patientForm.valid}`);

    // Check each required field
    const requiredFields = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'genderID',
      'contactNumber',
      'email',
      'nursID',
      'nursName',
      'patientDoctorID',
      'patientDoctor',
    ];

    requiredFields.forEach((field) => {
      const control = this.patientForm.get(field);
      console.log(
        `${field}: value=${control?.value}, valid=${control?.valid}, errors=`,
        control?.errors
      );
    });
  }
}
