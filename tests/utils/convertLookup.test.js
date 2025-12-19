import convertLookup from '@/utils/convertLookup.js';

describe('convertLookup', () => {
  describe('Basic Functionality', () => {
    test('should convert code to description when code exists', () => {
      const codes = ['A', 'B', 'C'];
      const descriptions = ['Alpha', 'Beta', 'Gamma'];
      
      expect(convertLookup('A', codes, descriptions)).toBe('Alpha');
      expect(convertLookup('B', codes, descriptions)).toBe('Beta');
      expect(convertLookup('C', codes, descriptions)).toBe('Gamma');
    });

    test('should return original code when not found in lookup', () => {
      const codes = ['A', 'B', 'C'];
      const descriptions = ['Alpha', 'Beta', 'Gamma'];
      
      expect(convertLookup('D', codes, descriptions)).toBe('D');
      expect(convertLookup('Z', codes, descriptions)).toBe('Z');
      expect(convertLookup('unknown', codes, descriptions)).toBe('unknown');
    });

    test('should handle first element correctly', () => {
      const codes = ['first', 'second', 'third'];
      const descriptions = ['1st', '2nd', '3rd'];
      
      expect(convertLookup('first', codes, descriptions)).toBe('1st');
    });

    test('should handle last element correctly', () => {
      const codes = ['first', 'second', 'third'];
      const descriptions = ['1st', '2nd', '3rd'];
      
      expect(convertLookup('third', codes, descriptions)).toBe('3rd');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty arrays', () => {
      expect(convertLookup('A', [], [])).toBe('A');
    });

    test('should handle single element arrays', () => {
      expect(convertLookup('X', ['X'], ['Ex'])).toBe('Ex');
      expect(convertLookup('Y', ['X'], ['Ex'])).toBe('Y');
    });

    test('should return undefined when description array is shorter', () => {
      const codes = ['A', 'B', 'C'];
      const descriptions = ['Alpha'];
      
      expect(convertLookup('B', codes, descriptions)).toBe(undefined);
      expect(convertLookup('C', codes, descriptions)).toBe(undefined);
    });

    test('should handle when description array is longer', () => {
      const codes = ['A', 'B'];
      const descriptions = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      
      expect(convertLookup('A', codes, descriptions)).toBe('Alpha');
      expect(convertLookup('B', codes, descriptions)).toBe('Beta');
    });
  });

  describe('Data Types', () => {
    test('should handle numeric codes', () => {
      const codes = [1, 2, 3];
      const descriptions = ['One', 'Two', 'Three'];
      
      expect(convertLookup(1, codes, descriptions)).toBe('One');
      expect(convertLookup(2, codes, descriptions)).toBe('Two');
      expect(convertLookup(3, codes, descriptions)).toBe('Three');
    });

    test('should handle mixed type codes', () => {
      const codes = [1, 'two', 3];
      const descriptions = ['One', 'Two', 'Three'];
      
      expect(convertLookup(1, codes, descriptions)).toBe('One');
      expect(convertLookup('two', codes, descriptions)).toBe('Two');
      expect(convertLookup(3, codes, descriptions)).toBe('Three');
    });

    test('should handle special characters in codes', () => {
      const codes = ['@', '#', '$'];
      const descriptions = ['At', 'Hash', 'Dollar'];
      
      expect(convertLookup('@', codes, descriptions)).toBe('At');
      expect(convertLookup('#', codes, descriptions)).toBe('Hash');
      expect(convertLookup('$', codes, descriptions)).toBe('Dollar');
    });

    test('should handle empty strings', () => {
      const codes = ['', 'A', 'B'];
      const descriptions = ['Empty', 'Alpha', 'Beta'];
      
      expect(convertLookup('', codes, descriptions)).toBe('Empty');
    });
  });

  describe('Case Sensitivity', () => {
    test('should be case sensitive', () => {
      const codes = ['a', 'B', 'C'];
      const descriptions = ['lower a', 'upper B', 'upper C'];
      
      expect(convertLookup('a', codes, descriptions)).toBe('lower a');
      expect(convertLookup('A', codes, descriptions)).toBe('A');
      expect(convertLookup('b', codes, descriptions)).toBe('b');
      expect(convertLookup('B', codes, descriptions)).toBe('upper B');
    });
  });

  describe('Duplicate Codes', () => {
    test('should return first match when codes are duplicated', () => {
      const codes = ['A', 'B', 'A', 'C'];
      const descriptions = ['First A', 'Beta', 'Second A', 'Gamma'];
      
      expect(convertLookup('A', codes, descriptions)).toBe('First A');
    });
  });
});
