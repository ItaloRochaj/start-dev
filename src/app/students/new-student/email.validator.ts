import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador customizado para e-mail
 * Verifica se o e-mail contém apenas caracteres ASCII válidos
 * Rejeita acentuação (á, é, í, ó, ú, ã, õ, etc.) e cedilha (ç)
 */
export function validEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value;

    // Regex para validar email ASCII puro (sem acentos ou ç)
    // Permite apenas: letras (a-z, A-Z), números (0-9), e caracteres especiais válidos para email
    const validEmailRegex = /^[a-zA-Z0-9._@+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    // Regex para detectar acentos e cedilha
    const accentPattern = /[áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]/;

    // Verificar se contém caracteres acentuados ou cedilha
    if (accentPattern.test(email)) {
      return { 'invalidEmail': { value: control.value } };
    }

    // Verificar formato geral do email
    if (!validEmailRegex.test(email)) {
      return { 'invalidEmail': { value: control.value } };
    }

    return null;
  };
}
