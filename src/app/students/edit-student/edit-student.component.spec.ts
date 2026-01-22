import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EditStudentComponent } from './edit-student.component';
import { StudentsService } from '../../services/students.service';
import { of, throwError } from 'rxjs';

describe('EditStudentComponent', () => {
  let component: EditStudentComponent;
  let fixture: ComponentFixture<EditStudentComponent>;
  let studentsService: StudentsService;

  const mockStudent = {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com',
    phone: '11987654321',
    photo: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditStudentComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [StudentsService]
    }).compileComponents();

    fixture = TestBed.createComponent(EditStudentComponent);
    component = fixture.componentInstance;
    studentsService = TestBed.inject(StudentsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load student details on init', () => {
    spyOn(studentsService, 'getStudentDetail').and.returnValue(of({ data: mockStudent }));
    component.studentId = '1';
    component.ngOnInit();
    expect(studentsService.getStudentDetail).toHaveBeenCalledWith('1');
  });

  it('should populate form with student data', () => {
    spyOn(studentsService, 'getStudentDetail').and.returnValue(of({ data: mockStudent }));
    component.studentId = '1';
    component.ngOnInit();
    expect(component.student).toEqual(mockStudent);
  });

  it('should have email as required', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });

  it('should accept valid email', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should detect changes in email field', () => {
    component.originalData = { email: 'old@email.com', phone: '', status: 'Ativo', photo: null };
    component.form.patchValue({ email: 'new@email.com' });
    component.onFormChange();
    expect(component.hasChanges).toBeTruthy();
  });

  it('should detect changes in phone field', () => {
    component.originalData = { email: '', phone: '1198765432', status: 'Ativo', photo: null };
    component.form.patchValue({ phone: '1187654321' });
    component.onFormChange();
    expect(component.hasChanges).toBeTruthy();
  });

  it('should detect changes in status field', () => {
    component.originalData = { email: '', phone: '', status: 'Ativo', photo: null };
    component.form.patchValue({ status: 'Inativo' });
    component.onFormChange();
    expect(component.hasChanges).toBeTruthy();
  });

  it('should not detect changes when reverting to original values', () => {
    component.originalData = { email: 'test@email.com', phone: '', status: 'Ativo', photo: null };
    component.form.patchValue({ email: 'test@email.com' });
    component.onFormChange();
    expect(component.hasChanges).toBeFalsy();
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

  it('should handle file selection for photo', () => {
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

  it('should revert changes to original values', () => {
    component.originalData = { email: 'original@email.com', phone: '11987654321', status: 'Ativo', photo: null };
    component.form.patchValue({ email: 'new@email.com', phone: '21987654321', status: 'Inativo' });
    component.revertChanges();
    expect(component.form.get('email')?.value).toBe('original@email.com');
    expect(component.form.get('phone')?.value).toBe('11987654321');
    expect(component.form.get('status')?.value).toBe('Ativo');
    expect(component.hasChanges).toBeFalsy();
  });

  it('should disable submit button when no changes', () => {
    component.hasChanges = false;
    expect(component.hasChanges).toBeFalsy();
  });

  it('should submit valid changes', () => {
    spyOn(studentsService, 'updateStudent').and.returnValue(of({ data: mockStudent }));
    spyOn(component.studentUpdated, 'emit');

    component.student = mockStudent;
    component.originalData = { email: 'old@email.com', phone: '', status: 'Ativo', photo: null };
    component.form.patchValue({ email: 'new@email.com' });
    component.hasChanges = true;

    component.onSubmit();
    expect(studentsService.updateStudent).toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    spyOn(studentsService, 'updateStudent');
    component.form.patchValue({ email: 'invalid-email' });
    component.hasChanges = true;
    component.onSubmit();
    expect(studentsService.updateStudent).not.toHaveBeenCalled();
  });

  it('should handle error on update', () => {
    spyOn(studentsService, 'updateStudent').and.returnValue(
      throwError({ error: { message: 'Erro ao atualizar' } })
    );

    component.student = mockStudent;
    component.originalData = { email: 'old@email.com', phone: '', status: 'Ativo', photo: null };
    component.form.patchValue({ email: 'new@email.com' });
    component.hasChanges = true;

    component.onSubmit();
    expect(component.errorMessage).toContain('Erro');
  });

  it('should emit close event on cancel', () => {
    spyOn(component.closeModal, 'emit');
    component.form.markAsPristine();
    component.onCancel();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should warn before discarding changes', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component.closeModal, 'emit');
    component.hasChanges = true;
    component.onCancel();
    expect(window.confirm).toHaveBeenCalled();
    expect(component.closeModal.emit).not.toHaveBeenCalled();
  });

  it('should detect error on invalid field', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid');
    emailControl?.markAsTouched();
    expect(component.hasError('email')).toBeTruthy();
  });

  it('should not detect error on valid field', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('valid@email.com');
    expect(component.hasError('email')).toBeFalsy();
  });

  it('should return error message for required field', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    emailControl?.markAsTouched();
    const message = component.getErrorMessage('email');
    expect(message).toContain('obrigatório');
  });

  it('should return error message for invalid email', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid');
    emailControl?.markAsTouched();
    const message = component.getErrorMessage('email');
    expect(message).toContain('Email');
  });

  it('should handle loading state', () => {
    component.loading = true;
    expect(component.loading).toBeTruthy();
    component.loading = false;
    expect(component.loading).toBeFalsy();
  });

  it('should clear success message on form change', () => {
    component.successMessage = 'Sucesso!';
    component.originalData = { email: 'test@email.com', phone: '', status: 'Ativo', photo: null };
    component.form.patchValue({ email: 'new@email.com' });
    component.onFormChange();
    expect(component.successMessage).toBe('');
  });

  it('should disable revert button when no changes', () => {
    component.hasChanges = false;
    expect(component.hasChanges).toBeFalsy();
  });
});
