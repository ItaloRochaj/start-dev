import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador customizado para nome completo
 * Exige pelo menos 2 palavras separadas por espaço
 */
export function fullNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Deixar required validator cuidar disso
    }

    const name = control.value.trim();
    const parts = name.split(/\s+/); // Divide por espaços em branco

    // Validar se há pelo menos 2 palavras
    if (parts.length < 2) {
      return { fullName: { value: control.value } };
    }

    // Validar se cada palavra tem pelo menos 2 caracteres
    const hasShortWord = parts.some(word => word.length < 2);
    if (hasShortWord) {
      return { fullNameShortWord: { value: control.value } };
    }

    return null;
  };
}
