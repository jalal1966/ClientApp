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
import { AuthService } from '../../services/auth.service';

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
    console.log('Return URL:', this.returnUrl);
  }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService
        .login(this.loginForm.value.username, this.loginForm.value.password)
        .subscribe({
          next: () => {
            console.log('Login successful, navigating to:', this.returnUrl);

            this.router

              .navigateByUrl(this.returnUrl + '/products')
              .then((success) => {
                console.log('Navigation status:', success);
              })
              .catch((err) => console.error('Navigation error:', err));
          },
          error: (error) => {
            console.error('Login failed:', error);
            this.errorMessage = 'Login failed. Please try again.';
            this.loading = false;
          },
        });
    }
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
}
