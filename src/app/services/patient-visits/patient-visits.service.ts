import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Visit } from '../../models/visits.model';

@Injectable({
  providedIn: 'root',
})
export class PatientVisitService {
  private apiUrl = `${environment.apiUrl}`;
  private readonly baseUrl = '/api/visits';

  constructor(private http: HttpClient) {}

  // Get all visits
  getAllVisits(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}${this.baseUrl}`);
  }

  // Get a specific visit by ID
  getVisit(id: number): Observable<Visit> {
    return this.http.get<Visit>(`${this.apiUrl}${this.baseUrl}/${id}`);
  }

  // Get visits for a specific patient
  getVisitsByPatient(patientId: number): Observable<Visit[]> {
    return this.http.get<Visit[]>(
      `${this.apiUrl}${this.baseUrl}/patient/${patientId}`
    );
  }

  // Create a new visit
  createVisit(visit: Visit): Observable<Visit> {
    return this.http.post<Visit>(`${this.apiUrl}${this.baseUrl}`, visit);
  }

  // Update an existing visit
  updateVisit(visit: Visit): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}${this.baseUrl}/${visit.id}`,
      visit
    );
  }

  // Delete a visit
  deleteVisit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${this.baseUrl}/${id}`);
  }
}
