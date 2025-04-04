import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PatientDetail } from '../../models/patient.model';
import { Allergy } from '../../models/medicalRecord.model';

@Injectable({
  providedIn: 'root',
})
export class PatientRecordService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = '/api/patients';

  constructor(private http: HttpClient) {}

  getPatientDetails(patientId: number): Observable<PatientDetail> {
    return this.http.get<PatientDetail>(
      `${this.apiUrl}${this.baseUrl}/${patientId}`
    );
  }

  getAllergies(patientId: number): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/allergies`
    );
  }

  addAllergy(patientId: number, allergy: Allergy): Observable<Allergy> {
    return this.http.post<Allergy>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/allergies`,
      allergy
    );
  }

  updateAllergy(
    patientId: number,
    allergyId: number,
    allergy: Allergy
  ): Observable<Allergy> {
    return this.http.put<Allergy>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/allergies/${allergyId}`,
      allergy
    );
  }

  deleteAllergy(patientId: number, allergyId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${this.baseUrl}/${patientId}/allergies/${allergyId}`
    );
  }
}
