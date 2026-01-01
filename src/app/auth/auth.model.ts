export interface AuthRequest {
  company: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  roles: string[];
  expiresIn: number;
  username?: string;
  company?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
}

export interface Company {
  id?: number;
  name: string;
  email?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  active?: boolean;
  subscriptionPlan?: string;
  createdAt?: Date;
}
