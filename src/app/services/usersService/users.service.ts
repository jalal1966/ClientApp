import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = '/api/Users';

  constructor(private http: HttpClient) {}
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
