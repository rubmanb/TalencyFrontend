import { Employee } from "./employee.interface";

export interface Department {
  id: number;
  name: string;
  employeeNames: string[];
  employeeCount: number;
  managerName?: string;
  budget?: number;
  active: boolean;
}

