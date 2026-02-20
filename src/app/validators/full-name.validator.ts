import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador customizado para nome completo
 * Exige:
 * - Pelo menos 2 palavras separadas por espaço
 * - Cada palavra com mínimo 2 caracteres
 * - Presença obrigatória de pelo menos uma letra (incluindo acentuadas)
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

    // Validar se contém pelo menos uma letra (a-z, A-Z, incluindo acentuadas)
    const hasLetter = /[a-zA-ZàáäâèéëêìíïîòóöôùúüûñçÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇ]/.test(name);
    if (!hasLetter) {
      return { fullNameNoLetters: { value: control.value } };
    }

    return null;
  };
}
