// patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { PatientDetail, Patients } from '../../models/patient.model';
import { MedicalRecord } from '../../models/medicalRecord.model';
import { User } from '../../models/user';
import { differenceInYears } from 'date-fns/differenceInYears';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = '/api/patients';

  constructor(private http: HttpClient) {}

  /** Fetch all patients */
  getPatients(): Observable<Patients[]> {
    return this.http
      .get<Patients[]>(`${this.apiUrl}${this.baseUrl}`)
      .pipe(catchError(this.handleError));
  }

  getDoctorList(id: number): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}/api/auth/users/job/${id}`)
      .pipe(catchError(this.handleError));
  }

  getPatient(id: number): Observable<Patients> {
    return this.http
      .get<Patients>(`${this.apiUrl}${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createPatient(patient: Patients): Observable<Patients> {
    return this.http
      .post<Patients>(`${this.apiUrl}${this.baseUrl}`, patient)
      .pipe(catchError(this.handleError));
  }

  updatePatient(id: number, patient: Patients): Observable<Patients> {
    return this.http
      .put<Patients>(`${this.apiUrl}${this.baseUrl}/${id}`, patient)
      .pipe(catchError(this.handleError));
  }

  deletePatient(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Medical Records operations
  getPatientRecords(patientId: number): Observable<MedicalRecord[]> {
    return this.http
      .get<MedicalRecord[]>(
        `${this.apiUrl}/medicalrecords/patient/${patientId}`
      )
      .pipe(catchError(this.handleError));
  }

  /** Get a single patient by ID */
  getRecord(id: number): Observable<MedicalRecord> {
    return this.http
      .get<MedicalRecord>(`${this.apiUrl}/medicalrecords/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** Create a new patient */
  createRecord(record: MedicalRecord): Observable<MedicalRecord> {
    return this.http
      .post<MedicalRecord>(`${this.apiUrl}/medicalrecords`, record)
      .pipe(catchError(this.handleError));
  }

  /** Update existing patient */
  updateRecord(id: number, record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(
      `${this.apiUrl}/medicalrecords/${id}`,
      record
    );
  }

  /** Delete a patient */
  deleteRecord(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/medicalrecords/${id}`);
  }

  /** Handle API errors */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    const errorMessage =
      error.error?.message || 'An error occurred. Please try again.';
    return throwError(() => new Error(errorMessage));
  }

  getAge(dob: string | Date): number {
    return differenceInYears(new Date(), new Date(dob));
  }

  getPatientDetails(id: number): Observable<PatientDetail> {
    return this.http.get<PatientDetail>(`${this.apiUrl}/${id}`);
  }
}
