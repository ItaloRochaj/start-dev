import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentsService } from '../../services/students.service';

@Component({
  selector: 'app-new-student',
  templateUrl: './new-student.component.html',
  styleUrls: ['./new-student.component.css']
})
export class NewStudentComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  errorMessage = '';
  photoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]]
    });
  }

  ngOnInit(): void {}

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
  }

  /**
   * Formata CPF enquanto digita
   */
  formatCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    if (value.length > 0) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    this.form.patchValue({ cpf: value }, { emitEvent: false });
  }

  /**
   * Formata Telefone enquanto digita
   */
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    if (value.length > 0) {
      if (value.length <= 2) {
        value = `(${value}`;
      } else if (value.length <= 7) {
        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      } else {
        value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
      }
    }
    this.form.patchValue({ phone: value }, { emitEvent: false });
  }

  /**
   * Salva novo aluno
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const nameControl = this.form.get('name');
    const cpfControl = this.form.get('cpf');
    const emailControl = this.form.get('email');
    const phoneControl = this.form.get('phone');

    const formData = {
      name: nameControl ? nameControl.value.trim() : '',
      cpf: cpfControl ? cpfControl.value.replace(/\D/g, '') : '',
      email: emailControl ? emailControl.value.trim() : '',
      phone: phoneControl ? phoneControl.value.replace(/\D/g, '') : '',
      photo: this.photoPreview ? String(this.photoPreview) : null
    };

    console.log('Enviando para API:', formData);

    this.studentsService.createStudent(formData).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('Sucesso:', response);
        alert('Aluno cadastrado com sucesso!');
        this.closeModal.emit();
      },
      (error: any) => {
        this.loading = false;
        console.error('Erro completo:', error);
        console.error('Status:', error.status);
        console.error('Response:', error.error);

        let errorMsg = 'Erro ao cadastrar aluno. Tente novamente.';

        if (error.error && typeof error.error === 'string') {
          errorMsg = error.error;
        } else if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.error && error.error.error) {
          errorMsg = error.error.error;
        }

        this.errorMessage = errorMsg;
        console.error('Mensagem de erro tratada:', errorMsg);
      }
    );
  }

  /**
   * Cancela e fecha o modal
   */
  onCancel(): void {
    if (this.form.dirty) {
      if (confirm('Descartar alterações?')) {
        this.closeModal.emit();
      }
    } else {
      this.closeModal.emit();
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
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} deve ter no mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    if (field.errors['email']) {
      return 'Email inválido';
    }
    if (field.errors['pattern']) {
      if (fieldName === 'cpf') {
        return 'CPF deve estar no formato: 000.000.000-00';
      }
      if (fieldName === 'phone') {
        return 'Telefone deve estar no formato: (00) 0000-0000 ou (00) 00000-0000';
      }
    }
    return 'Campo inválido';
  }

  /**
   * Helper para nome do campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      cpf: 'CPF',
      email: 'Email',
      phone: 'Telefone'
    };
    return labels[fieldName] || fieldName;
  }
}
