import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  returnUrl: string = '/';
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    this.submitted = true;

    // Reset error message
    this.errorMessage = '';

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    console.log('Submitting login for user:', username);

    this.authService
      .login(this.loginForm.value.username, this.loginForm.value.password)
      .subscribe({
        next: (user) => {
          console.log('Login successful, user received:', user);
          console.log('Return URL is:', this.returnUrl);

          // Only navigate to returnUrl if it's explicitly set and not the default

          if (
            this.returnUrl &&
            this.returnUrl !== '/' &&
            this.returnUrl !== '/login'
          ) {
            console.log('Navigating to return URL:', this.returnUrl);
            this.router
              .navigateByUrl(this.returnUrl)
              .then((success) => {
                console.log('Navigation status:', success);
                this.loading = false;
              })
              .catch((err) => {
                console.error('Navigation to return URL failed:', err);
                this.loading = false;
                // Fall back to role-based navigation
                this.authService.navigateByRole();
              });
          } else {
            console.log('No specific return URL, using role-based navigation');
            // Navigate based on role
            this.authService.navigateByRole();
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Login failed with error:', error);
          this.errorMessage =
            'Login failed. Please check your credentials and try again.';
          this.loading = false;
        },
      });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
}
