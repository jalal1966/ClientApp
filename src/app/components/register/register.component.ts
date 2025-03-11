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
import { AuthService } from '../../services/auth.service';

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
  error: string | null = null;
  isSubmitting: boolean = false;
  showPassword: boolean = false;

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
        address: [''],
        telephoneNo: [''],
        salary: [''], // Will convert to number before submission if needed
        note: [''],
        jobTitleID: [null, [Validators.required, this.oneOf([0, 1, 2])]],
        genderID: [null, [Validators.required, this.oneOf([1, 2])]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
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
    // Mark all fields as touched to trigger validation display
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.error = '';

      // Create a copy of the form value
      const formData = { ...this.registerForm.value };

      // Convert salary to number if it has a value
      if (formData.salary) {
        formData.salary = Number(formData.salary);
      }

      // Remove confirmPassword as it's not in the API model
      const { confirmPassword, ...registerModel } = formData;

      console.log('Submitting registration data:', registerModel);

      this.authService.register(registerModel).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          // Show success message or redirect to login
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' },
          });
        },
        error: (err) => {
          // Handle registration errors
          console.error('Registration error', err);
          this.error =
            err.error?.message || 'Registration failed. Please try again.';
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    } else {
      console.log('Form is invalid:', this.registerForm.errors);
      const controls = this.registerForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          console.log('Invalid control:', name, controls[name].errors);
        }
      }
    }
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
