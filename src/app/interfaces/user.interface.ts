interface User {
  id: number;
  username: string;
  email: string;
  employeeName?: string;
  roles: string[];
  lastLogin?: string;
  active: boolean;
  createdAt: string;
}
