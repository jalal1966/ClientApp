import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  VitalSigns,
  CreateVitalSigns,
  UpdateVitalSigns,
} from '../models/vital-signs.model';

@Injectable({
  providedIn: 'root',
})
export class VitalSignsService {
  private apiUrl = `${environment.apiUrl}/api/VitalSigns`; // Adjust based on your API

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Record new vital signs
  recordVitalSigns(vitalSigns: VitalSigns): Observable<VitalSigns> {
    return this.http.post<VitalSigns>(this.apiUrl, vitalSigns, {
      headers: this.getHeaders(),
    });
  }

  // Get all vital signs for a specific patient
  getPatientVitalSigns(patientId: number): Observable<VitalSigns[]> {
    return this.http.get<VitalSigns[]>(`${this.apiUrl}/patient/${patientId}`, {
      headers: this.getHeaders(),
    });
  }
  /**https://localhost:5001/api/VitalSigns/patient/1 */
  /** GET: All vital signs for a patient */
  getByPatient(patientId: number): Observable<VitalSigns[]> {
    return this.http.get<VitalSigns[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  // Get a specific vital sign record by ID
  getVitalSignById(id: number): Observable<VitalSigns> {
    return this.http.get<VitalSigns>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Get latest vital signs for a patient
  getLatestVitalSigns(patientId: number): Observable<VitalSigns> {
    return this.http.get<VitalSigns>(
      `${this.apiUrl}/patient/${patientId}/latest`,
      { headers: this.getHeaders() }
    );
  }

  // Update vital signs record
  updateVitalSigns(id: number, vitalSigns: VitalSigns): Observable<VitalSigns> {
    return this.http.put<VitalSigns>(`${this.apiUrl}/${id}`, vitalSigns, {
      headers: this.getHeaders(),
    });
  }

  // Delete vital signs record
  deleteVitalSigns(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Get vital signs within a date range
  getVitalSignsByDateRange(
    patientId: number,
    startDate: Date,
    endDate: Date
  ): Observable<VitalSigns[]> {
    return this.http.get<VitalSigns[]>(
      `${this.apiUrl}/patient/${patientId}/range`,
      {
        headers: this.getHeaders(),
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      }
    );
  }
  /** GET: All vital signs */
  getAll(): Observable<VitalSigns[]> {
    return this.http.get<VitalSigns[]>(this.apiUrl);
  }

  /** GET: Vital signs by ID */
  getById(id: number): Observable<VitalSigns> {
    return this.http.get<VitalSigns>(`${this.apiUrl}/patient/${id}`);
  }

  /** GET: Latest vital signs for a patient */
  getLatestByPatient(patientId: number): Observable<VitalSigns> {
    return this.http.get<VitalSigns>(
      `${this.apiUrl}/patient/${patientId}/latest`
    );
  }

  /** GET: Vital signs by date range */
  getByDateRange(
    patientId: number,
    startDate: string,
    endDate: string
  ): Observable<VitalSigns[]> {
    return this.http.get<VitalSigns[]>(
      `${this.apiUrl}/patient/${patientId}/range`,
      {
        params: {
          startDate,
          endDate,
        },
      }
    );
  }

  /** POST: Create new vital signs */
  create(data: CreateVitalSigns): Observable<VitalSigns> {
    return this.http.post<VitalSigns>(this.apiUrl, data);
  }

  /** PUT: Update vital signs */
  update(id: number, data: UpdateVitalSigns): Observable<VitalSigns> {
    return this.http.put<VitalSigns>(`${this.apiUrl}/${id}`, data);
  }

  /** DELETE: Remove vital signs */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
