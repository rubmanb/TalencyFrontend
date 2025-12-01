export interface Department {
  id: number;
  name: string;
  employeeCount: number;
  managerName?: string;
  budget?: number;
  active?: boolean;
}

