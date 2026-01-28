import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StudentsService } from '../services/students.service';

export interface Student {
  id: string;
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
export class StudentsComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadStudents();
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
      this.searchType = /^\d+$/.test(searchValue) ? 'cpf' : 'name';
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

  closeEditStudentModal(): void {
    this.showEditStudentModal = false;
    this.selectedStudentId = null;
    this.loadStudents(this.currentPage);
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

  closeNewStudentModal(): void {
    this.showNewStudentModal = false;
    this.loadStudents(this.currentPage);
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

  formatMatricula(id: string): string {
    const currentYear = new Date().getFullYear();
    const studentId = parseInt(id, 10);

    if (studentId <= 100) {
      return `${currentYear}00${studentId}`;
    } else {
      return `${currentYear}${studentId}`;
    }
  }
}
