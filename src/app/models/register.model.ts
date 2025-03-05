export interface RegisterModel {
  username: string;
  email: string;
  password: string;
  salt?: string;
  firstName?: string;
  lastName?: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  lastLoginAt?: Date;
}
