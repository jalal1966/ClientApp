import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medication } from '../../models/medicalRecord.model';

@Injectable({
  providedIn: 'root',
})
export class PatientMedicationsService {
  private baseUrl = 'api/patients';

  constructor(private http: HttpClient) {}

  // Get all medications for a patient
  getMedications(patientId: number): Observable<Medication[]> {
    return this.http.get<Medication[]>(
      `${this.baseUrl}/${patientId}/medications`
    );
  }

  // Get active medications for a patient
  getActiveMedications(patientId: number): Observable<Medication[]> {
    return this.http.get<Medication[]>(
      `${this.baseUrl}/${patientId}/medications/active`
    );
  }

  // Get a specific medication by id
  getMedication(
    patientId: number,
    medicationId: number
  ): Observable<Medication> {
    return this.http.get<Medication>(
      `${this.baseUrl}/${patientId}/medications/${medicationId}`
    );
  }

  // Create a new medication
  createMedication(
    patientId: number,
    medication: Medication
  ): Observable<Medication> {
    return this.http.post<Medication>(
      `${this.baseUrl}/${patientId}/medications`,
      medication
    );
  }

  // Update an existing medication
  updateMedication(
    patientId: number,
    medication: Medication
  ): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${patientId}/medications/${medication.id}`,
      medication
    );
  }

  // Delete a medication
  deleteMedication(patientId: number, medicationId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${patientId}/medications/${medicationId}`
    );
  }
}
