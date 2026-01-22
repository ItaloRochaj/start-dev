import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StudentsService } from '../../services/students.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent {
  @Input() studentId: string | null = null;
  @Input() studentName: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() studentDeleted = new EventEmitter<void>();

  loading = false;
  errorMessage = '';

  constructor(
    private studentsService: StudentsService,
    private toastService: ToastService
  ) {}

  /**
   * Cancela a exclusão e fecha o modal
   */
  onCancel(): void {
    this.closeModal.emit();
  }

  /**
   * Confirma a exclusão do aluno
   */
  onDelete(): void {
    if (!this.studentId) return;

    this.loading = true;
    this.errorMessage = '';

    console.log('🗑️ Deletando aluno:', this.studentId);

    this.studentsService.deleteStudent(this.studentId).subscribe(
      () => {
        this.loading = false;
        console.log('✅ Aluno deletado com sucesso');

        // Mostrar toast de sucesso
        this.toastService.success('Aluno excluído com sucesso!');

        // Emitir evento de sucesso
        this.studentDeleted.emit();

        // Fechar modal após 1 segundo
        setTimeout(() => {
          this.closeModal.emit();
        }, 1000);
      },
      (error) => {
        this.loading = false;
        console.error('❌ Erro ao deletar aluno:', error);
        this.toastService.error('Erro ao excluir aluno. Tente novamente.');
      }
    );
  }
}
