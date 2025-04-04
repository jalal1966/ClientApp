import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MedicalRecord } from '../../models/medicalRecord.model';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordsService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = '/api/patients';

  constructor(private http: HttpClient) {}

  /**
   * Get a patient's medical record
   * @param patientId The ID of the patient
   * @returns Observable of MedicalRecord
   */
  getMedicalRecord(patientId: number): Observable<MedicalRecord> {
    return this.http
      .get<MedicalRecord>(
        `${this.apiUrl}${this.baseUrl}/${patientId}/medical-record`
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new medical record for a patient
   * @param patientId The ID of the patient
   * @param medicalRecord The medical record to create
   * @returns Observable of MedicalRecord
   */
  createMedicalRecord(
    patientId: number,
    medicalRecord: MedicalRecord
  ): Observable<MedicalRecord> {
    return this.http
      .post<MedicalRecord>(
        `${this.apiUrl}${this.baseUrl}/${patientId}/medical-record`,
        medicalRecord
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an existing medical record
   * @param patientId The ID of the patient
   * @param medicalRecord The updated medical record
   * @returns Observable of void
   */
  updateMedicalRecord(
    patientId: number,
    medicalRecord: MedicalRecord
  ): Observable<void> {
    return this.http
      .put<void>(
        `${this.apiUrl}${this.baseUrl}/${patientId}/medical-record`,
        medicalRecord
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Calculate BMI based on height and weight
   * @param height Height in centimeters
   * @param weight Weight in kilograms
   * @returns Calculated BMI value with one decimal place
   */
  calculateBMI(height: number, weight: number): number {
    if (!height || !weight) return 0;

    // Convert height from cm to meters and calculate BMI
    const heightInMeters = height / 100;
    return +(weight / (heightInMeters * heightInMeters)).toFixed(1);
  }

  /**
   * Handle HTTP errors
   * @param error The error response
   * @returns Observable with error message
   */
  private handleError(error: any) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Add more context if available
      if (error.error?.message) {
        errorMessage += `\nDetails: ${error.error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
