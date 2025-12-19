import toBase64Safe from '@/utils/toBase64Safe.js';

describe('toBase64Safe', () => {
  describe('Basic Encoding', () => {
    test('should encode simple ASCII string', () => {
      const input = 'Hello World';
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
      
      // Verify it's valid base64
      const decoded = atob(encoded);
      expect(decoded).toBeDefined();
    });

    test('should encode empty string', () => {
      const encoded = toBase64Safe('');
      expect(typeof encoded).toBe('string');
    });

    test('should encode single character', () => {
      const encoded = toBase64Safe('a');
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });
  });

  describe('Unicode Support', () => {
    test('should encode Unicode characters', () => {
      const input = '世界 🌍';
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should encode emojis', () => {
      const input = '😀😁😂🤣😃';
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should encode mixed ASCII and Unicode', () => {
      const input = 'Hello 世界 🌍';
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should encode various language characters', () => {
      const input = 'Hello Привет مرحبا 你好';
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });
  });

  describe('Special Characters', () => {
    test('should encode special characters', () => {
      const input = '!@#$%^&*()_+-=[]{}|;:,.<>?/';
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should encode newlines and tabs', () => {
      const input = 'Line1\nLine2\tTabbed';
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should encode quotes', () => {
      const input = `Single 'quotes' and "double" quotes`;
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });
  });

  describe('JSON Data', () => {
    test('should encode JSON string', () => {
      const json = JSON.stringify({ name: 'Test', value: 123 });
      const encoded = toBase64Safe(json);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should encode complex JSON', () => {
      const json = JSON.stringify({
        user: { name: 'John', age: 30 },
        items: [1, 2, 3],
        active: true
      });
      const encoded = toBase64Safe(json);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });
  });

  describe('Output Format', () => {
    test('should return valid base64 string', () => {
      const input = 'test data';
      const encoded = toBase64Safe(input);
      
      // Base64 should only contain these characters
      expect(encoded).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
    });

    test('should produce consistent output for same input', () => {
      const input = 'consistent data';
      const encoded1 = toBase64Safe(input);
      const encoded2 = toBase64Safe(input);
      
      expect(encoded1).toBe(encoded2);
    });

    test('should produce different output for different input', () => {
      const encoded1 = toBase64Safe('data1');
      const encoded2 = toBase64Safe('data2');
      
      expect(encoded1).not.toBe(encoded2);
    });
  });

  describe('Error Handling', () => {
    test('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const encoded = toBase64Safe(longString);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should handle whitespace only', () => {
      const encoded = toBase64Safe('   \t\n   ');
      
      expect(typeof encoded).toBe('string');
    });
  });

  describe('Fallback Behavior', () => {
    test('should encode simple ASCII that works with standard btoa', () => {
      const input = 'Simple ASCII text';
      const encoded = toBase64Safe(input);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });
  });
});
