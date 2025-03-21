// Define interfaces matching your C# DTOs
export interface User {
  username: string;
  token: string;
  expiration: Date;
  jobTitleId?: number; // Added for role-based routing
  firstName: string;
  lastName: string;
  userID: number;
  telephoneNo: number;
  specialist: string;
  availability: string;
}
