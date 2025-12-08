
export interface UserResponseDTO {
  id: number;
  username: string;
  email: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  employeeId: number;
  employeeName?: string;
  employeeDni?: string;
  employeePosition?: string;
  roles: string[];
}
