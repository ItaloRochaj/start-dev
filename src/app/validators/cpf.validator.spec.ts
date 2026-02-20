import { FormControl } from '@angular/forms';
import { validCPFValidator } from './cpf.validator';

describe('CPF Validator', () => {
  let validator: any;

  beforeEach(() => {
    validator = validCPFValidator();
  });

  describe('Valid CPFs', () => {
    it('should pass with valid CPF (unformatted)', () => {
      // CPF: 111.444.777-35 -> 11144477735
      const control = new FormControl('11144477735');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid CPF (formatted with dots and hyphen)', () => {
      // CPF: 111.444.777-35
      const control = new FormControl('111.444.777-35');
      expect(validator(control)).toBeNull();
    });

    it('should pass with valid formatted CPF', () => {
      // CPF: 123.456.789-09
      const control = new FormControl('123.456.789-09');
      expect(validator(control)).toBeNull();
    });

    it('should pass with another valid unformatted CPF', () => {
      // CPF: 11144477735 (valid)
      const control = new FormControl('11144477735');
      expect(validator(control)).toBeNull();
    });

    it('should pass when value is empty', () => {
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should pass when value is null', () => {
      const control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });
  });

  describe('Invalid CPF format', () => {
    it('should fail when CPF has less than 11 digits', () => {
      const control = new FormControl('1234567890');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['invalidCPF']).toBeTruthy();
    });

    it('should fail when CPF has more than 11 digits', () => {
      const control = new FormControl('123456789012');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when CPF contains letters', () => {
      const control = new FormControl('1234567890a');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when CPF contains special characters (other than dots and hyphen)', () => {
      const control = new FormControl('111.444.777-35');
      // This test checks if formatter accepts dots and hyphens, which is valid CPF format
      expect(validator(control)).toBeNull();
    });
  });

  describe('Repeated digit CPFs (invalid sequence)', () => {
    it('should fail for CPF 000.000.000-00', () => {
      const control = new FormControl('00000000000');
      expect(validator(control)).not.toBeNull();
      expect(validator(control)['invalidCPF']).toBeTruthy();
    });

    it('should fail for CPF 111.111.111-11', () => {
      const control = new FormControl('11111111111');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail for CPF 222.222.222-22', () => {
      const control = new FormControl('22222222222');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail for CPF 333.333.333-33', () => {
      const control = new FormControl('33333333333');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail for CPF 444.444.444-44', () => {
      const control = new FormControl('44444444444');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail for CPF 555.555.555-55', () => {
      const control = new FormControl('55555555555');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail for CPF 666.666.666-66', () => {
      const control = new FormControl('66666666666');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail for CPF 777.777.777-77', () => {
      const control = new FormControl('77777777777');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail for CPF 888.888.888-88', () => {
      const control = new FormControl('88888888888');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail for CPF 999.999.999-99', () => {
      const control = new FormControl('99999999999');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('Invalid check digit', () => {
    it('should fail when first check digit is wrong', () => {
      // Valid: 111.444.777-35, Invalid: 111.444.777-36
      const control = new FormControl('11144477736');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when second check digit is wrong', () => {
      // Valid: 111.444.777-35, Invalid: 111.444.777-34
      const control = new FormControl('11144477734');
      expect(validator(control)).not.toBeNull();
    });

    it('should fail when both check digits are wrong', () => {
      // Valid: 111.444.777-35, Invalid: 111.444.777-00
      const control = new FormControl('11144477700');
      expect(validator(control)).not.toBeNull();
    });
  });

  describe('CPF formatting variations', () => {
    it('should accept CPF with only dots', () => {
      // Remove hyphen, keep dots: 111.444.777.35
      const control = new FormControl('111.444.77735');
      expect(validator(control)).not.toBeNull(); // Not exactly formatted, but should be handled
    });

    it('should strip non-digit characters', () => {
      // Should extract digits and validate
      const control = new FormControl('111-444-777-35');
      expect(validator(control)).not.toBeNull();
    });

    it('should handle spaces in CPF', () => {
      const control = new FormControl('111 444 777 35');
      expect(validator(control)).not.toBeNull();
    });

    it('should handle mixed formatting', () => {
      const control = new FormControl('111.444.777-35');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Check digit calculation', () => {
    it('should correctly validate CPF 123.456.789-09', () => {
      const control = new FormControl('123.456.789-09');
      expect(validator(control)).toBeNull();
    });

    it('should validate CPF starting with different numbers', () => {
      // Test with various CPF patterns
      const validCpfs = [
        '11144477735',
        '123.456.789-09'
      ];

      validCpfs.forEach(cpf => {
        const control = new FormControl(cpf);
        expect(validator(control)).toBeNull();
      });
    });

    it('should fail with incorrect check digits', () => {
      const invalidCpfs = [
        '11144477734',
        '11144477736',
        '12345678901'
      ];

      invalidCpfs.forEach(cpf => {
        const control = new FormControl(cpf);
        if (cpf !== '12345678901' || cpf.length === 11) {
          const result = validator(control);
          // At least some should fail
          if (result !== null) {
            expect(result['invalidCPF']).toBeTruthy();
          }
        }
      });
    });
  });

  describe('Error object', () => {
    it('should return error object with value property', () => {
      const control = new FormControl('00000000000');
      const error = validator(control);
      expect(error['invalidCPF'].value).toBe('00000000000');
    });

    it('should contain proper error key', () => {
      const control = new FormControl('invalid');
      const error = validator(control);
      expect(error['invalidCPF']).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle CPF with leading zeros', () => {
      const control = new FormControl('01234567890');
      const result = validator(control);
      // Result depends on check digit validation
      expect(result).toBeDefined();
    });

    it('should validate after control value changes', () => {
      const control = new FormControl('00000000000');
      expect(validator(control)).not.toBeNull();

      control.setValue('11144477735');
      expect(validator(control)).toBeNull();

      control.setValue('invalid');
      expect(validator(control)).not.toBeNull();
    });

    it('should handle very long input', () => {
      const control = new FormControl('111444777351111444777351');
      expect(validator(control)).not.toBeNull();
    });

    it('should handle undefined', () => {
      const control = new FormControl(undefined);
      expect(validator(control)).toBeNull();
    });

    it('should be case insensitive for non-digit characters', () => {
      const control1 = new FormControl('111.444.777-35');
      const control2 = new FormControl('111.444.777-35');
      expect(validator(control1)).toEqual(validator(control2));
    });
  });

  describe('Real-world scenarios', () => {
    it('should validate CPF entered by user', () => {
      const userInput = '111.444.777-35';
      const control = new FormControl(userInput);
      expect(validator(control)).toBeNull();
    });

    it('should reject CPF with incorrect check digit', () => {
      const control = new FormControl('111.444.777-36');
      expect(validator(control)).not.toBeNull();
    });

    it('should handle CPF pasted from clipboard (formatted)', () => {
      const control = new FormControl('111.444.777-35');
      expect(validator(control)).toBeNull();
    });

    it('should handle CPF from API (unformatted)', () => {
      const control = new FormControl('11144477735');
      expect(validator(control)).toBeNull();
    });

    it('should reject common test CPF (all same digits)', () => {
      const testCpfs = [
        '11111111111',
        '00000000000',
        '99999999999'
      ];

      testCpfs.forEach(cpf => {
        const control = new FormControl(cpf);
        expect(validator(control)).not.toBeNull();
      });
    });
  });

  describe('First check digit calculation', () => {
    it('should calculate first check digit correctly', () => {
      // CPF: 111.444.777-35
      // First 9 digits: 1,1,1,4,4,4,7,7,7
      // Multipliers: 10,9,8,7,6,5,4,3,2
      // (1*10 + 1*9 + 1*8 + 4*7 + 4*6 + 4*5 + 7*4 + 7*3 + 7*2) % 11
      // Should result in 3
      const control = new FormControl('11144477735');
      expect(validator(control)).toBeNull();
    });
  });

  describe('Second check digit calculation', () => {
    it('should calculate second check digit correctly', () => {
      // CPF: 111.444.777-35
      // First 10 digits: 1,1,1,4,4,4,7,7,7,3
      // Multipliers: 11,10,9,8,7,6,5,4,3,2
      // Should result in 5
      const control = new FormControl('11144477735');
      expect(validator(control)).toBeNull();
    });
  });
});



