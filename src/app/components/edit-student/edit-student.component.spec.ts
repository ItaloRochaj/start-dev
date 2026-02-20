import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { EditStudentComponent } from './edit-student.component';
import { StudentsService, StudentOutputDTO } from '../../services/students.service';

describe('EditStudentComponent', () => {
  let component: EditStudentComponent;
  let fixture: ComponentFixture<EditStudentComponent>;
  let studentsService: jasmine.SpyObj<StudentsService>;
  let sanitizer: DomSanitizer;

  const mockStudent: StudentOutputDTO = {
    id: '1',
    name: 'João Silva',
    cpf: '12345678901',
    email: 'joao@gmail.com',
    matricula: 'MAT-001',
    status: 'Ativo',
    phone: '(11) 99999-8888',
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

    await TestBed.configureTestingModule({
      declarations: [EditStudentComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: StudentsService, useValue: studentsServiceSpy },
        DomSanitizer
      ]
    }).compileComponents();

    studentsService = TestBed.get(StudentsService) as jasmine.SpyObj<StudentsService>;
    sanitizer = TestBed.get(DomSanitizer);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStudentComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with email, phone, and status fields', () => {
      expect(component.form.get('email')).toBeTruthy();
      expect(component.form.get('phone')).toBeTruthy();
      expect(component.form.get('status')).toBeTruthy();
    });

    it('should initialize form fields with correct values', () => {
      expect(component.form.get('email')!.value).toBe('');
      expect(component.form.get('phone')!.value).toBe('');
      expect(component.form.get('status')!.value).toBe('Ativo');
    });

    it('should initialize loading as true', () => {
      expect(component.loading).toBeTruthy();
    });

    it('should initialize submitting as false', () => {
      expect(component.submitting).toBeFalsy();
    });

    it('should initialize errorMessage as empty string', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should initialize successMessage as empty string', () => {
      expect(component.successMessage).toBe('');
    });

    it('should initialize photoPreview as null', () => {
      expect(component.photoPreview).toBeNull();
    });

    it('should initialize hasChanges as false', () => {
      expect(component.hasChanges).toBeFalsy();
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
  });

  describe('ngOnChanges', () => {
    it('should reload student details when studentId changes', () => {
      spyOn(component, 'loadStudentDetails');

      component.studentId = '1';
      component.ngOnChanges({
        studentId: {
          previousValue: null,
          currentValue: '1',
          firstChange: false,
          isFirstChange: () => false
        }
      });

      expect(component.loadStudentDetails).toHaveBeenCalled();
    });

    it('should not reload on first change', () => {
      spyOn(component, 'loadStudentDetails');

      component.ngOnChanges({
        studentId: {
          previousValue: undefined,
          currentValue: '1',
          firstChange: true,
          isFirstChange: () => true
        }
      });

      expect(component.loadStudentDetails).not.toHaveBeenCalled();
    });

    it('should not reload when studentId is null', () => {
      spyOn(component, 'loadStudentDetails');

      component.studentId = null;
      component.ngOnChanges({
        studentId: {
          previousValue: '1',
          currentValue: null,
          firstChange: false,
          isFirstChange: () => false
        }
      });

      expect(component.loadStudentDetails).not.toHaveBeenCalled();
    });
  });

  describe('Load Student Details - Success Path', () => {
    beforeEach(() => {
      component.studentId = '1';
    });

    it('should load student and populate form', (done) => {
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.student).toEqual(mockStudent);
        expect(component.form.get('email')!.value).toBe(mockStudent.email);
        expect(component.form.get('phone')!.value).toBe(mockStudent.phone);
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should set loading to false after loading', (done) => {
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loading = true;
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });

    it('should save original data for comparison', (done) => {
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.originalData).toBeTruthy();
        expect(component.originalData.email).toBe(mockStudent.email);
        done();
      }, 100);
    });

    it('should mark form as pristine after loading', (done) => {
      studentsService.getStudentDetail.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.form.pristine).toBeTruthy();
        done();
      }, 100);
    });
  });

  describe('Load Student Details - Error Path', () => {
    beforeEach(() => {
      component.studentId = '1';
    });

    it('should set error message on failure', (done) => {
      const error = { message: 'Student not found' };
      studentsService.getStudentDetail.and.returnValue(throwError(() => error));
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.errorMessage).toContain('Erro');
        done();
      }, 100);
    });

    it('should set loading to false on error', (done) => {
      studentsService.getStudentDetail.and.returnValue(throwError(() => ({} as any)));
      component.loading = true;
      component.loadStudentDetails();
      setTimeout(() => {
        expect(component.loading).toBeFalsy();
        done();
      }, 100);
    });
  });

  describe('Format Photo URL', () => {
    it('should return default avatar for null photo', () => {
      const url = component.getFormattedPhotoUrl(null as any);
      expect(url).toContain('data:image/svg+xml;base64');
    });

    it('should return photo as-is when it starts with data:', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      expect(component.getFormattedPhotoUrl(dataUrl)).toBe(dataUrl);
    });

    it('should wrap base64 string with data URL prefix', () => {
      const base64 = '/9j/4AAQSkZJRg==';
      const result = component.getFormattedPhotoUrl(base64);
      expect(result).toBe(`data:image/jpeg;base64,${base64}`);
    });
  });

  describe('Detect Changes', () => {
    beforeEach(() => {
      component.originalData = {
        email: 'joao@gmail.com',
        phone: '11999998888',
        status: 'Ativo',
        photo: null
      };
    });

    it('should detect email change', () => {
      component.form.patchValue({ email: 'novo@gmail.com' });
      expect(component['detectChanges']()).toBeTruthy();
    });

    it('should detect phone change', () => {
      component.form.patchValue({ phone: '(11) 88888-9999' });
      expect(component['detectChanges']()).toBeTruthy();
    });

    it('should detect status change', () => {
      component.form.patchValue({ status: 'Inativo' });
      expect(component['detectChanges']()).toBeTruthy();
    });

    it('should return false when no changes made', () => {
      component.form.patchValue({ email: 'joao@gmail.com', phone: '(11) 99999-8888', status: 'Ativo' });
      expect(component['detectChanges']()).toBeFalsy();
    });
  });

  describe('onFormChange', () => {
    it('should update hasChanges flag', () => {
      component.originalData = {
        email: 'test@gmail.com',
        phone: '11999998888',
        status: 'Ativo',
        photo: null
      };
      component.form.patchValue({ email: 'new@gmail.com' });
      component.onFormChange();
      expect(component.hasChanges).toBeTruthy();
    });

    it('should clear success message when form changes', () => {
      component.successMessage = 'Salvo!';
      component.onFormChange();
      expect(component.successMessage).toBe('');
    });
  });

  describe('Phone Formatting', () => {
    it('should format phone for 10 digits (fixo)', () => {
      const event = { target: { value: '1122222222' } };
      component.formatPhone(event);
      expect(component.form.get('phone')!.value).toBe('(11) 2222-2222');
    });

    it('should format phone for 11 digits (celular)', () => {
      const event = { target: { value: '11922222222' } };
      component.formatPhone(event);
      expect(component.form.get('phone')!.value).toBe('(11) 92222-2222');
    });

    it('should limit phone to 11 digits', () => {
      const event = { target: { value: '119222222222222' } };
      component.formatPhone(event);
      const phone = component.form.get('phone')!.value;
      expect(phone.replace(/\D/g, '').length).toBeLessThanOrEqual(11);
    });

    it('should trigger onFormChange on format', () => {
      component.originalData = { email: 'test@gmail.com', phone: '11999998888', status: 'Ativo', photo: null };
      const event = { target: { value: '(11) 99999-8888' } };
      spyOn(component, 'onFormChange');
      component.formatPhone(event);
      expect(component.onFormChange).toHaveBeenCalled();
    });
  });

  describe('File Selection and Photo Preview', () => {
    it('should handle file selection', () => {
      const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } };
      component.onFileSelected(event);
      expect(component.selectedFile).toBe(file);
    });

    it('should remove photo when removePhoto is called', () => {
      component.photoPreview = 'data:image/jpeg;base64,test';
      component.selectedFile = new File([''], 'photo.jpg');
      component.removePhoto();
      expect(component.photoPreview).toBeNull();
      expect(component.selectedFile).toBeNull();
    });

    it('should trigger onFormChange when removing photo', () => {
      spyOn(component, 'onFormChange');
      component.removePhoto();
      expect(component.onFormChange).toHaveBeenCalled();
    });
  });

  describe('Form Submission - Success', () => {
    beforeEach(() => {
      component.student = mockStudent;
      component.form.patchValue({
        email: 'novo@gmail.com',
        phone: '(11) 99999-9999',
        status: 'Ativo'
      });
      component.originalData = {
        email: 'joao@gmail.com',
        phone: '11999998888',
        status: 'Ativo',
        photo: null
      };
      component.hasChanges = true;
    });

    it('should call updateStudent with correct data', (done) => {
      studentsService.updateStudent.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.onSubmit();
      setTimeout(() => {
        expect(studentsService.updateStudent).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should emit studentUpdated event on success', (done) => {
      studentsService.updateStudent.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.studentUpdated.subscribe(() => {
        expect(true).toBeTruthy();
        done();
      });
      component.onSubmit();
    });

    it('should show success message', (done) => {
      studentsService.updateStudent.and.returnValue(of({ success: true, message: '', data: mockStudent }));
      component.onSubmit();
      setTimeout(() => {
        expect(component.successMessage).toContain('sucesso');
        done();
      }, 100);
    });
  });

  describe('Form Submission - Error Cases', () => {
    beforeEach(() => {
      component.student = mockStudent;
      component.hasChanges = false;
    });

    it('should show error when form is invalid', () => {
      component.form.patchValue({ email: 'invalid-email' });
      component.onSubmit();
      expect(component.errorMessage).toContain('corrija os erros');
    });

    it('should show error when no changes made', () => {
      component.form.patchValue({
        email: 'joao@gmail.com',
        phone: '(11) 99999-8888',
        status: 'Ativo'
      });
      component.hasChanges = false;
      component.onSubmit();
      expect(component.errorMessage).toContain('Nenhuma alteração');
    });

    it('should show error when student id is missing', () => {
      component.student = null;
      component.hasChanges = true;
      component.form.patchValue({
        email: 'novo@gmail.com',
        phone: '(11) 99999-9999',
        status: 'Ativo'
      });
      component.onSubmit();
      expect(component.errorMessage).toContain('ID');
    });

    it('should handle update service error', (done) => {
      component.student = mockStudent;
      component.hasChanges = true;
      component.form.patchValue({
        email: 'novo@gmail.com',
        phone: '(11) 99999-9999',
        status: 'Ativo'
      });
      studentsService.updateStudent.and.returnValue(
        throwError(() => ({ error: { message: 'Update failed' } }))
      );
      component.onSubmit();
      setTimeout(() => {
        expect(component.errorMessage).toContain('Update failed');
        expect(component.submitting).toBeFalsy();
        done();
      }, 100);
    });
  });

  describe('onCancel', () => {
    it('should emit closeModal when no changes', () => {
      component.hasChanges = false;
      component.closeModal.subscribe(() => {
        expect(true).toBeTruthy();
      });
      component.onCancel();
    });

    it('should ask for confirmation when there are changes', () => {
      component.hasChanges = true;
      spyOn(window, 'confirm').and.returnValue(false);
      component.onCancel();
      expect(window.confirm).toHaveBeenCalled();
    });

    it('should emit closeModal when user confirms discard', () => {
      component.hasChanges = true;
      spyOn(window, 'confirm').and.returnValue(true);
      component.closeModal.subscribe(() => {
        expect(true).toBeTruthy();
      });
      component.onCancel();
    });
  });

  describe('revertChanges', () => {
    it('should restore original form values', () => {
      component.originalData = {
        email: 'original@gmail.com',
        phone: '11999998888',
        status: 'Ativo',
        photo: null
      };
      component.form.patchValue({
        email: 'changed@gmail.com',
        phone: '(11) 88888-9999',
        status: 'Inativo'
      });
      component.revertChanges();
      expect(component.form.get('email')!.value).toBe('original@gmail.com');
      expect(component.form.get('status')!.value).toBe('Ativo');
    });

    it('should clear selectedFile on revert', () => {
      component.selectedFile = new File([''], 'photo.jpg');
      component.originalData = { email: 'test@gmail.com', phone: '11999998888', status: 'Ativo', photo: null };
      component.revertChanges();
      expect(component.selectedFile).toBeNull();
    });

    it('should mark form as pristine after revert', () => {
      component.originalData = { email: 'test@gmail.com', phone: '11999998888', status: 'Ativo', photo: null };
      component.form.markAsDirty();
      component.revertChanges();
      expect(component.form.pristine).toBeTruthy();
    });
  });

  describe('hasError', () => {
    it('should return true for invalid and dirty field', () => {
      const email = component.form.get('email');
      email!.setValue('');
      email!.markAsDirty();
      expect(component.hasError('email')).toBeTruthy();
    });

    it('should return false for valid field', () => {
      const email = component.form.get('email');
      email!.setValue('test@gmail.com');
      expect(component.hasError('email')).toBeFalsy();
    });
  });

  describe('getErrorMessage', () => {
    it('should return required error message', () => {
      const email = component.form.get('email');
      email!.setValue('');
      email!.markAsTouched();
      expect(component.getErrorMessage('email')).toContain('obrigatório');
    });

    it('should return phone pattern error message', () => {
      const phone = component.form.get('phone');
      phone!.setValue('123');
      phone!.markAsTouched();
      expect(component.getErrorMessage('phone')).toContain('formato');
    });

    it('should return empty string for valid field', () => {
      const email = component.form.get('email');
      email!.setValue('valid@gmail.com');
      expect(component.getErrorMessage('email')).toBe('');
    });
  });

  describe('getDefaultAvatar', () => {
    it('should return SVG data URL', () => {
      const avatar = component.getDefaultAvatar();
      expect(avatar).toContain('data:image/svg+xml;base64');
    });

    it('should be consistent across calls', () => {
      const avatar1 = component.getDefaultAvatar();
      const avatar2 = component.getDefaultAvatar();
      expect(avatar1).toBe(avatar2);
    });
  });

  describe('Phone Normalization', () => {
    it('should remove all non-digit characters', () => {
      const normalized = component['normalizePhone']('(11) 99999-8888');
      expect(normalized).toBe('11999998888');
    });

    it('should handle already normalized phone', () => {
      const normalized = component['normalizePhone']('11999998888');
      expect(normalized).toBe('11999998888');
    });
  });

  describe('Email Validation', () => {
    it('should reject invalid email format', () => {
      const email = component.form.get('email');
      email!.setValue('not-an-email');
      expect(email!.invalid).toBeTruthy();
    });

    it('should accept valid gmail address', () => {
      const email = component.form.get('email');
      email!.setValue('test@gmail.com');
      expect(email!.invalid).toBeFalsy();
    });

    it('should accept valid outlook address', () => {
      const email = component.form.get('email');
      email!.setValue('test@outlook.com');
      expect(email!.invalid).toBeFalsy();
    });

    it('should accept valid yahoo address', () => {
      const email = component.form.get('email');
      email!.setValue('test@yahoo.com');
      expect(email!.invalid).toBeFalsy();
    });
  });

  describe('Phone Field Validation', () => {
    it('should accept valid 10-digit phone (fixo)', () => {
      const phone = component.form.get('phone')!;
      phone.setValue('(11) 4444-4444');
      expect(phone.invalid).toBeFalsy();
    });

    it('should accept valid 11-digit phone (celular)', () => {
      const phone = component.form.get('phone')!;
      phone.setValue('(11) 94444-4444');
      expect(phone.invalid).toBeFalsy();
    });

    it('should reject phone with wrong format', () => {
      const phone = component.form.get('phone')!;
      phone.setValue('11944444444');
      expect(phone.invalid).toBeTruthy();
    });
  });

  describe('Form Error Handling', () => {
    it('should return error message for invalid email', () => {
      const message = component.getErrorMessage('email');
      expect(message).toBeTruthy();
    });

    it('should return error message for invalid phone', () => {
      const phone = component.form.get('phone');
      phone!.setErrors({ 'pattern': true });
      const message = component.getErrorMessage('phone');
      expect(message).toContain('Telefone');
    });

    it('should get default avatar', () => {
      const avatar = component.getDefaultAvatar();
      expect(avatar).toContain('data:image/svg+xml;base64');
    });

    it('should handle photo error', () => {
      const event = { target: { src: '' } };
      component.onPhotoError(event);
      expect(event.target.src).toContain('data:image/svg+xml;base64');
    });
  });

  describe('Photo Preview and Formatting', () => {
    it('should format data URL photos correctly', () => {
      const photoUrl = component.getFormattedPhotoUrl('data:image/jpeg;base64,test');
      expect(photoUrl).toBe('data:image/jpeg;base64,test');
    });

    it('should add base64 prefix to pure base64 strings', () => {
      const photoUrl = component.getFormattedPhotoUrl('base64encodedstring');
      expect(photoUrl).toContain('data:image/jpeg;base64,');
    });

    it('should return default avatar for empty photo', () => {
      const avatar = component.getFormattedPhotoUrl('');
      expect(avatar).toContain('data:image/svg+xml;base64');
    });

    it('should trigger file input', () => {
      const fileInput = document.createElement('input');
      fileInput.id = 'photoInput';
      document.body.appendChild(fileInput);

      const clickSpy = spyOn(fileInput, 'click');
      component.triggerFileInput();

      document.body.removeChild(fileInput);
    });
  });

  describe('Submit and Save Operations', () => {
    it('should not submit when form is invalid', () => {
      spyOn(studentsService, 'updateStudent');
      component.form.patchValue({ email: '', phone: '' });
      component.onSubmit();
      expect(component.errorMessage).toBeTruthy();
      expect(studentsService.updateStudent).not.toHaveBeenCalled();
    });

    it('should not submit when there are no changes', () => {
      spyOn(studentsService, 'updateStudent');
      component.hasChanges = false;
      component.form.patchValue({ email: 'test@gmail.com', phone: '(11) 99999-9999' });
      component.onSubmit();
      expect(component.errorMessage).toContain('alteração');
    });

    it('should not submit when student is not loaded', () => {
      spyOn(studentsService, 'updateStudent');
      component.student = null;
      component.hasChanges = true;
      component.form.patchValue({ email: 'test@gmail.com', phone: '(11) 99999-9999' });
      component.onSubmit();
      expect(component.errorMessage).toContain('ID');
    });

    it('should handle submit error', (done) => {
      component.student = mockStudent;
      component.hasChanges = true;
      studentsService.updateStudent.and.returnValue(throwError({ error: { message: 'Erro ao salvar' } }));
      component.form.patchValue({ email: 'new@gmail.com', phone: '(11) 99999-9999', status: 'Ativo' });

      component.onSubmit();

      setTimeout(() => {
        expect(component.errorMessage).toBeTruthy();
        expect(component.submitting).toBeFalsy();
        done();
      }, 100);
    });
  });
});




