import { Component } from '@angular/core';
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
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        firstName: [''],
        lastName: [''],
        address: ['', Validators.required],
        telephoneNo: ['', Validators.required],
        salary: [''],
        note: [''],
        jobTitleID: ['', [Validators.required, this.oneOf([1, 2])]],
        gender: ['', [Validators.required, this.oneOf([1, 2])]],
      },
      { validators: this.passwordMatchValidator }
    );
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
  get gender() {
    return this.registerForm.get('gender');
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    // Mark all fields as touched to trigger validation display
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.error = '';

      // Prepare registration model, excluding confirmPassword
      const { confirmPassword, ...registerModel } = this.registerForm.value;

      this.authService.register(registerModel).subscribe({
        next: () => {
          // Show success message or redirect to login
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' },
          });
        },
        error: (err) => {
          // Handle registration errors
          this.error =
            err.error?.message || 'Registration failed. Please try again.';
          this.isSubmitting = false;
          console.error('Registration error', err);
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    }
  }
}
