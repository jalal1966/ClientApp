export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  genderID: number;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  insuranceProvider: string;
  insuranceNumber: string;
  nursID: number;
  nursName: string;
  patientDoctorID: number;
  patientDoctorName: string;
  registrationDate: Date;
}
