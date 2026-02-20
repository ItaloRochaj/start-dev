import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentsService } from '../../services/students.service';
import { ToastService } from '../../services/toast.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { fullNameValidator } from '../../validators/full-name.validator';
import { validCPFValidator } from '../../validators/cpf.validator';
import { validEmailValidator } from '../../validators/email.validator';

@Component({
  selector: 'app-new-student',
  templateUrl: './new-student.component.html',
  styleUrls: ['./new-student.component.css']
})
export class NewStudentComponent implements OnInit, OnDestroy {
  @Output() closeModal = new EventEmitter<void>();
  @Output() closeModalWithConfirm = new EventEmitter<boolean>();

  form: FormGroup;
  loading = false;
  errorMessage = '';
  photoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  cpfAlreadyExists = false;
  emailAlreadyExists = false;
  validatingCpf = false;
  validatingEmail = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), fullNameValidator()]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/), validCPFValidator()]],
      email: ['', [Validators.required, validEmailValidator()]],
      phone: ['', [Validators.required, Validators.pattern(/^(\(\d{2}\)\s\d{4}-\d{4}|\(\d{2}\)\s\d{5}-\d{4})$/)]]
    });
  }

  ngOnInit(): void {
    this.setupCpfValidation();
    this.setupEmailValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configura validação em tempo real de CPF
   */
  private setupCpfValidation(): void {
    const cpfControl = this.form.get('cpf');
    if (cpfControl) {
      cpfControl.statusChanges
        .pipe(
          debounceTime(800),
          distinctUntilChanged()
        )
        .subscribe(() => {
          const cpfValue = cpfControl.value && cpfControl.value.replace(/\D/g, '');
          if (cpfValue && cpfValue.length === 11 && cpfControl.valid) {
            this.validateCpf(cpfValue);
          }
        });
    }
  }

  /**
   * Configura validação em tempo real de Email
   */
  private setupEmailValidation(): void {
    const emailControl = this.form.get('email');
    if (emailControl) {
      emailControl.statusChanges
        .pipe(
          debounceTime(800),
          distinctUntilChanged()
        )
        .subscribe(() => {
          const emailValue = emailControl.value;
          if (emailValue && emailControl.valid) {
            this.validateEmail(emailValue);
          }
        });
    }
  }

  /**
   * Valida se CPF já existe
   */
  private validateCpf(cpf: string): void {
    this.validatingCpf = true;
    this.cpfAlreadyExists = false;

    this.studentsService.validateCpfExists(cpf).subscribe(
      (response: any) => {
        this.validatingCpf = false;
        this.cpfAlreadyExists = response.data === true;
        if (this.cpfAlreadyExists) {
          this.toastService.warning('Este CPF já está cadastrado');
        }
      },
      (error) => {
        this.validatingCpf = false;
        console.error('Erro ao validar CPF:', error);
      }
    );
  }

  /**
   * Valida se Email já existe
   */
  private validateEmail(email: string): void {
    this.validatingEmail = true;
    this.emailAlreadyExists = false;

    this.studentsService.validateEmailExists(email).subscribe(
      (response: any) => {
        this.validatingEmail = false;
        this.emailAlreadyExists = response.data === true;
        if (this.emailAlreadyExists) {
          this.toastService.warning('Este Email já está cadastrado');
        }
      },
      (error) => {
        this.validatingEmail = false;
        console.error('Erro ao validar Email:', error);
      }
    );
  }

  /**
   * Manipula o carregamento de foto
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validar tamanho máximo de 2MB
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        this.toastService.error('Foto não pode ser maior que 2MB');
        return;
      }

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
   * Retorna a URL do avatar padrão
   */
  getDefaultAvatar(): string {
    return 'https://via.placeholder.com/160?text=Foto';
  }

  /**
   * Handler para erro ao carregar a foto
   */
  onPhotoError(event: any): void {
    event.target.src = this.getDefaultAvatar();
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
   * Telefone fixo: (XX) XXXX-XXXX (10 dígitos)
   * Telefone celular: (XX) XXXXX-XXXX (11 dígitos)
   */
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    if (value.length > 0) {
      if (value.length <= 2) {
        value = `(${value}`;
      } else if (value.length <= 6) {
        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      } else if (value.length <= 10) {
        // Telefone fixo: (XX) XXXX-XXXX
        value = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
      } else {
        // Telefone celular: (XX) XXXXX-XXXX
        value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
      }
    }
    this.form.patchValue({ phone: value }, { emitEvent: false });
  }

  /**
   * Salva novo aluno
   */
  onSubmit(): void {
    // Validar se há duplicação conhecida
    if (this.cpfAlreadyExists) {
      this.toastService.error('Não é possível cadastrar: CPF já existe');
      return;
    }

    if (this.emailAlreadyExists) {
      this.toastService.error('Não é possível cadastrar: Email já existe');
      return;
    }

    if (this.form.invalid) {
      this.toastService.error('Por favor, preencha todos os campos corretamente');
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

    console.log('Enviando aluno para API:', formData);

    this.studentsService.createStudent(formData).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('✅ Aluno criado com sucesso:', response);
        this.toastService.success('Aluno cadastrado com sucesso!');
        // Aguarda um pouco para o usuário ver o toast, depois fecha
        setTimeout(() => {
          this.closeModal.emit();
        }, 1500);
      },
      (error: any) => {
        this.loading = false;
        console.error('❌ Erro ao criar aluno:', error);

        let errorMsg = 'Erro ao cadastrar aluno. Tente novamente.';

        // Tratamento específico por status HTTP
        if (error.status === 409) {
          // Conflict - duplicação
          errorMsg = (error.error && error.error.message) || 'Dados duplicados: CPF ou Email já cadastrados';
        } else if (error.status === 400) {
          // Bad Request - validação
          errorMsg = (error.error && error.error.message) || 'Dados inválidos. Verifique os campos preenchidos.';
        } else if (error.status === 500) {
          errorMsg = 'Erro no servidor. Tente novamente mais tarde.';
        }

        this.toastService.error(errorMsg);
        console.error('Mensagem de erro:', errorMsg);
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
   * Gerencia fechamento ao clicar no backdrop/fundo do modal
   * Se há dados preenchidos, pede confirmação
   */
  onBackdropClick(): void {
    if (this.form.dirty || this.hasFormData()) {
      if (confirm('Descartar alterações?')) {
        this.closeModal.emit();
      }
    } else {
      this.closeModal.emit();
    }
  }

  /**
   * Verifica se há dados preenchidos no formulário
   */
  private hasFormData(): boolean {
    const nameControl = this.form.get('name');
    const cpfControl = this.form.get('cpf');
    const emailControl = this.form.get('email');
    const phoneControl = this.form.get('phone');

    const name = nameControl && nameControl.value ? nameControl.value.trim() : '';
    const cpf = cpfControl && cpfControl.value ? cpfControl.value.trim() : '';
    const email = emailControl && emailControl.value ? emailControl.value.trim() : '';
    const phone = phoneControl && phoneControl.value ? phoneControl.value.trim() : '';

    return !!(name || cpf || email || phone || this.photoPreview);
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
    if (field.errors['invalidEmail']) {
      return 'Email inválido. Use Gmail, Outlook, Yahoo, iCloud ou outro provedor de email conhecido';
    }
    if (field.errors['fullName']) {
      return 'Nome deve ser completo (informe pelo menos nome e sobrenome)';
    }
    if (field.errors['fullNameShortWord']) {
      return 'Cada palavra do nome deve ter pelo menos 2 caracteres';
    }
    if (field.errors['fullNameNoLetters']) {
      return 'Informe um nome completo válido';
    }
    if (field.errors['invalidCPF']) {
      return 'CPF inválido';
    }
    if (field.errors['pattern']) {
      if (fieldName === 'cpf') {
        return 'CPF deve estar no formato: 000.000.000-00';
      }
      if (fieldName === 'phone') {
        return 'Telefone deve estar no formato: (00) 0000-0000 (fixo) ou (00) 00000-0000 (celular)';
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
