import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { RegisterModel } from '../models/register.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    // Initialize from localStorage
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    console.log('Getting currentUserValue:', this.currentUserSubject.value);
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    const link = `${this.apiUrl}/api/Auth/login`;
    console.log('linklogin', link);
    return this.http
      .post<any>(`${this.apiUrl}/api/auth/login`, { username, password })
      .pipe(
        map((user) => {
          // Make sure user object has all required properties
          if (!user || !user.token) {
            console.error('Invalid user object returned from API:', user);
            throw new Error('Invalid user response from server');
          }

          // Store user info with consistent casing
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', user.token); // Store token separately
          localStorage.setItem('expiration', user.expiration.toString());

          // Store job title ID for role-based routing
          // Make sure jobTitleId is stored explicitly as a number
          if (user.jobTitleId !== undefined) {
            localStorage.setItem('jobTitleId', user.jobTitleId.toString());
          }

          this.currentUserSubject.next(user);
          console.log('Login successful, user data:', user);
          return user;
        }),
        catchError((error) => {
          console.error('Login error details:', error);
          return throwError(() => error);
        })
      );
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    if (!token || !expiration) return false;

    const expirationDate = new Date(expiration); // Convert stored string to Date

    return expirationDate.getTime() > new Date().getTime(); // Compare timestamps
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  register(registerData: RegisterModel): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/api/auth/register`, registerData)
      .pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/forgot-password`, { email });
  }

  validateResetToken(email: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-reset-token`, {
      email,
      token,
    });
  }

  logout(): void {
    // Remove stored token and username
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('expiration');

    // Update current user
    this.currentUserSubject.next(null);

    // remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  resetPassword(
    email: string,
    token: string,
    password: string
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      email,
      token,
      password,
    });
  }

  // Navigate based on user role
  navigateByRole(): void {
    const user = this.currentUserValue;
    if (!user) {
      console.warn('No user found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Ensure jobTitleId is treated as a number
    const roleId =
      typeof user.jobTitleId === 'string'
        ? parseInt(user.jobTitleId, 10)
        : user.jobTitleId;

    console.log('Navigating based on role ID:', roleId);

    // Use a delayed navigation to ensure the auth state is fully updated
    setTimeout(() => {
      switch (roleId) {
        case 0:
          console.log('Routing to admin dashboard');
          this.router.navigate(['/admin']);
          break;
        case 1:
          console.log('Routing to doctor dashboard');
          this.router.navigate(['/doctor']);
          break;
        case 2:
          console.log('Routing to nurse dashboard');
          this.router.navigate(['/nurse']);
          break;
        default:
          console.log('No specific role matched, routing to home');
          this.router.navigate(['/']);
          break;
      }
    }, 100);
  }

  // Check if the user has a specific role
  hasRole(roleId: number): boolean {
    return this.currentUserValue?.jobTitleId === roleId;
  }

  // Check if the current token is expired
  isTokenExpired(): boolean {
    const user = this.currentUserValue;
    if (!user) return true;

    const expiration = new Date(user.expiration);
    return expiration < new Date();
  }

  hasToken(): boolean {
    // Implement your logic to check for token
    return !!localStorage.getItem('token') || !!this.currentUserValue?.token;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error.status, error);

    if (error.error) {
      // Handle ASP.NET Core default validation response format
      if (error.error.errors && typeof error.error.errors === 'object') {
        // Extract all error messages from the errors object
        const errorMessages: string[] = [];
        for (const key in error.error.errors) {
          if (Array.isArray(error.error.errors[key])) {
            error.error.errors[key].forEach((message: string) => {
              errorMessages.push(message);
            });
          }
        }

        if (errorMessages.length > 0) {
          return throwError(() => errorMessages);
        }
      }

      // Handle our custom error response format
      if (error.error.errors && Array.isArray(error.error.errors)) {
        return throwError(() => error.error.errors);
      }

      // If there's a message property
      if (error.error.message) {
        return throwError(() => [error.error.message]);
      }

      // If error.error is a string
      if (typeof error.error === 'string') {
        return throwError(() => [error.error]);
      }

      // If error.error has a title (common in ASP.NET Core responses)
      if (error.error.title) {
        return throwError(() => [error.error.title]);
      }
    }

    // Fallback error
    return throwError(() => [
      'An unexpected error occurred. Please try again.',
    ]);
  }
}
