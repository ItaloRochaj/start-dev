import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador customizado para e-mail
 * Verifica se o e-mail contém apenas caracteres ASCII válidos
 * Rejeita acentuação (á, é, í, ó, ú, ã, õ, etc.) e cedilha (ç)
 * Valida apenas domínios de email conhecidos e confiáveis
 */
export function validEmailValidator(): ValidatorFn {
  // Lista de domínios de email conhecidos e confiáveis
  const validEmailDomains = [
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'icloud.com',
    'mail.com',
    'protonmail.com',
    'tutanota.com',
    'zoho.com',
    'mailbox.org',
    'fastmail.com',
    'yandex.com',
    'aol.com',
    'mail.ru',
    'gmx.com',
    'gmx.net',
    'gmx.de',
    'web.de',
    'vodafone.it',
    'libero.it',
    'alice.it',
    'tim.it',
    'virgilio.it',
    'tiscali.it',
    'freenet.de',
    't-online.de',
    'arcor.de',
    'wanadoo.de',
    'alice.de',
    'verizon.net',
    'comcast.net',
    'charter.net',
    'cox.net',
    'bellsouth.net',
    'earthlink.net',
    'sbcglobal.net',
    'att.net',
    'frontier.com',
    'windstream.net',
    '1and1.com'
  ];

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value.trim().toLowerCase();

    // Regex para detectar acentos e cedilha
    const accentPattern = /[áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]/;

    // Verificar se contém caracteres acentuados ou cedilha
    if (accentPattern.test(email)) {
      return { 'invalidEmail': { value: control.value } };
    }

    // Regex para validar email ASCII puro (sem acentos ou ç)
    // Permite apenas: letras (a-z, A-Z), números (0-9), e caracteres especiais válidos para email
    const validEmailRegex = /^[a-zA-Z0-9._@+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    // Verificar formato geral do email
    if (!validEmailRegex.test(email)) {
      return { 'invalidEmail': { value: control.value } };
    }

    // Extrair domínio do email
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return { 'invalidEmail': { value: control.value } };
    }

    const domain = emailParts[1];

    // Verificar se o domínio está na lista de provedores válidos
    if (!validEmailDomains.includes(domain)) {
      return { 'invalidEmail': { value: control.value } };
    }

    return null;
  };
}
