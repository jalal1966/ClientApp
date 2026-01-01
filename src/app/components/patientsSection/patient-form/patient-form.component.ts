import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PatientService } from '../../../services/patient/patient.service';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/auth/auth.service';
import { Location } from '@angular/common'; // Correct import
import { PatientComponentBase } from '../../../shared/base/patient-component-base';

@Component({
  selector: 'app-patient-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss',
})
export class PatientFormComponent
  extends PatientComponentBase
  implements OnInit
{
  patientForm!: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string | null = null; // For single error messages
  errorMessages: string[] = []; // For multiple error messages
  doctorRecords: User[] = [];

  // Form control properties
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
  lastVisitDate: any;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    router: Router,
    private location: Location,
    authService: AuthService // Correct injection
  ) {
    super(authService, router);

    // Get current user
    const currentUser = authService;
    this.initForm();
  }

  initForm() {
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      dateOfBirth: ['', Validators.required],
      genderID: ['', [Validators.required, this.oneOf([1, 2])]], // Apply custom validator
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
      lastVisitDate: [''],
    });
  }
  ngOnInit(): void {
    // Set nurse ID and name from current user
    this.patientForm.patchValue({
      nursID: this.currentUser.userID,
      nursName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
    });
    console.log('Nurs', this.nursID, this.nursName);

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

    // Assign form controls to component properties for easier access
    this.firstName = this.patientForm.get('firstName');
    this.lastName = this.patientForm.get('lastName');
    this.dateOfBirth = this.patientForm.get('dateOfBirth');
    this.genderID = this.patientForm.get('genderID');
    this.contactNumber = this.patientForm.get('contactNumber');
    this.email = this.patientForm.get('email');
    this.nursID = this.patientForm.get('nursID');
    this.nursName = this.patientForm.get('nursName');
    this.patientDoctorID = this.patientForm.get('patientDoctorID');
    this.patientDoctor = this.patientForm.get('patientDoctorName');
    this.lastVisitDate = this.patientForm.get('lastVisitDate');
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
          lastVisitDate: this.lastVisitDate,
        });
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
  get formControls() {
    return this.patientForm.controls;
  }

  async onSubmit(): Promise<void> {
    // Clear previous error messages
    this.errorMessages = [];

    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return this.navigateBack();
    }

    this.isSubmitting = true;
    try {
      // Prepare the form data - ensure proper formatting
      const formData = { ...this.patientForm.value };

      // Ensure IDs are numbers
      formData.genderID = Number(formData.genderID);
      formData.nursID = Number(formData.nursID);
      formData.patientDoctorID = Number(formData.patientDoctorID);

      // Format dates
      if (formData.dateOfBirth) {
        formData.dateOfBirth = new Date(formData.dateOfBirth)
          .toISOString()
          .split('T')[0];
      }

      if (formData.lastVisitDate) {
        formData.lastVisitDate = formData.lastVisitDate
          ? new Date(formData.lastVisitDate).toISOString().split('T')[0]
          : null;
      }

      console.log('Submitting patient data:', formData);

      // Send to server and get the response with the new patient ID
      const response = await this.patientService
        .createPatient(formData)
        .toPromise();

      alert(
        'Patient registered successfully! Redirecting to medical record form...'
      );

      // Navigate to medical record form with the new patient ID
      // Assuming the response contains the patient ID as 'id' or 'patientId'
      const newPatientId = response?.id || response?.id;

      if (newPatientId) {
        // Navigate to medical records form
        this.router.navigate(['/patients', newPatientId, 'medical-records']);
      } else {
        console.error('Patient ID not returned from server');
        this.location.back();
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);

      // Improved error handling
      if (error.error && error.error.errors) {
        // Process validation errors from the server
        const serverErrors = error.error.errors;
        console.log('Server validation errors:', serverErrors);

        this.errorMessages = [];
        for (const key in serverErrors) {
          if (serverErrors.hasOwnProperty(key)) {
            // Get field display name
            const fieldName = this.getFieldDisplayName(key);
            const errorMessages = Array.isArray(serverErrors[key])
              ? serverErrors[key]
              : [serverErrors[key]];

            // Add each error to the messages array
            errorMessages.forEach((errorMsg: string) => {
              this.errorMessages.push(`${fieldName}: ${errorMsg}`);
            });

            // Add server error to specific form control if it exists
            const control = this.patientForm.get(key);
            if (control) {
              const currentErrors = control.errors || {};
              control.setErrors({
                ...currentErrors,
                serverError: errorMessages.join(', '),
              });
            }
          }
        }
      } else {
        // Generic error message if specific errors aren't available
        this.errorMessage = 'Failed to register patient. Please try again.';
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  // Helper method to get display name for fields
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      dateOfBirth: 'Date of Birth',
      genderID: 'Gender',
      contactNumber: 'Contact Number',
      email: 'Email',
      nursID: 'Nurse ID',
      nursName: 'Nurse Name',
      patientDoctorID: 'Doctor',
      patientDoctorName: 'Doctor Name',
      lastVisitDate: 'Last Visit Date',
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactNumber: 'Emergency Contact Number',
      insuranceProvider: 'Insurance Provider',
      insuranceNumber: 'Insurance Number',
      address: 'Address',
    };

    return displayNames[fieldName] || fieldName;
  }

  navigateBack(): void {
    this.location.back();
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
      //'lastVisitDate'
    ];

    requiredFields.forEach((field) => {
      const control = this.patientForm.get(field);
      console.log(
        `${field}: value=${control?.value}, valid=${control?.valid}, errors=`,
        control?.errors
      );
    });
  }

  // Alternative method using input event
  convertToUppercase(event: any) {
    const input = event.target as HTMLInputElement;
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;

    input.value = input.value.toUpperCase();
    input.setSelectionRange(startPos, endPos);
    // Add this to convert input to uppercase
    this.patientForm
      .get('insuranceProvider')
      ?.valueChanges.subscribe((value) => {
        if (value && value !== value.toUpperCase()) {
          this.patientForm
            .get('insuranceProvider')
            ?.setValue(value.toUpperCase(), { emitEvent: false });
        }
      });
  }
}
