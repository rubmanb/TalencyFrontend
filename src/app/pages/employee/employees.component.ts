import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../interfaces/employee.interface';

import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule
  ]
})
export class Employees implements OnInit {

  employees: Employee[] = [];
  employeeForm!: FormGroup;
  editingId: number | null = null;
  searchText: string = '';
  filteredEmployees: Employee[] = [];
  activeTab: string = 'list';

  // Opciones para selects
  genders = ['MASCULINO', 'FEMENINO', 'OTRO'];
  maritalStatuses = ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNIÓN_LIBRE'];
  contractTypes = ['INDEFINIDO', 'TEMPORAL', 'PRÁCTICAS', 'FORMACIÓN'];
  jobLevels = ['JUNIOR', 'MID_LEVEL', 'SENIOR', 'MANAGER', 'DIRECTOR'];
  workSchedules = ['MAÑANA', 'TARDE', 'NOCHE', 'MIXTO', 'FLEXIBLE'];

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.initForm();
  }

  initForm() {
    this.employeeForm = this.fb.group({
      // Datos personales
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: [''],
      gender: [''],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}[A-Z]$/)]],
      healthInsuranceNumber: ['', Validators.required],
      maritalStatus: [''],
      emailPersonal: ['', Validators.email],

      // Datos de contacto
      address: [''],
      city: [''],
      country: [''],
      phone: [''],
      emergencyContact: [''],

      // Datos laborales
      position: ['', Validators.required],
      jobLevel: [''],
      contractType: [''],
      contractExpireDate: [''],
      hireDate: ['', Validators.required],
      fireDate: [''],
      workSchedule: [''],
      seniority: [''],
      department: [''],

      // Vacaciones
      vacationsDaysAllocated: [0],
      vacationsDaysUsed: [0],

      // Datos bancarios
      bankName: [''],
      iban: ['', Validators.pattern(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/)],

      // Estado
      active: [true]
    });
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe((data) => {
      this.employees = data;
      this.filteredEmployees = data;
    });
  }

  submitForm() {
    if (this.employeeForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const employee: Employee = this.employeeForm.value;

    if (this.editingId) {
      this.employeeService.update(this.editingId, employee).subscribe(() => {
        this.loadEmployees();
        this.resetForm();
        this.setTab('list');
        console.log(employee)
      });
    } else {
      this.employeeService.create(employee).subscribe(() => {
        this.loadEmployees();
        this.resetForm();
        this.setTab('list');
      });
    }
  }

  editEmployee(emp: Employee) {
    this.editingId = emp.id!;

    // Formatear fechas para el input date
    const formattedEmp = {
      ...emp,
      dateOfBirth: emp.dateOfBirth ? this.formatDateForInput(emp.dateOfBirth) : '',
      contractExpireDate: emp.contractExpireDate ? this.formatDateForInput(emp.contractExpireDate) : '',
      hireDate: emp.hireDate ? this.formatDateForInput(emp.hireDate) : '',
      fireDate: emp.fireDate ? this.formatDateForInput(emp.fireDate) : '',
      department: emp.department || ''
    };
    this.employeeForm.patchValue(formattedEmp);
    this.setTab('form');
  }

  deleteEmployee(id: number) {
    if (confirm('¿Seguro que quieres eliminar este empleado?')) {
      this.employeeService.delete(id).subscribe(() => {
        this.loadEmployees();
      });
    }
  }

  resetForm() {
    this.editingId = null;
    this.employeeForm.reset({ active: true, vacationsDaysAllocated: 0, vacationsDaysUsed: 0 });
  }

  filterEmployees(): void {
    if (this.searchText.trim() === '') {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter((emp) =>
        emp.dni.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (emp.firstName && emp.firstName.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (emp.lastName && emp.lastName.toLowerCase().includes(this.searchText.toLowerCase())) ||
        (emp.position && emp.position.toLowerCase().includes(this.searchText.toLowerCase()))
      );
    }
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredEmployees = [];//this.employees

  }

  setTab(tab: 'list' | 'form') {
    this.activeTab = tab;
    if (tab === 'list') {
    this.resetForm();
  }
  if (tab === 'form' && !this.editingId) {
    this.resetForm();
  }
  }

  // Utilidades
  private markAllFieldsAsTouched() {
    Object.keys(this.employeeForm.controls).forEach(key => {
      this.employeeForm.get(key)?.markAsTouched();
    });
  }

  private formatDateForInput(date: any): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  }

  // Calcular días de vacaciones restantes
  getRemainingVacationDays(): number {
    const allocated = this.employeeForm.get('vacationsDaysAllocated')?.value || 0;
    const used = this.employeeForm.get('vacationsDaysUsed')?.value || 0;
    return allocated - used;
  }
}
