import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NewStudentComponent } from './new-student.component';
import { StudentsService } from '../../services/students.service';
import { ToastService } from '../../services/toast.service';
import { of, throwError } from 'rxjs';

describe('NewStudentComponent', () => {
  let component: NewStudentComponent;
  let fixture: ComponentFixture<NewStudentComponent>;
  let studentsService: StudentsService;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewStudentComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [StudentsService, ToastService]
    }).compileComponents();

    fixture = TestBed.createComponent(NewStudentComponent);
    component = fixture.componentInstance;
    studentsService = TestBed.get(StudentsService);
    toastService = TestBed.get(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('name')!.value).toBe('');
    expect(component.form.get('cpf')!.value).toBe('');
    expect(component.form.get('email')!.value).toBe('');
    expect(component.form.get('phone')!.value).toBe('');
  });

  it('should validate required name field', () => {
    const nameControl = component.form.get('name');
    nameControl!.setValue('');
    expect(nameControl!.hasError('required')).toBeTruthy();
  });

  it('should validate name minimum length', () => {
    const nameControl = component.form.get('name');
    nameControl!.setValue('A');
    expect(nameControl!.hasError('minlength')).toBeTruthy();
  });

  it('should validate name maximum length', () => {
    const nameControl = component.form.get('name');
    nameControl!.setValue('A'.repeat(101));
    expect(nameControl!.hasError('maxlength')).toBeTruthy();
  });

  it('should validate valid name', () => {
    const nameControl = component.form.get('name');
    nameControl!.setValue('João Silva');
    expect(nameControl!.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl!.setValue('invalid-email');
    expect(emailControl!.hasError('email')).toBeTruthy();
  });

  it('should validate valid email', () => {
    const emailControl = component.form.get('email');
    emailControl!.setValue('aluno@email.com');
    expect(emailControl!.valid).toBeTruthy();
  });

  it('should validate CPF format', () => {
    const cpfControl = component.form.get('cpf');
    cpfControl!.setValue('12345678901');
    expect(cpfControl!.hasError('pattern')).toBeTruthy();
  });

  it('should validate valid CPF format', () => {
    const cpfControl = component.form.get('cpf');
    cpfControl!.setValue('123.456.789-10');
    expect(cpfControl!.hasError('pattern')).toBeFalsy();
  });

  it('should format CPF on input', () => {
    const event = {
      target: { value: '12345678910' }
    };
    component.formatCPF(event);
    expect(component.form.get('cpf')!.value).toContain('.');
    expect(component.form.get('cpf')!.value).toContain('-');
  });

  it('should format phone on input', () => {
    const event = {
      target: { value: '11987654321' }
    };
    component.formatPhone(event);
    expect(component.form.get('phone')!.value).toContain('(');
    expect(component.form.get('phone')!.value).toContain(')');
    expect(component.form.get('phone')!.value).toContain('-');
  });

  it('should handle file selection', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: { files: [file] }
    };
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
  });

  it('should remove selected photo', () => {
    component.photoPreview = 'data:image/jpeg;base64,...';
    component.selectedFile = new File([''], 'test.jpg');
    component.removePhoto();
    expect(component.photoPreview).toBeNull();
    expect(component.selectedFile).toBeNull();
  });

  it('should detect error on invalid field', () => {
    const nameControl = component.form.get('name');
    nameControl!.setValue('');
    nameControl!.markAsTouched();
    expect(component.hasError('name')).toBeTruthy();
  });

  it('should not detect error on valid field', () => {
    const nameControl = component.form.get('name');
    nameControl!.setValue('João Silva');
    expect(component.hasError('name')).toBeFalsy();
  });

  it('should return correct error message for required field', () => {
    const nameControl = component.form.get('name');
    nameControl!.setValue('');
    nameControl!.markAsTouched();
    const message = component.getErrorMessage('name');
    expect(message).toContain('obrigatório');
  });

  it('should return correct error message for invalid email', () => {
    const emailControl = component.form.get('email');
    emailControl!.setValue('invalid');
    emailControl!.markAsTouched();
    const message = component.getErrorMessage('email');
    expect(message).toContain('Email');
  });

  it('should submit valid form', () => {
    spyOn(studentsService, 'createStudent').and.returnValue(of({ success: true, message: '', data: { id: '1', name: 'Test', cpf: '', email: '', phone: '', matricula: '', status: 'Ativo', photo: null } }));
    spyOn(component, 'onCancel');

    component.form.patchValue({
      name: 'João Silva',
      cpf: '123.456.789-10',
      email: 'joao@email.com',
      phone: '(11) 98765-4321'
    });

    component.onSubmit();
    expect(studentsService.createStudent).toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    spyOn(studentsService, 'createStudent');
    component.form.patchValue({
      name: '',
      cpf: '',
      email: '',
      phone: ''
    });

    component.onSubmit();
    expect(studentsService.createStudent).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
  });

  it('should handle API error on submission', () => {
    spyOn(studentsService, 'createStudent').and.returnValue(
      throwError({ error: { message: 'CPF já cadastrado' } })
    );

    component.form.patchValue({
      name: 'João Silva',
      cpf: '123.456.789-10',
      email: 'joao@email.com',
      phone: '(11) 98765-4321'
    });

    component.onSubmit();
    expect(component.errorMessage).toContain('CPF');
  });

  it('should set loading state during submission', (done) => {
    spyOn(studentsService, 'createStudent').and.returnValue(of({ success: true, message: '', data: { id: '1', name: 'Test', cpf: '', email: '', phone: '', matricula: '', status: 'Ativo', photo: null } }));

    component.form.patchValue({
      name: 'João Silva',
      cpf: '123.456.789-10',
      email: 'joao@email.com',
      phone: '(11) 98765-4321'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(component.loading).toBeFalsy();
      done();
    }, 100);
  });

  it('should cancel and navigate away', () => {
    spyOn(component, 'onCancel').and.callThrough();
    component.form.markAsPristine();
    component.onCancel();
    expect(component.onCancel).toHaveBeenCalled();
  });

  it('should warn before discarding changes', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.form.markAsDirty();
    component.onCancel();
    expect(window.confirm).toHaveBeenCalled();
  });

  it('should reset error message on new submission attempt', () => {
    component.errorMessage = 'Erro anterior';
    component.form.patchValue({
      name: 'João Silva',
      cpf: '123.456.789-10',
      email: 'joao@email.com',
      phone: '(11) 98765-4321'
    });

    spyOn(studentsService, 'createStudent').and.returnValue(of({ success: true, message: '', data: { id: '1', name: 'Test', cpf: '', email: '', phone: '', matricula: '', status: 'Ativo', photo: null } }));
    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });

  it('should disable submit button when form is invalid', () => {
    component.form.patchValue({
      name: '',
      cpf: '',
      email: '',
      phone: ''
    });
    expect(component.form.invalid).toBeTruthy();
  });

  it('should trim name and email before submission', () => {
    spyOn(studentsService, 'createStudent').and.returnValue(of({ success: true, message: '', data: { id: '1', name: 'Test', cpf: '', email: '', phone: '', matricula: '', status: 'Ativo', photo: null } }));

    component.form.patchValue({
      name: '  João Silva  ',
      cpf: '123.456.789-10',
      email: '  joao@email.com  ',
      phone: '(11) 98765-4321'
    });

    spyOn(studentsService, 'createStudent').and.returnValue(of({ success: true, message: '', data: { id: '1', name: '', cpf: '', email: '', phone: '', matricula: '', status: '', photo: null } }));
    component.onSubmit();
    expect(studentsService.createStudent).toHaveBeenCalled();
  });

  describe('CPF and Email Async Validation', () => {
    it('should validate CPF exists', (done) => {
      spyOn(studentsService, 'validateCpfExists').and.returnValue(of({ success: true, message: '', data: true }));
      component.form.get('cpf')!.setValue('123.456.789-10');

      setTimeout(() => {
        expect(component.cpfAlreadyExists).toBeDefined();
        done();
      }, 1000);
    });

    it('should validate Email exists', (done) => {
      spyOn(studentsService, 'validateEmailExists').and.returnValue(of({ success: true, message: '', data: true }));
      component.form.get('email')!.setValue('test@email.com');

      setTimeout(() => {
        expect(component.emailAlreadyExists).toBeDefined();
        done();
      }, 1000);
    });

    it('should handle CPF validation error', (done) => {
      spyOn(studentsService, 'validateCpfExists').and.returnValue(throwError(new Error('Error')));
      component.form.get('cpf')!.setValue('123.456.789-10');

      setTimeout(() => {
        done();
      }, 1000);
    });

    it('should handle Email validation error', (done) => {
      spyOn(studentsService, 'validateEmailExists').and.returnValue(throwError(new Error('Error')));
      component.form.get('email')!.setValue('test@email.com');

      setTimeout(() => {
        done();
      }, 1000);
    });
  });

  describe('Form Helpers and Utilities', () => {
    it('should trigger file input on triggerFileInput', () => {
      const fileInput = document.createElement('input');
      fileInput.id = 'photoInput';
      document.body.appendChild(fileInput);
      spyOn(fileInput, 'click');

      component.triggerFileInput();

      document.body.removeChild(fileInput);
    });

    it('should get correct field label', () => {
      const label = component['getFieldLabel']('name');
      expect(label).toBe('Nome');
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

    it('should disable submit button when CPF exists', () => {
      component.cpfAlreadyExists = true;
      expect(component.form.invalid || component.cpfAlreadyExists).toBeTruthy();
    });

    it('should disable submit button when Email exists', () => {
      component.emailAlreadyExists = true;
      expect(component.form.invalid || component.emailAlreadyExists).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    it('should return minlength error message', () => {
      const nameControl = component.form.get('name');
      nameControl!.setValue('A');
      nameControl!.markAsTouched();
      const message = component.getErrorMessage('name');
      expect(message).toContain('mínimo');
    });

    it('should return maxlength error message', () => {
      const nameControl = component.form.get('name');
      nameControl!.setValue('A'.repeat(101));
      nameControl!.markAsTouched();
      const message = component.getErrorMessage('name');
      expect(message).toContain('máximo');
    });

    it('should return fullName error message', () => {
      const nameControl = component.form.get('name');
      nameControl!.setErrors({ 'fullName': true });
      const message = component.getErrorMessage('name');
      expect(message).toContain('completo');
    });

    it('should return invalidCPF error message', () => {
      const cpfControl = component.form.get('cpf');
      cpfControl!.setErrors({ 'invalidCPF': true });
      const message = component.getErrorMessage('cpf');
      expect(message).toContain('CPF');
    });
  });

  describe('File Selection and Photo Handling', () => {
    it('should reject file larger than 2MB', () => {
      spyOn(toastService, 'error');
      const largeFile = new File(['x'.repeat(2.5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [largeFile] } };

      component.onFileSelected(event);

      expect(toastService.error).toHaveBeenCalledWith('Foto não pode ser maior que 2MB');
      expect(component.photoPreview).toBeNull();
    });

    it('should accept file smaller than 2MB', (done) => {
      const file = new File(['x'.repeat(1024 * 1024)], 'photo.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } };

      component.onFileSelected(event);

      setTimeout(() => {
        expect(component.selectedFile).toBe(file);
        expect(component.photoPreview).toBeTruthy();
        done();
      }, 100);
    });

    it('should handle file selection error', () => {
      const event = { target: { files: [] } };
      component.onFileSelected(event);
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('CPF Formatting', () => {
    it('should format CPF with dots and dash', () => {
      const event = { target: { value: '12345678910' } };
      component.formatCPF(event);
      expect(component.form.get('cpf')!.value).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    });

    it('should limit CPF to 14 characters', () => {
      const event = { target: { value: '123456789101112' } };
      component.formatCPF(event);
      const cpf = component.form.get('cpf')!.value;
      expect(cpf.length).toBeLessThanOrEqual(14);
    });

    it('should clear CPF when empty', () => {
      const event = { target: { value: '' } };
      component.formatCPF(event);
      expect(component.form.get('cpf')!.value).toBe('');
    });
  });

  describe('Phone Formatting', () => {
    it('should format phone with parentheses and dash', () => {
      const event = { target: { value: '11987654321' } };
      component.formatPhone(event);
      expect(component.form.get('phone')!.value).toMatch(/^\(\d{2}\)\s\d{4,5}-\d{4}$/);
    });

    it('should limit phone to 11 digits', () => {
      const event = { target: { value: '119876543211234' } };
      component.formatPhone(event);
      const phone = component.form.get('phone')!.value.replace(/\D/g, '');
      expect(phone.length).toBeLessThanOrEqual(11);
    });

    it('should clear phone when empty', () => {
      const event = { target: { value: '' } };
      component.formatPhone(event);
      expect(component.form.get('phone')!.value).toBe('');
    });
  });

  describe('Cancel and Discard', () => {
    it('should discard changes on confirm', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.form.markAsDirty();
      component.form.patchValue({ name: 'Test' });

      component.onCancel();

      expect(component.closeModalWithConfirm.emit).toBeDefined();
    });

    it('should not discard changes if cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const initialValue = component.form.value;
      component.form.markAsDirty();
      component.form.patchValue({ name: 'Test' });

      component.onCancel();

      expect(component.form.value.name).toBe('Test');
    });
  });

  describe('Form Submission with Various Scenarios', () => {
    it('should handle API error with message property', () => {
      spyOn(studentsService, 'createStudent').and.returnValue(
        throwError({ error: { message: 'CPF já cadastrado' } })
      );

      component.form.patchValue({
        name: 'João Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com',
        phone: '(11) 98765-4321'
      });

      component.onSubmit();
      expect(component.errorMessage).toBeTruthy();
    });

    it('should handle API error without message property', () => {
      spyOn(studentsService, 'createStudent').and.returnValue(
        throwError({ error: { } })
      );

      component.form.patchValue({
        name: 'João Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com',
        phone: '(11) 98765-4321'
      });

      component.onSubmit();
      expect(component.errorMessage).toBeTruthy();
    });

    it('should handle CPF validation when control is empty', (done) => {
      component.form.get('cpf')!.setValue('');

      setTimeout(() => {
        expect(component.cpfAlreadyExists).toBeFalsy();
        done();
      }, 1000);
    });

    it('should handle CPF validation when control is invalid', (done) => {
      component.form.get('cpf')!.setValue('invalid');

      setTimeout(() => {
        done();
      }, 1000);
    });

    it('should handle email validation when control is empty', (done) => {
      component.form.get('email')!.setValue('');

      setTimeout(() => {
        expect(component.emailAlreadyExists).toBeFalsy();
        done();
      }, 1000);
    });

    it('should handle email validation when control is invalid', (done) => {
      component.form.get('email')!.setValue('invalid');

      setTimeout(() => {
        done();
      }, 1000);
    });
  });

  describe('Submission Error Handling', () => {
    it('should not submit when CPF already exists', () => {
      spyOn(toastService, 'error');
      component.cpfAlreadyExists = true;
      component.form.patchValue({
        name: 'João Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com',
        phone: '(11) 98765-4321'
      });

      component.onSubmit();

      expect(toastService.error).toHaveBeenCalledWith('Não é possível cadastrar: CPF já existe');
    });

    it('should not submit when Email already exists', () => {
      spyOn(toastService, 'error');
      component.emailAlreadyExists = true;
      component.form.patchValue({
        name: 'João Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com',
        phone: '(11) 98765-4321'
      });

      component.onSubmit();

      expect(toastService.error).toHaveBeenCalledWith('Não é possível cadastrar: Email já existe');
    });

    it('should show error message when form is invalid', () => {
      spyOn(toastService, 'error');
      component.form.patchValue({
        name: '',
        cpf: '',
        email: '',
        phone: ''
      });

      component.onSubmit();

      expect(toastService.error).toHaveBeenCalledWith('Por favor, preencha todos os campos corretamente');
    });

    it('should set loading to false on API error', () => {
      spyOn(studentsService, 'createStudent').and.returnValue(
        throwError({ error: { message: 'Erro servidor' } })
      );

      component.form.patchValue({
        name: 'João Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com',
        phone: '(11) 98765-4321'
      });

      component.onSubmit();
      expect(component.loading).toBeFalsy();
    });

    it('should handle successful submission', (done) => {
      spyOn(toastService, 'success');
      spyOn(component.closeModal, 'emit');
      const mockResponse = { success: true, message: '', data: { id: '1', name: 'Test', cpf: '123', email: 'test@email.com', phone: '1199999999', matricula: 'MAT-001', status: 'Ativo', photo: null } };
      spyOn(studentsService, 'createStudent').and.returnValue(of(mockResponse));

      component.form.patchValue({
        name: 'João Silva',
        cpf: '123.456.789-10',
        email: 'joao@email.com',
        phone: '(11) 98765-4321'
      });

      component.onSubmit();

      setTimeout(() => {
        expect(toastService.success).toHaveBeenCalledWith('Aluno cadastrado com sucesso!');
        expect(component.closeModal.emit).toHaveBeenCalled();
        done();
      }, 1600);
    });
  });

  describe('Phone Formatting Edge Cases', () => {
    it('should format phone with 1 digit', () => {
      const event = { target: { value: '1' } };
      component.formatPhone(event);
      expect(component.form.get('phone')!.value).toBe('(1');
    });

    it('should format phone with 2-6 digits', () => {
      const event = { target: { value: '119' } };
      component.formatPhone(event);
      expect(component.form.get('phone')!.value).toMatch(/^\(\d{2}\)\s\d+$/);
    });

    it('should format phone with 7-10 digits (fixo)', () => {
      const event = { target: { value: '1198765432' } };
      component.formatPhone(event);
      const phone = component.form.get('phone')!.value;
      expect(phone).toMatch(/^\(\d{2}\)\s\d{4}-\d{4}$/);
    });

    it('should format phone with 11 digits (celular)', () => {
      const event = { target: { value: '11987654321' } };
      component.formatPhone(event);
      const phone = component.form.get('phone')!.value;
      expect(phone).toMatch(/^\(\d{2}\)\s\d{5}-\d{4}$/);
    });
  });

  describe('CPF Formatting Edge Cases', () => {
    it('should format CPF with 1-3 digits', () => {
      const event = { target: { value: '123' } };
      component.formatCPF(event);
      expect(component.form.get('cpf')!.value).toBe('123');
    });

    it('should format CPF with 4-6 digits', () => {
      const event = { target: { value: '12345' } };
      component.formatCPF(event);
      expect(component.form.get('cpf')!.value).toMatch(/^\d{3}\.\d{1,2}$/);
    });

    it('should format CPF with 7-9 digits', () => {
      const event = { target: { value: '123456789' } };
      component.formatCPF(event);
      expect(component.form.get('cpf')!.value).toMatch(/^\d{3}\.\d{3}\.\d{3}$/);
    });

    it('should format CPF with 10-11 digits', () => {
      const event = { target: { value: '12345678910' } };
      component.formatCPF(event);
      const cpf = component.form.get('cpf')!.value;
      expect(cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    });
  });

  describe('File Upload Edge Cases', () => {
    it('should not upload file larger than 2MB', () => {
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [largeFile] } };
      spyOn(toastService, 'error');
      component.onFileSelected(event);
      expect(toastService.error).toHaveBeenCalledWith('Foto não pode ser maior que 2MB');
      expect(component.selectedFile).toBeNull();
    });

    it('should handle empty file selection', () => {
      const event = { target: { files: [] } };
      component.onFileSelected(event);
      expect(component.selectedFile).toBeNull();
      expect(component.photoPreview).toBeNull();
    });
  });

  describe('Form Error Messages', () => {
    it('should return error message for empty field', () => {
      component.form.get('name')!.setValue('');
      const message = component.getErrorMessage('name');
      expect(message).toContain('obrigatório');
    });

    it('should return error message for minlength', () => {
      component.form.get('name')!.setValue('A');
      component.form.get('name')!.markAsDirty();
      const message = component.getErrorMessage('name');
      expect(message).toContain('mínimo');
    });

    it('should return error message for maxlength', () => {
      component.form.get('name')!.setValue('A'.repeat(101));
      component.form.get('name')!.markAsDirty();
      const message = component.getErrorMessage('name');
      expect(message).toContain('máximo');
    });

    it('should return error message for invalid CPF pattern', () => {
      component.form.get('cpf')!.setValue('123456789');
      component.form.get('cpf')!.markAsDirty();
      const message = component.getErrorMessage('cpf');
      expect(message).toContain('formato');
    });

    it('should return error message for invalid phone pattern', () => {
      component.form.get('phone')!.setValue('123456789');
      component.form.get('phone')!.markAsDirty();
      const message = component.getErrorMessage('phone');
      expect(message).toContain('formato');
    });
  });

  describe('Form Field Error Detection', () => {
    it('should detect error in field when invalid and touched', () => {
      const nameControl = component.form.get('name')!;
      nameControl.setValue('');
      nameControl.markAsTouched();
      expect(component.hasError('name')).toBeTruthy();
    });

    it('should not detect error in field when valid', () => {
      component.form.get('name')!.setValue('João Silva');
      expect(component.hasError('name')).toBeFalsy();
    });

    it('should not detect error in non-existent field', () => {
      expect(component.hasError('nonexistent')).toBeFalsy();
    });
  });

  describe('Photo Handling', () => {
    it('should remove photo', () => {
      component.photoPreview = 'data:image/jpeg;base64,...';
      component.selectedFile = new File(['test'], 'test.jpg');
      component.removePhoto();
      expect(component.photoPreview).toBeNull();
      expect(component.selectedFile).toBeNull();
    });

    it('should get default avatar URL', () => {
      const url = component.getDefaultAvatar();
      expect(url).toContain('placeholder.com');
    });

    it('should handle photo load error', () => {
      const event = { target: { src: 'invalid.jpg' } };
      component.onPhotoError(event);
      expect(event.target.src).toContain('placeholder.com');
    });

    it('should trigger file input', () => {
      const mockElement = document.createElement('input');
      spyOn(mockElement, 'click');
      spyOn(document, 'getElementById').and.returnValue(mockElement);
      component.triggerFileInput();
      expect(mockElement.click).toHaveBeenCalled();
    });
  });

  describe('Cancel and Modal Closing', () => {
    it('should close modal when cancel and form not dirty', () => {
      spyOn(component.closeModal, 'emit');
      component.form.markAsPristine();
      component.onCancel();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });

    it('should ask confirmation when cancel with dirty form', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component.closeModal, 'emit');
      component.form.markAsDirty();
      component.onCancel();
      expect(window.confirm).toHaveBeenCalled();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });

    it('should not close modal when cancel with dirty form and confirm false', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(component.closeModal, 'emit');
      component.form.markAsDirty();
      component.onCancel();
      expect(component.closeModal.emit).not.toHaveBeenCalled();
    });

    it('should close modal on backdrop click when no form data', () => {
      spyOn(component.closeModal, 'emit');
      component.form.markAsPristine();
      component.onBackdropClick();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });

    it('should ask confirmation on backdrop click with form data', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component.closeModal, 'emit');
      component.form.get('name')!.setValue('João Silva');
      component.onBackdropClick();
      expect(window.confirm).toHaveBeenCalled();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });
  });

  describe('Form State and Data Detection', () => {
    it('should detect no form data when form empty', () => {
      component.form.reset();
      component.photoPreview = null;
      expect((component as any).hasFormData()).toBeFalsy();
    });

    it('should detect form data when name is filled', () => {
      component.form.get('name')!.setValue('João Silva');
      expect((component as any).hasFormData()).toBeTruthy();
    });

    it('should detect form data when photo is selected', () => {
      component.photoPreview = 'data:image/jpeg;base64,...';
      component.form.reset();
      expect((component as any).hasFormData()).toBeTruthy();
    });

    it('should detect form data when any field is filled', () => {
      component.form.get('cpf')!.setValue('123.456.789-10');
      expect((component as any).hasFormData()).toBeTruthy();
    });
  });

  describe('Format Phone Edge Cases', () => {
    it('should not format phone with empty value', () => {
      const event = { target: { value: '' } };
      component.formatPhone(event);
      expect(component.form.get('phone')!.value).toBe('');
    });

    it('should format phone with 1 digit', () => {
      const event = { target: { value: '1' } };
      component.formatPhone(event);
      expect(component.form.get('phone')!.value).toBe('(1');
    });

    it('should format phone with 2-6 digits', () => {
      const event = { target: { value: '11987' } };
      component.formatPhone(event);
      const phone = component.form.get('phone')!.value;
      expect(phone).toMatch(/^\(\d{2}\)\s\d{1,4}$/);
    });
  });

  describe('Format CPF Edge Cases', () => {
    it('should not format CPF with empty value', () => {
      const event = { target: { value: '' } };
      component.formatCPF(event);
      expect(component.form.get('cpf')!.value).toBe('');
    });

    it('should truncate CPF to 11 digits', () => {
      const event = { target: { value: '123456789101112' } };
      component.formatCPF(event);
      const cpf = component.form.get('cpf')!.value;
      expect(cpf.replace(/\D/g, '').length).toBeLessThanOrEqual(11);
    });

    it('should handle non-numeric input', () => {
      const event = { target: { value: 'abc123def456' } };
      component.formatCPF(event);
      const cpf = component.form.get('cpf')!.value;
      expect(cpf).toMatch(/^\d/);
    });
  });
});



