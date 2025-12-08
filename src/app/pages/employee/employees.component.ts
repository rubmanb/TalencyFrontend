import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs';

import { Employee } from '../../interfaces/employee.interface';
import { EmployeeService } from '../../core/services/employee.service';
import { DepartmentService } from '../../core/services/department.service';

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

  departments: { id: number, name: string }[] = [];
  departmentsNames: string[] = [];
  departmentsLoaded: boolean = false;

  // Opciones para selects
  genders = ['MASCULINO', 'FEMENINO', 'OTRO'];
  maritalStatus = ['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNIÓN_LIBRE'];
  contractTypes = ['INDEFINIDO', 'TEMPORAL', 'PRÁCTICAS', 'FORMACIÓN'];
  jobLevels = ['JUNIOR', 'MID_LEVEL', 'SENIOR', 'MANAGER', 'DIRECTOR'];
  workSchedules = ['MAÑANA', 'TARDE', 'NOCHE', 'MIXTO', 'FLEXIBLE'];

  isLoading: boolean = true;

  constructor(
    private employeeService: EmployeeService,
    private deparmentService: DepartmentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.loadDepartments();
    this.loadEmployees();
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
      email: ['', Validators.email],

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
      department_id: [null, Validators.required],
      department_name: [''],

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
    this.isLoading = true;
    this.employeeService.getAll().pipe(
      tap((employees: Employee[]) => {
        this.employees = employees;
        this.filteredEmployees = employees;
        this.isLoading = false;
      })
    ).subscribe({
      error: (error) => {
        console.error('Error cargando empleados:', error);
        this.isLoading = false;
      }
    });
  }

  loadDepartments() {
    this.isLoading = true;
    this.deparmentService.getAllDepartments().pipe(
      tap((data) => {
        this.departments = data.map(d => ({ id: Number(d.id), name: d.name }));
        this.departmentsNames = this.departments.map(d => d.name);
        this.departmentsLoaded = true;
        this.isLoading = false;
      })
    ).subscribe({
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.isLoading = false;
      }
    });
  }

  submitForm() {
    if (this.employeeForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formValue = this.employeeForm.value;

    const employee: Employee = {
      ...formValue,
      departmentId: formValue.department_id
    };

    if (this.editingId) {
      this.employeeService.update(this.editingId, employee).subscribe(() => {
        this.loadEmployees();
        this.resetForm();
        this.setTab('list');
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

    const rawDeptId = (emp as any).department_id ?? (emp as any).departmentId ?? (emp as any).department?.id;
    const empDeptId = rawDeptId === null || rawDeptId === undefined ? null : Number(rawDeptId);

    const patchEmployeeToForm = (departmentFound?: { id: number, name: string } | null) => {
      const formattedEmp = {
        ...emp,
        dateOfBirth: emp.dateOfBirth ? this.formatDateForInput(emp.dateOfBirth) : '',
        contractExpireDate: emp.contractExpireDate ? this.formatDateForInput(emp.contractExpireDate) : '',
        hireDate: emp.hireDate ? this.formatDateForInput(emp.hireDate) : '',
        fireDate: emp.fireDate ? this.formatDateForInput(emp.fireDate) : '',

        department_id: empDeptId,

        department_name: departmentFound ? departmentFound.name : ''
      };

      console.log('Empleado seleccionado (formateado):', formattedEmp);
      this.employeeForm.patchValue(formattedEmp);
      this.setTab('form');
    };

    if (this.departmentsLoaded) {
      const department = empDeptId !== null ? this.departments.find(d => d.id === empDeptId) : undefined;
      console.log('Departamento encontrado (sync):', department);
      patchEmployeeToForm(department ?? null);
      return;
    }

    console.log('Departamentos no cargados todavía — cargando antes de parchear...');
    this.deparmentService.getAllDepartments().pipe(
      tap((data) => {
        this.departments = data.map(d => ({ id: Number(d.id), name: d.name }));
        this.departmentsNames = this.departments.map(d => d.name);
        this.departmentsLoaded = true;
      })
    ).subscribe({
      next: () => {
        const department = empDeptId !== null ? this.departments.find(d => d.id === empDeptId) : undefined;
        console.log('Departamento encontrado (after load):', department);
        patchEmployeeToForm(department ?? null);
      },
      error: (err) => {
        console.error('Error cargando departamentos en editEmployee:', err);
        patchEmployeeToForm(null);
      }
    });
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
    this.employeeForm.reset({
      active: true,
      vacationsDaysAllocated: 0,
      vacationsDaysUsed: 0,
      department_name: ''
    });
  }

  filterEmployees(): void {
    if (this.searchText.trim() === '') {
      this.filteredEmployees = [...this.employees];
    } else {
      const t = this.searchText.toLowerCase();
      this.filteredEmployees = this.employees.filter((emp) =>
        emp.dni?.toLowerCase().includes(t) ||
        emp.firstName?.toLowerCase().includes(t) ||
        emp.lastName?.toLowerCase().includes(t) ||
        emp.position?.toLowerCase().includes(t)
      );
    }
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredEmployees = [...this.employees];
  }

  setTab(tab: 'list' | 'form') {
    this.activeTab = tab;
    if (tab === 'list') this.resetForm();
    if (tab === 'form' && !this.editingId) this.resetForm();
  }

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

  getRemainingVacationDays(): number {
    const allocated = this.employeeForm.get('vacationsDaysAllocated')?.value || 0;
    const used = this.employeeForm.get('vacationsDaysUsed')?.value || 0;
    return allocated - used;
  }
}
