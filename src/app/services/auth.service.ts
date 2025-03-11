import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    return this.http
      .post<any>(`${this.apiUrl}/api/auth/login`, { username, password })
      .pipe(
        map((user) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', user.token); // Store token separately
          localStorage.setItem('expiration', user.expiration.toString());

          // Store job title ID for role-based routing
          if (user.jobTitleId !== undefined) {
            localStorage.setItem('jobTitleId', user.jobTitleId.toString());
          }

          this.currentUserSubject.next(user);
          console.log('user', user);
          return user;
        }),
        catchError((error) => {
          console.error('Login error:', error);
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
    return this.http.post(`${this.apiUrl}/register`, registerData);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
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
      this.router.navigate(['/login']);
      return;
    }

    switch (user.jobTitleId) {
      case 1: // Doctor
        this.router.navigate(['/doctor']);
        break;
      case 2: // Nurse
        this.router.navigate(['/nurse']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
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
}
