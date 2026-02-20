import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteConfirmationComponent } from './delete-confirmation.component';
import { StudentsService } from '../../services/students.service';
import { of, throwError } from 'rxjs';

describe('DeleteConfirmationComponent', () => {
  let component: DeleteConfirmationComponent;
  let fixture: ComponentFixture<DeleteConfirmationComponent>;
  let studentsService: StudentsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteConfirmationComponent ],
      providers: [ StudentsService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteConfirmationComponent);
    component = fixture.componentInstance;
    studentsService = TestBed.inject(StudentsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialização', () => {
    it('deve inicializar com valores padrão', () => {
      expect(component.loading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('deve exibir nome do aluno recebido por Input', () => {
      component.studentName = 'João Silva';
      fixture.detectChanges();
      const messageElement = fixture.nativeElement.querySelector('.confirmation-message p');
      expect(messageElement.textContent).toContain('João Silva');
    });
  });

  describe('onCancel', () => {
    it('deve emitir closeModal ao cancelar', () => {
      spyOn(component.closeModal, 'emit');
      component.onCancel();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    it('deve chamar deleteStudent do serviço', () => {
      spyOn(studentsService, 'deleteStudent').and.returnValue(of({}));
      component.studentId = '123';
      component.onDelete();
      expect(studentsService.deleteStudent).toHaveBeenCalledWith('123');
    });

    it('deve emitir studentDeleted após sucesso', (done) => {
      spyOn(studentsService, 'deleteStudent').and.returnValue(of({}));
      spyOn(component.studentDeleted, 'emit');
      component.studentId = '123';
      component.onDelete();

      setTimeout(() => {
        expect(component.studentDeleted.emit).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('deve emitir closeModal após sucesso', (done) => {
      spyOn(studentsService, 'deleteStudent').and.returnValue(of({}));
      spyOn(component.closeModal, 'emit');
      component.studentId = '123';
      component.onDelete();

      setTimeout(() => {
        expect(component.closeModal.emit).toHaveBeenCalled();
        done();
      }, 1100);
    });

    it('deve definir errorMessage em caso de erro', () => {
      const error = { error: 'Erro ao deletar' };
      spyOn(studentsService, 'deleteStudent').and.returnValue(throwError(error));
      component.studentId = '123';
      component.onDelete();
      expect(component.errorMessage).toBe('Erro ao excluir aluno. Tente novamente.');
    });

    it('deve desabilitar botões durante carregamento', () => {
      spyOn(studentsService, 'deleteStudent').and.returnValue(of({}));
      component.studentId = '123';
      component.onDelete();
      expect(component.loading).toBe(true);
    });

    it('deve limpar errorMessage antes de deletar', () => {
      component.errorMessage = 'Erro anterior';
      spyOn(studentsService, 'deleteStudent').and.returnValue(of({}));
      component.studentId = '123';
      component.onDelete();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Validação', () => {
    it('não deve deletar sem studentId', () => {
      spyOn(studentsService, 'deleteStudent');
      component.studentId = null;
      component.onDelete();
      expect(studentsService.deleteStudent).not.toHaveBeenCalled();
    });
  });
});
