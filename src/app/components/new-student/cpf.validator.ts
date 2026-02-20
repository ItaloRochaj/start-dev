import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador customizado para CPF
 * Valida se o CPF é válido usando o algoritmo de dígitos verificadores
 */
export function validCPFValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Deixar required validator cuidar disso
    }

    const cpf = control.value.replace(/\D/g, '');

    // Validar comprimento
    if (cpf.length !== 11) {
      return { invalidCPF: { value: control.value } };
    }

    // Validar se não é sequência repetida (000.000.000-00, 111.111.111-11, etc)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { invalidCPF: { value: control.value } };
    }

    // Validar dígitos verificadores
    if (!isValidCPF(cpf)) {
      return { invalidCPF: { value: control.value } };
    }

    return null;
  };
}

/**
 * Valida o CPF usando o algoritmo de dígitos verificadores
 */
function isValidCPF(cpf: string): boolean {
  // Extrair dígitos verificadores
  const digit1 = parseInt(cpf.charAt(9), 10);
  const digit2 = parseInt(cpf.charAt(10), 10);

  // Calcular primeiro dígito verificador
  const calculated1 = calculateFirstDigit(cpf);
  if (calculated1 !== digit1) {
    return false;
  }

  // Calcular segundo dígito verificador
  const calculated2 = calculateSecondDigit(cpf);
  if (calculated2 !== digit2) {
    return false;
  }

  return true;
}

/**
 * Calcula o primeiro dígito verificador
 * Multiplica cada um dos 9 primeiros dígitos por 10, 9, 8, ..., 2
 */
function calculateFirstDigit(cpf: string): number {
  let sum = 0;
  let multiplier = 10;

  for (let i = 0; i < 9; i++) {
    const digit = parseInt(cpf.charAt(i), 10);
    sum += digit * multiplier;
    multiplier--;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Calcula o segundo dígito verificador
 * Multiplica cada um dos 10 primeiros dígitos por 11, 10, 9, ..., 2
 */
function calculateSecondDigit(cpf: string): number {
  let sum = 0;
  let multiplier = 11;

  for (let i = 0; i < 10; i++) {
    const digit = parseInt(cpf.charAt(i), 10);
    sum += digit * multiplier;
    multiplier--;
  }

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}
