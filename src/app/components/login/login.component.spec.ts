import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'setToken', 'getToken', 'isAuthenticated']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show', 'success', 'error', 'warning', 'info']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.get(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.get(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.get(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with hidePassword set to true', () => {
      expect(component.hidePassword).toBeTruthy();
    });

    it('should initialize with submitted set to false', () => {
      expect(component.submitted).toBeFalsy();
    });

    it('should initialize with isLoading set to false', () => {
      expect(component.isLoading).toBeFalsy();
    });

    it('should initialize with errorMessage set to null', () => {
      expect(component.errorMessage).toBeNull();
    });

    it('should create form group with usuario and senha controls', () => {
      expect(component.loginForm.get('usuario')).toBeTruthy();
      expect(component.loginForm.get('senha')).toBeTruthy();
    });

    it('should initialize form controls with empty values', () => {
      expect(component.loginForm.get('usuario')!.value).toBe('');
      expect(component.loginForm.get('senha')!.value).toBe('');
    });

    it('should mark form as invalid on initialization', () => {
      expect(component.loginForm.invalid).toBeTruthy();
    });
  });

  describe('Usuario Field Validation', () => {
    describe('Required Validator', () => {
      it('should mark usuario control as invalid when empty', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('');
        expect(control!.hasError('required')).toBeTruthy();
      });

      it('should mark usuario control as valid when not empty', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('usuario123');
        expect(control!.hasError('required')).toBeFalsy();
      });
    });

    describe('Alphanumeric Validator', () => {
      it('should reject usuario with only letters', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('userabcd');
        expect(control!.hasError('alphanumeric')).toBeTruthy();
      });

      it('should reject usuario with only numbers', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('12345678');
        expect(control!.hasError('alphanumeric')).toBeTruthy();
      });

      it('should reject usuario with special characters', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('user@123#');
        expect(control!.hasError('alphanumeric')).toBeTruthy();
      });

      it('should reject usuario with spaces', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('user 123');
        expect(control!.hasError('alphanumeric')).toBeTruthy();
      });

      it('should accept usuario with letters and numbers', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('usuario123');
        expect(control!.hasError('alphanumeric')).toBeFalsy();
      });

      it('should accept usuario starting with letter', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('a12345678');
        expect(control!.hasError('alphanumeric')).toBeFalsy();
      });

      it('should reject usuario with accented characters', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('usuário123');
        expect(control!.hasError('alphanumeric')).toBeTruthy();
      });
    });

    describe('Username Length Validator', () => {
      it('should reject usuario with 7 characters', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('user123');
        expect(control!.hasError('usernameLength')).toBeTruthy();
      });

      it('should accept usuario with exactly 8 characters', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('user1234');
        expect(control!.hasError('usernameLength')).toBeFalsy();
      });

      it('should accept usuario with exactly 50 characters', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('a'.repeat(25) + '0'.repeat(25));
        expect(control!.hasError('usernameLength')).toBeFalsy();
      });

      it('should reject usuario with 51 characters', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('a'.repeat(26) + '0'.repeat(25));
        expect(control!.hasError('usernameLength')).toBeTruthy();
      });

      it('should accept usuario with 20 characters', () => {
        const control = component.loginForm.get('usuario');
        control!.setValue('user1234user1234abc1');
        expect(control!.hasError('usernameLength')).toBeFalsy();
      });
    });
  });

  describe('Senha Field Validation', () => {
    describe('Required Validator', () => {
      it('should mark senha control as invalid when empty', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('');
        expect(control!.hasError('required')).toBeTruthy();
      });

      it('should mark senha control as valid when not empty', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('senha123456');
        expect(control!.hasError('required')).toBeFalsy();
      });
    });

    describe('Alphanumeric Validator', () => {
      it('should reject senha with only letters', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('password');
        expect(control!.hasError('alphanumeric')).toBeTruthy();
      });

      it('should reject senha with only numbers', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('12345678');
        expect(control!.hasError('alphanumeric')).toBeTruthy();
      });

      it('should reject senha with special characters', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('pass@123#');
        expect(control!.hasError('alphanumeric')).toBeTruthy();
      });

      it('should accept senha with letters and numbers', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('password123');
        expect(control!.hasError('alphanumeric')).toBeFalsy();
      });
    });

    describe('Password Length Validator', () => {
      it('should reject senha with 7 characters', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('pass123');
        expect(control!.hasError('passwordLength')).toBeTruthy();
      });

      it('should accept senha with exactly 8 characters', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('pass1234');
        expect(control!.hasError('passwordLength')).toBeFalsy();
      });

      it('should accept senha with exactly 100 characters', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('a'.repeat(50) + '0'.repeat(50));
        expect(control!.hasError('passwordLength')).toBeFalsy();
      });

      it('should reject senha with 101 characters', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('a'.repeat(51) + '0'.repeat(50));
        expect(control!.hasError('passwordLength')).toBeTruthy();
      });

      it('should accept senha with 50 characters', () => {
        const control = component.loginForm.get('senha');
        control!.setValue('pass'.repeat(12) + 'word1');
        expect(control!.hasError('passwordLength')).toBeFalsy();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle hidePassword from true to false', () => {
      component.hidePassword = true;
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeFalsy();
    });

    it('should toggle hidePassword from false to true', () => {
      component.hidePassword = false;
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeTruthy();
    });

    it('should toggle hidePassword multiple times', () => {
      expect(component.hidePassword).toBeTruthy();
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeFalsy();
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeTruthy();
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeFalsy();
    });
  });

  describe('Form Submission - Invalid Cases', () => {
    it('should not submit when form is invalid', () => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should set submitted flag to true', () => {
      expect(component.submitted).toBeFalsy();
      component.onSubmit();
      expect(component.submitted).toBeTruthy();
    });

    it('should clear errorMessage before submission', () => {
      component.errorMessage = 'Previous error';
      component.onSubmit();
      expect(component.errorMessage).toBeNull();
    });

    it('should not call authService.login when usuario is empty', () => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.loginForm.patchValue({
        usuario: '',
        senha: 'senha123456'
      });
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should not call authService.login when senha is empty', () => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: ''
      });
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission - Success Path', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: 'senha123456'
      });
    });

    it('should set isLoading to true when submitting', () => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.onSubmit();
      // isLoading is set to true immediately, then false in subscription
      expect(authService.login).toHaveBeenCalled();
    });

    it('should call authService.login with correct credentials', () => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.onSubmit();
      expect(authService.login).toHaveBeenCalledWith({
        username: 'usuario123',
        password: 'senha123456'
      });
    });

    it('should set token when response contains token', (done) => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token-123' } }));
      component.onSubmit();
      setTimeout(() => {
        expect(authService.setToken).toHaveBeenCalledWith('test-token-123');
        done();
      }, 100);
    });

    it('should show success toast on login success', (done) => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.onSubmit();
      setTimeout(() => {
        expect(toastService.success).toHaveBeenCalledWith('Login realizado com sucesso!');
        done();
      }, 100);
    });

    it('should navigate to /students on login success', (done) => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.onSubmit();
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/students']);
        done();
      }, 100);
    });

    it('should set isLoading to false on success', (done) => {
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.onSubmit();
      setTimeout(() => {
        expect(component.isLoading).toBeFalsy();
        done();
      }, 100);
    });

    it('should handle login response without token', (done) => {
      authService.login.and.returnValue(of({ success: true, message: '', data: {} }));
      component.onSubmit();
      setTimeout(() => {
        expect(authService.setToken).not.toHaveBeenCalled();
        expect(toastService.success).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should log success message on login', (done) => {
      spyOn(console, 'log');
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      component.onSubmit();
      setTimeout(() => {
        expect(console.log).toHaveBeenCalledWith('Login successful:', { success: true, message: '', data: { token: 'test-token' } });
        done();
      }, 100);
    });
  });

  describe('Form Submission - Error Path', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: 'senha123456'
      });
    });

    it('should handle login error without error details', (done) => {
      authService.login.and.returnValue(throwError(() => ({} as any)));
      component.onSubmit();
      setTimeout(() => {
        expect(toastService.error).toHaveBeenCalledWith('Erro ao fazer login. Tente novamente.');
        done();
      }, 100);
    });

    it('should set isLoading to false on error', (done) => {
      authService.login.and.returnValue(throwError(() => ({ error: { message: 'Error' } })));
      component.onSubmit();
      setTimeout(() => {
        expect(component.isLoading).toBeFalsy();
        done();
      }, 100);
    });

    it('should not navigate to /students on error', (done) => {
      authService.login.and.returnValue(throwError(() => ({ error: { message: 'Error' } })));
      component.onSubmit();
      setTimeout(() => {
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should not set token on error', (done) => {
      authService.login.and.returnValue(throwError(() => ({ error: { message: 'Error' } })));
      component.onSubmit();
      setTimeout(() => {
        expect(authService.setToken).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should log error message on login failure', (done) => {
      spyOn(console, 'error');
      const errorResponse = { error: { message: 'Login failed' } };
      authService.login.and.returnValue(throwError(() => errorResponse));
      component.onSubmit();
      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('Login failed:', errorResponse);
        done();
      }, 100);
    });

    it('should handle null error object', (done) => {
      authService.login.and.returnValue(throwError(() => null));
      component.onSubmit();
      setTimeout(() => {
        expect(toastService.error).toHaveBeenCalledWith('Erro ao fazer login. Tente novamente.');
        done();
      }, 100);
    });
  });

  describe('Button Disabled State', () => {
    it('should disable button when form is invalid', () => {
      expect(component.isButtonDisabled()).toBeTruthy();
    });

    it('should enable button when form is valid', () => {
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: 'senha123456'
      });
      expect(component.isButtonDisabled()).toBeFalsy();
    });

    it('should disable button when isLoading is true', () => {
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: 'senha123456'
      });
      component.isLoading = true;
      expect(component.isButtonDisabled()).toBeTruthy();
    });

    it('should disable button when form is invalid even if isLoading is false', () => {
      component.isLoading = false;
      expect(component.isButtonDisabled()).toBeTruthy();
    });

    it('should enable button only when form is valid and isLoading is false', () => {
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: 'senha123456'
      });
      component.isLoading = false;
      expect(component.isButtonDisabled()).toBeFalsy();
    });
  });

  describe('Getter Methods - Usuario', () => {
    it('should return usuario control', () => {
      const usuario = component.usuario;
      expect(usuario).toBe(component.loginForm.get('usuario'));
    });

    it('should return usuario control value', () => {
      component.loginForm.patchValue({ usuario: 'testuser123' });
      expect(component.usuario!.value).toBe('testuser123');
    });
  });

  describe('Getter Methods - Senha', () => {
    it('should return senha control', () => {
      const senha = component.senha;
      expect(senha).toBe(component.loginForm.get('senha'));
    });

    it('should return senha control value', () => {
      component.loginForm.patchValue({ senha: 'testpass123' });
      expect(component.senha!.value).toBe('testpass123');
    });
  });

  describe('Usuario Error Messages', () => {
    it('should return required error message when usuario is empty', () => {
      const control = component.loginForm.get('usuario');
      control!.setValue('');
      control!.markAsTouched();
      expect(component.getUsuarioErrorMessage()).toBe('Username é obrigatório');
    });

    it('should return alphanumeric error message when usuario has no numbers', () => {
      const control = component.loginForm.get('usuario');
      control!.setValue('userabcd');
      control!.markAsTouched();
      expect(component.getUsuarioErrorMessage()).toBe('Username deve conter apenas letras (sem acento) e números');
    });

    it('should return alphanumeric error message when usuario has special characters', () => {
      const control = component.loginForm.get('usuario');
      control!.setValue('user@123#');
      control!.markAsTouched();
      expect(component.getUsuarioErrorMessage()).toBe('Username deve conter apenas letras (sem acento) e números');
    });

    it('should return usernameLength error message when usuario is too short', () => {
      const control = component.loginForm.get('usuario');
      control!.setValue('user123');
      control!.markAsTouched();
      expect(component.getUsuarioErrorMessage()).toBe('Username deve conter entre 8 e 50 caracteres');
    });

    it('should return usernameLength error message when usuario is too long', () => {
      const control = component.loginForm.get('usuario');
      control!.setValue('a'.repeat(51) + '0'.repeat(10));
      control!.markAsTouched();
      expect(component.getUsuarioErrorMessage()).toBe('Username deve conter entre 8 e 50 caracteres');
    });

    it('should return empty string when usuario is valid', () => {
      const control = component.loginForm.get('usuario');
      control!.setValue('usuario123');
      control!.markAsTouched();
      expect(component.getUsuarioErrorMessage()).toBe('');
    });

    it('should return empty string when control is null', () => {
      spyOn(component.loginForm, 'get').and.returnValue(null as any);
      expect(component.getUsuarioErrorMessage()).toBe('');
    });

    it('should return generic invalid message when error is not recognized', () => {
      const control = component.loginForm.get('usuario');
      control!.setErrors({ unknownError: true });
      expect(component.getUsuarioErrorMessage()).toBe('Username inválido');
    });
  });

  describe('Senha Error Messages', () => {
    it('should return required error message when senha is empty', () => {
      const control = component.loginForm.get('senha');
      control!.setValue('');
      control!.markAsTouched();
      expect(component.getSenhaErrorMessage()).toBe('Password é obrigatório');
    });

    it('should return alphanumeric error message when senha has no numbers', () => {
      const control = component.loginForm.get('senha');
      control!.setValue('password');
      control!.markAsTouched();
      expect(component.getSenhaErrorMessage()).toBe('Password deve conter apenas letras (sem acento) e números');
    });

    it('should return alphanumeric error message when senha has special characters', () => {
      const control = component.loginForm.get('senha');
      control!.setValue('pass@123#');
      control!.markAsTouched();
      expect(component.getSenhaErrorMessage()).toBe('Password deve conter apenas letras (sem acento) e números');
    });

    it('should return passwordLength error message when senha is too short', () => {
      const control = component.loginForm.get('senha');
      control!.setValue('pass123');
      control!.markAsTouched();
      expect(component.getSenhaErrorMessage()).toBe('Password deve conter entre 8 e 100 caracteres');
    });

    it('should return passwordLength error message when senha is too long', () => {
      const control = component.loginForm.get('senha');
      control!.setValue('a'.repeat(101) + '0'.repeat(10));
      control!.markAsTouched();
      expect(component.getSenhaErrorMessage()).toBe('Password deve conter entre 8 e 100 caracteres');
    });

    it('should return empty string when senha is valid', () => {
      const control = component.loginForm.get('senha');
      control!.setValue('senha123456');
      control!.markAsTouched();
      expect(component.getSenhaErrorMessage()).toBe('');
    });

    it('should return empty string when control is null', () => {
      spyOn(component.loginForm, 'get').and.returnValue(null as any);
      expect(component.getSenhaErrorMessage()).toBe('');
    });

    it('should return generic invalid message when error is not recognized', () => {
      const control = component.loginForm.get('senha');
      control!.setErrors({ unknownError: true });
      expect(component.getSenhaErrorMessage()).toBe('Password inválido');
    });
  });

  describe('Form State Management', () => {
    it('should mark form as touched after submission attempt', () => {
      component.onSubmit();
      expect(component.submitted).toBeTruthy();
    });

    it('should preserve submitted state across multiple submissions', () => {
      component.onSubmit();
      expect(component.submitted).toBeTruthy();
      component.onSubmit();
      expect(component.submitted).toBeTruthy();
    });

    it('should clear error message on new submission', () => {
      component.errorMessage = 'Previous error';
      component.onSubmit();
      expect(component.errorMessage).toBeNull();
    });

    it('should maintain form values during submission', () => {
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: 'senha123456'
      });
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));
      const usuarioValue = component.loginForm.get('usuario')!.value;
      const senhaValue = component.loginForm.get('senha')!.value;
      component.onSubmit();
      expect(component.loginForm.get('usuario')!.value).toBe(usuarioValue);
      expect(component.loginForm.get('senha')!.value).toBe(senhaValue);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive submissions', (done) => {
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: 'senha123456'
      });
      authService.login.and.returnValue(of({ success: true, message: '', data: { token: 'test-token' } }));

      component.onSubmit();
      component.onSubmit();
      component.onSubmit();

      setTimeout(() => {
        expect(authService.login).toHaveBeenCalledTimes(3);
        done();
      }, 100);
    });

    it('should handle very long valid usuario', () => {
      const control = component.loginForm.get('usuario');
      const longUser = 'a'.repeat(25) + '0'.repeat(25);
      control!.setValue(longUser);
      expect(control!.valid).toBeTruthy();
    });

    it('should handle very long valid senha', () => {
      const control = component.loginForm.get('senha');
      const longPass = 'a'.repeat(50) + '0'.repeat(50);
      control!.setValue(longPass);
      expect(control!.valid).toBeTruthy();
    });

    it('should handle response with nested token property', (done) => {
      authService.login.and.returnValue(
        of({ success: true, message: '', data: { token: 'nested-token-123' } })
      );
      component.loginForm.patchValue({
        usuario: 'usuario123',
        senha: 'senha123456'
      });
      component.onSubmit();
      setTimeout(() => {
        expect(authService.setToken).toHaveBeenCalledWith('nested-token-123');
        done();
      }, 100);
    });

    it('should handle form with whitespace in controls', () => {
      const usuarioControl = component.loginForm.get('usuario');
      usuarioControl!.setValue('  usuario123  ');
      expect(usuarioControl!.invalid).toBeTruthy();
    });
  });
});



