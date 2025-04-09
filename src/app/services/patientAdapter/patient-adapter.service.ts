import { Injectable } from '@angular/core';
import { PatientDetail, Patients } from '../../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientAdapterService {
  /**
   * Transforms the API response to match the Patients interface
   */
  adaptApiResponseToPatient(apiResponse: any): Patients {
    // Create PatientDetail object
    const patientDetail: PatientDetail = {
      roomNumber: apiResponse.roomNumber || '',
      bedNumber: apiResponse.bedNumber || '',
      dateOfBirth: new Date(apiResponse.dateOfBirth),
      primaryDiagnosis: apiResponse.primaryDiagnosis || '',
      admissionDate: apiResponse.registrationDate
        ? new Date(apiResponse.registrationDate)
        : new Date(),
      familyMedicalHistory: apiResponse.familyMedicalHistory || '',
      socialHistory: apiResponse.socialHistory || '',
      createdAt: new Date(apiResponse.registrationDate),
      updatedAt: new Date(),
      // Transform allergies
      allergies:
        apiResponse.allergies?.map((allergy: any) => ({
          id: allergy.id,
          allergyType: allergy.allergyType,
          name: allergy.name || allergy.allergyType,
          reaction: allergy.reaction,
          severity: allergy.severity,
        })) || [],
      // Transform medications
      currentMedications:
        apiResponse.currentMedications?.map((med: any) => ({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: med.startDate ? new Date(med.startDate) : new Date(),
          endDate: med.endDate ? new Date(med.endDate) : null,
        })) || [],
      // Transform immunizations
      immunizations:
        apiResponse.immunizations?.map((imm: any) => ({
          id: imm.id,
          patientId: imm.patientId || apiResponse.id,
          vaccineName: imm.vaccineName,
          administrationDate: new Date(imm.administrationDate),
          lotNumber: imm.lotNumber,
          administeringProvider: imm.administeringProvider,
          manufacturer: imm.manufacturer,
        })) || [],
      // Transform medical record
      medicalRecord: {
        bloodType: apiResponse.bloodType || 'Unknown',
        height: apiResponse.height,
        weight: apiResponse.weight,
        bmi: apiResponse.bmi,
        patientId: 0,
        userID: 0,
        recordDate: undefined,
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: '',
        isFollowUpRequired: false,
        chronicConditions: '',
        surgicalHistory: '',
        socialHistory: '',
        familyMedicalHistory: '',
      },
      // Transform visits
      recentVisits:
        apiResponse.recentVisits?.map((visit: any) => ({
          id: visit.id,
          patientId: visit.patientId || apiResponse.id,
          date: new Date(visit.visitDate || visit.date),
          type: visit.visitType || visit.type || 'Check-up',
          providerId: visit.providerId || apiResponse.patientDoctorName,
          diagnoses: visit.diagnoses || '',
          notes: visit.notes,
        })) || [],
      // Transform lab results
      recentLabResults:
        apiResponse.recentLabResults?.map((lab: any) => ({
          id: lab.id,
          patientId: lab.patientId || apiResponse.id,
          testDate: new Date(lab.testDate),
          testName: lab.testName,
          result: lab.result,
          referenceRange: lab.referenceRange,
          orderingProvider: apiResponse.patientDoctorName || 'Unknown',
          notes: lab.notes,
        })) || [],
    };

    // Create patient object with patientDetails
    return {
      id: apiResponse.id,
      firstName: apiResponse.firstName,
      lastName: apiResponse.lastName,
      dateOfBirth: new Date(apiResponse.dateOfBirth),
      genderID: apiResponse.genderID,
      contactNumber: apiResponse.contactNumber,
      email: apiResponse.email,
      emergencyContactName: apiResponse.emergencyContactName,
      emergencyContactNumber: apiResponse.emergencyContactNumber,
      insuranceProvider: apiResponse.insuranceProvider,
      insuranceNumber: apiResponse.insuranceNumber,
      address: apiResponse.address,
      nursID: apiResponse.nursID,
      nursName: apiResponse.nursName,
      patientDoctorID: apiResponse.patientDoctorID,
      patientDoctorName: apiResponse.patientDoctorName,
      registrationDate: new Date(apiResponse.registrationDate),
      lastVisitDate: apiResponse.lastVisitDate
        ? new Date(apiResponse.lastVisitDate)
        : null,
      patientDetails: patientDetail,
    };
  }
}
