export interface AuthResponse {
  token: string;
  expiration: Date;
  email: string;
  username: string;
}
