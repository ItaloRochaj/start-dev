import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { AuthValidator } from '../../validators/auth.validator';

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
      usuario: [
        '',
        [
          Validators.required,
          AuthValidator.alphanumericValidator(),
          AuthValidator.usernameLengthValidator()
        ]
      ],
      senha: [
        '',
        [
          Validators.required,
          AuthValidator.alphanumericValidator(),
          AuthValidator.passwordLengthValidator()
        ]
      ]
    });
  }

  ngOnInit(): void {}

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

  /**
   * Retorna a mensagem de erro apropriada para o campo username
   */
  getUsuarioErrorMessage(): string {
    const control = this.usuario;
    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Username é obrigatório';
    }
    if (control.hasError('alphanumeric')) {
      return 'Username deve conter apenas letras (sem acento) e números';
    }
    if (control.hasError('usernameLength')) {
      return 'Username deve conter entre 8 e 50 caracteres';
    }

    return 'Username inválido';
  }

  /**
   * Retorna a mensagem de erro apropriada para o campo password
   */
  getSenhaErrorMessage(): string {
    const control = this.senha;
    if (!control || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Password é obrigatório';
    }
    if (control.hasError('alphanumeric')) {
      return 'Password deve conter apenas letras (sem acento) e números';
    }
    if (control.hasError('passwordLength')) {
      return 'Password deve conter entre 8 e 100 caracteres';
    }

    return 'Password inválido';
  }
}

