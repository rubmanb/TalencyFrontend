interface SecuritySettings {
  minPasswordLength: number;
  passwordExpiryDays: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  twoFactorAuth: boolean;
  loginAttemptsLimit: boolean;
}