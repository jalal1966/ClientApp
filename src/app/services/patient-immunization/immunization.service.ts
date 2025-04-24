import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Immunization } from '../../models/medicalRecord.model';

@Injectable({
  providedIn: 'root',
})
export class ImmunizationService {
  private readonly http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = '/api/patients';

  /**
   * Gets all immunizations for a specific patient
   * @param patientId The ID of the patient
   * @returns An observable of immunization array
   */
  getImmunizations(patientId: number): Observable<Immunization[]> {
    return this.http.get<Immunization[]>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/immunizations`
    );
  }

  /* getImmunizations(patientId: number) {
    let url = `/api/patients/${patientId}/immunizations`;
    return this.http.get<Immunization[]>(url);
  } */
  /**
   * Gets a specific immunization by ID for a patient
   * @param patientId The ID of the patient
   * @param immunizationId The ID of the immunization
   * @returns An observable of the immunization
   */
  getImmunization(
    patientId: number,
    immunizationId: number
  ): Observable<Immunization> {
    return this.http.get<Immunization>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/immunizations/${immunizationId}`
    );
  }

  /**
   * Creates a new immunization for a patient
   * @param patientId The ID of the patient
   * @param immunization The immunization data to create
   * @returns An observable of the created immunization
   */
  createImmunization(
    patientId: number,
    immunization: Omit<Immunization, 'id'>
  ): Observable<Immunization> {
    return this.http.post<Immunization>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/immunizations`,
      immunization
    );
  }

  /**
   * Updates an existing immunization
   * @param patientId The ID of the patient
   * @param immunizationId The ID of the immunization
   * @param immunization The updated immunization data
   * @returns An empty observable that completes when the operation is finished
   */
  updateImmunization(
    patientId: number,
    immunizationId: number,
    immunization: Immunization
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/immunizations/${immunizationId}`,
      immunization
    );
  }

  /**
   * Deletes an immunization
   * @param patientId The ID of the patient
   * @param immunizationId The ID of the immunization
   * @returns An empty observable that completes when the operation is finished
   */
  deleteImmunization(
    patientId: number,
    immunizationId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/immunizations/${immunizationId}`
    );
  }
}
