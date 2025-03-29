import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string | null = null; // For single error messages
  errorMessages: string[] = []; // For multiple error messages
  isSubmitting: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        firstName: [''],
        lastName: [''],
        specialist: ['', [Validators.required, Validators.minLength(3)]],
        address: [''],
        telephoneNo: [''],
        salary: [0], // Will convert to number before submission if needed
        note: [''],
        jobTitleID: [null, [Validators.required, this.oneOf([0, 1, 2, 3])]],
        genderID: [null, [Validators.required, this.oneOf([1, 2])]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.trackFormChanges();
  }

  trackFormChanges() {
    // For debugging the form
    if (typeof window !== 'undefined') {
      // Check for SSR
      console.log('Form initialized');
      this.registerForm.valueChanges.subscribe((val) => {
        console.log('Form values:', val);
        console.log('Form valid:', this.registerForm.valid);
        console.log('Form errors:', this.registerForm.errors);
      });
    }
  }
  // Custom validator for oneOf
  oneOf(validOptions: any[]) {
    return (control: any) => {
      return validOptions.includes(control.value) ? null : { oneOf: true };
    };
  }

  // Getter methods for easy form control access
  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
  get firstName() {
    return this.registerForm.get('firstName');
  }
  get lastName() {
    return this.registerForm.get('lastName');
  }
  get specialist() {
    return this.registerForm.get('specialist');
  }
  get address() {
    return this.registerForm.get('address');
  }
  get telephoneNo() {
    return this.registerForm.get('telephoneNo');
  }
  get salary() {
    return this.registerForm.get('salary');
  }
  get note() {
    return this.registerForm.get('note');
  }
  get genderID() {
    return this.registerForm.get('genderID');
  }
  get jobTitleID() {
    return this.registerForm.get('jobTitleID');
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null; // Skip validation if either field is empty
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // Mark all fields as touched to trigger validation display
      this.registerForm.markAllAsTouched();
      // Form validation handling
      this.collectFormErrors();
    }
    this.isSubmitting = true;
    this.errorMessage = null;
    this.errorMessages = [];

    // Create a copy of the form value
    const formData = { ...this.registerForm.value };

    // Convert salary to number if it has a value
    if (formData.salary) {
      formData.salary = Number(formData.salary);
    }

    // Include confirmPassword in the payload
    const registerModel = formData;

    console.log('Submitting registration data:', registerModel);

    this.authService.register(registerModel).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        // Show success message or redirect to login
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' },
        });
      },
      error: (errors) => {
        console.log('Registration errors:', errors);

        this.errorMessages = Array.isArray(errors)
          ? errors
          : [errors.toString()];
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private collectFormErrors() {
    const controls = this.registerForm.controls;
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

    if (this.registerForm.errors?.['passwordMismatch']) {
      this.errorMessages.push('Passwords do not match');
    }
  }

  togglePassword(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
