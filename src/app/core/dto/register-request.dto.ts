export interface RegisterRequestDto {
  // Company
  companyName: string;
  companyEmail?: string;
  taxId?: string;

  // Owner user
  username: string;
  email?: string;
  password: string;

  // Subscription
  subscriptionPlan: 'FREE' | 'STANDARD' | 'PREMIUM';
}
