import fromBase64Safe from '@/utils/fromBase64Safe.js';
import toBase64Safe from '@/utils/toBase64Safe.js';

describe('fromBase64Safe', () => {
  describe('Basic Decoding', () => {
    test('should decode simple base64 string', () => {
      const original = 'Hello World';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBeDefined();
      expect(typeof decoded).toBe('string');
    });

    test('should decode empty base64 string', () => {
      const encoded = toBase64Safe('');
      const decoded = fromBase64Safe(encoded);
      
      expect(typeof decoded).toBe('string');
    });

    test('should decode single character', () => {
      const original = 'a';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(typeof decoded).toBe('string');
    });
  });

  describe('Unicode Support', () => {
    test('should decode Unicode characters', () => {
      const original = '世界 🌍';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });

    test('should decode emojis', () => {
      const original = '😀😁😂🤣😃';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });

    test('should decode mixed ASCII and Unicode', () => {
      const original = 'Hello 世界 🌍';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });

    test('should decode various language characters', () => {
      const original = 'Hello Привет مرحبا 你好';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });
  });

  describe('Special Characters', () => {
    test('should decode special characters', () => {
      const original = '!@#$%^&*()_+-=[]{}|;:,.<>?/';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });

    test('should decode newlines and tabs', () => {
      const original = 'Line1\nLine2\tTabbed';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });

    test('should decode quotes', () => {
      const original = `Single 'quotes' and "double" quotes`;
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });
  });

  describe('Roundtrip Encoding/Decoding', () => {
    test('should decode what toBase64Safe encodes', () => {
      const original = 'Test data';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });

    test('should handle multiple roundtrips', () => {
      const original = 'Multiple roundtrips';
      
      const encoded1 = toBase64Safe(original);
      const decoded1 = fromBase64Safe(encoded1);
      
      const encoded2 = toBase64Safe(decoded1);
      const decoded2 = fromBase64Safe(encoded2);
      
      expect(decoded2).toBe(original);
    });

    test('should preserve data through encode/decode cycle', () => {
      const testCases = [
        'Simple text',
        'Text with 世界',
        'Emoji 🌍',
        'Numbers: 123456',
        'Special: !@#$%',
        'Newline\nTab\t'
      ];
      
      testCases.forEach(original => {
        const encoded = toBase64Safe(original);
        const decoded = fromBase64Safe(encoded);
        expect(decoded).toBe(original);
      });
    });
  });

  describe('JSON Data', () => {
    test('should decode JSON string', () => {
      const json = JSON.stringify({ name: 'Test', value: 123 });
      const encoded = toBase64Safe(json);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(json);
      expect(JSON.parse(decoded)).toEqual({ name: 'Test', value: 123 });
    });

    test('should decode complex JSON', () => {
      const obj = {
        user: { name: 'John', age: 30 },
        items: [1, 2, 3],
        active: true
      };
      const json = JSON.stringify(obj);
      const encoded = toBase64Safe(json);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(json);
      expect(JSON.parse(decoded)).toEqual(obj);
    });
  });

  describe('Error Handling', () => {
    test('should handle very long encoded strings', () => {
      const longString = 'a'.repeat(10000);
      const encoded = toBase64Safe(longString);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(longString);
    });

    test('should handle whitespace', () => {
      const original = '   \t\n   ';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });
  });

  describe('Fallback Behavior', () => {
    test('should decode standard base64 for ASCII', () => {
      const original = 'Simple ASCII text';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });
  });

  describe('Data Integrity', () => {
    test('should preserve exact string content', () => {
      const original = 'Exact\x00Binary\x01Data\x02Test';
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });

    test('should handle all printable characters', () => {
      let original = '';
      for (let i = 32; i < 127; i++) {
        original += String.fromCharCode(i);
      }
      const encoded = toBase64Safe(original);
      const decoded = fromBase64Safe(encoded);
      
      expect(decoded).toBe(original);
    });
  });
});
