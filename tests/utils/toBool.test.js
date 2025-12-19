import toBool from '@/utils/toBool.js';

describe('toBool', () => {
  describe('Default Behavior (trueValue = "True")', () => {
    test('should return true for "True"', () => {
      expect(toBool('True')).toBe(true);
    });

    test('should return false for non-"True" strings', () => {
      expect(toBool('False')).toBe(false);
      expect(toBool('false')).toBe(false);
      expect(toBool('true')).toBe(false);
      expect(toBool('TRUE')).toBe(false);
      expect(toBool('YES')).toBe(false);
      expect(toBool('NO')).toBe(false);
      expect(toBool('1')).toBe(false);
      expect(toBool('0')).toBe(false);
      expect(toBool('')).toBe(false);
      expect(toBool('anything')).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(toBool('')).toBe(false);
    });

    test('should return false for whitespace strings', () => {
      expect(toBool(' ')).toBe(false);
      expect(toBool('  ')).toBe(false);
      expect(toBool('\t')).toBe(false);
      expect(toBool('\n')).toBe(false);
    });
  });

  describe('Custom trueValue Parameter', () => {
    test('should use custom trueValue for comparison', () => {
      expect(toBool('yes', 'yes')).toBe(true);
      expect(toBool('YES', 'YES')).toBe(true);
      expect(toBool('1', '1')).toBe(true);
      expect(toBool('SI', 'SI')).toBe(true);
      expect(toBool('oui', 'oui')).toBe(true);
    });

    test('should return false when value does not match custom trueValue', () => {
      expect(toBool('no', 'yes')).toBe(false);
      expect(toBool('True', 'yes')).toBe(false);
      expect(toBool('0', '1')).toBe(false);
      expect(toBool('yes', 'YES')).toBe(false);
    });

    test('should handle empty string as trueValue', () => {
      expect(toBool('', '')).toBe(true);
      expect(toBool('something', '')).toBe(false);
    });
  });

  describe('Type Coercion (Loose Equality)', () => {
    test('should handle numeric values with loose equality', () => {
      expect(toBool(1, 1)).toBe(true);
      expect(toBool(0, 1)).toBe(false);
      expect(toBool(1, '1')).toBe(true);
      expect(toBool('1', 1)).toBe(true);
      expect(toBool(0, '0')).toBe(true);
    });

    test('should handle boolean values with loose equality', () => {
      expect(toBool(true, true)).toBe(true);
      expect(toBool(false, true)).toBe(false);
      expect(toBool(true, false)).toBe(false);
      expect(toBool(false, false)).toBe(true);
      expect(toBool(true, 1)).toBe(true);
      expect(toBool(false, 0)).toBe(true);
    });

    test('should handle null and undefined', () => {
      expect(toBool(null, 'True')).toBe(false);
      expect(toBool(undefined, 'True')).toBe(false);
      expect(toBool(null, null)).toBe(true);
      // When undefined is passed as trueValue, it becomes the default value "True"
      // so toBool(undefined, undefined) compares undefined == "True" which is false
      expect(toBool(undefined, undefined)).toBe(false);
      expect(toBool(null, undefined)).toBe(false);
    });

    test('should handle objects with loose equality', () => {
      const obj = { value: 'test' };
      expect(toBool(obj, obj)).toBe(true);
      expect(toBool(obj, { value: 'test' })).toBe(false);
    });
  });

  describe('Special Cases', () => {
    test('should handle numeric zero and empty string', () => {
      expect(toBool(0, 0)).toBe(true);
      expect(toBool(0, '')).toBe(true);
      expect(toBool('', 0)).toBe(true);
      expect(toBool('', '')).toBe(true);
    });

    test('should handle string representations of numbers', () => {
      expect(toBool('100', 100)).toBe(true);
      expect(toBool(100, '100')).toBe(true);
      expect(toBool('0', 0)).toBe(true);
      expect(toBool(0, '0')).toBe(true);
    });

    test('should not perform type conversion for arrays', () => {
      expect(toBool([], [])).toBe(false);
      expect(toBool([1], [1])).toBe(false);
    });
  });

  describe('Real-world Use Cases', () => {
    test('should work with API response strings', () => {
      expect(toBool('True', 'True')).toBe(true);
      expect(toBool('False', 'True')).toBe(false);
    });

    test('should work with yes/no responses', () => {
      expect(toBool('yes', 'yes')).toBe(true);
      expect(toBool('no', 'yes')).toBe(false);
    });

    test('should work with numeric flags', () => {
      expect(toBool(1, 1)).toBe(true);
      expect(toBool(0, 1)).toBe(false);
      expect(toBool('1', '1')).toBe(true);
      expect(toBool('0', '1')).toBe(false);
    });
  });
});
