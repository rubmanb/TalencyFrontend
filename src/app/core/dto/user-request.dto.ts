
export interface UserRequestDTO {
  username: string;
  email: string;
  password: string;
  employeeId: number;
  roleIds: number[];
  currentUserRole?: string;
}
