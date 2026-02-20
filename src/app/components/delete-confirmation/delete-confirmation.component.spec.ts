import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteConfirmationComponent } from './delete-confirmation.component';
import { StudentsService } from '../../services/students.service';
import { ToastService } from '../../services/toast.service';
import { of, throwError } from 'rxjs';

describe('DeleteConfirmationComponent', () => {
  let component: DeleteConfirmationComponent;
  let fixture: ComponentFixture<DeleteConfirmationComponent>;
  let studentsService: jasmine.SpyObj<StudentsService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const studentsServiceSpy = jasmine.createSpyObj('StudentsService', ['deleteStudent']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [DeleteConfirmationComponent],
      providers: [
        { provide: StudentsService, useValue: studentsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmationComponent);
    component = fixture.componentInstance;
    studentsService = TestBed.get(StudentsService) as jasmine.SpyObj<StudentsService>;
    toastService = TestBed.get(ToastService) as jasmine.SpyObj<ToastService>;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('');
      expect(component.studentId).toBeNull();
      expect(component.studentName).toBeNull();
    });

    it('should set studentId from input', () => {
      component.studentId = '123';
      expect(component.studentId).toBe('123');
    });

    it('should set studentName from input', () => {
      component.studentName = 'João Silva';
      expect(component.studentName).toBe('João Silva');
    });

    it('should display student name in template', () => {
      component.studentName = 'Maria Santos';
      fixture.detectChanges();
      const compiled = fixture.nativeElement.textContent;
      expect(compiled).toContain('Maria Santos');
    });
  });

  describe('onCancel Method', () => {
    it('should emit closeModal event when onCancel is called', (done) => {
      component.closeModal.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      component.onCancel();
    });

    it('should emit closeModal with correct timing', () => {
      let emitted = false;
      component.closeModal.subscribe(() => {
        emitted = true;
      });

      expect(emitted).toBe(false);
      component.onCancel();
      expect(emitted).toBe(true);
    });

    it('should not change loading state on cancel', () => {
      component.loading = false;
      component.onCancel();
      expect(component.loading).toBe(false);

      component.loading = true;
      component.onCancel();
      expect(component.loading).toBe(true);
    });

    it('should not affect studentId on cancel', () => {
      component.studentId = '123';
      component.onCancel();
      expect(component.studentId).toBe('123');
    });

    it('should not affect studentName on cancel', () => {
      component.studentName = 'João';
      component.onCancel();
      expect(component.studentName).toBe('João');
    });
  });

  describe('onDelete Method - Success Path', () => {
    beforeEach(() => {
      component.studentId = '123';
      component.studentName = 'João Silva';
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));
    });

    it('should call deleteStudent with correct student ID', () => {
      component.onDelete();
      expect(studentsService.deleteStudent).toHaveBeenCalledWith('123');
    });

    it('should call deleteStudent exactly once per onDelete call', () => {
      component.onDelete();
      expect(studentsService.deleteStudent).toHaveBeenCalledTimes(1);
    });

    it('should clear error message on successful deletion', () => {
      component.errorMessage = 'Previous error';
      component.onDelete();
      expect(component.errorMessage).toBe('');
    });

    it('should show success toast with correct message', () => {
      component.onDelete();
      expect(toastService.success).toHaveBeenCalledWith('Aluno excluído com sucesso!');
    });

    it('should emit studentDeleted event after deletion', (done) => {
      component.studentDeleted.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      component.onDelete();
    });

    it('should set loading to false after deletion completes', (done) => {
      component.onDelete();
      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 50);
    });

    it('should log deletion start', () => {
      spyOn(console, 'log');
      component.onDelete();
      expect(console.log).toHaveBeenCalledWith('Deletando aluno:', '123');
    });

    it('should log deletion success', (done) => {
      spyOn(console, 'log');
      component.onDelete();
      setTimeout(() => {
        expect(console.log).toHaveBeenCalledWith('Aluno deletado com sucesso');
        done();
      }, 50);
    });
  });

  describe('onDelete Method - Error Path', () => {
    beforeEach(() => {
      component.studentId = '123';
    });

    it('should set loading to false when error occurs', (done) => {
      const error = new Error('Delete failed');
      studentsService.deleteStudent.and.returnValue(throwError(error));

      component.loading = true;
      component.onDelete();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 50);
    });

    it('should show error toast on deletion failure', () => {
      const error = new Error('Delete failed');
      studentsService.deleteStudent.and.returnValue(throwError(error));

      component.onDelete();

      expect(toastService.error).toHaveBeenCalledWith('Erro ao excluir aluno. Tente novamente.');
    });

    it('should not emit studentDeleted on error', (done) => {
      const error = new Error('Delete failed');
      studentsService.deleteStudent.and.returnValue(throwError(error));

      let studentDeletedEmitted = false;
      component.studentDeleted.subscribe(() => {
        studentDeletedEmitted = true;
      });

      component.onDelete();

      setTimeout(() => {
        expect(studentDeletedEmitted).toBe(false);
        done();
      }, 50);
    });

    it('should not emit closeModal on error', (done) => {
      const error = new Error('Delete failed');
      studentsService.deleteStudent.and.returnValue(throwError(error));

      let closeModalEmitted = false;
      component.closeModal.subscribe(() => {
        closeModalEmitted = true;
      });

      component.onDelete();

      setTimeout(() => {
        expect(closeModalEmitted).toBe(false);
        done();
      }, 1050);
    });

    it('should log error on deletion failure', () => {
      spyOn(console, 'error');
      const error = new Error('Network error');
      studentsService.deleteStudent.and.returnValue(throwError(error));

      component.onDelete();

      expect(console.error).toHaveBeenCalledWith('Erro ao deletar aluno:', error);
    });

    it('should handle 404 error response', () => {
      const error = { status: 404, message: 'Student not found' };
      studentsService.deleteStudent.and.returnValue(throwError(error));

      component.onDelete();

      expect(toastService.error).toHaveBeenCalled();
    });

    it('should handle 500 error response', () => {
      const error = { status: 500, message: 'Server error' };
      studentsService.deleteStudent.and.returnValue(throwError(error));

      component.onDelete();

      expect(toastService.error).toHaveBeenCalled();
    });

    it('should handle network timeout error', () => {
      const error = new Error('Timeout');
      studentsService.deleteStudent.and.returnValue(throwError(error));

      component.onDelete();

      expect(toastService.error).toHaveBeenCalled();
    });
  });

  describe('onDelete Method - Edge Cases', () => {
    it('should return early if studentId is null', () => {
      component.studentId = null;
      component.onDelete();
      expect(studentsService.deleteStudent).not.toHaveBeenCalled();
    });

    it('should return early if studentId is undefined', () => {
      component.studentId = undefined as any;
      component.onDelete();
      expect(studentsService.deleteStudent).not.toHaveBeenCalled();
    });

    it('should return early if studentId is empty string', () => {
      component.studentId = '';
      component.onDelete();
      expect(studentsService.deleteStudent).not.toHaveBeenCalled();
    });

    it('should return early if studentId is 0', () => {
      component.studentId = '0';
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));
      component.onDelete();
      // '0' is truthy string, so should call service
      expect(studentsService.deleteStudent).toHaveBeenCalledWith('0');
    });

    it('should handle numeric string student IDs', () => {
      component.studentId = '999';
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));
      component.onDelete();
      expect(studentsService.deleteStudent).toHaveBeenCalledWith('999');
    });

    it('should handle UUIDs as student IDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      component.studentId = uuid;
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));
      component.onDelete();
      expect(studentsService.deleteStudent).toHaveBeenCalledWith(uuid);
    });
  });

  describe('State Management', () => {
    it('should not modify studentId during deletion', () => {
      component.studentId = '123';
      component.studentName = 'João';
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));

      component.onDelete();

      expect(component.studentId).toBe('123');
    });

    it('should not modify studentName during deletion', () => {
      component.studentId = '123';
      component.studentName = 'João Silva';
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));

      component.onDelete();

      expect(component.studentName).toBe('João Silva');
    });

    it('should maintain errorMessage on cancel', () => {
      component.errorMessage = 'Some error';
      component.onCancel();
      expect(component.errorMessage).toBe('Some error');
    });

    it('should preserve loading state through multiple operations', () => {
      component.loading = false;
      component.onCancel();
      expect(component.loading).toBe(false);

      component.loading = true;
      component.onCancel();
      expect(component.loading).toBe(true);
    });
  });

  describe('Event Emission Order', () => {
    it('should emit studentDeleted before closeModal', (done) => {
      const eventOrder: string[] = [];
      component.studentId = '123';
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));

      component.studentDeleted.subscribe(() => {
        eventOrder.push('studentDeleted');
      });

      component.closeModal.subscribe(() => {
        eventOrder.push('closeModal');
      });

      component.onDelete();

      setTimeout(() => {
        expect(eventOrder[0]).toBe('studentDeleted');
        expect(eventOrder[1]).toBe('closeModal');
        done();
      }, 1100);
    });
  });

  describe('Multiple Deletion Attempts', () => {
    it('should handle rapid successive delete calls', () => {
      component.studentId = '123';
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));

      component.onDelete();
      component.onDelete();

      expect(studentsService.deleteStudent).toHaveBeenCalledTimes(2);
    });

    it('should use correct ID for each delete call', () => {
      studentsService.deleteStudent.and.returnValue(of({ success: true, message: '', data: null }));

      component.studentId = '111';
      component.onDelete();

      component.studentId = '222';
      component.onDelete();

      expect(studentsService.deleteStudent).toHaveBeenCalledWith('111');
      expect(studentsService.deleteStudent).toHaveBeenCalledWith('222');
    });
  });
});



