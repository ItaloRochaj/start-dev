import { FormControl } from '@angular/forms';
import { validEmailValidator } from './email.validator';

describe('Email Validator', () => {
  let validator: any;

  beforeEach(() => {
    validator = validEmailValidator();
  });

  describe('Valid emails with known domains', () => {
    it('should pass with valid gmail email', () => {
      const control = new FormControl('user@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid outlook email', () => {
      const control = new FormControl('user@outlook.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid hotmail email', () => {
      const control = new FormControl('user@hotmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid yahoo email', () => {
      const control = new FormControl('user@yahoo.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid icloud email', () => {
      const control = new FormControl('user@icloud.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid protonmail email', () => {
      const control = new FormControl('user@protonmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid tutanota email', () => {
      const control = new FormControl('user@tutanota.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid zoho email', () => {
      const control = new FormControl('user@zoho.com');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Valid email formats', () => {
    it('should pass with lowercase email', () => {
      const control = new FormControl('user@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with uppercase email (converted to lowercase)', () => {
      const control = new FormControl('USER@GMAIL.COM');
      expect(validator(control)).toBeNull();
    });

    it('should pass with mixed case email', () => {
      const control = new FormControl('User@Gmail.Com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with numbers in local part', () => {
      const control = new FormControl('user123@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with dot in local part', () => {
      const control = new FormControl('user.name@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with plus in local part', () => {
      const control = new FormControl('user+tag@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with hyphen in local part', () => {
      const control = new FormControl('user-name@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with underscore in local part', () => {
      const control = new FormControl('user_name@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with multiple dots in local part', () => {
      const control = new FormControl('first.middle.last@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with single character local part', () => {
      const control = new FormControl('a@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should pass with many characters in local part', () => {
      const control = new FormControl('verylongemailaddressname@gmail.com');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Accented characters rejection', () => {
    it('should fail with accented a', () => {
      const control = new FormControl('usér@gmail.com');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['invalidEmail']).toBeTruthy();
    });

    it('should fail with accented e', () => {
      const control = new FormControl('usér@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with accented i', () => {
      const control = new FormControl('usí@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with accented o', () => {
      const control = new FormControl('usó@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with accented u', () => {
      const control = new FormControl('usú@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with tilde a', () => {
      const control = new FormControl('usã@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with tilde o', () => {
      const control = new FormControl('usõ@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with cedilla', () => {
      const control = new FormControl('uçer@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with accent in uppercase', () => {
      const control = new FormControl('USÉR@GMAIL.COM');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with multiple accented characters', () => {
      const control = new FormControl('usér.nàmé@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with grave accent', () => {
      const control = new FormControl('usè@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with circumflex', () => {
      const control = new FormControl('usê@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with diaeresis', () => {
      const control = new FormControl('usë@gmail.com');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Invalid email format', () => {
    it('should fail without @ symbol', () => {
      const control = new FormControl('usergmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with multiple @ symbols', () => {
      const control = new FormControl('user@mail@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with @ at beginning', () => {
      const control = new FormControl('@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with @ at end', () => {
      const control = new FormControl('user@');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail without domain name', () => {
      const control = new FormControl('user@.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail without TLD', () => {
      const control = new FormControl('user@gmail');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with space in email', () => {
      const control = new FormControl('user @gmail.com');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Unknown domain rejection', () => {
    it('should fail with unknown domain', () => {
      const control = new FormControl('user@unknownmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with invalid TLD', () => {
      const control = new FormControl('user@gmail.invalid');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with numeric domain', () => {
      const control = new FormControl('user@123.456');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with local company domain', () => {
      const control = new FormControl('user@company.local');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with localhost', () => {
      const control = new FormControl('user@localhost.localdomain');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with IP address format', () => {
      const control = new FormControl('user@192.168.1.1');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Empty and null values', () => {
    it('should pass with empty string', () => {
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should pass with null value', () => {
      const control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });

    it('should pass with undefined value', () => {
      const control = new FormControl(undefined);
      expect(validator(control)).toBeNull();
    });
  });

  describe('Case insensitivity', () => {
    it('should handle uppercase domain', () => {
      const control = new FormControl('user@GMAIL.COM');
      expect(validator(control)).toBeNull();
    });

    it('should handle mixed case domain', () => {
      const control = new FormControl('user@GmAiL.cOm');
      expect(validator(control)).toBeNull();
    });

    it('should normalize to lowercase internally', () => {
      const control1 = new FormControl('USER@GMAIL.COM');
      const control2 = new FormControl('user@gmail.com');
      expect(validator(control1)).toEqual(validator(control2));
    });
  });

  describe('Special characters in local part', () => {
    it('should pass with allowed special characters', () => {
      const validChars = ['.', '+', '-', '_'];
      validChars.forEach(char => {
        const control = new FormControl(`user${char}name@gmail.com`);
        expect(validator(control)).toBeNull();
      });
    });

    it('should fail with invalid special characters', () => {
      const invalidChars = ['!', '#', '$', '%', '^', '&', '*', '(', ')', '=', '[', ']', '{', '}', '|', '\\', '/', '?', '~', '`'];
      invalidChars.forEach(char => {
        const control = new FormControl(`user${char}name@gmail.com`);
        expect(validator(control)).not.toBeNull();
      });
    });

    it('should fail with comma', () => {
      const control = new FormControl('user,name@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with semicolon', () => {
      const control = new FormControl('user;name@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with colon', () => {
      const control = new FormControl('user:name@gmail.com');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Whitespace handling', () => {
    it('should trim leading whitespace', () => {
      const control = new FormControl('  user@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should trim trailing whitespace', () => {
      const control = new FormControl('user@gmail.com  ');
      expect(validator(control)).toBeNull();
    });

    it('should fail with space in local part', () => {
      const control = new FormControl('user name@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with space before @', () => {
      const control = new FormControl('user @gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with space after @', () => {
      const control = new FormControl('user@ gmail.com');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should validate after control value changes', () => {
      const control = new FormControl('invalid');
      expect(validator(control)).not.toBeNull();

      control.setValue('user@gmail.com');
      expect(validator(control)).toBeNull();

      control.setValue('usér@gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should handle very long email address', () => {
      const longEmail = 'verylongusernamewithmanycharacters@gmail.com';
      const control = new FormControl(longEmail);
      expect(validator(control)).toBeNull();
    });

    it('should handle subdomain', () => {
      // Note: validator only accepts simple domains, not subdomains
      const control = new FormControl('user@mail.gmail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should be case sensitive for error comparison', () => {
      const control1 = new FormControl('user@GMAIL.COM');
      const control2 = new FormControl('user@gmail.com');
      // Both should pass since they normalize to lowercase
      expect(validator(control1)).toBeNull();
      expect(validator(control2)).toBeNull();
    });
  });

  describe('Real-world scenarios', () => {
    it('should validate user registration email', () => {
      const emails = [
        'john.doe@gmail.com',
        'jane.smith@outlook.com',
        'bob@yahoo.com'
      ];

      emails.forEach(email => {
        const control = new FormControl(email);
        expect(validator(control)).toBeNull();
      });
    });

    it('should reject corporate email', () => {
      const control = new FormControl('user@company.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should validate common email providers', () => {
      const validEmails = [
        'user@gmail.com',
        'user@hotmail.com',
        'user@yahoo.com',
        'user@outlook.com',
        'user@icloud.com'
      ];

      validEmails.forEach(email => {
        const control = new FormControl(email);
        expect(validator(control)).toBeNull();
      });
    });

    it('should reject email with accented domain name', () => {
      const control = new FormControl('user@gménail.com');
      expect(validator(control)).not.toBeNull();
    });

    it('should reject email with numbers in domain', () => {
      const control = new FormControl('user@gm4il.com');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Error object properties', () => {
    it('should return error with value property', () => {
      const control = new FormControl('invalid@unknown.com');
      const error = validator(control);
      expect(error['invalidEmail'].value).toBe('invalid@unknown.com');
    });

    it('should have invalidEmail key', () => {
      const control = new FormControl('invalid@unknown.com');
      const error = validator(control);
      expect(error['invalidEmail']).toBeDefined();
    });
  });

  describe('Known email domains from validator', () => {
    // Test some of the known domains
    const knownDomains = [
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
      'fastmail.com'
    ];

    knownDomains.forEach(domain => {
      it(`should accept email with domain ${domain}`, () => {
        const control = new FormControl(`user@${domain}`);
        expect(validator(control)).toBeNull();
      });
    });
  });

  describe('Domain extraction', () => {
    it('should correctly extract domain from email', () => {
      const control = new FormControl('user@gmail.com');
      expect(validator(control)).toBeNull();
    });

    it('should handle domain with multiple characters', () => {
      const control = new FormControl('user@mailbox.org');
      expect(validator(control)).toBeNull();
    });

    it('should validate correct domain regardless of local part', () => {
      const control1 = new FormControl('a@gmail.com');
      const control2 = new FormControl('verylongname@gmail.com');
      expect(validator(control1)).toBeNull();
      expect(validator(control2)).toBeNull();
    });
  });
});



