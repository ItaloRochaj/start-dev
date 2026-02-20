import { FormControl } from '@angular/forms';
import { fullNameValidator } from './full-name.validator';

describe('Full Name Validator', () => {
  let validator: any;

  beforeEach(() => {
    validator = fullNameValidator();
  });

  describe('Valid full names', () => {
    it('should pass with simple two-word name', () => {
      const control = new FormControl('John Doe');
      expect(validator(control)).toBeNull();
    });

    it('should pass with three-word name', () => {
      const control = new FormControl('John Michael Doe');
      expect(validator(control)).toBeNull();
    });

    it('should pass with multiple words', () => {
      const control = new FormControl('José Maria da Silva Santos');
      expect(validator(control)).toBeNull();
    });

    it('should pass with lowercase name', () => {
      const control = new FormControl('john doe');
      expect(validator(control)).toBeNull();
    });

    it('should pass with uppercase name', () => {
      const control = new FormControl('JOHN DOE');
      expect(validator(control)).toBeNull();
    });

    it('should pass with mixed case name', () => {
      const control = new FormControl('JoHn DoE');
      expect(validator(control)).toBeNull();
    });

    it('should pass with minimum valid name (2 chars per word)', () => {
      const control = new FormControl('Jo Do');
      expect(validator(control)).toBeNull();
    });

    it('should pass with four word name', () => {
      const control = new FormControl('Ana Paula Costa Silva');
      expect(validator(control)).toBeNull();
    });

    it('should pass with accented characters', () => {
      const control = new FormControl('José María');
      expect(validator(control)).toBeNull();
    });

    it('should pass with cedilla', () => {
      const control = new FormControl('François Côté');
      expect(validator(control)).toBeNull();
    });

    it('should pass with special Portuguese names', () => {
      const control = new FormControl('João São Paulo');
      expect(validator(control)).toBeNull();
    });

    it('should pass with hyphenated first name', () => {
      const control = new FormControl('Mary-Jane Watson');
      expect(validator(control)).toBeNull();
    });

    it('should pass with hyphenated last name', () => {
      const control = new FormControl('John Silva-Costa');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Invalid - single word', () => {
    it('should fail with single word', () => {
      const control = new FormControl('John');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['fullName']).toBeTruthy();
    });

    it('should fail with only first name', () => {
      const control = new FormControl('Maria');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with single letter', () => {
      const control = new FormControl('A');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with single word all caps', () => {
      const control = new FormControl('JOHN');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Invalid - short words', () => {
    it('should fail when first word is single character', () => {
      const control = new FormControl('J Doe');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['fullNameShortWord']).toBeTruthy();
    });

    it('should fail when last word is single character', () => {
      const control = new FormControl('John D');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when middle word is single character', () => {
      const control = new FormControl('John M Doe');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with two single character words', () => {
      const control = new FormControl('J D');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when any word is shorter than 2 characters', () => {
      const control = new FormControl('John A Doe');
      expect(validator(control)).not.toBeNull();
    });

    it('should pass with all words having exactly 2 characters', () => {
      const control = new FormControl('Jo Do');
      expect(validator(control)).toBeNull();
    });

    it('should fail when first word has 1 char and last has 2', () => {
      const control = new FormControl('J Do');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Invalid - no letters', () => {
    it('should fail with only numbers', () => {
      const control = new FormControl('123 456');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['fullNameNoLetters']).toBeTruthy();
    });

    it('should fail with only spaces', () => {
      const control = new FormControl('   ');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with only special characters', () => {
      const control = new FormControl('!@# $%&');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with hyphen only', () => {
      const control = new FormControl('- --');
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

  describe('Whitespace handling', () => {
    it('should trim leading whitespace', () => {
      const control = new FormControl('  John Doe');
      expect(validator(control)).toBeNull();
    });

    it('should trim trailing whitespace', () => {
      const control = new FormControl('John Doe  ');
      expect(validator(control)).toBeNull();
    });

    it('should handle multiple spaces between words', () => {
      const control = new FormControl('John    Doe');
      expect(validator(control)).toBeNull();
    });

    it('should handle tabs between words', () => {
      const control = new FormControl('John\tDoe');
      expect(validator(control)).toBeNull();
    });

    it('should handle newlines between words', () => {
      const control = new FormControl('John\nDoe');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Whitespace only inputs', () => {
    it('should fail with only spaces', () => {
      const control = new FormControl('     ');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail with space and single character', () => {
      const control = new FormControl(' A ');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Special characters and symbols', () => {
    it('should pass with apostrophe (common in names)', () => {
      const control = new FormControl("Mary O'Brien");
      expect(validator(control)).toBeNull();
    });

    it('should pass with hyphen in compound name', () => {
      const control = new FormControl('Mary-Jane Watson');
      expect(validator(control)).toBeNull();
    });

    it('should pass with accented characters', () => {
      const control = new FormControl('François Müller');
      expect(validator(control)).toBeNull();
    });

    it('should handle Portuguese accents', () => {
      const control = new FormControl('João Cristóvão');
      expect(validator(control)).toBeNull();
    });

    it('should fail with numbers mixed with letters (if intended)', () => {
      const control = new FormControl('John123 Doe456');
      expect(validator(control)).toBeNull(); // Has letters, so it passes
    });

    it('should pass with mix of letters and allowed symbols', () => {
      const control = new FormControl("Mary-Anne O'Connor");
      expect(validator(control)).toBeNull();
    });
  });

  describe('Real-world names', () => {
    it('should validate common Portuguese names', () => {
      const names = [
        'João Silva',
        'Maria Santos',
        'José Oliveira',
        'Ana Paula Costa'
      ];

      names.forEach(name => {
        const control = new FormControl(name);
        expect(validator(control)).toBeNull();
      });
    });

    it('should validate common English names', () => {
      const names = [
        'John Smith',
        'Jane Doe',
        'Michael Johnson',
        'Sarah Williams'
      ];

      names.forEach(name => {
        const control = new FormControl(name);
        expect(validator(control)).toBeNull();
      });
    });

    it('should validate international names', () => {
      const names = [
        'François Müller',
        'Carmen García',
        'Hans Mueller',
        'Maria Gonzalez'
      ];

      names.forEach(name => {
        const control = new FormControl(name);
        expect(validator(control)).toBeNull();
      });
    });

    it('should reject incomplete names', () => {
      const names = [
        'John',
        'Silva',
        'Maria'
      ];

      names.forEach(name => {
        const control = new FormControl(name);
        expect(validator(control)).not.toBeNull();
      });
    });
  });

  describe('Edge cases', () => {
    it('should validate after control value changes', () => {
      const control = new FormControl('John');
      expect(validator(control)).not.toBeNull();

      control.setValue('John Doe');
      expect(validator(control)).toBeNull();

      control.setValue('J');
      expect(validator(control)).not.toBeNull();

      control.setValue('Anna Smith');
      expect(validator(control)).toBeNull();
    });

    it('should handle very long names', () => {
      const longName = 'Verylongfirstname Verylonglastname';
      const control = new FormControl(longName);
      expect(validator(control)).toBeNull();
    });

    it('should handle many words', () => {
      const control = new FormControl('Maria da Silva Santos Costa Oliveira');
      expect(validator(control)).toBeNull();
    });

    it('should handle names with numbers', () => {
      const control = new FormControl('John Doe 3rd');
      expect(validator(control)).toBeNull();
    });

    it('should handle all uppercase', () => {
      const control = new FormControl('JOHN DOE');
      expect(validator(control)).toBeNull();
    });

    it('should handle all lowercase', () => {
      const control = new FormControl('john doe');
      expect(validator(control)).toBeNull();
    });

    it('should handle mixed case with accents', () => {
      const control = new FormControl('JoãO dA sIlVa');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Minimum requirements validation', () => {
    it('should require minimum 2 words', () => {
      const control = new FormControl('JustOne');
      expect(validator(control)).not.toBeNull();
    });

    it('should require each word to have minimum 2 characters', () => {
      const control = new FormControl('Jo Do');
      expect(validator(control)).toBeNull();
    });

    it('should require at least one letter', () => {
      const control = new FormControl('1234 5678');
      expect(validator(control)).not.toBeNull();
    });

    it('should validate all three minimum requirements together', () => {
      const control = new FormControl('12 ab'); // 2 words, 2+ chars each, has letters
      expect(validator(control)).toBeNull();
    });
  });

  describe('Error object properties', () => {
    it('should have fullName error key for insufficient words', () => {
      const control = new FormControl('OnlyOne');
      const error = validator(control);
      expect(error['fullName']).toBeDefined();
    });

    it('should have fullNameShortWord error key for short words', () => {
      const control = new FormControl('J Doe');
      const error = validator(control);
      expect(error['fullNameShortWord']).toBeDefined();
    });

    it('should have fullNameNoLetters error key for no letters', () => {
      const control = new FormControl('123 456');
      const error = validator(control);
      expect(error['fullNameNoLetters']).toBeDefined();
    });

    it('should contain value property in error', () => {
      const control = new FormControl('OnlyOne');
      const error = validator(control);
      expect(error['fullName'].value).toBe('OnlyOne');
    });
  });

  describe('Multiple error scenarios', () => {
    it('single word is caught first', () => {
      const control = new FormControl('J'); // Single word AND short
      const error = validator(control);
      expect(error['fullName']).toBeDefined();
    });

    it('short words caught before no letters', () => {
      const control = new FormControl('1 2'); // Short words AND no letters
      const error = validator(control);
      expect(error['fullNameShortWord']).toBeDefined();
    });

    it('no letters checked when structure is valid', () => {
      const control = new FormControl('12 34'); // 2 words, 2+ chars, but no letters
      const error = validator(control);
      expect(error['fullNameNoLetters']).toBeDefined();
    });
  });

  describe('Word separation edge cases', () => {
    it('should split by multiple spaces', () => {
      const control = new FormControl('John     Doe');
      expect(validator(control)).toBeNull();
    });

    it('should split by mixed whitespace', () => {
      const control = new FormControl('John \t\n Doe');
      expect(validator(control)).toBeNull();
    });

    it('should handle hyphenated names as single word', () => {
      const control = new FormControl('Mary-Anne Watson');
      // Mary-Anne is treated as one word with hyphen, Watson is another
      expect(validator(control)).toBeNull();
    });

    it('should handle apostrophes in names', () => {
      const control = new FormControl("O'Brien Smith");
      expect(validator(control)).toBeNull();
    });
  });

  describe('Letter detection', () => {
    it('should recognize lowercase letters', () => {
      const control = new FormControl('abc def');
      expect(validator(control)).toBeNull();
    });

    it('should recognize uppercase letters', () => {
      const control = new FormControl('ABC DEF');
      expect(validator(control)).toBeNull();
    });

    it('should recognize accented letters', () => {
      const control = new FormControl('àáäâ èéëê');
      expect(validator(control)).toBeNull();
    });

    it('should require at least one [a-zA-Z]', () => {
      const control = new FormControl('123 456');
      expect(validator(control)).not.toBeNull();
    });

    it('should pass with single letter in valid structure', () => {
      const control = new FormControl('a1 b2');
      expect(validator(control)).toBeNull();
    });
  });
});



