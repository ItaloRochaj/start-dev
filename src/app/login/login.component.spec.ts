import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty values', () => {
    expect(component.loginForm.get('usuario')?.value).toBe('');
    expect(component.loginForm.get('senha')?.value).toBe('');
  });

  it('should validate usuario field with less than 8 characters', () => {
    const usuarioControl = component.loginForm.get('usuario');
    usuarioControl?.setValue('user123');
    expect(usuarioControl?.invalid).toBeTruthy();
  });

  it('should validate usuario field without numbers', () => {
    const usuarioControl = component.loginForm.get('usuario');
    usuarioControl?.setValue('userabcd');
    expect(usuarioControl?.invalid).toBeTruthy();
  });

  it('should validate usuario field without letters', () => {
    const usuarioControl = component.loginForm.get('usuario');
    usuarioControl?.setValue('12345678');
    expect(usuarioControl?.invalid).toBeTruthy();
  });

  it('should accept valid usuario', () => {
    const usuarioControl = component.loginForm.get('usuario');
    usuarioControl?.setValue('usuario123');
    expect(usuarioControl?.valid).toBeTruthy();
  });

  it('should validate senha field with less than 8 characters', () => {
    const senhaControl = component.loginForm.get('senha');
    senhaControl?.setValue('pass123');
    expect(senhaControl?.invalid).toBeTruthy();
  });

  it('should validate senha field without numbers', () => {
    const senhaControl = component.loginForm.get('senha');
    senhaControl?.setValue('password');
    expect(senhaControl?.invalid).toBeTruthy();
  });

  it('should accept valid senha', () => {
    const senhaControl = component.loginForm.get('senha');
    senhaControl?.setValue('password123');
    expect(senhaControl?.valid).toBeTruthy();
  });

  it('should disable submit button when form is invalid', () => {
    expect(component.isButtonDisabled()).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    component.loginForm.patchValue({
      usuario: 'usuario123',
      senha: 'senha123456'
    });
    expect(component.isButtonDisabled()).toBeFalsy();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTruthy();
    component.togglePasswordVisibility();
    expect(component.hidePassword).toBeFalsy();
    component.togglePasswordVisibility();
    expect(component.hidePassword).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    spyOn(console, 'log');
    component.onSubmit();
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should log credentials on successful submit', () => {
    spyOn(console, 'log');
    component.loginForm.patchValue({
      usuario: 'usuario123',
      senha: 'senha123456'
    });
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('Login data:', {
      usuario: 'usuario123',
      senha: 'senha123456'
    });
  });
});
