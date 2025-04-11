import { Injectable } from '@angular/core';
import { PatientDetail, Patients } from '../../models/patient.model';
import { Visit } from '../../models/visits.model';
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
      // Transform medical record to match the interface
      medicalRecord: {
        id: apiResponse.medicalRecord?.id,
        patientId: apiResponse.id,
        userID: apiResponse.medicalRecord?.userID || 0,
        recordDate: apiResponse.medicalRecord?.recordDate
          ? new Date(apiResponse.medicalRecord.recordDate)
          : undefined,
        recentVisits: [
          {
            id: apiResponse.medicalRecord?.visit?.id || 0,
            patientId: apiResponse.id,
            visitDate: apiResponse.lastVisitDate
              ? new Date(apiResponse.lastVisitDate)
              : new Date(),
            providerName: apiResponse.patientDoctorName,
            providerId: apiResponse.patientDoctorID,
            visitType:
              apiResponse.medicalRecord?.visit?.visitType || 'Check-up',
            reason: apiResponse.medicalRecord?.visit?.reason || '',
            assessment: apiResponse.medicalRecord?.visit?.assessment || '',
            diagnosis: apiResponse.medicalRecord?.visit?.diagnosis || [],
            planTreatment:
              apiResponse.medicalRecord?.visit?.planTreatment || '',
            currentMedications:
              apiResponse.medicalRecord?.visit?.medication || [],
            notes: apiResponse.medicalRecord?.visit?.notes || '',
            followUpRequired:
              apiResponse.medicalRecord?.isFollowUpRequired || false,
            followUpDate: apiResponse.medicalRecord?.followUpDate
              ? new Date(apiResponse.medicalRecord.followUpDate)
              : undefined,
          },
        ],
        height: apiResponse.height || 0,
        weight: apiResponse.weight || 0,
        bmi: apiResponse.bmi || 0,
        bloodType: apiResponse.bloodType || 'Unknown',
        chronicConditions: apiResponse.chronicConditions || '',
        surgicalHistory: apiResponse.surgicalHistory || '',
        socialHistory: apiResponse.socialHistory || '',
        familyMedicalHistory: apiResponse.familyMedicalHistory || '',
        allergies:
          apiResponse.allergies?.map((allergy: any) => ({
            id: allergy.id,
            patientId: apiResponse.id,
            allergyType: allergy.allergyType,
            name: allergy.name || allergy.allergyType,
            reaction: allergy.reaction,
            severity: allergy.severity,
            dateIdentified: allergy.dateIdentified
              ? new Date(allergy.dateIdentified)
              : new Date(),
          })) || [],
        recentLabResults:
          apiResponse.recentLabResults?.map((lab: any) => ({
            id: lab.id,
            patientId: lab.patientId || apiResponse.id,
            testDate: new Date(lab.testDate),
            testName: lab.testName,
            result: lab.result,
            referenceRange: lab.referenceRange,
            orderingProvider: apiResponse.patientDoctorName || 'Unknown',
            notes: lab.notes || '',
            orderedBy: lab.orderedBy || apiResponse.patientDoctorID,
            tests: lab.tests || [],
            date: lab.testDate ? new Date(lab.testDate) : new Date(),
          })) || [],
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
      },
      // Optional fields
      medicalConditions:
        apiResponse.medicalConditions?.map((condition: any) => ({
          id: condition.id,
          name: condition.name,
          diagnosedDate: new Date(condition.diagnosedDate),
          notes: condition.notes || '',
          status: condition.status || 'active',
        })) || undefined,
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
