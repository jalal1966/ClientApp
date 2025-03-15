export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  genderID: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  insuranceProvider: string;
  insuranceNumber: string;
  nursID: number;
  nursName: string;
  PatientDoctorID: number;
  PatientDoctor: string;
}
