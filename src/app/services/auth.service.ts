import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RegisterModel } from '../models/register.model';
import { LoginModel } from '../models/login.model';
import { AuthResponse } from '../models/authResponse.model';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth'; // Update with your API URL
  private currentUserSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('username')
  );

  constructor(private http: HttpClient) {}

  register(model: RegisterModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, model);
  }

  login(model: LoginModel): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, model).pipe(
      tap((response) => {
        // Store token and username in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('expiration', response.expiration.toString());

        // Update current user
        this.currentUserSubject.next(response.username);
      })
    );
  }

  logout() {
    // Remove stored token and username
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('expiration');

    // Update current user
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<string | null> {
    return this.currentUserSubject.asObservable();
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
    return !!localStorage.getItem('token');
  }
}
