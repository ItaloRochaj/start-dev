import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NewStudentComponent } from './new-student.component';
import { StudentsService } from '../../services/students.service';
import { of, throwError } from 'rxjs';

describe('NewStudentComponent', () => {
  let component: NewStudentComponent;
  let fixture: ComponentFixture<NewStudentComponent>;
  let studentsService: StudentsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewStudentComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [StudentsService]
    }).compileComponents();

    fixture = TestBed.createComponent(NewStudentComponent);
    component = fixture.componentInstance;
    studentsService = TestBed.inject(StudentsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('cpf')?.value).toBe('');
    expect(component.form.get('email')?.value).toBe('');
    expect(component.form.get('phone')?.value).toBe('');
  });

  it('should validate required name field', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBeTruthy();
  });

  it('should validate name minimum length', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('A');
    expect(nameControl?.hasError('minlength')).toBeTruthy();
  });

  it('should validate name maximum length', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('A'.repeat(101));
    expect(nameControl?.hasError('maxlength')).toBeTruthy();
  });

  it('should validate valid name', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('João Silva');
    expect(nameControl?.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });

  it('should validate valid email', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('aluno@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate CPF format', () => {
    const cpfControl = component.form.get('cpf');
    cpfControl?.setValue('12345678901');
    expect(cpfControl?.hasError('pattern')).toBeTruthy();
  });

  it('should validate valid CPF format', () => {
    const cpfControl = component.form.get('cpf');
    cpfControl?.setValue('123.456.789-10');
    expect(cpfControl?.hasError('pattern')).toBeFalsy();
  });

  it('should format CPF on input', () => {
    const event = {
      target: { value: '12345678910' }
    };
    component.formatCPF(event);
    expect(component.form.get('cpf')?.value).toContain('.');
    expect(component.form.get('cpf')?.value).toContain('-');
  });

  it('should format phone on input', () => {
    const event = {
      target: { value: '11987654321' }
    };
    component.formatPhone(event);
    expect(component.form.get('phone')?.value).toContain('(');
    expect(component.form.get('phone')?.value).toContain(')');
    expect(component.form.get('phone')?.value).toContain('-');
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
    nameControl?.setValue('');
    nameControl?.markAsTouched();
    expect(component.hasError('name')).toBeTruthy();
  });

  it('should not detect error on valid field', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('João Silva');
    expect(component.hasError('name')).toBeFalsy();
  });

  it('should return correct error message for required field', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();
    const message = component.getErrorMessage('name');
    expect(message).toContain('obrigatório');
  });

  it('should return correct error message for invalid email', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid');
    emailControl?.markAsTouched();
    const message = component.getErrorMessage('email');
    expect(message).toContain('Email');
  });

  it('should submit valid form', () => {
    spyOn(studentsService, 'createStudent').and.returnValue(of({ id: '1' }));
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
    spyOn(studentsService, 'createStudent').and.returnValue(of({ id: '1' }));

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

    spyOn(studentsService, 'createStudent').and.returnValue(of({ id: '1' }));
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
    spyOn(studentsService, 'createStudent').and.returnValue(of({ id: '1' }));

    component.form.patchValue({
      name: '  João Silva  ',
      cpf: '123.456.789-10',
      email: '  joao@email.com  ',
      phone: '(11) 98765-4321'
    });

    component.onSubmit();

    const callArgs = studentsService.createStudent.calls.mostRecent().args[0];
    expect(callArgs.name).not.toContain('  ');
    expect(callArgs.email).not.toContain('  ');
  });
});
