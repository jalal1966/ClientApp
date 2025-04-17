import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BloodPressureService {
  constructor() {}

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
}
