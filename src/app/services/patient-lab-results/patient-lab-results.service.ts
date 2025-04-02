import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LabResult } from '../../models/medicalRecord.model';

@Injectable({
  providedIn: 'root',
})
export class PatientLabResultsService {
  private baseUrl = '/api/patients';

  constructor(private http: HttpClient) {}

  /**
   * Get all lab results for a patient
   * @param patientId The ID of the patient
   * @returns Observable of LabResult array
   */
  getLabResults(patientId: number): Observable<LabResult[]> {
    return this.http.get<LabResult[]>(
      `${this.baseUrl}/${patientId}/lab-results`
    );
  }

  /**
   * Get a specific lab result
   * @param patientId The ID of the patient
   * @param resultId The ID of the lab result
   * @returns Observable of LabResult
   */
  getLabResult(patientId: number, resultId: number): Observable<LabResult> {
    return this.http.get<LabResult>(
      `${this.baseUrl}/${patientId}/lab-results/${resultId}`
    );
  }

  /**
   * Create a new lab result for a patient
   * @param patientId The ID of the patient
   * @param labResult The lab result to create
   * @returns Observable of created LabResult
   */
  createLabResult(
    patientId: number,
    labResult: LabResult
  ): Observable<LabResult> {
    return this.http.post<LabResult>(
      `${this.baseUrl}/${patientId}/lab-results`,
      labResult
    );
  }

  /**
   * Update an existing lab result
   * @param patientId The ID of the patient
   * @param resultId The ID of the lab result
   * @param labResult The updated lab result data
   * @returns Observable of HTTP response
   */
  updateLabResult(
    patientId: number,
    resultId: number,
    labResult: LabResult
  ): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${patientId}/lab-results/${resultId}`,
      labResult
    );
  }

  /**
   * Delete a lab result
   * @param patientId The ID of the patient
   * @param resultId The ID of the lab result to delete
   * @returns Observable of HTTP response
   */
  deleteLabResult(patientId: number, resultId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${patientId}/lab-results/${resultId}`
    );
  }
}
