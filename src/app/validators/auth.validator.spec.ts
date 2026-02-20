import { FormControl } from '@angular/forms';
import { AuthValidator } from './auth.validator';

describe('AuthValidator', () => {
  describe('alphanumericValidator', () => {
    let validator: any;

    beforeEach(() => {
      validator = AuthValidator.alphanumericValidator();
    });

    it('should pass when value contains letters and numbers', () => {
      const control = new FormControl('Test123');
      expect(validator(control)).toBeNull();
    });

    it('should pass with lowercase letters and numbers', () => {
      const control = new FormControl('test123');
      expect(validator(control)).toBeNull();
    });

    it('should pass with uppercase letters and numbers', () => {
      const control = new FormControl('TEST123');
      expect(validator(control)).toBeNull();
    });

    it('should pass with mixed case letters and numbers', () => {
      const control = new FormControl('TeSt123');
      expect(validator(control)).toBeNull();
    });

    it('should fail when value contains only letters', () => {
      const control = new FormControl('testonly');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['alphanumeric']).toBeTruthy();
    });

    it('should fail when value contains only numbers', () => {
      const control = new FormControl('123456789');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['alphanumeric']).toBeTruthy();
    });

    it('should fail when value is empty string', () => {
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should fail when value is null', () => {
      const control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });

    it('should fail when value contains spaces', () => {
      const control = new FormControl('test 123');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when value contains special characters', () => {
      const control = new FormControl('test@123');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when value contains accents', () => {
      const control = new FormControl('tëst123');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when value contains cedilla', () => {
      const control = new FormControl('teçt123');
      expect(validator(control)).not.toBeNull();
    });

    it('should pass with exactly one letter and one number', () => {
      const control = new FormControl('a1');
      expect(validator(control)).toBeNull();
    });

    it('should pass with many letters and numbers', () => {
      const control = new FormControl('abcdefghijklmnopqrstuvwxyz0123456789');
      expect(validator(control)).toBeNull();
    });

    it('should fail when value contains hyphen', () => {
      const control = new FormControl('test-123');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when value contains underscore', () => {
      const control = new FormControl('test_123');
      expect(validator(control)).not.toBeNull();
    });

    it('should return error object with details', () => {
      const control = new FormControl('onlyletters');
      const error = validator(control);
      expect(error['alphanumeric'].value).toBe('onlyletters');
      expect(error['alphanumeric'].pattern).toBeTruthy();
      expect(error['alphanumeric'].message).toBeTruthy();
    });

    it('should fail when value contains dot', () => {
      const control = new FormControl('test.123');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('usernameLengthValidator', () => {
    let validator: any;

    beforeEach(() => {
      validator = AuthValidator.usernameLengthValidator();
    });

    it('should pass when username has 8 characters (minimum)', () => {
      const control = new FormControl('testuser');
      expect(validator(control)).toBeNull();
    });

    it('should pass when username has 50 characters (maximum)', () => {
      const control = new FormControl('a'.repeat(50));
      expect(validator(control)).toBeNull();
    });

    it('should pass when username has 15 characters (middle range)', () => {
      const control = new FormControl('testusername123');
      expect(validator(control)).toBeNull();
    });

    it('should fail when username has 7 characters (below minimum)', () => {
      const control = new FormControl('testuse');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['usernameLength']).toBeTruthy();
    });

    it('should fail when username has 51 characters (above maximum)', () => {
      const control = new FormControl('a'.repeat(51));
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['usernameLength']).toBeTruthy();
    });

    it('should fail when username is empty', () => {
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should fail when username is null', () => {
      const control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });

    it('should return error with length information', () => {
      const control = new FormControl('short');
      const error = validator(control);
      expect(error['usernameLength'].requiredLength).toBe(8);
      expect(error['usernameLength'].maxLength).toBe(50);
      expect(error['usernameLength'].actualLength).toBe(5);
    });

    it('should pass with exactly 25 characters', () => {
      const control = new FormControl('a'.repeat(25));
      expect(validator(control)).toBeNull();
    });

    it('should return error message', () => {
      const control = new FormControl('short');
      const error = validator(control);
      expect(error['usernameLength'].message).toBeTruthy();
    });

    it('should fail when username has only 1 character', () => {
      const control = new FormControl('a');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when username has 100 characters', () => {
      const control = new FormControl('a'.repeat(100));
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('passwordLengthValidator', () => {
    let validator: any;

    beforeEach(() => {
      validator = AuthValidator.passwordLengthValidator();
    });

    it('should pass when password has 8 characters (minimum)', () => {
      const control = new FormControl('password');
      expect(validator(control)).toBeNull();
    });

    it('should pass when password has 100 characters (maximum)', () => {
      const control = new FormControl('a'.repeat(100));
      expect(validator(control)).toBeNull();
    });

    it('should pass when password has 50 characters (middle range)', () => {
      const control = new FormControl('a'.repeat(50));
      expect(validator(control)).toBeNull();
    });

    it('should fail when password has 7 characters (below minimum)', () => {
      const control = new FormControl('passwor');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['passwordLength']).toBeTruthy();
    });

    it('should fail when password has 101 characters (above maximum)', () => {
      const control = new FormControl('a'.repeat(101));
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['passwordLength']).toBeTruthy();
    });

    it('should fail when password is empty', () => {
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should fail when password is null', () => {
      const control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });

    it('should return error with length information', () => {
      const control = new FormControl('short');
      const error = validator(control);
      expect(error['passwordLength'].requiredLength).toBe(8);
      expect(error['passwordLength'].maxLength).toBe(100);
      expect(error['passwordLength'].actualLength).toBe(5);
    });

    it('should pass with exactly 50 characters', () => {
      const control = new FormControl('a'.repeat(50));
      expect(validator(control)).toBeNull();
    });

    it('should return error message', () => {
      const control = new FormControl('short');
      const error = validator(control);
      expect(error['passwordLength'].message).toBeTruthy();
    });

    it('should fail when password has only 1 character', () => {
      const control = new FormControl('a');
      expect(validator(control)).not.toBeNull();
    });

    it('should pass with special characters in password', () => {
      const control = new FormControl('P@ssw0rd123!');
      expect(validator(control)).toBeNull();
    });

    it('should pass with spaces in password', () => {
      const control = new FormControl('pass word 123');
      expect(validator(control)).toBeNull();
    });

    it('should pass with accented characters', () => {
      const control = new FormControl('pässwörd123456');
      expect(validator(control)).toBeNull();
    });

    it('should handle exactly boundary values', () => {
      // Exactly 8
      expect(validator(new FormControl('a'.repeat(8)))).toBeNull();
      // Exactly 100
      expect(validator(new FormControl('a'.repeat(100)))).toBeNull();
      // Exactly 7 (below minimum)
      expect(validator(new FormControl('a'.repeat(7)))).not.toBeNull();
      // Exactly 101 (above maximum)
      expect(validator(new FormControl('a'.repeat(101)))).not.toBeNull();
    });
  });

  describe('Validator integration', () => {
    it('should allow chaining multiple validators', () => {
      const alphaValidator = AuthValidator.alphanumericValidator();
      const lengthValidator = AuthValidator.usernameLengthValidator();

      const control = new FormControl('test1234');

      expect(alphaValidator(control)).toBeNull();
      expect(lengthValidator(control)).toBeNull();
    });

    it('should fail on first validator', () => {
      const alphaValidator = AuthValidator.alphanumericValidator();
      const lengthValidator = AuthValidator.usernameLengthValidator();

      const control = new FormControl('onlyletters');

      expect(alphaValidator(control)).not.toBeNull();
      expect(lengthValidator(control)).toBeNull(); // Length is ok (11 chars)
    });

    it('should fail on length validator', () => {
      const alphaValidator = AuthValidator.alphanumericValidator();
      const lengthValidator = AuthValidator.usernameLengthValidator();

      const control = new FormControl('short');

      expect(alphaValidator(control)).not.toBeNull(); // No numbers
      expect(lengthValidator(control)).not.toBeNull(); // Below 8
    });
  });

  describe('Edge cases', () => {
    it('alphanumeric: should handle control value changes', () => {
      const validator = AuthValidator.alphanumericValidator();
      const control = new FormControl('onlyletters');

      expect(validator(control)).not.toBeNull();

      control.setValue('test123');
      expect(validator(control)).toBeNull();

      control.setValue('123only');
      expect(validator(control)).not.toBeNull();
    });

    it('length validators: should update on value change', () => {
      const validator = AuthValidator.usernameLengthValidator();
      const control = new FormControl('short');

      expect(validator(control)).not.toBeNull();

      control.setValue('longenoughusername');
      expect(validator(control)).toBeNull();

      control.setValue('a');
      expect(validator(control)).not.toBeNull();
    });

    it('should handle undefined gracefully', () => {
      const alphaValidator = AuthValidator.alphanumericValidator();
      const control = new FormControl(undefined);

      expect(alphaValidator(control)).toBeUndefined();
    });
  });
});



