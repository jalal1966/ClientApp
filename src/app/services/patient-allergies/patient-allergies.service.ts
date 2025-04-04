import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Allergy } from '../../models/medicalRecord.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientAllergiesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllergies(patientId: number): Observable<Allergy[]> {
    return this.http.get<Allergy[]>(
      `${this.apiUrl}/api/${patientId}/allergies`
    );
  }

  getAllergy(patientId: number, id: number): Observable<Allergy> {
    return this.http.get<Allergy>(
      `${this.apiUrl}/api/${patientId}/allergies/${id}`
    );
  }

  createAllergy(patientId: number, allergy: Allergy): Observable<Allergy> {
    return this.http.post<Allergy>(
      `${this.apiUrl}/api/${patientId}/allergies`,
      allergy
    );
  }

  updateAllergy(
    patientId: number,
    id: number,
    allergy: Allergy
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/api/${patientId}/allergies/${id}`,
      allergy
    );
  }

  deleteAllergy(patientId: number, id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/api/${patientId}/allergies/${id}`
    );
  }
}
