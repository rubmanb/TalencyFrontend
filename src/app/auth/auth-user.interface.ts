export interface AuthUser {
  username: string;
  company: string;
  roles: string[];
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
}
