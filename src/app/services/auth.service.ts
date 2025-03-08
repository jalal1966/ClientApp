import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterModel } from '../models/register.model';
import { LoginModel } from '../models/login.model';
import { AuthResponse } from '../models/authResponse.model';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl + '/api/auth'; // Update with your API URL

  private currentUserSubject = new BehaviorSubject<User | null>(
    JSON.parse(localStorage.getItem('username') || 'null')
  );

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.currentUser.subscribe((user) => console.log('Current User:', user));
  }
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  login(username: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
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

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');

    if (!token || !expiration) return false;

    return new Date(expiration) > new Date();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasToken(): boolean {
    // Implement your logic to check for token
    return !!localStorage.getItem('token') || !!this.currentUserValue?.token;
  }
}
