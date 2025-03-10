import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterModel } from '../models/register.model';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/api/auth'; // Update with your API URL
  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem('currentUser') || 'null')
  );
  public currentUser: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.currentUser.subscribe((user) => console.log('Current User:', user));
  }
  // to DO here localStorage.setItem('jobTitle', user.jobTitle);
  login(username: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map((user) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', user.token); // Store token separately
          localStorage.setItem('expiration', user.expiration);
          this.currentUserSubject.next(user);
          console.log('user', user);
          return user;
        }),
        catchError((error) => {
          console.error('Login failed:', error);
          throw error; // Re-throw the error for the component to handle
        })
      );
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    if (!token || !expiration) return false;

    const expirationDate = new Date(expiration); // Convert stored string to Date

    return expirationDate.getTime() > new Date().getTime(); // Compare timestamps
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

  logout() {
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

  hasToken(): boolean {
    // Implement your logic to check for token
    return !!localStorage.getItem('token') || !!this.currentUserValue?.token;
  }
}
