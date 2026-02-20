import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { StudentDetailsComponent } from './student-details.component';
import { StudentsService, StudentOutputDTO } from '../../services/students.service';
import { ToastService } from '../../services/toast.service';

describe('StudentDetailsComponent', () => {
  let component: StudentDetailsComponent;
  let fixture: ComponentFixture<StudentDetailsComponent>;
  let studentsService: jasmine.SpyObj<StudentsService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let sanitizer: DomSanitizer;

  const mockStudent: StudentOutputDTO = {
    id: '1',
    name: 'João Silva',
    cpf: '12345678901',
    email: 'joao@example.com',
    matricula: 'MAT-001',
    status: 'Ativo',
    phone: '11999998888',
    photo: null
  };

  beforeEach(async () => {
    const studentsServiceSpy = jasmine.createSpyObj('StudentsService', [
      'getStudents',
      'getStudentDetail',
      'createStudent',
      'updateStudent',
      'deleteStudent'
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'show',
      'success',
      'error',
      'warning',
      'info'
    ]);

    await TestBed.configureTestingModule({
      declarations: [StudentDetailsComponent],
      providers: [
        { provide: StudentsService, useValue: studentsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        DomSanitizer
      ]
    }).compileComponents();

    studentsService = TestBed.get(StudentsService) as jasmine.SpyObj<StudentsService>;
    toastService = TestBed.get(ToastService) as jasmine.SpyObj<ToastService>;
    sanitizer = TestBed.get(DomSanitizer);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentDetailsComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize studentId as null', () => {
      expect(component.studentId).toBeNull();
    });

    it('should initialize student as null', () => {
      expect(component.student).toBeNull();
    });

    it('should initialize loading as true', () => {
      expect(component.loading).toBeTruthy();
    });

    it('should initialize errorMessage as empty string', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should initialize photoUrl as null', () => {
      expect(component.photoUrl).toBeNull();
    });

    it('should have closeModal EventEmitter', () => {
      expect(component.closeModal).toBeDefined();
      expect(component.closeModal.emit).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should not call loadStudentDetails when studentId is null', () => {
      spyOn(component, 'loadStudentDetails');
      component.studentId = null;
      fixture.detectChanges();
      expect(component.loadStudentDetails).not.toHaveBeenCalled();
    });

    it('should call loadStudentDetails when studentId is provided', () => {
      spyOn(component, 'loadStudentDetails');
      component.studentId = '1';
      fixture.detectChanges();
      expect(component.loadStudentDetails).toHaveBeenCalled();
    });

    it('should call loadStudentDetails when studentId is valid string', () => {
      spyOn(component, 'loadStudentDetails');
      component.studentId = 'student-123';
      fixture.detectChanges();
      expect(component.loadStudentDetails).toHaveBeenCalled();
    });

    it('should not call loadStudentDetails when studentId is empty string', () => {
      spyOn(component, 'loadStudentDetails');
      component.studentId = '';
      fixture.detectChanges();
      expect(component.loadStudentDetails).not.toHaveBeenCalled();
    });
  });

  describe('Load Student Details - Success Path', () => {
    beforeEach(() => {
      component.studentId = '1';
    });

    it('should call getStudentDetail with correct studentId', () => {
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      expect(studentsService.getStudentDetail).toHaveBeenCalledWith('1');
    });

    it('should set loading to false after success', (done) => {
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loading = true;
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should set student from response data', (done) => {
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.student).toEqual(mockStudent);
        done();
      }, 100);
    });

    it('should clear errorMessage on success', (done) => {
      component.errorMessage = 'Previous error';
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.errorMessage).toBe('');
        done();
      }, 100);
    });

    it('should set photoUrl when student has photo', (done) => {
      const studentWithPhoto: StudentOutputDTO = {
        ...mockStudent,
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
      };
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: studentWithPhoto }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.photoUrl).toBeTruthy();
        done();
      }, 100);
    });

    it('should not set photoUrl when student has no photo', (done) => {
      const studentWithoutPhoto: StudentOutputDTO = {
        ...mockStudent,
        photo: null
      };
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: studentWithoutPhoto }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.photoUrl).toBeNull();
        done();
      }, 100);
    });

    it('should handle response with student data directly', (done) => {
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.student).toEqual(mockStudent);
        done();
      }, 100);
    });

    it('should set loading to true before fetching', () => {
      component.loading = false;
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      expect(component.loading).toBeTruthy();
    });

    it('should log student details on success', (done) => {
      spyOn(console, 'log');
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(console.log).toHaveBeenCalledWith('✅ Detalhes do aluno carregados:', { data: mockStudent });
        done();
      }, 100);
    });
  });

  describe('Load Student Details - Error Path', () => {
    beforeEach(() => {
      component.studentId = '1';
    });

    it('should set loading to false on error', (done) => {
      const error = { message: 'Student not found' };
      studentsService.getStudentDetail.and.returnValue(throwError(() => error));
      component.loading = true;
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should show error toast with custom message', (done) => {
      const error = { message: 'Student not found' };
      studentsService.getStudentDetail.and.returnValue(throwError(() => error));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(toastService.error).toHaveBeenCalledWith('Student not found');
        done();
      }, 100);
    });

    it('should show error toast with default message when error has no message', (done) => {
      const error = {};
      studentsService.getStudentDetail.and.returnValue(throwError(() => error));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(toastService.error).toHaveBeenCalledWith('Erro ao carregar detalhes do aluno.');
        done();
      }, 100);
    });

    it('should log error on failure', (done) => {
      spyOn(console, 'error');
      const error = { message: 'Network error' };
      studentsService.getStudentDetail.and.returnValue(throwError(() => error));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('❌ Erro ao carregar detalhes:', error);
        done();
      }, 100);
    });

    it('should not set student on error', (done) => {
      const error = { message: 'Error' };
      studentsService.getStudentDetail.and.returnValue(throwError(() => error));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.student).toBeNull();
        done();
      }, 100);
    });

    it('should clear previous errorMessage on new load attempt', (done) => {
      component.errorMessage = 'Previous error';
      const error = { message: 'New error' };
      studentsService.getStudentDetail.and.returnValue(throwError(() => error));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.errorMessage).toBe('');
        done();
      }, 100);
    });
  });

  describe('Format Photo URL', () => {
    it('should return default avatar when photo is null', () => {
      const url = component.getFormattedPhotoUrl(null as any);
      expect(url).toContain('data:image/svg+xml;base64');
    });

    it('should return default avatar when photo is empty string', () => {
      const url = component.getFormattedPhotoUrl('');
      expect(url).toContain('data:image/svg+xml;base64');
    });

    it('should return photo as-is when it starts with data:', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const url = component.getFormattedPhotoUrl(dataUrl);
      expect(url).toBe(dataUrl);
    });

    it('should wrap base64 string with data URL prefix', () => {
      const base64 = '/9j/4AAQSkZJRg==';
      const url = component.getFormattedPhotoUrl(base64);
      expect(url).toBe(`data:image/jpeg;base64,${base64}`);
    });

    it('should preserve long base64 string', () => {
      const longBase64 = 'a'.repeat(1000);
      const url = component.getFormattedPhotoUrl(longBase64);
      expect(url).toContain(longBase64);
    });

    it('should return http URL as-is', () => {
      const httpUrl = 'http://example.com/photo.jpg';
      const url = component.getFormattedPhotoUrl(httpUrl);
      expect(url).toBe(httpUrl);
    });

    it('should return https URL as-is', () => {
      const httpsUrl = 'https://example.com/photo.jpg';
      const url = component.getFormattedPhotoUrl(httpsUrl);
      expect(url).toBe(httpsUrl);
    });

    it('should return file URL as-is', () => {
      const fileUrl = 'file:///path/to/photo.jpg';
      const url = component.getFormattedPhotoUrl(fileUrl);
      expect(url).toBe(fileUrl);
    });

    it('should differentiate between data URL and base64', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KG';
      const result = component.getFormattedPhotoUrl(dataUrl);
      expect(result).toBe(dataUrl);
    });

    it('should handle malformed base64-like strings', () => {
      const malformed = 'SGVsbG8gV29ybGQ=';
      const url = component.getFormattedPhotoUrl(malformed);
      expect(url).toBe(`data:image/jpeg;base64,${malformed}`);
    });
  });

  describe('Default Avatar Generation', () => {
    it('should return SVG data URL', () => {
      const avatar = component.getDefaultAvatar();
      expect(avatar).toContain('data:image/svg+xml;base64');
    });

    it('should return consistent avatar for multiple calls', () => {
      const avatar1 = component.getDefaultAvatar();
      const avatar2 = component.getDefaultAvatar();
      expect(avatar1).toBe(avatar2);
    });

    it('should contain SVG elements in the generated avatar', () => {
      const avatar = component.getDefaultAvatar();
      const svgContent = atob(avatar.split(',')[1]);
      expect(svgContent).toContain('<svg');
      expect(svgContent).toContain('</svg>');
    });

    it('should contain circle element for head', () => {
      const avatar = component.getDefaultAvatar();
      const svgContent = atob(avatar.split(',')[1]);
      expect(svgContent).toContain('<circle');
    });

    it('should contain path element for body', () => {
      const avatar = component.getDefaultAvatar();
      const svgContent = atob(avatar.split(',')[1]);
      expect(svgContent).toContain('<path');
    });

    it('should be a valid base64 encoded string', () => {
      const avatar = component.getDefaultAvatar();
      const base64Part = avatar.split(',')[1];
      expect(() => atob(base64Part)).not.toThrow();
    });
  });

  describe('on Cancel', () => {
    it('should emit closeModal event', (done) => {
      component.closeModal.subscribe(() => {
        expect(true).toBeTruthy();
        done();
      });
      component.onCancel();
    });

    it('should emit closeModal without any data', (done) => {
      let emittedValue: any;
      component.closeModal.subscribe((value) => {
        emittedValue = value;
        done();
      });
      component.onCancel();
      expect(emittedValue).toBeUndefined();
    });

    it('should be callable multiple times', (done) => {
      let emitCount = 0;
      component.closeModal.subscribe(() => {
        emitCount++;
        if (emitCount === 3) {
          expect(emitCount).toBe(3);
          done();
        }
      });
      component.onCancel();
      component.onCancel();
      component.onCancel();
    });
  });

  describe('Status Getter', () => {
    it('should return student status when available', () => {
      component.student = { ...mockStudent, status: 'Ativo' };
      expect(component.status).toBe('Ativo');
    });

    it('should return "Ativo" as default when student is null', () => {
      component.student = null;
      expect(component.status).toBe('Ativo');
    });

    it('should return "Ativo" as default when status is empty', () => {
      component.student = { ...mockStudent, status: '' };
      expect(component.status).toBe('Ativo');
    });

    it('should return "Inativo" when student has that status', () => {
      component.student = { ...mockStudent, status: 'Inativo' };
      expect(component.status).toBe('Inativo');
    });

    it('should return exact status value', () => {
      component.student = { ...mockStudent, status: 'Suspenso' };
      expect(component.status).toBe('Suspenso');
    });

    it('should return "Ativo" when student has no status property', () => {
      component.student = { ...mockStudent };
      delete component.student!.status;
      expect(component.status).toBe('Ativo');
    });
  });

  describe('Is Active Getter', () => {
    it('should return true when status is "Ativo"', () => {
      component.student = { ...mockStudent, status: 'Ativo' };
      expect(component.isActive).toBeTruthy();
    });

    it('should return true when status is "ativo" (lowercase)', () => {
      component.student = { ...mockStudent, status: 'ativo' };
      expect(component.isActive).toBeTruthy();
    });

    it('should return true when status is "ATIVO" (uppercase)', () => {
      component.student = { ...mockStudent, status: 'ATIVO' };
      expect(component.isActive).toBeTruthy();
    });

    it('should return true as default when student is null', () => {
      component.student = null;
      expect(component.isActive).toBeTruthy();
    });

    it('should return false when status is "Inativo"', () => {
      component.student = { ...mockStudent, status: 'Inativo' };
      expect(component.isActive).toBeFalsy();
    });

    it('should return false when status is "inativo"', () => {
      component.student = { ...mockStudent, status: 'inativo' };
      expect(component.isActive).toBeFalsy();
    });

    it('should return false when status is any value other than ativo', () => {
      component.student = { ...mockStudent, status: 'Suspenso' };
      expect(component.isActive).toBeFalsy();
    });

    it('should return true when student has no status property', () => {
      component.student = { ...mockStudent };
      delete component.student!.status;
      expect(component.isActive).toBeTruthy();
    });

    it('should return true when status is empty string', () => {
      component.student = { ...mockStudent, status: '' };
      expect(component.isActive).toBeTruthy();
    });
  });

  describe('Matricula Getter', () => {
    it('should return student matricula when available', () => {
      component.student = { ...mockStudent, matricula: 'MAT-001' };
      expect(component.matricula).toBe('MAT-001');
    });

    it('should return "-" as default when student is null', () => {
      component.student = null;
      expect(component.matricula).toBe('-');
    });

    it('should return "-" as default when matricula is empty', () => {
      component.student = { ...mockStudent, matricula: '' };
      expect(component.matricula).toBe('-');
    });

    it('should return exact matricula value', () => {
      component.student = { ...mockStudent, matricula: 'MAT-2024-001' };
      expect(component.matricula).toBe('MAT-2024-001');
    });

    it('should handle numeric matricula', () => {
      component.student = { ...mockStudent, matricula: '12345' };
      expect(component.matricula).toBe('12345');
    });

    it('should return "-" when student has no matricula property', () => {
      component.student = { ...mockStudent };
      delete component.student!.matricula;
      expect(component.matricula).toBe('-');
    });
  });

  describe('Integration - Load and Display', () => {
    it('should load student and set all display properties', (done) => {
      component.studentId = '1';
      const studentWithPhoto: StudentOutputDTO = {
        ...mockStudent,
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        status: 'Ativo',
        matricula: 'MAT-001'
      };
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: studentWithPhoto }));

      component.loadStudentDetails();

      setTimeout(() => {
        expect(component.student).toEqual(studentWithPhoto);
        expect(component.photoUrl).toBeTruthy();
        expect(component.status).toBe('Ativo');
        expect(component.isActive).toBeTruthy();
        expect(component.matricula).toBe('MAT-001');
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should handle student with null photo by not setting photoUrl', (done) => {
      component.studentId = '1';
      const studentWithoutPhoto: StudentOutputDTO = {
        ...mockStudent,
        photo: null,
        status: 'Ativo'
      };
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: studentWithoutPhoto }));

      component.loadStudentDetails();

      setTimeout(() => {
        expect(component.student).toEqual(studentWithoutPhoto);
        expect(component.photoUrl).toBeNull();
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long student names', (done) => {
      component.studentId = '1';
      const studentWithLongName: StudentOutputDTO = {
        ...mockStudent,
        name: 'a'.repeat(1000)
      };
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: studentWithLongName }));

      component.loadStudentDetails();

      setTimeout(() => {
        expect(component.student!.name.length).toBe(1000);
        done();
      }, 100);
    });

    it('should handle student with special characters in name', (done) => {
      component.studentId = '1';
      const studentWithSpecialChars: StudentOutputDTO = {
        ...mockStudent,
        name: 'José da Silva-Martins'
      };
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: studentWithSpecialChars }));

      component.loadStudentDetails();

      setTimeout(() => {
        expect(component.student!.name).toBe('José da Silva-Martins');
        done();
      }, 100);
    });

    it('should handle rapid successive load calls', (done) => {
      component.studentId = '1';
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));

      component.loadStudentDetails();
      component.loadStudentDetails();
      component.loadStudentDetails();

      setTimeout(() => {
        expect(studentsService.getStudentDetail).toHaveBeenCalledTimes(3);
        done();
      }, 100);
    });

    it('should handle very long base64 photo string', (done) => {
      component.studentId = '1';
      const longBase64 = 'a'.repeat(10000);
      const studentWithLongPhoto: StudentOutputDTO = {
        ...mockStudent,
        photo: longBase64
      };
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: studentWithLongPhoto }));

      component.loadStudentDetails();

      setTimeout(() => {
        expect(component.photoUrl).toContain(longBase64);
        done();
      }, 100);
    });

    it('should handle null response from service', (done) => {
      component.studentId = '1';
      studentsService.getStudentDetail.and.returnValue(of(null as any));

      component.loadStudentDetails();

      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should handle undefined response data', (done) => {
      component.studentId = '1';
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: undefined }));

      component.loadStudentDetails();

      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should handle photo URL with query parameters', () => {
      const urlWithParams = 'https://example.com/photo.jpg?size=large&quality=high';
      const url = component.getFormattedPhotoUrl(urlWithParams);
      expect(url).toBe(urlWithParams);
    });

    it('should handle photo URL with hash fragment', () => {
      const urlWithHash = 'https://example.com/photo.jpg#section';
      const url = component.getFormattedPhotoUrl(urlWithHash);
      expect(url).toBe(urlWithHash);
    });

    it('should get default avatar', () => {
      const avatar = component.getDefaultAvatar();
      expect(avatar).toContain('data:image/svg+xml;base64');
    });

    it('should handle photo error and set default avatar', () => {
      const event = { target: { src: '' } };
      component.onPhotoError(event);
      expect(event.target.src).toContain('data:image/svg+xml;base64');
    });
  });
});



