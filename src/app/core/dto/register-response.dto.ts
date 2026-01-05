export interface RegisterResponseDto {
  // Auth
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;

  // User
  username: string;
  roles: string[];

  // Company
  companyName: string;

  // Subscription
  subscriptionPlan: 'FREE' | 'STANDARD' | 'PREMIUM';
}
