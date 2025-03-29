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

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    console.log(this.http.get<User[]>(`${this.apiUrl}/api/Users`));
    return this.http.get<User[]>(`${this.apiUrl}/api/Users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getProviders(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/providers`);
  }

  getDoctors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/Users/doctors`);
  }

  getNurses(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/nurses`);
  }

  getPatients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/patients`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(user: User): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${user.userID}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
