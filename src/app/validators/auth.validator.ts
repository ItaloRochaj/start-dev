import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Validador customizado para username e password
 * Aceita: letras (a-z, A-Z) e números (0-9)
 * Rejeita: espaços, acentos, cedilha, caracteres especiais
 */
export class AuthValidator {

  /**
   * Valida se o username contém apenas letras e números (sem acento)
   * @returns ValidatorFn - Função validadora do Angular
   */
  static alphanumericValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // Deixar Validators.required validar se está vazio
      }

      const pattern = /^[a-zA-Z0-9]+$/;
      const valid = pattern.test(control.value);

      if (!valid) {
        return {
          alphanumeric: {
            value: control.value,
            pattern: '^[a-zA-Z0-9]+$',
            message: 'Deve conter apenas letras (sem acento) e números'
          }
        };
      }

      return null;
    };
  }

  /**
   * Valida se o username tem entre 8 e 50 caracteres
   * @returns ValidatorFn - Função validadora do Angular
   */
  static usernameLengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }

      const length = control.value.length;
      if (length < 8 || length > 50) {
        return {
          usernameLength: {
            requiredLength: 8,
            maxLength: 50,
            actualLength: length,
            message: 'Username deve conter entre 8 e 50 caracteres'
          }
        };
      }

      return null;
    };
  }

  /**
   * Valida se o password tem entre 8 e 100 caracteres
   * @returns ValidatorFn - Função validadora do Angular
   */
  static passwordLengthValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }

      const length = control.value.length;
      if (length < 8 || length > 100) {
        return {
          passwordLength: {
            requiredLength: 8,
            maxLength: 100,
            actualLength: length,
            message: 'Password deve conter entre 8 e 100 caracteres'
          }
        };
      }

      return null;
    };
  }
}
