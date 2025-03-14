// patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  insuranceProvider: string;
  insuranceNumber: string;
}

export interface MedicalRecord {
  id?: number;
  recordDate: Date;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;
  isFollowUpRequired: boolean;
  followUpDate?: Date;
  patientId: number;
}

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

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`);
  }

  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients`, patient);
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/patients/${id}`, patient);
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/patients/${id}`);
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
