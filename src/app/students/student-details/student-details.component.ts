import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { StudentsService, StudentOutputDTO } from '../../services/students.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {
  @Input() studentId: string | null = null;
  @Output() closeModal = new EventEmitter<void>();

  student: StudentOutputDTO | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private studentsService: StudentsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.studentId) {
      this.loadStudentDetails();
    }
  }

  loadStudentDetails(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log('📋 Carregando detalhes do aluno ID:', this.studentId);
    console.log('📋 Modo Mock:', this.studentsService.isMockEnabled());

    this.studentsService.getStudentDetail(this.studentId!).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('✅ Detalhes do aluno carregados:', response);
        this.student = response.data || response;
        console.log('📸 Foto do aluno:', this.student && this.student.photo);
      },
      (error) => {
        this.loading = false;
        console.error('❌ Erro ao carregar detalhes:', error);
        console.error('📌 Status do erro:', error.status || 'Sem status');
        console.error('📌 Mensagem do erro:', error.message || 'Sem mensagem');
        this.toastService.error(error.message || 'Erro ao carregar detalhes do aluno. Tente novamente.');
      }
    );
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  get status(): string {
    return this.student && this.student.status ? this.student.status : 'Ativo';
  }

  get isActive(): boolean {
    return this.student && this.student.status ? this.student.status.toLowerCase() === 'ativo' : true;
  }

  get matricula(): string {
    // Usa ID ou retorna placeholder
    return this.student && this.student.id ? this.formatMatricula(this.student.id) : '-';
  }

  formatMatricula(id: string | number): string {
    const currentYear = new Date().getFullYear();
    const studentId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (studentId <= 100) {
      return `${currentYear}00${studentId}`;
    } else {
      return `${currentYear}${studentId}`;
    }
  }

  getDefaultAvatar(): string {
    // Avatar padrão em SVG inline base64
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect fill="#e0e0e0" width="200" height="200" rx="8"/>
      <circle fill="#999" cx="100" cy="60" r="30"/>
      <path fill="#999" d="M 40 140 Q 40 110 100 110 Q 160 110 160 140 L 160 180 Q 160 190 150 190 L 50 190 Q 40 190 40 180 Z"/>
    </svg>`;
    const encoded = btoa(svg);
    return `data:image/svg+xml;base64,${encoded}`;
  }

  onPhotoError(event: any): void {
    console.warn('❌ Erro ao carregar foto, usando avatar padrão');
    event.target.src = this.getDefaultAvatar();
  }
}
