import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { HiringTrendsChart } from "./hiring-trends-chart/hiring-trends-chart";
import { DepartmentChart } from "./department-chart/department-chart";

interface KPI {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  turnoverRate: number;
  terminations: number;
  avgTenure: number;
}

interface DepartmentReport {
  name: string;
  employeeCount: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;
}

interface Activity {
  description: string;
  timestamp: string;
  type: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, HiringTrendsChart, DepartmentChart],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit {
  kpis: KPI = {
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    turnoverRate: 0,
    terminations: 0,
    avgTenure: 0
  };

  departmentReports: DepartmentReport[] = [];
  recentActivities: Activity[] = [];

  dateRange = {
    start: this.getFirstDayOfMonth(),
    end: new Date().toISOString().split('T')[0]
  };

  selectedReportType: string = 'general';
  isLoading: boolean = false;

  hiringTrends: { date: string, newHires: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.generateReport();
  }

  getFirstDayOfMonth(): string {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  }

  generateReport() {
    this.isLoading = true;

    this.hiringTrends = [
    { date: '2025-12-01', newHires: 2 },
    { date: '2025-12-05', newHires: 1 },
    { date: '2025-12-10', newHires: 3 },
    { date: '2025-12-15', newHires: 0 },
    { date: '2025-12-20', newHires: 6 }
  ];

    // Simular carga de datos - reemplazar con API real
    setTimeout(() => {
      this.kpis = {
        totalEmployees: 156,
        activeEmployees: 148,
        newHires: 12,
        turnoverRate: 5.1,
        terminations: 8,
        avgTenure: 2.8
      };

      this.departmentReports = [
        { name: 'Tecnología', employeeCount: 45, newHires: 5, terminations: 2, turnoverRate: 4.4 },
        { name: 'Ventas', employeeCount: 32, newHires: 3, terminations: 1, turnoverRate: 3.1 },
        { name: 'Marketing', employeeCount: 18, newHires: 2, terminations: 0, turnoverRate: 0 },
        { name: 'Finanzas', employeeCount: 15, newHires: 1, terminations: 1, turnoverRate: 6.7 },
        { name: 'Recursos Humanos', employeeCount: 12, newHires: 1, terminations: 0, turnoverRate: 0 },
        { name: 'Operaciones', employeeCount: 34, newHires: 0, terminations: 4, turnoverRate: 11.8 }
      ];

      this.recentActivities = [
        { description: 'Nuevo empleado contratado: Juan Pérez', timestamp: '2024-10-04T14:30:00', type: 'hiring' },
        { description: 'Reporte mensual generado automáticamente', timestamp: '2024-10-04T08:00:00', type: 'system' },
        { description: 'Usuario admin.maria accedió al sistema', timestamp: '2024-10-03T16:45:00', type: 'login' },
        { description: 'Departamento de Tecnología actualizado', timestamp: '2024-10-03T10:15:00', type: 'update' },
        { description: 'Backup del sistema completado', timestamp: '2024-10-02T23:00:00', type: 'backup' }
      ];

      this.isLoading = false;
    }, 1000);
  }

  refreshData() {
    this.generateReport();
  }

  exportReport() {
    console.log('Exportando reporte...', {
      type: this.selectedReportType,
      dateRange: this.dateRange,
      kpis: this.kpis
    });

    // Simular descarga
    setTimeout(() => {
      alert('Reporte exportado exitosamente');
    }, 500);
  }

  getReportTitle(): string {
    const titles: { [key: string]: string } = {
      'general': 'Reporte General',
      'hiring': 'Reporte de Contrataciones',
      'turnover': 'Reporte de Rotación',
      'department': 'Reporte por Departamento'
    };
    return titles[this.selectedReportType] || 'Reporte';
  }




}
