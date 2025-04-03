import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientInfo } from '../../models/patientInfo';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientInfoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPatientInfo(id: number): Observable<PatientInfo> {
    return this.http.get<PatientInfo>(`${this.apiUrl}/api/patients/${id}/info`);
  }

  updatePatientInfo(id: number, patientInfo: PatientInfo): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/patients/${id}/info`, patientInfo);
  }

  updateContactInfo(id: number, contactInfo: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/api/patients/${id}/info/contact`,
      contactInfo
    );
  }

  updateInsuranceInfo(id: number, insuranceInfo: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/api/patients/${id}/info/insurance`,
      insuranceInfo
    );
  }
}
