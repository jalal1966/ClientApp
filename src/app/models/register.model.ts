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
  gender?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
