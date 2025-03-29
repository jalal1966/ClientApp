// Define interfaces matching your C# DTOs
export interface User {
  username: string;
  token: string;
  expiration: Date;
  jobTitleID?: number; // Added for role-based routing
  firstName: string;
  lastName: string;
  userID: number;
  telephoneNo: number;
  specialist: string;
  availability: string;
  email: string;
  role: JopTitleID;
}
// To Do
export enum JopTitleID {
  Admin = 0,
  Doctor = 1,
  Nurse = 2,
  Management = 3,
}
