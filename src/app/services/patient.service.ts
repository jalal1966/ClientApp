// patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Patient } from '../models/patient.model';
import { MedicalRecord } from '../models/medicalRecord.model';
import { User } from '../models/user';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Patient CRUD operations
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/api/patients`);
  }

  getDoctorList(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/api/auth/users/job/${id}`);
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/api/patients/${id}`);
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/api/patients`, patient);
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/api/patients/${id}`, patient);
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/patients/${id}`);
  }

  // Medical Records operations
  getPatientRecords(patientId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(
      `${this.apiUrl}/medicalrecords/patient/${patientId}`
    );
  }

  getRecord(id: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.apiUrl}/medicalrecords/${id}`);
  }

  createRecord(record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(
      `${this.apiUrl}/medicalrecords`,
      record
    );
  }

  updateRecord(id: number, record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(
      `${this.apiUrl}/medicalrecords/${id}`,
      record
    );
  }

  deleteRecord(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/medicalrecords/${id}`);
  }
}
