import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';

import { StudentsComponent } from './students.component';
import { StudentsService } from '../../services/students.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NewStudentComponent } from '../new-student/new-student.component';
import { EditStudentComponent } from '../edit-student/edit-student.component';
import { StudentDetailsComponent } from '../student-details/student-details.component';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;
  let studentsService: jasmine.SpyObj<StudentsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockStudents = [
    { id: '1', matricula: 'MAT-001', name: 'João Silva', cpf: '123.456.789-00', email: 'joao@email.com', phone: '(11) 98765-4321', status: 'Ativo', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: '2', matricula: 'MAT-002', name: 'Maria Santos', cpf: '123.456.789-01', email: 'maria@email.com', phone: '(11) 98765-4322', status: 'Ativo', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: '3', matricula: 'MAT-003', name: 'Pedro Oliveira', cpf: '123.456.789-02', email: 'pedro@email.com', phone: '(11) 98765-4323', status: 'Inativo', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
  ];

  const mockPagedResponse = {
    data: {
      content: mockStudents,
      page: 0,
      size: 4,
      totalElements: 3,
      totalPages: 1,
      first: true,
      last: true
    },
    success: true,
    message: 'Success'
  };

  beforeEach(async () => {
    const studentsServiceSpy = jasmine.createSpyObj('StudentsService', ['getStudents', 'getStudentDetail', 'createStudent', 'updateStudent', 'deleteStudent']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [StudentsComponent, NewStudentComponent, EditStudentComponent, StudentDetailsComponent, DeleteConfirmationComponent],
      imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: StudentsService, useValue: studentsServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    studentsService = TestBed.get(StudentsService) as jasmine.SpyObj<StudentsService>;
    authService = TestBed.get(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.get(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize searchForm with search control', () => {
      expect(component.searchForm.get('search')).toBeTruthy();
    });

    it('should initialize with empty student list', () => {
      expect(component.students).toEqual([]);
    });

    it('should initialize pagination properties', () => {
      expect(component.currentPage).toBe(0);
      expect(component.pageSize).toBe(4);
      expect(component.totalPages).toBe(0);
      expect(component.totalElements).toBe(0);
    });

    it('should initialize search properties', () => {
      expect(component.searchTerm).toBe('');
      expect(component.searchType).toBe('name');
    });

    it('should initialize modal flags as false', () => {
      expect(component.showNewStudentModal).toBeFalsy();
      expect(component.showStudentDetailsModal).toBeFalsy();
      expect(component.showEditStudentModal).toBeFalsy();
      expect(component.showDeleteConfirmationModal).toBeFalsy();
    });

    it('should initialize loading as false', () => {
      expect(component.loading).toBeFalsy();
    });
  });

  describe('ngOnInit', () => {
    it('should load students on init', () => {
      spyOn(component, 'loadStudents');
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      component.ngOnInit();
      expect(component.loadStudents).toHaveBeenCalledWith();
    });

    it('should setup reactive search on init', fakeAsync(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      component.ngOnInit();
      tick(500);
      component.searchForm.patchValue({ search: 'João' });
      tick(500);
      // Search should be triggered after debounceTime
    }));
  });

  describe('Load Students', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
    });

    it('should load students and populate list', (done) => {
      component.loadStudents(0);
      setTimeout(() => {
        expect(component.students).toEqual(mockStudents);
        expect(component.totalPages).toBe(1);
        expect(component.totalElements).toBe(3);
        done();
      }, 100);
    });

    it('should set loading flag to true before loading', () => {
      component.loadStudents(0);
      expect(component.loading).toBeTruthy();
    });

    it('should set loading flag to false after loading', (done) => {
      component.loadStudents(0);
      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should update current page', (done) => {
      component.loadStudents(2);
      setTimeout(() => {
        expect(component.currentPage).toBe(2);
        done();
      }, 100);
    });

    it('should call getStudents with correct parameters', (done) => {
      component.loadStudents(1);
      setTimeout(() => {
        expect(studentsService.getStudents).toHaveBeenCalledWith(1, 4, '', 'name');
        done();
      }, 100);
    });

    it('should handle error on load', (done) => {
      studentsService.getStudents.and.returnValue(throwError(() => ({ error: 'Error' })));
      spyOn(console, 'error');
      component.loadStudents(0);
      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        expect(console.error).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
    });

    it('should detect numeric search as matricula', (done) => {
      component.searchForm.patchValue({ search: '2024001' });
      component.onSearch();
      setTimeout(() => {
        expect(component.searchType).toBe('matricula');
        done();
      }, 100);
    });

    it('should detect text search as name', (done) => {
      component.searchForm.patchValue({ search: 'João' });
      component.onSearch();
      setTimeout(() => {
        expect(component.searchType).toBe('name');
        done();
      }, 100);
    });

    it('should reset page to 0 on search', (done) => {
      component.currentPage = 5;
      component.searchForm.patchValue({ search: 'João' });
      component.onSearch();
      setTimeout(() => {
        expect(component.currentPage).toBe(0);
        done();
      }, 100);
    });

    it('should call loadStudents on search', (done) => {
      spyOn(component, 'loadStudents');
      component.searchForm.patchValue({ search: 'João' });
      component.onSearch();
      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalledWith(0);
        done();
      }, 100);
    });

    it('should set searchTerm on search', (done) => {
      component.searchForm.patchValue({ search: 'João Silva' });
      component.onSearch();
      setTimeout(() => {
        expect(component.searchTerm).toBe('João Silva');
        done();
      }, 100);
    });

    it('should handle empty search', (done) => {
      component.searchTerm = 'previous';
      component.searchForm.patchValue({ search: '' });
      component.onSearch();
      setTimeout(() => {
        expect(component.searchTerm).toBe('');
        done();
      }, 100);
    });

    it('should clear search and reload all students', (done) => {
      component.searchTerm = 'João';
      component.searchForm.patchValue({ search: 'João' });
      component.clearSearch();
      setTimeout(() => {
        expect(component.searchTerm).toBe('');
        expect(component.searchForm.get('search')!.value).toBeNull();
        expect(component.currentPage).toBe(0);
        done();
      }, 100);
    });

    it('should debounce reactive search input', fakeAsync(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      component.ngOnInit();
      const searchControl = component.searchForm.get('search');

      searchControl!.setValue('J');
      tick(300);
      searchControl!.setValue('Jo');
      tick(300);
      searchControl!.setValue('João');
      tick(500);

      // Should only call once after debounce
      expect(studentsService.getStudents).toHaveBeenCalled();
    }));
  });

  describe('View Student Details', () => {
    it('should set selectedStudentId and open modal', () => {
      component.viewStudent('1');
      expect(component.selectedStudentId).toBe('1');
      expect(component.showStudentDetailsModal).toBeTruthy();
    });

    it('should close student details modal', () => {
      component.showStudentDetailsModal = true;
      component.closeStudentDetailsModal();
      expect(component.showStudentDetailsModal).toBeFalsy();
      expect(component.selectedStudentId).toBeNull();
    });

    it('should log when viewing student', () => {
      spyOn(console, 'log');
      component.viewStudent('1');
      expect(console.log).toHaveBeenCalledWith('🔍 Abrindo detalhes do aluno:', '1');
    });
  });

  describe('Edit Student', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      fixture.detectChanges();
    });

    it('should set selectedStudentId and open edit modal', () => {
      component.editStudent('1');
      expect(component.selectedStudentId).toBe('1');
      expect(component.showEditStudentModal).toBeTruthy();
    });

    it('should close edit modal without changes', () => {
      component.showEditStudentModal = true;
      component.selectedStudentId = '1';
      component.closeEditStudentModal(false);
      expect(component.showEditStudentModal).toBeFalsy();
      expect(component.selectedStudentId).toBeNull();
    });

    it('should log when editing student', () => {
      spyOn(console, 'log');
      component.editStudent('1');
      expect(console.log).toHaveBeenCalledWith('✏️ Abrindo edição do aluno:', '1');
    });
  });

  describe('Delete Student', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      component.students = mockStudents;
    });

    it('should open delete confirmation modal', () => {
      component.deleteStudent('1');
      expect(component.selectedStudentId).toBe('1');
      expect(component.selectedStudentName).toBe('João Silva');
      expect(component.showDeleteConfirmationModal).toBeTruthy();
    });

    it('should close delete confirmation modal', () => {
      component.showDeleteConfirmationModal = true;
      component.closeDeleteConfirmationModal();
      expect(component.showDeleteConfirmationModal).toBeFalsy();
      expect(component.selectedStudentId).toBeNull();
      expect(component.selectedStudentName).toBeNull();
    });

    it('should handle student deleted callback', (done) => {
      spyOn(component, 'loadStudents');
      component.onStudentDeleted();
      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      component.totalPages = 5;
    });

    it('should navigate to specific page', (done) => {
      spyOn(component, 'loadStudents');
      component.goToPage(2);
      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalledWith(2);
        done();
      }, 100);
    });

    it('should not navigate to invalid page (negative)', () => {
      spyOn(component, 'loadStudents');
      component.goToPage(-1);
      expect(component.loadStudents).not.toHaveBeenCalled();
    });

    it('should not navigate to invalid page (beyond total)', () => {
      spyOn(component, 'loadStudents');
      component.goToPage(10);
      expect(component.loadStudents).not.toHaveBeenCalled();
    });

    it('should go to first page', (done) => {
      spyOn(component, 'loadStudents');
      component.goToFirstPage();
      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalledWith(0);
        done();
      }, 100);
    });

    it('should go to last page', (done) => {
      spyOn(component, 'loadStudents');
      component.goToLastPage();
      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalledWith(4);
        done();
      }, 100);
    });

    it('should go to next page', (done) => {
      component.currentPage = 2;
      spyOn(component, 'loadStudents');
      component.goToNextPage();
      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalledWith(3);
        done();
      }, 100);
    });

    it('should not go to next page on last page', () => {
      component.currentPage = 4;
      spyOn(component, 'loadStudents');
      component.goToNextPage();
      expect(component.loadStudents).not.toHaveBeenCalled();
    });

    it('should go to previous page', (done) => {
      component.currentPage = 2;
      spyOn(component, 'loadStudents');
      component.goToPreviousPage();
      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalledWith(1);
        done();
      }, 100);
    });

    it('should not go to previous page on first page', () => {
      component.currentPage = 0;
      spyOn(component, 'loadStudents');
      component.goToPreviousPage();
      expect(component.loadStudents).not.toHaveBeenCalled();
    });

    it('should generate correct page numbers', () => {
      component.currentPage = 5;
      component.totalPages = 10;
      const pages = component.getPageNumbers();
      expect(pages.length).toBeLessThanOrEqual(5);
      expect(pages).toContain(5);
    });

    it('should not generate pages beyond totalPages', () => {
      component.currentPage = 0;
      component.totalPages = 3;
      const pages = component.getPageNumbers();
      expect(pages[pages.length - 1]).toBeLessThan(3);
    });
  });

  describe('New Student Modal', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      fixture.detectChanges();
    });

    it('should open new student modal', () => {
      component.newStudent();
      expect(component.showNewStudentModal).toBeTruthy();
    });

    it('should close new student modal without changes', () => {
      component.showNewStudentModal = true;
      component.closeNewStudentModal(false);
      expect(component.showNewStudentModal).toBeFalsy();
    });

    it('should reload students when closing modal', (done) => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      spyOn(component, 'loadStudents');
      component.closeNewStudentModal(false);
      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Logout', () => {
    it('should ask confirmation before logout', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.logout();
      expect(window.confirm).toHaveBeenCalled();
    });

    it('should logout when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should not logout when cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.logout();
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('Status Class', () => {
    it('should return "active" for Ativo status', () => {
      expect(component.getStatusClass('Ativo')).toBe('active');
    });

    it('should return "active" for ativo status (lowercase)', () => {
      expect(component.getStatusClass('ativo')).toBe('active');
    });

    it('should return "inactive" for Inativo status', () => {
      expect(component.getStatusClass('Inativo')).toBe('inactive');
    });

    it('should return "active" as default for null status', () => {
      expect(component.getStatusClass(null)).toBe('active');
    });

    it('should return "active" for undefined status', () => {
      expect(component.getStatusClass(undefined)).toBe('active');
    });

    it('should return "active" for non-string status', () => {
      expect(component.getStatusClass(123 as any)).toBe('active');
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty students list', (done) => {
      const emptyResponse = { data: { content: [], page: 0, size: 4, totalElements: 0, totalPages: 0, first: true, last: true } };
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: emptyResponse.data }));
      component.loadStudents(0);
      setTimeout(() => {
        expect(component.students).toEqual([]);
        expect(component.totalPages).toBe(0);
        done();
      }, 100);
    });

    it('should handle large student list', (done) => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        matricula: `MAT-${i}`,
        name: `Student ${i}`,
        cpf: `123.456.789-${String(i).padStart(2, '0')}`,
        email: `student${i}@email.com`,
        phone: '(11) 98765-4321',
        status: 'Ativo',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }));
      const largeResponse = { data: { content: largeList, page: 0, size: 100, totalElements: 100, totalPages: 1, first: true, last: true } };
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: largeResponse.data }));
      component.pageSize = 100;
      component.loadStudents(0);
      setTimeout(() => {
        expect(component.students.length).toBe(100);
        done();
      }, 100);
    });

    it('should handle search with special characters', (done) => {
      component.searchForm.patchValue({ search: 'João da Silva-Martins' });
      component.onSearch();
      setTimeout(() => {
        expect(component.searchTerm).toBe('João da Silva-Martins');
        expect(component.searchType).toBe('name');
        done();
      }, 100);
    });

    it('should handle multiple rapid page changes', fakeAsync(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      component.totalPages = 10;

      component.goToPage(1);
      tick(0);
      component.goToPage(2);
      tick(0);
      component.goToPage(3);
      tick(0);

      expect(studentsService.getStudents).toHaveBeenCalledTimes(3);
    }));
  });

  describe('Logout and Navigation', () => {
    it('should logout and navigate to login', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should not logout if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.logout();
      expect(authService.logout).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Pagination and Page Numbers', () => {
    it('should calculate correct page numbers for first pages', () => {
      component.totalPages = 10;
      component.currentPage = 0;
      const pages = component.getPageNumbers();
      expect(pages).toContain(0);
      expect(pages.length).toBeLessThanOrEqual(5);
    });

    it('should calculate correct page numbers for middle pages', () => {
      component.totalPages = 10;
      component.currentPage = 5;
      const pages = component.getPageNumbers();
      expect(pages).toContain(5);
      expect(pages.length).toBeLessThanOrEqual(5);
    });

    it('should calculate correct page numbers for last pages', () => {
      component.totalPages = 10;
      component.currentPage = 9;
      const pages = component.getPageNumbers();
      expect(pages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Modal Management', () => {
    it('should close new student modal without confirmation if form is pristine', () => {
      component.showNewStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = true;
      mockForm.get.and.returnValue({ value: '' });
      const mockComponent = { form: mockForm } as any;
      component.newStudentComponent = mockComponent;
      spyOn(window, 'confirm');

      component.closeNewStudentModal();

      expect(component.showNewStudentModal).toBeFalsy();
      expect(window.confirm).not.toHaveBeenCalled();
    });

    it('should ask for confirmation before discarding changes', () => {
      component.showNewStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = false;
      mockForm.get.and.returnValue({ value: 'Test' });
      const mockComponent = { form: mockForm } as any;
      component.newStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(true);

      component.closeNewStudentModal();

      expect(window.confirm).toHaveBeenCalledWith('Descartar alterações?');
      expect(component.showNewStudentModal).toBeFalsy();
    });

    it('should keep modal open if user rejects discard', () => {
      component.showNewStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = false;
      mockForm.get.and.returnValue({ value: 'Test' });
      const mockComponent = { form: mockForm } as any;
      component.newStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(false);

      component.closeNewStudentModal();

      expect(component.showNewStudentModal).toBeTruthy();
    });

    it('should close edit student modal properly', () => {
      component.showEditStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = true;
      mockForm.get.and.returnValue({ value: '' });
      const mockComponent = { form: mockForm } as any;
      component.editStudentComponent = mockComponent;

      component.closeEditStudentModal();

      expect(component.showEditStudentModal).toBeFalsy();
    });

    it('should open delete confirmation modal with correct data', () => {
      const student = mockStudents[0];
      component.deleteStudent(student.id);

      expect(component.showDeleteConfirmationModal).toBeTruthy();
      expect(component.selectedStudentId).toBe(student.id);
      expect(component.selectedStudentName).toBe(student.name);
    });

    it('should close delete confirmation modal', () => {
      component.showDeleteConfirmationModal = true;
      component.closeDeleteConfirmationModal();

      expect(component.showDeleteConfirmationModal).toBeFalsy();
    });
  });

  describe('Search and Filter', () => {
    it('should search by name', (done) => {
      component.searchForm.patchValue({ search: 'João' });
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.onSearch();

      setTimeout(() => {
        expect(component.searchTerm).toBe('João');
        expect(component.searchType).toBe('name');
        done();
      }, 600);
    });

    it('should detect numeric search as matricula/CPF', (done) => {
      component.searchForm.patchValue({ search: '12345678901' });
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.onSearch();

      setTimeout(() => {
        expect(component.searchTerm).toBe('12345678901');
        expect(component.searchType).toBe('matricula');
        done();
      }, 600);
    });

    it('should reset search when cleared', (done) => {
      component.searchTerm = 'João';
      component.searchForm.patchValue({ search: '' });
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.onSearch();

      setTimeout(() => {
        expect(component.searchTerm).toBe('');
        done();
      }, 600);
    });
  });

  describe('Additional Page Navigation', () => {
    beforeEach(() => {
      component.totalPages = 5;
      component.currentPage = 0;
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
    });

    it('should go to first page', () => {
      component.goToFirstPage();
      expect(studentsService.getStudents).toHaveBeenCalled();
    });

    it('should go to last page', () => {
      component.goToLastPage();
      expect(studentsService.getStudents).toHaveBeenCalledWith(4, 4);
    });

    it('should go to previous page', () => {
      component.currentPage = 2;
      component.goToPreviousPage();
      expect(studentsService.getStudents).toHaveBeenCalledWith(1, 4);
    });

    it('should not go to previous page if on first page', () => {
      component.currentPage = 0;
      studentsService.getStudents.calls.reset();
      component.goToPreviousPage();
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should go to next page', () => {
      component.currentPage = 1;
      component.goToNextPage();
      expect(studentsService.getStudents).toHaveBeenCalledWith(2, 4);
    });

    it('should not go to next page if on last page', () => {
      component.currentPage = 4;
      studentsService.getStudents.calls.reset();
      component.goToNextPage();
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should not go to invalid page', () => {
      studentsService.getStudents.calls.reset();
      component.goToPage(-1);
      expect(studentsService.getStudents).not.toHaveBeenCalled();

      component.goToPage(10);
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should handle valid page navigation', () => {
      component.goToPage(2);
      expect(studentsService.getStudents).toHaveBeenCalledWith(2, 4);
    });
  });

  describe('View Student Details', () => {
    it('should open student details modal', () => {
      const studentId = '1';
      component.viewStudent(studentId);

      expect(component.selectedStudentId).toBe(studentId);
      expect(component.showStudentDetailsModal).toBeTruthy();
    });

    it('should close student details modal', () => {
      component.showStudentDetailsModal = true;
      component.closeStudentDetailsModal();

      expect(component.showStudentDetailsModal).toBeFalsy();
      expect(component.selectedStudentId).toBeNull();
    });
  });

  describe('Edit Student', () => {
    it('should open edit student modal', () => {
      const studentId = '1';
      component.editStudent(studentId);

      expect(component.selectedStudentId).toBe(studentId);
      expect(component.showEditStudentModal).toBeTruthy();
    });

    it('should close edit student modal without form changes', () => {
      component.showEditStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = true;
      mockForm.get.and.returnValue({ value: '' });
      const mockComponent = { form: mockForm } as any;
      component.editStudentComponent = mockComponent;
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.closeEditStudentModal();

      expect(component.showEditStudentModal).toBeFalsy();
    });

    it('should emit student updated event', () => {
      spyOn(component, 'loadStudents');
      component.onStudentDeleted();

      expect(component.loadStudents).toHaveBeenCalled();
    });
  });

  describe('Load Students with Various Scenarios', () => {
    it('should handle null search term', (done) => {
      component.searchTerm = '';
      component.searchType = 'name';
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.loadStudents(0);

      setTimeout(() => {
        expect(component.students.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should handle different search types', (done) => {
      component.searchTerm = 'MAT-001';
      component.searchType = 'matricula';
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.loadStudents(0);

      setTimeout(() => {
        expect(studentsService.getStudents).toHaveBeenCalledWith(0, 4, 'MAT-001', 'matricula');
        done();
      }, 100);
    });

    it('should handle email search', (done) => {
      component.searchTerm = 'test@email.com';
      component.searchType = 'email';
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.loadStudents(0);

      setTimeout(() => {
        expect(studentsService.getStudents).toHaveBeenCalledWith(0, 4, 'test@email.com', 'email');
        done();
      }, 100);
    });
  });

  describe('Clear Search Functionality', () => {
    it('should clear search and reload students', (done) => {
      component.searchTerm = 'João';
      component.searchForm.patchValue({ search: 'João' });
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.clearSearch();

      setTimeout(() => {
        expect(component.searchTerm).toBe('');
        expect(component.currentPage).toBe(0);
        expect(studentsService.getStudents).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should reset form on clear search', () => {
      component.searchForm.patchValue({ search: 'test' });
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      component.clearSearch();

      expect(component.searchForm.get('search')!.value).toBeNull();
    });
  });

  describe('Student Deletion Flow', () => {
    it('should not open delete confirmation if student not found', () => {
      const nonExistentId = 'non-existent';
      component.students = mockStudents;
      component.deleteStudent(nonExistentId);

      expect(component.showDeleteConfirmationModal).toBeFalsy();
    });

    it('should handle student deletion success', (done) => {
      component.selectedStudentId = '1';
      spyOn(component, 'loadStudents');

      component.onStudentDeleted();

      setTimeout(() => {
        expect(component.loadStudents).toHaveBeenCalledWith(component.currentPage);
        done();
      }, 100);
    });
  });

  describe('Status Styling', () => {
    it('should return correct status class for various statuses', () => {
      expect(component.getStatusClass('Ativo')).toBe('active');
      expect(component.getStatusClass('Inativo')).toBe('inactive');
      expect(component.getStatusClass(null)).toBe('active');
      expect(component.getStatusClass(undefined)).toBe('active');
      expect(component.getStatusClass(123 as any)).toBe('active');
    });

    it('should handle mixed case status', () => {
      expect(component.getStatusClass('ativo')).toBe('active');
      expect(component.getStatusClass('inativo')).toBe('inactive');
    });
  });

  describe('Reactive Search Setup', () => {
    it('should trigger search on form control value change', fakeAsync(() => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      fixture.detectChanges();

      const searchControl = component.searchForm.get('search');
      searchControl!.setValue('João');

      tick(600);

      expect(studentsService.getStudents).toHaveBeenCalled();
    }));

    it('should reset current page on new search', fakeAsync(() => {
      component.currentPage = 5;
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      fixture.detectChanges();

      const searchControl = component.searchForm.get('search');
      searchControl!.setValue('search term');

      tick(600);

      expect(component.currentPage).toBe(0);
    }));

    it('should handle empty search value', fakeAsync(() => {
      component.searchTerm = 'previous';
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));
      fixture.detectChanges();

      const searchControl = component.searchForm.get('search');
      searchControl!.setValue('');

      tick(600);

      expect(component.searchTerm).toBe('');
    }));
  });

  describe('Load Students Edge Cases', () => {
    it('should handle API response with nested data property', (done) => {
      const nestedResponse = {
        data: {
          content: mockStudents,
          page: 0,
          size: 4,
          totalElements: 3,
          totalPages: 1,
          first: true,
          last: true
        }
      };

      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: nestedResponse.data }));

      component.loadStudents(0);

      setTimeout(() => {
        expect(component.students).toEqual(mockStudents);
        done();
      }, 100);
    });

    it('should handle loading state', (done) => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.loadStudents(0);

      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should clear error message on successful load', (done) => {
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.loadStudents(0);

      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should handle API error', (done) => {
      studentsService.getStudents.and.returnValue(throwError({ error: 'Error loading students' }));

      component.loadStudents(0);

      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });
  });

  describe('Modal Close with Unsaved Changes', () => {
    it('should close edit modal with unsaved changes and confirm', () => {
      component.showEditStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = false;
      mockForm.get.and.returnValue({ value: 'Test' });
      const mockComponent = { form: mockForm, hasChanges: true } as any;
      component.editStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(true);
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.closeEditStudentModal(true);

      expect(window.confirm).toHaveBeenCalledWith('Descartar alterações?');
      expect(component.showEditStudentModal).toBeFalsy();
    });

    it('should not close edit modal if confirm rejected', () => {
      component.showEditStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = false;
      mockForm.get.and.returnValue({ value: 'Test' });
      const mockComponent = { form: mockForm, hasChanges: true } as any;
      component.editStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(false);
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.closeEditStudentModal(true);

      expect(component.showEditStudentModal).toBeTruthy();
    });
  });

  describe('New Student Modal with Unsaved Changes', () => {
    it('should close new modal with unsaved changes and confirm', () => {
      component.showNewStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = false;
      mockForm.dirty = true;
      mockForm.get.and.returnValue({ value: 'Test' });
      const mockComponent = { form: mockForm } as any;
      component.newStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(true);
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.closeNewStudentModal(true);

      expect(window.confirm).toHaveBeenCalledWith('Descartar alterações?');
      expect(component.showNewStudentModal).toBeFalsy();
    });

    it('should not close new modal if form has data', () => {
      component.showNewStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = false;
      mockForm.dirty = true;
      mockForm.get.and.callFake((fieldName: string) => {
        if (fieldName === 'name') return { value: 'João Silva' };
        return { value: '' };
      });
      const mockComponent = { form: mockForm } as any;
      component.newStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(false);
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.closeNewStudentModal(true);

      expect(component.showNewStudentModal).toBeTruthy();
    });

    it('should close new modal if form is pristine', () => {
      component.showNewStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = true;
      mockForm.dirty = false;
      mockForm.get.and.returnValue({ value: '' });
      const mockComponent = { form: mockForm } as any;
      component.newStudentComponent = mockComponent;
      spyOn(window, 'confirm');
      studentsService.getStudents.and.returnValue(of({ success: true, message: '', data: mockPagedResponse.data }));

      component.closeNewStudentModal(true);

      expect(component.showNewStudentModal).toBeFalsy();
      expect(window.confirm).not.toHaveBeenCalled();
    });
  });

  describe('Pagination Edge Cases', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();
    });

    it('should not go to page with negative page number', () => {
      component.totalPages = 5;
      studentsService.getStudents.calls.reset();
      component.goToPage(-1);
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should not go to page with page >= totalPages', () => {
      component.totalPages = 3;
      component.currentPage = 0;
      studentsService.getStudents.calls.reset();
      component.goToPage(5);
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should go to page with valid page number', () => {
      component.totalPages = 5;
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.goToPage(2);
      expect(studentsService.getStudents).toHaveBeenCalledWith(2, component.pageSize, '', 'name');
    });

    it('should go to first page', () => {
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.goToFirstPage();
      expect(studentsService.getStudents).toHaveBeenCalledWith(0, component.pageSize, '', 'name');
    });

    it('should go to last page', () => {
      component.totalPages = 5;
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.goToLastPage();
      expect(studentsService.getStudents).toHaveBeenCalledWith(4, component.pageSize, '', 'name');
    });

    it('should not go to previous page when at first page', () => {
      component.currentPage = 0;
      studentsService.getStudents.calls.reset();
      component.goToPreviousPage();
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should go to previous page when not at first page', () => {
      component.currentPage = 2;
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.goToPreviousPage();
      expect(studentsService.getStudents).toHaveBeenCalledWith(1, component.pageSize, '', 'name');
    });

    it('should not go to next page when at last page', () => {
      component.currentPage = 4;
      component.totalPages = 5;
      studentsService.getStudents.calls.reset();
      component.goToNextPage();
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should go to next page when not at last page', () => {
      component.currentPage = 1;
      component.totalPages = 5;
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.goToNextPage();
      expect(studentsService.getStudents).toHaveBeenCalledWith(2, component.pageSize, '', 'name');
    });
  });

  describe('Page Numbers Calculation', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();
    });

    it('should calculate page numbers when totalPages < maxPagesToShow', () => {
      component.totalPages = 3;
      component.currentPage = 1;
      const pages = component.getPageNumbers();
      expect(pages.length).toBeLessThanOrEqual(5);
      expect(pages[0]).toBe(0);
      expect(pages[pages.length - 1]).toBe(2);
    });

    it('should calculate page numbers when totalPages > maxPagesToShow (start pages)', () => {
      component.totalPages = 10;
      component.currentPage = 0;
      const pages = component.getPageNumbers();
      expect(pages.length).toBeLessThanOrEqual(5);
      expect(pages[0]).toBe(0);
    });

    it('should calculate page numbers when totalPages > maxPagesToShow (middle pages)', () => {
      component.totalPages = 10;
      component.currentPage = 5;
      const pages = component.getPageNumbers();
      expect(pages.length).toBeLessThanOrEqual(5);
      expect(pages).toContain(5);
    });

    it('should calculate page numbers when totalPages > maxPagesToShow (end pages)', () => {
      component.totalPages = 10;
      component.currentPage = 9;
      const pages = component.getPageNumbers();
      expect(pages.length).toBeLessThanOrEqual(5);
      expect(pages[pages.length - 1]).toBe(9);
    });

    it('should handle single page correctly', () => {
      component.totalPages = 1;
      component.currentPage = 0;
      const pages = component.getPageNumbers();
      expect(pages).toEqual([0]);
    });
  });

  describe('Status Styling', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();
    });

    it('should return active class for ativo status', () => {
      const statusClass = component.getStatusClass('ativo');
      expect(statusClass).toBe('active');
    });

    it('should return inactive class for inativo status', () => {
      const statusClass = component.getStatusClass('inativo');
      expect(statusClass).toBe('inactive');
    });

    it('should return active class for uppercase ATIVO status', () => {
      const statusClass = component.getStatusClass('ATIVO');
      expect(statusClass).toBe('active');
    });

    it('should return inactive class for uppercase INATIVO status', () => {
      const statusClass = component.getStatusClass('INATIVO');
      expect(statusClass).toBe('inactive');
    });

    it('should return active class for null status', () => {
      const statusClass = component.getStatusClass(null);
      expect(statusClass).toBe('active');
    });

    it('should return active class for undefined status', () => {
      const statusClass = component.getStatusClass(undefined);
      expect(statusClass).toBe('active');
    });

    it('should return active class for non-string status', () => {
      const statusClass = component.getStatusClass(123);
      expect(statusClass).toBe('active');
    });

    it('should return active class for empty string status', () => {
      const statusClass = component.getStatusClass('');
      expect(statusClass).toBe('active');
    });
  });

  describe('Student Details Modal', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();
    });

    it('should open student details modal', () => {
      component.viewStudent('1');
      expect(component.showStudentDetailsModal).toBeTruthy();
      expect(component.selectedStudentId).toBe('1');
    });

    it('should close student details modal', () => {
      component.showStudentDetailsModal = true;
      component.selectedStudentId = '1';
      component.closeStudentDetailsModal();
      expect(component.showStudentDetailsModal).toBeFalsy();
      expect(component.selectedStudentId).toBeNull();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();
    });

    it('should detect numeric search as matricula', () => {
      const searchControl = component.searchForm.get('search');
      searchControl!.setValue('12345');
      const spy = spyOn(component, 'loadStudents');
      component.onSearch();
      expect(component.searchType).toBe('matricula');
    });

    it('should detect text search as name', () => {
      const searchControl = component.searchForm.get('search');
      searchControl!.setValue('João');
      component.onSearch();
      expect(component.searchType).toBe('name');
    });

    it('should clear search form and reset search', () => {
      component.searchTerm = 'João';
      component.currentPage = 2;
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.clearSearch();
      expect(component.searchTerm).toBe('');
      expect(component.currentPage).toBe(0);
      expect(component.searchForm.get('search')!.value).toBeNull();
    });
  });

  describe('Edit Student Modal', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();
    });

    it('should open edit student modal', () => {
      component.editStudent('1');
      expect(component.showEditStudentModal).toBeTruthy();
      expect(component.selectedStudentId).toBe('1');
    });

    it('should close edit student modal without confirmation', () => {
      component.showEditStudentModal = true;
      component.selectedStudentId = '1';
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.closeEditStudentModal(false);
      expect(component.showEditStudentModal).toBeFalsy();
      expect(component.selectedStudentId).toBeNull();
    });

    it('should close edit student modal with confirmation when no changes', () => {
      component.showEditStudentModal = true;
      const mockComponent = { hasChanges: false } as any;
      component.editStudentComponent = mockComponent;
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.closeEditStudentModal(true);
      expect(component.showEditStudentModal).toBeFalsy();
    });

    it('should close edit student modal with confirmation when changes and user confirms', () => {
      component.showEditStudentModal = true;
      const mockComponent = { hasChanges: true } as any;
      component.editStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(true);
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.closeEditStudentModal(true);
      expect(component.showEditStudentModal).toBeFalsy();
    });

    it('should not close edit student modal with confirmation when changes and user denies', () => {
      component.showEditStudentModal = true;
      const mockComponent = { hasChanges: true } as any;
      component.editStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(false);
      component.closeEditStudentModal(true);
      expect(component.showEditStudentModal).toBeTruthy();
    });
  });

  describe('Logout Functionality', () => {
    it('should logout and navigate when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should not logout when user denies', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.logout();
      expect(authService.logout).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Delete Student Modal', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();
    });

    it('should open delete confirmation modal', () => {
      component.deleteStudent('1');
      expect(component.showDeleteConfirmationModal).toBeTruthy();
      expect(component.selectedStudentId).toBe('1');
      expect(component.selectedStudentName).toBe('João Silva');
    });

    it('should close delete confirmation modal', () => {
      component.showDeleteConfirmationModal = true;
      component.selectedStudentId = '1';
      component.closeDeleteConfirmationModal();
      expect(component.showDeleteConfirmationModal).toBeFalsy();
      expect(component.selectedStudentId).toBeNull();
      expect(component.selectedStudentName).toBeNull();
    });

    it('should reload students after deletion', () => {
      studentsService.getStudents.calls.reset();
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.onStudentDeleted();
      expect(studentsService.getStudents).toHaveBeenCalled();
    });
  });

  describe('New Student Creation', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.ngOnInit();
    });

    it('should open new student modal', () => {
      component.newStudent();
      expect(component.showNewStudentModal).toBeTruthy();
    });
  });

  describe('Branch Coverage - closeNewStudentModal with form data', () => {
    it('should keep new student modal open when confirm is false with form data', () => {
      component.showNewStudentModal = true;
      const mockForm = jasmine.createSpyObj('FormGroup', ['get']);
      mockForm.pristine = false;
      mockForm.get.and.callFake((fieldName: string) => {
        const values: { [key: string]: any } = {
          name: { value: 'João Silva' },
          cpf: { value: '' },
          email: { value: '' },
          phone: { value: '' }
        };
        return values[fieldName] || { value: '' };
      });
      const mockComponent = { form: mockForm } as any;
      component.newStudentComponent = mockComponent;
      spyOn(window, 'confirm').and.returnValue(false);
      component.closeNewStudentModal(true);
      expect(component.showNewStudentModal).toBeTruthy();
    });
  });

  describe('Branch Coverage - closeEditStudentModal with null component', () => {
    it('should close edit modal when editStudentComponent is undefined', () => {
      component.showEditStudentModal = true;
      component.editStudentComponent = undefined as any;
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.closeEditStudentModal(true);
      expect(component.showEditStudentModal).toBeFalsy();
    });
  });

  describe('Branch Coverage - getPageNumbers edge cases', () => {
    it('should handle page numbers when endPage minus startPage is less than maxPages', () => {
      component.currentPage = 8;
      component.totalPages = 10;
      const pages = component.getPageNumbers();
      expect(pages.length).toBeLessThanOrEqual(5);
      expect(pages[pages.length - 1]).toBe(9);
    });

    it('should handle single page scenario', () => {
      component.currentPage = 0;
      component.totalPages = 1;
      const pages = component.getPageNumbers();
      expect(pages).toEqual([0]);
    });
  });

  describe('Branch Coverage - onSearch with empty search', () => {
    it('should handle onSearch when searchForm control is null', () => {
      spyOn(component.searchForm, 'get').and.returnValue(null);
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
      component.onSearch();
      expect(component.searchTerm).toBe('');
    });
  });
  describe('Branch Coverage - Search Type Detection', () => {
    beforeEach(() => {
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
    });

    it('should detect numeric-only input as matricula', () => {
      component.searchForm.patchValue({ search: '2024001' });
      component.onSearch();
      expect(component.searchType).toBe('matricula');
    });

    it('should detect text input as name', () => {
      component.searchForm.patchValue({ search: 'João Silva' });
      component.onSearch();
      expect(component.searchType).toBe('name');
    });

    it('should detect mixed alphanumeric as name', () => {
      component.searchForm.patchValue({ search: 'MAT001' });
      component.onSearch();
      expect(component.searchType).toBe('name');
    });
  });

  describe('Branch Coverage - Pagination Boundaries', () => {
    beforeEach(() => {
      component.totalPages = 5;
      studentsService.getStudents.and.returnValue(of(mockPagedResponse));
    });

    it('should not navigate when goToPreviousPage on first page', () => {
      component.currentPage = 0;
      studentsService.getStudents.calls.reset();
      component.goToPreviousPage();
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should not navigate when goToNextPage on last page', () => {
      component.currentPage = 4;
      studentsService.getStudents.calls.reset();
      component.goToNextPage();
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should not navigate to page beyond totalPages', () => {
      studentsService.getStudents.calls.reset();
      component.goToPage(10);
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });

    it('should not navigate to negative page', () => {
      studentsService.getStudents.calls.reset();
      component.goToPage(-1);
      expect(studentsService.getStudents).not.toHaveBeenCalled();
    });
  });

  describe('Branch Coverage - Delete Student Edge Cases', () => {
    it('should not open delete modal when student not found', () => {
      component.students = mockStudents;
      component.deleteStudent('non-existent-id');
      expect(component.showDeleteConfirmationModal).toBeFalsy();
      expect(component.selectedStudentId).toBeNull();
    });
  });

  describe('Branch Coverage - Status Class with Different Types', () => {
    it('should return active for null status', () => {
      expect(component.getStatusClass(null as any)).toBe('active');
    });

    it('should return active for undefined status', () => {
      expect(component.getStatusClass(undefined as any)).toBe('active');
    });

    it('should return active for numeric status', () => {
      expect(component.getStatusClass(123 as any)).toBe('active');
    });

    it('should return inactive for Inativo lowercase', () => {
      expect(component.getStatusClass('inativo')).toBe('inactive');
    });

    it('should return inactive for INATIVO uppercase', () => {
      expect(component.getStatusClass('INATIVO')).toBe('inactive');
    });
  });

});
