import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces
export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  employeesCount: number;
  departmentsCount: number;
  lastLogin: string;
}

export interface SystemStats {
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  totalEmployees: number;
  totalDepartments: number;
  recentRegistrations: number;
  systemUsage: number;
}

@Component({
  selector: 'app-super-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './super-dashboard.html',
  styleUrl: './super-dashboard.css'
})
export class SuperDashboard implements OnInit {
  // Datos de ejemplo - reemplazar con llamadas reales al API
  companies: Company[] = [
    {
      id: 1,
      name: 'Tech Solutions SA',
      email: 'admin@techsolutions.com',
      phone: '+34 912 345 678',
      plan: 'PREMIUM',
      status: 'ACTIVE',
      createdAt: '2024-01-15',
      employeesCount: 45,
      departmentsCount: 8,
      lastLogin: '2024-12-19'
    },
    {
      id: 2,
      name: 'Consulting Partners',
      email: 'info@consultingpartners.es',
      phone: '+34 913 456 789',
      plan: 'BASIC',
      status: 'ACTIVE',
      createdAt: '2024-02-20',
      employeesCount: 12,
      departmentsCount: 4,
      lastLogin: '2024-12-18'
    },
    {
      id: 3,
      name: 'StartUp Innovadora SL',
      email: 'ceo@startupinnovadora.com',
      phone: '+34 914 567 890',
      plan: 'FREE',
      status: 'PENDING',
      createdAt: '2024-12-10',
      employeesCount: 3,
      departmentsCount: 2,
      lastLogin: '2024-12-15'
    }
  ];

  systemStats: SystemStats = {
    totalCompanies: 156,
    activeCompanies: 142,
    suspendedCompanies: 8,
    totalEmployees: 2845,
    totalDepartments: 567,
    recentRegistrations: 12,
    systemUsage: 87.5
  };

  // Filtros y búsqueda
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  planFilter: string = 'ALL';

  today: Date = new Date();

  constructor() {
    //Charts
  }

  ngOnInit(): void {
    this.initCharts();
  }

  // Métodos de filtrado
  get filteredCompanies(): Company[] {
    return this.companies.filter(company => {
      const matchesSearch = !this.searchTerm ||
        company.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'ALL' || company.status === this.statusFilter;
      const matchesPlan = this.planFilter === 'ALL' || company.plan === this.planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }

  // Inicializar gráficos
  private initCharts(): void {
    this.initCompaniesChart();
    this.initPlansChart();
  }

  // TODO: Implementar gráfico de empresas APEXCHARTS
  private initCompaniesChart(): void {}

  // TODO: Implementar gráfico de planes APEXCHARTS
  private initPlansChart(): void {}

  // Métodos de utilidad
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-success';
      case 'SUSPENDED': return 'bg-danger';
      case 'PENDING': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getPlanBadgeClass(plan: string): string {
    switch (plan) {
      case 'ENTERPRISE': return 'bg-purple';
      case 'PREMIUM': return 'bg-primary';
      case 'BASIC': return 'bg-info';
      case 'FREE': return 'bg-secondary';
      default: return 'bg-light text-dark';
    }
  }

  // Acciones
  viewCompany(company: Company): void {
    console.log('Ver empresa:', company);
    // TODO: Navegar a detalle de empresa
  }

  editCompany(company: Company): void {
    console.log('Editar empresa:', company);
    // TODO: Abrir modal de edición
  }

  suspendCompany(company: Company): void {
    if (confirm(`¿Suspender la empresa ${company.name}?`)) {
      console.log('Suspender empresa:', company);
      // TODO: Llamar al servicio de suspensión
    }
  }

  activateCompany(company: Company): void {
    if (confirm(`¿Activar la empresa ${company.name}?`)) {
      console.log('Activar empresa:', company);
      // TODO: Llamar al servicio de activación
    }
  }

  // Métodos para formatear datos
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}
