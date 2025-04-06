import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = '/api/Users';
  currentUser: User | undefined;

  constructor(
    private authService: AuthService,

    private http: HttpClient
  ) {}

  /**
   * Loads the current user and patches the provided form with user ID
   * @param form The form to be patched with user data
   * @param errorCallback Optional callback for error handling
   * @returns Observable of the user object
   */
  public loadCurrentUserAndPatchForm(
    form: FormGroup,
    errorCallback?: (error: any) => void
  ): Observable<any> {
    return this.authService.getCurrentUser().pipe(
      tap({
        next: (user) => {
          if (user) {
            console.log('Full user object:', JSON.stringify(user));
            console.log('Current user loaded:', user);
            this.currentUser = user;
            console.log('currentUser', this.currentUser);
            // Patch the form
            form.patchValue({
              userID: user.userID,
              nursName: `${user.firstName} ${user.lastName}`,
            });
          }
        },
        error: (err) => {
          console.error('Error getting current user:', err);
          if (errorCallback) {
            errorCallback(err);
          }
        },
      }),
      // 👇 This makes the observable emit the user object
      map((user) => user)
    );
  }

  // active
  getUsers(): Observable<User[]> {
    console.log(this.http.get<User[]>(`${this.apiUrl}${this.baseUrl}`));
    return this.http.get<User[]>(`${this.apiUrl}${this.baseUrl}`);
  }

  getDoctors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}${this.baseUrl}/doctors`);
  }

  getNurses(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}${this.baseUrl}/nurses`);
  }

  getAdministrator(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}${this.baseUrl}/Administrator`);
  }

  getManagement(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}${this.baseUrl}/Management`);
  }

  // Not Active Yet ///////////////////////77//////////////////////////////////////////777
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${this.baseUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}${this.baseUrl}/`, user);
  }

  updateUser(user: User): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${user.userID}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${this.baseUrl}/${id}`);
  }
}
