import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../../core/services/department.service';
import { Department } from '../../interfaces/departments.interface';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './departments.html',
  styleUrls: ['./departments.css']
})
export class Departments implements OnInit {
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  searchTerm: string = '';
  filterActive: boolean = false;

  // Modal control
  isModalOpen: boolean = false;
  isEditing: boolean = false;
  editingId: number | null = null;
  departmentForm!: FormGroup;

  // Statistics
  totalDepartments: number = 0;
  activeDepartments: number = 0;
  totalEmployees: number = 0;
  avgEmployeesPerDept: number = 0;

  constructor(
    private departmentService: DepartmentService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadDepartments();
  }

  initForm() {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  async loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.filteredDepartments = [...this.departments];
        this.calculateStatistics();
        this.filterDepartments();
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
      }
    });
  }

  openCreateModal() {
    this.isModalOpen = true;
    this.isEditing = false;
    this.editingId = null;
    this.departmentForm.reset();
  }

  openEditModal(department: Department) {
    this.isModalOpen = true;
    this.isEditing = true;
    this.editingId = department.id!;
    this.departmentForm.patchValue({
      name: department.name
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editingId = null;
    this.departmentForm.reset();
  }

  submitForm() {
    if (this.departmentForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const formData: Department = this.departmentForm.value;

    if (this.isEditing && this.editingId) {
      this.departmentService.updateDepartment(this.editingId, formData).subscribe({
        next: (updatedDepartment) => {
          const index = this.departments.findIndex(dept => dept.id === this.editingId);
          if (index !== -1) {
            this.departments[index] = updatedDepartment;
          }
          this.closeModal();
          this.filterDepartments();
          this.calculateStatistics();
        },
        error: (error) => {
          console.error('Error actualizando departamento:', error);
          alert('Error al actualizar el departamento');
        }
      });
    } else {
      this.departmentService.createDepartment(formData).subscribe({
        next: (newDepartment) => {
          this.departments.push(newDepartment);
          this.closeModal();
          this.filterDepartments();
          this.calculateStatistics();
        },
        error: (error) => {
          console.error('Error creando departamento:', error);
          alert('Error al crear el departamento');
        }
      });
    }
  }

  filterDepartments() {
    this.filteredDepartments = this.departments.filter(dept => {
      const matchesSearch = !this.searchTerm ||
        dept.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesFilter = !this.filterActive || (dept as any).active !== false;

      return matchesSearch && matchesFilter;
    });
  }

  toggleActiveFilter() {
    this.filterActive = !this.filterActive;
    this.filterDepartments();
  }

  calculateStatistics() {
    this.totalDepartments = this.departments.length;
    this.activeDepartments = this.departments.filter(dept => (dept as any).active !== false).length;
    this.totalEmployees = this.departments.reduce((sum, dept) => sum + (dept.employeeNames?.length || 0), 0);
    this.avgEmployeesPerDept = this.totalDepartments > 0 ? this.totalEmployees / this.totalDepartments : 0;
  }

  editDepartment(department: Department) {
    this.openEditModal(department);
  }

  viewDepartment(department: Department) {
    console.log('Ver detalles del departamento:', department);
    // TODO: Implementar vista detallada
  }

  deleteDepartment(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este departamento?')) {
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.departments = this.departments.filter(dept => dept.id !== id);
          this.filterDepartments();
          this.calculateStatistics();
        },
        error: (error) => {
          console.error('Error eliminando departamento:', error);
          alert('Error al eliminar el departamento');
        }
      });
    }
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.departmentForm.controls).forEach(key => {
      this.departmentForm.get(key)?.markAsTouched();
    });
  }
}
