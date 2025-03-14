export interface RegisterModel {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  specialist?: string;
  address?: string;
  telephoneNo?: string;
  salary?: number;
  note?: string;
  jobTitleID?: number;
  genderID?: number;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
