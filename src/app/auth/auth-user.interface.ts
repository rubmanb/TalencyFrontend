export interface AuthUser {
  email: string;
  companyName: string;
  roles: string[];
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
}
