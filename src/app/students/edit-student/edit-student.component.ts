import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { StudentsService, StudentOutputDTO } from '../../services/students.service';

@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  styleUrls: ['./edit-student.component.css']
})
export class EditStudentComponent implements OnInit, OnChanges {
  @Input() studentId: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() studentUpdated = new EventEmitter<void>();

  form: FormGroup;
  student: StudentOutputDTO | null = null;
  loading = true;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  photoPreview: string | null = null;
  selectedFile: File | null = null;
  hasChanges = false;
  originalData: any = null;

  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^(\(\d{2}\)\s\d{4,5}-\d{4}|\d{8,11})?$/)]],
      status: ['Ativo']
    });
  }

  ngOnInit(): void {
    if (this.studentId) {
      this.loadStudentDetails();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentId'] && !changes['studentId'].firstChange) {
      console.log('studentId mudou para:', this.studentId);
      if (this.studentId) {
        this.loadStudentDetails();
      }
    }
  }

  loadStudentDetails(): void {
    this.loading = true;
    this.errorMessage = '';

    console.log(' Carregando aluno para edição:', this.studentId);

    this.studentsService.getStudentDetail(this.studentId!).subscribe(
      (response: any) => {
        this.loading = false;
        this.student = response.data || response;
        console.log(' Aluno carregado para edição:', this.student);

        // Preparar formulário com dados do aluno
        if (this.student) {
          this.form.patchValue({
            email: this.student.email || '',
            phone: this.student.phone || '',
            status: this.student.status || 'Ativo' // Usar status do aluno, ou Ativo como padrão
          });

          // Se houver foto, processar e usar como preview
          if (this.student.photo) {
            this.photoPreview = this.getFormattedPhotoUrl(this.student.photo);
          }

          // Salvar dados originais para comparação
          this.originalData = {
            email: this.student.email,
            phone: this.student.phone,
            status: this.student.status || 'Ativo',
            photo: this.student.photo
          };

          // Marcar formulário como pristine (sem alterações)
          this.form.markAsPristine();
          this.form.markAsUntouched();
          this.hasChanges = false;
        }
      },
      (error) => {
        this.loading = false;
        console.error('Erro ao carregar aluno para edição:', error);
        this.errorMessage = 'Erro ao carregar dados do aluno. Tente novamente.';
      }
    );
  }

  getFormattedPhotoUrl(photo: string): string {
    if (!photo) return this.getDefaultAvatar();

    // Se já está em formato data URL, retornar como está
    if (photo.startsWith('data:')) {
      return photo;
    }

    // Se é uma string Base64 pura, adicionar prefixo
    if (!photo.includes('://')) {
      return `data:image/jpeg;base64,${photo}`;
    }

    return photo;
  }

  /**
   * Detecta mudanças no formulário
   */
  onFormChange(): void {
    this.hasChanges = this.detectChanges();
    this.successMessage = ''; // Limpar mensagem de sucesso ao fazer alterações
  }

  /**
   * Detecta se há mudanças em relação aos dados originais
   */
  private detectChanges(): boolean {
    if (!this.originalData) return false;

    const emailControl = this.form.get('email');
    const phoneControl = this.form.get('phone');
    const statusControl = this.form.get('status');

    const currentData = {
      email: emailControl ? emailControl.value : '',
      phone: phoneControl ? phoneControl.value : '',
      status: statusControl ? statusControl.value : 'Ativo',
      photo: this.photoPreview
    };

    // Comparar cada campo
    return (
      currentData.email !== this.originalData.email ||
      currentData.phone !== this.originalData.phone ||
      currentData.status !== this.originalData.status ||
      currentData.photo !== this.originalData.photo
    );
  }

  /**
   * Manipula o carregamento de foto
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
        this.onFormChange(); // Detectar mudança na foto
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Trigger do input de arquivo
   */
  triggerFileInput(): void {
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    fileInput.click();
  }

  /**
   * Remove a foto selecionada
   */
  removePhoto(): void {
    this.photoPreview = null;
    this.selectedFile = null;
    this.onFormChange(); // Detectar mudança
  }

  /**
   * Formata Telefone enquanto digita
   */
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');

    // Limitar a 11 dígitos
    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    // Formatar conforme digita
    if (value.length > 0) {
      if (value.length <= 2) {
        value = `(${value}`;
      } else if (value.length <= 7) {
        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      } else {
        // Detectar se é 10 ou 11 dígitos
        if (value.length <= 10) {
          value = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
        } else {
          value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        }
      }
    }

    this.form.patchValue({ phone: value }, { emitEvent: false });
    this.onFormChange();
  }

  /**
   * Salva alterações do aluno
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Por favor, corrija os erros antes de salvar.';
      return;
    }

    if (!this.hasChanges) {
      this.errorMessage = 'Nenhuma alteração foi feita.';
      return;
    }

    if (!this.student || !this.student.id) {
      this.errorMessage = 'Erro: ID do aluno não encontrado.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const emailControl = this.form.get('email');
    const phoneControl = this.form.get('phone');
    const statusControl = this.form.get('status');

    const updateData = {
      email: emailControl ? emailControl.value.trim() : '',
      phone: phoneControl ? phoneControl.value.replace(/\D/g, '') : '',
      status: statusControl ? statusControl.value : 'Ativo',
      photo: this.photoPreview ? String(this.photoPreview) : this.student.photo
    };

    console.log('Atualizando aluno:', this.student.id, updateData);

    this.studentsService.updateStudent(String(this.student.id), updateData).subscribe(
      (response: any) => {
        this.submitting = false;
        console.log(' Aluno atualizado com sucesso:', response);
        this.successMessage = 'Aluno atualizado com sucesso!';

        // Atualizar dados originais
        this.originalData = updateData;
        this.form.markAsPristine();
        this.hasChanges = false;

        // Emitir evento de atualização
        this.studentUpdated.emit();

        // Fechar modal após 1.5s
        setTimeout(() => {
          this.closeModal.emit();
        }, 1500);
      },
      (error: any) => {
        this.submitting = false;
        console.error(' Erro ao atualizar aluno:', error);

        let errorMsg = 'Erro ao atualizar aluno. Tente novamente.';
        if (error.error && typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.error && error.error.error) {
          errorMsg = error.error.error;
        }

        this.errorMessage = errorMsg;
      }
    );
  }

  /**
   * Cancela e fecha o modal
   */
  onCancel(): void {
    if (this.hasChanges) {
      if (confirm('Descartar alterações?')) {
        this.closeModal.emit();
      }
    } else {
      this.closeModal.emit();
    }
  }

  /**
   * Reverte alterações aos valores originais
   */
  revertChanges(): void {
    if (this.originalData) {
      this.form.patchValue({
        email: this.originalData.email,
        phone: this.originalData.phone,
        status: this.originalData.status
      });
      this.photoPreview = this.originalData.photo;
      this.selectedFile = null;
      this.form.markAsPristine();
      this.hasChanges = false;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  /**
   * Retorna se o campo tem erro
   */
  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Retorna mensagem de erro do campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    if (field.errors['email']) {
      return 'Email inválido';
    }
    if (field.errors['pattern']) {
      if (fieldName === 'phone') {
        return 'Telefone deve estar no formato: (00) 0000-0000 ou (00) 00000-0000 ou apenas 10-11 dígitos';
      }
    }
    return 'Campo inválido';
  }

  /**
   * Helper para nome do campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      phone: 'Telefone',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Avatar padrão em SVG base64
   */
  getDefaultAvatar(): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect fill="#e0e0e0" width="200" height="200" rx="8"/>
      <circle fill="#999" cx="100" cy="60" r="30"/>
      <path fill="#999" d="M 40 140 Q 40 110 100 110 Q 160 110 160 140 L 160 180 Q 160 190 150 190 L 50 190 Q 40 190 40 180 Z"/>
    </svg>`;
    const encoded = btoa(svg);
    return `data:image/svg+xml;base64,${encoded}`;
  }

  /**
   * Trata erro ao carregar foto
   */
  onPhotoError(event: any): void {
    event.target.src = this.getDefaultAvatar();
  }
}
