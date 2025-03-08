export interface RegisterModel {
  username: string;
  email: string;
  password: string;
  salt?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  telephoneNo?: string;
  salary?: number;
  note?: string;
  jobTitleID?: number;
  gender?: number;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
