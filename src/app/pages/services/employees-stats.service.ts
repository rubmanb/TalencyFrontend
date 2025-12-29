import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EmployeeService } from '../../core/services/employee.service';
import { KPI, HiringTrend } from '../models/employee-stats.model';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../../interfaces/employee.interface';

@Injectable({
  providedIn: 'root'
})
export class EmployeesStatsService {

  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  employees$ = this.employeesSubject.asObservable();

  private loaded = false;

  constructor(private employeeService: EmployeeService) {}

  loadIfNeeded(): void {
    if (this.loaded) return;

    this.employeeService.getAll()
      .subscribe({
        next: (employees) => {
          this.employeesSubject.next(employees);
          this.loaded = true;
        },
        error: (err) => {
          console.error('Error cargando empleados', err);
        }
      });
  }
}
