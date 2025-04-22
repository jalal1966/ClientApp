import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Pressure } from '../../models/medicalRecord.model';

@Injectable({
  providedIn: 'root',
})
export class BloodPressureService {
  private apiUrl = `${environment.apiUrl}/api/pressures`;

  constructor(private http: HttpClient) {}

  /**
   * Get all pressure readings
   */
  getAllPressures(): Observable<Pressure[]> {
    return this.http.get<Pressure[]>(this.apiUrl);
  }

  /**
   * Get a specific pressure reading by ID
   * @param id The pressure reading ID
   */
  getPressureById(id: number): Observable<Pressure[]> {
    return this.http.get<Pressure[]>(`${this.apiUrl}/Patient/${id}`);
  }

  /**
   * Get all pressure readings for a specific medical record
   * @param medicalRecordId The medical record ID
   */
  getPressuresByMedicalRecord(medicalRecordId: number): Observable<Pressure[]> {
    return this.http.get<Pressure[]>(
      `${this.apiUrl}/medical-record/${medicalRecordId}`
    );
  }

  /**
   * Create a new pressure reading
   * @param pressure The pressure data to create
   */
  createPressure(pressure: Pressure): Observable<Pressure> {
    // Pre-calculate values before sending to API
    if (pressure.systolicPressure && pressure.diastolicPressure) {
      pressure.bloodPressureRatio = this.calculateBloodPressureRatio(
        pressure.systolicPressure,
        pressure.diastolicPressure
      );
    }

    return this.http.post<Pressure>(this.apiUrl, pressure);
  }

  /**
   * Update an existing pressure reading
   * @param id The pressure reading ID
   * @param pressure The updated pressure data
   */
  updatePressure(id: number, pressure: Pressure): Observable<void> {
    // Pre-calculate values before sending to API
    if (pressure.systolicPressure && pressure.diastolicPressure) {
      pressure.bloodPressureRatio = this.calculateBloodPressureRatio(
        pressure.systolicPressure,
        pressure.diastolicPressure
      );
    }

    return this.http.put<void>(`${this.apiUrl}/${id}`, pressure);
  }

  /**
   * Delete a pressure reading
   * @param id The pressure reading ID to delete
   */
  deletePressure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Calculates blood pressure ratio (systolic/diastolic)
   * @param systolicPressure The systolic blood pressure
   * @param diastolicPressure The diastolic blood pressure
   * @returns Blood pressure ratio or null if invalid inputs
   */
  calculateBloodPressureRatio(
    systolicPressure: number | null,
    diastolicPressure: number | null
  ): number | null {
    if (
      systolicPressure != null &&
      diastolicPressure != null &&
      diastolicPressure > 0
    ) {
      return systolicPressure / diastolicPressure;
    }
    return null;
  }

  /**
   * Evaluates if blood pressure is normal based on age, weight, and gender
   * @param systolicPressure The systolic blood pressure
   * @param diastolicPressure The diastolic blood pressure
   * @param age Patient's age
   * @param weight Patient's weight in kg
   * @param gender Patient's gender ('male' or 'female')
   * @returns Whether the blood pressure is within normal range
   */
  evaluateBloodPressure(
    systolicPressure: number | null,
    diastolicPressure: number | null,
    age: number,
    weight: number,
    gender: string
  ): boolean {
    if (systolicPressure == null || diastolicPressure == null) {
      return false;
    }

    // Default ranges
    let maxSystolic = 120;
    let minSystolic = 90;
    let maxDiastolic = 80;
    let minDiastolic = 60;

    // Adjust based on age
    if (age < 18) {
      // Pediatric adjustments
      maxSystolic = 110 + age;
      minSystolic = 80 + Math.floor(age / 2);
      maxDiastolic = 70 + Math.floor(age / 3);
      minDiastolic = 50 + Math.floor(age / 3);
    } else if (age > 60) {
      // Elderly adjustments
      maxSystolic += Math.floor((age - 60) / 10) * 5;
      minSystolic -= Math.floor((age - 60) / 20) * 5;
      maxDiastolic += Math.floor((age - 60) / 10) * 2;
    }

    // Adjust based on gender (simplified)
    if (gender.toLowerCase() === 'male') {
      maxSystolic += 5;
      maxDiastolic += 3;
    }

    // Adjust based on weight (BMI consideration would be more accurate)
    // This is a simplified adjustment
    if (weight > 100) {
      maxSystolic += Math.floor((weight - 100) / 10) * 2;
      maxDiastolic += Math.floor((weight - 100) / 10);
    }

    // Evaluate if blood pressure is within normal range
    return (
      systolicPressure >= minSystolic &&
      systolicPressure <= maxSystolic &&
      diastolicPressure >= minDiastolic &&
      diastolicPressure <= maxDiastolic
    );
  }

  /**
   * Gets the blood pressure category based on systolic and diastolic values
   * @param systolicPressure The systolic blood pressure
   * @param diastolicPressure The diastolic blood pressure
   * @returns Blood pressure category
   */
  getBloodPressureCategory(
    systolicPressure: number | null,
    diastolicPressure: number | null
  ): string {
    if (systolicPressure == null || diastolicPressure == null) {
      return 'Unknown';
    }

    if (systolicPressure < 90 || diastolicPressure < 60) {
      return 'Low Blood Pressure';
    } else if (systolicPressure < 120 && diastolicPressure < 80) {
      return 'Normal';
    } else if (systolicPressure < 130 && diastolicPressure < 80) {
      return 'Elevated';
    } else if (systolicPressure < 140 || diastolicPressure < 90) {
      return 'Hypertension Stage 1';
    } else if (systolicPressure < 180 || diastolicPressure < 120) {
      return 'Hypertension Stage 2';
    } else {
      return 'Hypertensive Crisis';
    }
  }

  /**
   * Creates a pressure record with comprehensive evaluation
   * @param medicalRecordId The medical record ID
   * @param systolicPressure The systolic blood pressure
   * @param diastolicPressure The diastolic blood pressure
   * @param age Patient's age
   * @param weight Patient's weight in kg
   * @param gender Patient's gender ('male' or 'female')
   */
  createComprehensivePressureRecord(
    patientId: number,
    systolicPressure: number | null,
    diastolicPressure: number | null,
    medicalRecordId: number,
    age: number,
    weight: number,
    gender: string
  ): Observable<Pressure> {
    const pressure: Pressure = {
      patientId: patientId,
      medicalRecordId: medicalRecordId,
      systolicPressure: systolicPressure,
      diastolicPressure: diastolicPressure,
      bloodPressureRatio: this.calculateBloodPressureRatio(
        systolicPressure,
        diastolicPressure
      ),
      isBloodPressureNormal: this.evaluateBloodPressure(
        systolicPressure,
        diastolicPressure,
        age,
        weight,
        gender
      ),
    };

    return this.createPressure(pressure);
  }

  /**
   * Get the most recent pressure reading for a medical record
   * @param medicalRecordId The medical record ID
   */
  getLatestPressureForMedicalRecord(
    medicalRecordId: number
  ): Observable<Pressure | null> {
    return this.getPressuresByMedicalRecord(medicalRecordId).pipe(
      map((pressures) => (pressures.length > 0 ? pressures[0] : null))
    );
  }
}
