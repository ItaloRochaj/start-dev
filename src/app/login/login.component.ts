import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  submitted = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      usuario: ['', [Validators.required, this.usuarioValidator.bind(this)]],
      senha: ['', [Validators.required, this.senhaValidator.bind(this)]]
    });
  }

  ngOnInit(): void {}

  /**
   * Validador customizado para campo Usuário
   * Regra: Mínimo 8 caracteres, incluindo letras e números
   */
  usuarioValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const value = control.value;
    const hasMinLength = value.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);

    const valid = hasMinLength && hasLetters && hasNumbers;
    return valid ? null : { usuarioInvalido: true };
  }

  /**
   * Validador customizado para campo Senha
   * Regra: Mínimo 8 caracteres, incluindo letras e números
   */
  senhaValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const value = control.value;
    const hasMinLength = value.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);

    const valid = hasMinLength && hasLetters && hasNumbers;
    return valid ? null : { senhaInvalida: true };
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.loginForm.valid) {
      this.isLoading = true;

      const usuarioControl = this.loginForm.get('usuario');
      const senhaControl = this.loginForm.get('senha');
      const credentials = {
        username: usuarioControl ? usuarioControl.value : '',
        password: senhaControl ? senhaControl.value : ''
      };

      this.authService.login(credentials).subscribe(
        (response) => {
          this.isLoading = false;
          console.log('Login successful:', response);

          // Armazenar token se fornecido
          if (response.data && response.data.token) {
            this.authService.setToken(response.data.token);
          }

          this.toastService.success('Login realizado com sucesso!');

          // Redirecionar para página de estudantes
          this.router.navigate(['/students']);
        },
        (error) => {
          this.isLoading = false;
          console.error('Login failed:', error);
          const errorMsg = error && error.error && error.error.message ? error.error.message : 'Erro ao fazer login. Tente novamente.';
          this.toastService.error(errorMsg);
        }
      );
    }
  }

  get usuario() {
    return this.loginForm.get('usuario');
  }

  get senha() {
    return this.loginForm.get('senha');
  }

  isButtonDisabled(): boolean {
    return this.loginForm.invalid || this.isLoading;
  }
}

