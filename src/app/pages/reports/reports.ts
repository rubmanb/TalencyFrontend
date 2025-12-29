import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { HiringTrendsChart } from './hiring-trends-chart/hiring-trends-chart';
import { DepartmentChart } from './department-chart/department-chart';
import { EmployeesStatsService } from '../services/employees-stats.service';
import { Employee } from '../../interfaces/employee.interface';
import { KPI } from '../models/employee-stats.model';

interface DepartmentReport {
  name: string;
  employeeCount: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, HiringTrendsChart, DepartmentChart],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit, OnDestroy {
selectedReportType: any;
recentActivities: any;
refreshData() {
throw new Error('Method not implemented.');
}
exportReport() {
throw new Error('Method not implemented.');
}

  private sub?: Subscription;
  private employees: Employee[] = [];

  kpis: KPI = {
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    terminations: 0,
    turnoverRate: 0,
    avgTenure: 0
  };

  departmentReports: DepartmentReport[] = [];
  hiringTrends: { date: string; newHires: number }[] = [];

  dateRange = {
    start: this.getFirstDayOfMonth(),
    end: new Date().toISOString().split('T')[0]
  };

  constructor(private employeeStatsService: EmployeesStatsService) {}

  ngOnInit(): void {
    this.employeeStatsService.loadIfNeeded();

    this.sub = this.employeeStatsService.employees$
      .subscribe(employees => {
        if (!employees.length) return;

        this.employees = employees;
        this.recalculateAll();
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  recalculateAll(): void {
    this.calculateKPIs(this.employees);
    this.calculateDepartmentReports(this.employees);
    this.calculateHiringTrends(this.employees);
  }

  /* ================= KPIs ================= */

  private calculateKPIs(employees: Employee[]): void {
    const start = new Date(this.dateRange.start);
    const end = new Date(this.dateRange.end);

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.active).length;

    const newHires = employees.filter(e =>
      new Date(e.hireDate) >= start && new Date(e.hireDate) <= end
    ).length;

    const terminations = employees.filter(e =>
      e.contract_expire_date &&
      new Date(e.contract_expire_date) >= start &&
      new Date(e.contract_expire_date) <= end
    ).length;

    const turnoverRate = totalEmployees
      ? +(terminations / totalEmployees * 100).toFixed(1)
      : 0;

    const avgTenure = this.calculateAvgTenure(employees);

    this.kpis = {
      totalEmployees,
      activeEmployees,
      newHires,
      terminations,
      turnoverRate,
      avgTenure
    };
  }

  private calculateAvgTenure(employees: Employee[]): number {
    const now = new Date();

    const years = employees.map(e => {
      const hire = new Date(e.hireDate);
      const end = e.contract_expire_date ? new Date(e.contract_expire_date) : now;
      return (end.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365);
    });

    return +(years.reduce((a, b) => a + b, 0) / years.length).toFixed(1);
  }

  /* ================= Departments ================= */

  private calculateDepartmentReports(employees: Employee[]): void {
    const map = new Map<any, Employee[]>();

    employees.forEach(e => {
      map.set(e.department_id, [...(map.get(e.department_id) || []), e]);
    });

    this.departmentReports = Array.from(map.entries()).map(([name, emps]) => {
      const employeeCount = emps.length;
      const newHires = emps.filter(e => this.isInRange(e.hireDate)).length;
      const terminations = emps.filter(e =>
        e.contract_expire_date && this.isInRange(e.contract_expire_date)
      ).length;

      return {
        name,
        employeeCount,
        newHires,
        terminations,
        turnoverRate: employeeCount
          ? +(terminations / employeeCount * 100).toFixed(1)
          : 0
      };
    });
  }

  /* ================= Hiring Trends ================= */

  private calculateHiringTrends(employees: Employee[]): void {
    const map = new Map<string, number>();

    employees.forEach(e => {
      if (!this.isInRange(e.hireDate)) return;

      const month = e.hireDate.slice(0, 7); // YYYY-MM
      map.set(month, (map.get(month) || 0) + 1);
    });

    this.hiringTrends = Array.from(map.entries())
      .map(([date, newHires]) => ({ date, newHires }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private isInRange(dateStr: string): boolean {
    const d = new Date(dateStr);
    return d >= new Date(this.dateRange.start)
        && d <= new Date(this.dateRange.end);
  }

  getFirstDayOfMonth(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }
}
