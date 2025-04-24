// patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import {
  PatientBasicInfoUpdate,
  PatientDetail,
  Patients,
} from '../../models/patient.model';
import { MedicalRecord } from '../../models/medicalRecord.model';
import { User } from '../../models/user';
import { differenceInYears } from 'date-fns/differenceInYears';
import { PatientAdapterService } from '../patientAdapter/patient-adapter.service';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = '/api/patients';

  constructor(
    private http: HttpClient,
    private patientAdapter: PatientAdapterService
  ) {}

  /** Fetch all patients */
  /*  getPatients(): Observable<Patients[]> {
    return this.http
      .get<Patients[]>(`${this.apiUrl}${this.baseUrl}`)
      .pipe(catchError(this.handleError));
  } */

  getPatients(): Observable<Patients[]> {
    return this.http.get<any[]>(`${this.apiUrl}${this.baseUrl}`).pipe(
      map((patients) =>
        patients.map((patient) =>
          this.patientAdapter.adaptApiResponseToPatient(patient)
        )
      ),
      catchError(this.handleError)
    );
  }

  getDoctorList(id: number): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}/api/auth/users/job/${id}`)
      .pipe(catchError(this.handleError));
  }

  getPatient(id: number): Observable<Patients> {
    return this.http.get<any>(`${this.apiUrl}${this.baseUrl}/${id}`).pipe(
      map((patient) => this.patientAdapter.adaptApiResponseToPatient(patient)),
      catchError(this.handleError)
    );
  }

  createPatient(patient: Patients): Observable<Patients> {
    return this.http
      .post<Patients>(`${this.apiUrl}${this.baseUrl}`, patient)
      .pipe(
        map((patient) =>
          this.patientAdapter.adaptApiResponseToPatient(patient)
        ),
        catchError(this.handleError)
      );
  }

  updatePatient(id: number, patient: Patients): Observable<Patients> {
    return this.http
      .put<Patients>(`${this.apiUrl}${this.baseUrl}/${id}`, patient)
      .pipe(
        map((patient) =>
          this.patientAdapter.adaptApiResponseToPatient(patient)
        ),
        catchError(this.handleError)
      );
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${this.baseUrl}/${id}`).pipe(
      map((patient) => this.patientAdapter.adaptApiResponseToPatient(patient)),
      catchError(this.handleError)
    );
  }

  /* getPatientInfo(id: number): Observable<Patients> {
    return this.http.get<Patients>(`${this.apiUrl}${this.baseUrl}/${id}`);
  } */

  updatePatientInfo(
    id: number,
    patientInfo: PatientBasicInfoUpdate
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}${this.baseUrl}/${id}/info`,
      patientInfo
    );
  }

  updateContactInfo(id: number, contactInfo: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}${this.baseUrl}/${id}/info/contact`,
      contactInfo
    );
  }

  updateInsuranceInfo(id: number, insuranceInfo: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}${this.baseUrl}/${id}/info/insurance`,
      insuranceInfo
    );
  }

  generateVisitSummary(visitId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/visits/${visitId}/summary`, {
      responseType: 'blob',
    });
  }

  // Medical Records operations
  getPatientRecords(patientId: number): Observable<MedicalRecord[]> {
    return this.http
      .get<MedicalRecord[]>(
        `${this.apiUrl}${this.baseUrl}/medicalrecords/patient/${patientId}`
      )
      .pipe(catchError(this.handleError));
  }

  /** Get a single patient by ID */
  getRecord(id: number): Observable<MedicalRecord> {
    return this.http
      .get<MedicalRecord>(`${this.apiUrl}${this.baseUrl}/medicalrecords/${id}`)
      .pipe(catchError(this.handleError));
  }

  /** Create a new patient */
  createRecord(record: MedicalRecord): Observable<MedicalRecord> {
    return this.http
      .post<MedicalRecord>(
        `${this.apiUrl}${this.baseUrl}/medicalrecords`,
        record
      )
      .pipe(catchError(this.handleError));
  }

  /** Update existing patient */
  updateRecord(id: number, record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(
      `${this.apiUrl}${this.baseUrl}/medicalrecords/${id}`,
      record
    );
  }

  /** Delete a patient */
  deleteRecord(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}${this.baseUrl}/medicalrecords/${id}`
    );
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

  ///////////////////////////////////////////////////////////////////
  /**
   * Generates a visit summary PDF for a specific visit
   */

  /**
   * Downloads lab results as a PDF for a specific lab
   */
  downloadLabResults(labId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}${this.baseUrl}/labs/${labId}/results`,
      {
        responseType: 'blob',
      }
    );
  }

  /**
   * Downloads immunizations results as a PDF for a specific lab
   */
  downloadImmunizationsResults(immzId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}${this.baseUrl}/immunization/${immzId}/results`,
      {
        responseType: 'blob',
      }
    );
  }
  //////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////

  /**
   * Emails lab results to a patient
   */
  emailLabResults(labId: number, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}${this.baseUrl}/labs/${labId}/email`, {
      email,
    });
  }

  /**
   * Emails lab results to a patient
   */
  emailImmunizationsResults(labId: number, email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${this.baseUrl}/immunization/${labId}/email`,
      {
        email,
      }
    );
  }
  /**
   * Gets visit history for a specific patient
   */
  getPatientVisits(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${patientId}/api/visits`);
  }

  /**
   * Gets lab results for a specific patient
   */
  getPatientLabResults(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/${patientId}${this.baseUrl}/labs`
    );
  }

  /**
   * Search patients by name or other criteria
   */
  searchPatients(searchTerm: string): Observable<Patients[]> {
    return this.http.get<Patients[]>(`${this.apiUrl}${this.baseUrl}/search`, {
      params: { term: searchTerm },
    });
  }
}
