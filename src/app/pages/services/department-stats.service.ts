import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { DepartmentService } from '../../core/services/department.service';
import { EmployeeService } from '../../core/services/employee.service';

export interface DepartmentChartData {
  name: string;
  employeeCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class DepartmentStatsService {
  private chartDataSubject = new BehaviorSubject<DepartmentChartData[]>([]);
  chartData$ = this.chartDataSubject.asObservable();

  private loaded = false;

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService
  ) {}

  loadIfNeeded() {
    if (this.loaded) return;

    forkJoin({
      departments: this.departmentService.getAllDepartments(),
      employees: this.employeeService.getAll(),
    }).subscribe({
      next: ({ departments, employees }) => {
        const countMap = new Map<number, number>();

        for (const e of employees) {
          if (!e.department_id) continue;
          const id = Number(e.department_id);
          countMap.set(id, (countMap.get(id) || 0) + 1);
        }

        const chartData = departments.map((d) => ({
          name: d.name,
          employeeCount: countMap.get(d.id!) || 0,
        }));

        this.chartDataSubject.next(chartData);
        this.loaded = true;
      },
      error: (err) => {
        console.error('Error loading department stats', err);
      },
    });
  }

  refresh() {
    this.loaded = false;
    this.loadIfNeeded();
  }
}
