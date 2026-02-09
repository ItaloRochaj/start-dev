import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentsService } from '../services/students.service';
import { AuthService } from '../services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NewStudentComponent } from './new-student/new-student.component';
import { EditStudentComponent } from './edit-student/edit-student.component';

export interface Student {
  id: string;
  matricula?: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse {
  content: Student[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit, OnDestroy {
  @ViewChild(NewStudentComponent) newStudentComponent!: NewStudentComponent;
  @ViewChild(EditStudentComponent) editStudentComponent!: EditStudentComponent;

  students: Student[] = [];
  searchForm: FormGroup;
  currentPage = 0;
  pageSize = 4;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  searchTerm = '';
  searchType = 'name';
  showNewStudentModal = false;
  showStudentDetailsModal = false;
  showEditStudentModal = false;
  showDeleteConfirmationModal = false;
  selectedStudentId: string | null = null;
  selectedStudentName: string | null = null;
  private destroy$ = new Subject<void>();
  isClosingNewStudentModal = false;
  isClosingEditStudentModal = false;

  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.setupReactiveSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupReactiveSearch(): void {
    const searchControl = this.searchForm.get('search');
    if (searchControl) {
      searchControl.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((searchValue: string) => {
            if (searchValue && searchValue.trim()) {
              this.searchTerm = searchValue.trim();
              // Detectar se é número (matrícula ou CPF) ou texto (nome)
              this.searchType = /^\d+$/.test(searchValue.trim()) ? 'matricula' : 'name';
            } else {
              this.searchTerm = '';
            }
            this.currentPage = 0;
            return this.studentsService.getStudents(0, this.pageSize, this.searchTerm, this.searchType);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (response: any) => {
            this.students = response.data.content;
            this.totalPages = response.data.totalPages;
            this.totalElements = response.data.totalElements;
            this.loading = false;
          },
          error: (error) => {
            console.error('Erro ao buscar alunos:', error);
            this.loading = false;
          }
        });
    }
  }

  loadStudents(page: number = 0): void {
    this.loading = true;
    this.currentPage = page;

    this.studentsService.getStudents(page, this.pageSize, this.searchTerm, this.searchType)
      .subscribe({
        next: (response: any) => {
          this.students = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar alunos:', error);
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    const searchControl = this.searchForm.get('search');
    const searchValue = searchControl ? searchControl.value : null;
    if (searchValue) {
      // Detectar se é número (matrícula) ou texto (nome)
      this.searchTerm = searchValue;
      this.searchType = /^\d+$/.test(searchValue) ? 'matricula' : 'name';
    } else {
      this.searchTerm = '';
    }
    this.currentPage = 0;
    this.loadStudents(0);
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadStudents(0);
  }

  viewStudent(id: string): void {
    console.log('🔍 Abrindo detalhes do aluno:', id);
    this.selectedStudentId = id;
    this.showStudentDetailsModal = true;
    console.log('📋 Modal aberto - showStudentDetailsModal:', this.showStudentDetailsModal);
    console.log('📋 Aluno selecionado - selectedStudentId:', this.selectedStudentId);
  }

  closeStudentDetailsModal(): void {
    this.showStudentDetailsModal = false;
    this.selectedStudentId = null;
  }

  editStudent(id: string): void {
    console.log('✏️ Abrindo edição do aluno:', id);
    this.selectedStudentId = id;
    console.log('Estado antes:', {
      selectedStudentId: this.selectedStudentId,
      showEditStudentModal: this.showEditStudentModal
    });
    this.showEditStudentModal = true;
    console.log('Estado depois:', {
      selectedStudentId: this.selectedStudentId,
      showEditStudentModal: this.showEditStudentModal
    });
  }

  closeEditStudentModal(shouldConfirm: boolean = false): void {
    if (shouldConfirm && this.editStudentComponent) {
      // Verificar se há alterações
      if (this.editStudentComponent.hasChanges) {
        if (confirm('Descartar alterações?')) {
          this.showEditStudentModal = false;
          this.selectedStudentId = null;
          this.loadStudents(this.currentPage);
        }
      } else {
        this.showEditStudentModal = false;
        this.selectedStudentId = null;
        this.loadStudents(this.currentPage);
      }
    } else {
      this.showEditStudentModal = false;
      this.selectedStudentId = null;
      this.loadStudents(this.currentPage);
    }
  }

  deleteStudent(id: string): void {
    const student = this.students.find(s => s.id === id);
    if (student) {
      console.log('🗑️ Abrindo confirmação de exclusão:', id);
      this.selectedStudentId = id;
      this.selectedStudentName = student.name;
      this.showDeleteConfirmationModal = true;
    }
  }

  closeDeleteConfirmationModal(): void {
    this.showDeleteConfirmationModal = false;
    this.selectedStudentId = null;
    this.selectedStudentName = null;
  }

  onStudentDeleted(): void {
    console.log('✅ Aluno deletado com sucesso');
    this.loadStudents(this.currentPage);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadStudents(page);
    }
  }

  goToFirstPage(): void {
    this.loadStudents(0);
  }

  goToLastPage(): void {
    this.loadStudents(this.totalPages - 1);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.loadStudents(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadStudents(this.currentPage + 1);
    }
  }

  newStudent(): void {
    this.showNewStudentModal = true;
  }

  closeNewStudentModal(shouldConfirm: boolean = false): void {
    if (shouldConfirm && this.newStudentComponent) {
      // Verificar se há dados preenchidos
      if (this.newStudentComponent.form.dirty || this.hasNewStudentFormData()) {
        if (confirm('Descartar alterações?')) {
          this.showNewStudentModal = false;
          this.loadStudents(this.currentPage);
        }
      } else {
        this.showNewStudentModal = false;
        this.loadStudents(this.currentPage);
      }
    } else {
      this.showNewStudentModal = false;
      this.loadStudents(this.currentPage);
    }
  }

  private hasNewStudentFormData(): boolean {
    if (!this.newStudentComponent) return false;
    const form = this.newStudentComponent.form;

    const nameControl = form.get('name');
    const cpfControl = form.get('cpf');
    const emailControl = form.get('email');
    const phoneControl = form.get('phone');

    const name = nameControl && nameControl.value ? nameControl.value.trim() : '';
    const cpf = cpfControl && cpfControl.value ? cpfControl.value.trim() : '';
    const email = emailControl && emailControl.value ? emailControl.value.trim() : '';
    const phone = phoneControl && phoneControl.value ? phoneControl.value.trim() : '';

    return !!(name || cpf || email || phone);
  }

  logout(): void {
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfWindow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(0, this.currentPage - halfWindow);
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStatusClass(status?: string | any): string {
    if (!status || typeof status !== 'string') {
      return 'active';
    }
    return status.toLowerCase() === 'ativo' ? 'active' : 'inactive';
  }
}
