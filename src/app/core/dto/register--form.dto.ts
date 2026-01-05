import { AuthRequest } from '../../auth/auth.model';

export interface RegisterFormDto extends AuthRequest {
  email: string;
  confirmPassword: string;
}
