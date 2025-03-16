import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  patientForm!: FormGroup;
  isSubmitting: boolean = false;

  currentUser: User | null = null;
  errorMessage: string | null = null; // For single error messages
  errorMessages: string[] = []; // For multiple error messages
  doctorRecords: User[] = [];
  firstName: any;
  lastName: any;
  dateOfBirth: any;
  genderID: any;
  contactNumber: any;
  email: any;
  nursID: any;
  nursName: any;
  patientDoctorID: any;
  patientDoctor: any;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // Correct injection
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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
    // Fetch doctor list
    this.patientService.getDoctorList(1).subscribe({
      next: (doctors) => {
        console.log('Doctors loaded:', doctors);
        this.doctorRecords = doctors;
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.doctorRecords = [];
      },
    });

    // Listen for changes in the doctor selection
    this.patientForm
      .get('patientDoctorID')
      ?.valueChanges.subscribe((selectedUserID) => {
        if (selectedUserID) {
          const selectedDoctor = this.doctorRecords.find(
            (doctor) => doctor.userID === selectedUserID
          );
          if (selectedDoctor) {
            // Update the doctor's name in the form
            this.patientForm.patchValue({
              patientDoctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
            });
          }
        } else {
          // Reset the doctor's name if no doctor is selected
          this.patientForm.patchValue({
            patientDoctorName: '',
          });
        }
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
          patientDoctorName: this.patientDoctor?.errors,
        });
      });
    }
  }

  private initializeForm(): void {
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
      patientDoctorName: ['', Validators.required],
    });
  }
  // Custom validator for oneOf
  oneOf(validOptions: any[]) {
    return (control: any) => {
      return validOptions.includes(control.value) ? null : { oneOf: true };
    };
  }

  // Getter methods for form controls
  get formControls() {
    return this.patientForm.controls;
  }

  async onSubmit(): Promise<void> {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      await this.patientService
        .createPatient(this.patientForm.value)
        .toPromise();
      alert('Patient registered successfully!');
      this.router.navigate(['/patients']);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // Form submission
  /*  onSubmit(): void {
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
  } */

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
      'patientDoctorName',
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
