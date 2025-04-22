import { Injectable } from '@angular/core';
import { PatientDetail, Patients } from '../../models/patient.model';
import { Visit } from '../../models/visits.model';
import { MedicalRecord } from '../../models/medicalRecord.model';
import { MedicalRecordsService } from '../medical-records/medical-records.service';

@Injectable({
  providedIn: 'root',
})
export class PatientAdapterService {
  /**
   * Transforms the API response to match the Patients interface
   */
  adaptApiResponseToPatient(apiResponse: any): Patients {
    console.log('Raw API response:', apiResponse);

    const patientId = apiResponse.id ?? 0;

    // Get the first medical record from the array (if it exists)
    const medicalRecordData =
      Array.isArray(apiResponse.medicalRecords) &&
      apiResponse.medicalRecords.length > 0
        ? apiResponse.medicalRecords[0]
        : {};

    const medicalRecordId = medicalRecordData.id ?? 0;

    // Create patient detail
    const patientDetail: PatientDetail = {
      roomNumber: apiResponse.roomNumber ?? '',
      bedNumber: apiResponse.bedNumber ?? '',
      dateOfBirth: new Date(apiResponse.dateOfBirth),
      primaryDiagnosis: apiResponse.primaryDiagnosis ?? '',
      admissionDate: apiResponse.registrationDate
        ? new Date(apiResponse.registrationDate)
        : new Date(),
      createdAt: new Date(apiResponse.registrationDate ?? Date.now()),
      updatedAt: new Date(),
    };

    // Create medical record using data from the first medical record in the array
    const medicalRecord: MedicalRecord = {
      id: medicalRecordId,
      patientId,
      userID: medicalRecordData.userID ?? 0,
      recordDate: medicalRecordData.recordDate
        ? new Date(medicalRecordData.recordDate)
        : undefined,
      recentVisits: Array.isArray(medicalRecordData.visits)
        ? medicalRecordData.visits.map((visit: any) => ({
            id: visit.id ?? 0,
            patientId,
            medicalRecordId,
            visitDate: visit.visitDate ? new Date(visit.visitDate) : new Date(),
            providerName: apiResponse.patientDoctorName ?? '',
            providerId: apiResponse.patientDoctorID ?? 0,
            visitType: visit.visitType ?? 'Check-up',
            reason: visit.reason ?? '',
            assessment: visit.assessment ?? '',
            diagnosis: Array.isArray(visit.diagnosis) ? visit.diagnosis : [],
            planTreatment: visit.planTreatment ?? '',
            medication: Array.isArray(visit.medication) ? visit.medication : [],
            notes: visit.notes ?? '',
            followUpRequired: visit.followUpRequired ?? false,
            followUpDate: visit.followUpDate
              ? new Date(visit.followUpDate)
              : undefined,
          }))
        : [],

      height: medicalRecordData.height ?? 0,
      weight: medicalRecordData.weight ?? 0,
      bmi: medicalRecordData.bmi ?? 0,
      bloodType: medicalRecordData.bloodType ?? 'Unknown',
      chronicConditions: medicalRecordData.chronicConditions ?? '',
      surgicalHistory: medicalRecordData.surgicalHistory ?? '',
      socialHistory: medicalRecordData.socialHistory ?? '',
      familyMedicalHistory: medicalRecordData.familyMedicalHistory ?? '',

      allergies: Array.isArray(medicalRecordData.allergies)
        ? medicalRecordData.allergies.map((allergy: any) => ({
            id: allergy.id ?? 0,
            patientId,
            allergyType: allergy.allergyType ?? '',
            name: allergy.name ?? allergy.allergyType ?? '',
            reaction: allergy.reaction ?? '',
            severity: allergy.severity ?? 'Unknown',
            dateIdentified: allergy.dateIdentified
              ? new Date(allergy.dateIdentified)
              : new Date(),
          }))
        : [],

      labResults: Array.isArray(medicalRecordData.labResults)
        ? medicalRecordData.labResults.map((lab: any) => ({
            id: lab.id ?? 0,
            patientId,
            testDate: lab.testDate ? new Date(lab.testDate) : new Date(),
            testName: lab.testName ?? '',
            result: lab.result ?? '',
            referenceRange: lab.referenceRange ?? '',
            orderingProvider:
              lab.orderingProvider ??
              apiResponse.patientDoctorName ??
              'Unknown',
            notes: lab.notes ?? '',
            medicalRecordId,
          }))
        : [],

      immunizations: Array.isArray(medicalRecordData.immunizations)
        ? medicalRecordData.immunizations.map((imm: any) => ({
            id: imm.id ?? 0,
            patientId,
            medicalRecordId,
            vaccineName: imm.vaccineName ?? '',
            administrationDate: imm.administrationDate
              ? new Date(imm.administrationDate)
              : new Date(),
            lotNumber: imm.lotNumber ?? '',
            administeringProvider: imm.administeringProvider ?? '',
            manufacturer: imm.manufacturer ?? '',
            nextDoseDate: imm.nextDoseDate ?? '',
          }))
        : [],

      pressure: Array.isArray(medicalRecordData.pressure)
        ? medicalRecordData.pressure.map((pres: any) => ({
            id: pres.id ?? 0,
            patientId,
            medicalRecordId,
            systolicPressure: pres.systolicPressure ?? null,
            diastolicPressure: pres.diastolicPressure ?? null,
            bloodPressureRatio: pres.bloodPressureRatio ?? null,
            isBloodPressureNormal: pres.isBloodPressureNormal ?? false,
            createdAt: pres.createdAt ? new Date(pres.createdAt) : new Date(),
            updatedAt: pres.updatedAt ? new Date(pres.updatedAt) : null,
          }))
        : [],

      followUpDate: medicalRecordData.followUpDate
        ? new Date(medicalRecordData.followUpDate)
        : undefined,
      isFollowUpRequired: medicalRecordData.isFollowUpRequired ?? false,
    };

    // Log the medical record to verify it has data
    console.log('Created medical record:', medicalRecord);

    // Create the patient object
    const patient: Patients = {
      id: patientId,
      firstName: apiResponse.firstName ?? '',
      lastName: apiResponse.lastName ?? '',
      dateOfBirth: new Date(apiResponse.dateOfBirth),
      genderID: apiResponse.genderID ?? 0,
      contactNumber: apiResponse.contactNumber ?? '',
      email: apiResponse.email ?? '',
      emergencyContactName: apiResponse.emergencyContactName ?? '',
      emergencyContactNumber: apiResponse.emergencyContactNumber ?? '',
      insuranceProvider: apiResponse.insuranceProvider ?? '',
      insuranceNumber: apiResponse.insuranceNumber ?? '',
      address: apiResponse.address ?? '',
      nursID: apiResponse.nursID ?? 0,
      nursName: apiResponse.nursName ?? '',
      patientDoctorID: apiResponse.patientDoctorID ?? 0,
      patientDoctorName: apiResponse.patientDoctorName ?? '',
      registrationDate: new Date(apiResponse.registrationDate ?? Date.now()),
      lastVisitDate: apiResponse.lastVisitDate
        ? new Date(apiResponse.lastVisitDate)
        : null,
      patientDetails: patientDetail,
      medicalRecord: medicalRecord, // Assign the created medical record
    };

    // Log final result
    console.log('Final patient object:', patient);

    return patient;
  }
}
