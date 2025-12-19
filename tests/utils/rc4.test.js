import rc4 from '@/utils/rc4.js';

describe('rc4', () => {
  describe('Basic Encryption/Decryption', () => {
    test('should encrypt and decrypt simple text', () => {
      const key = 'testkey';
      const plaintext = 'Hello World';
      
      const encrypted = rc4(key, plaintext);
      expect(encrypted).not.toBe(plaintext);
      
      const decrypted = rc4(key, encrypted);
      expect(decrypted).toBe(plaintext);
    });

    test('should encrypt and decrypt with different keys producing different results', () => {
      const plaintext = 'Secret Message';
      const key1 = 'key1';
      const key2 = 'key2';
      
      const encrypted1 = rc4(key1, plaintext);
      const encrypted2 = rc4(key2, plaintext);
      
      expect(encrypted1).not.toBe(encrypted2);
      expect(rc4(key1, encrypted1)).toBe(plaintext);
      expect(rc4(key2, encrypted2)).toBe(plaintext);
    });

    test('should produce different output for same input with different keys', () => {
      const plaintext = 'Test';
      const encrypted1 = rc4('key1', plaintext);
      const encrypted2 = rc4('key2', plaintext);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('Symmetry', () => {
    test('should be symmetric (encrypting twice returns original)', () => {
      const key = 'symmetrickey';
      const original = 'Symmetric Test';
      
      const firstPass = rc4(key, original);
      const secondPass = rc4(key, firstPass);
      
      expect(secondPass).toBe(original);
    });

    test('should work with multiple encrypt/decrypt cycles', () => {
      const key = 'cyclekey';
      let text = 'Original Text';
      
      // Encrypt and decrypt multiple times
      for (let i = 0; i < 10; i++) {
        text = rc4(key, text);
        text = rc4(key, text);
      }
      
      expect(text).toBe('Original Text');
    });
  });

  describe('Different Data Types', () => {
    test('should handle empty string', () => {
      const key = 'key';
      const encrypted = rc4(key, '');
      expect(encrypted).toBe('');
      expect(rc4(key, encrypted)).toBe('');
    });

    test('should handle single character', () => {
      const key = 'key';
      const plaintext = 'A';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should handle long text', () => {
      const key = 'longkey';
      const plaintext = 'A'.repeat(1000);
      
      const encrypted = rc4(key, plaintext);
      expect(encrypted).not.toBe(plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should handle special characters', () => {
      const key = 'specialkey';
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should handle unicode characters', () => {
      const key = 'unicodekey';
      const plaintext = 'Hello 世界 🌍';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should handle numbers in string', () => {
      const key = 'numkey';
      const plaintext = '1234567890';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should handle mixed alphanumeric', () => {
      const key = 'mixedkey';
      const plaintext = 'Test123!@#abc';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });
  });

  describe('Key Variations', () => {
    test('should work with short key', () => {
      const key = 'k';
      const plaintext = 'Message';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should work with long key', () => {
      const key = 'a'.repeat(256);
      const plaintext = 'Message';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should work with numeric string key', () => {
      const key = '12345';
      const plaintext = 'Numeric Key Test';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should work with special character key', () => {
      const key = '!@#$%';
      const plaintext = 'Special Key Test';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });
  });

  describe('Consistency', () => {
    test('should produce consistent results for same key and plaintext', () => {
      const key = 'consistentkey';
      const plaintext = 'Consistent Message';
      
      const encrypted1 = rc4(key, plaintext);
      const encrypted2 = rc4(key, plaintext);
      
      expect(encrypted1).toBe(encrypted2);
    });

    test('should produce same result regardless of call order', () => {
      const key = 'orderkey';
      const text1 = 'First';
      const text2 = 'Second';
      
      const enc1a = rc4(key, text1);
      const enc2a = rc4(key, text2);
      
      const enc2b = rc4(key, text2);
      const enc1b = rc4(key, text1);
      
      expect(enc1a).toBe(enc1b);
      expect(enc2a).toBe(enc2b);
    });
  });

  describe('JSON Data', () => {
    test('should encrypt and decrypt JSON strings', () => {
      const key = 'jsonkey';
      const jsonData = JSON.stringify({ name: 'Test', value: 123, nested: { key: 'value' } });
      
      const encrypted = rc4(key, jsonData);
      const decrypted = rc4(key, encrypted);
      
      expect(decrypted).toBe(jsonData);
      expect(JSON.parse(decrypted)).toEqual({ name: 'Test', value: 123, nested: { key: 'value' } });
    });

    test('should handle complex JSON structures', () => {
      const key = 'complexkey';
      const complexData = JSON.stringify({
        array: [1, 2, 3],
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        nested: {
          deep: {
            value: 'deep value'
          }
        }
      });
      
      const encrypted = rc4(key, complexData);
      const decrypted = rc4(key, encrypted);
      
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(complexData));
    });
  });

  describe('Security Properties', () => {
    test('wrong key should not decrypt correctly', () => {
      const plaintext = 'Secret';
      const correctKey = 'correct';
      const wrongKey = 'wrong';
      
      const encrypted = rc4(correctKey, plaintext);
      const wrongDecrypt = rc4(wrongKey, encrypted);
      
      expect(wrongDecrypt).not.toBe(plaintext);
    });

    test('should produce non-readable output for encrypted data', () => {
      const key = 'readabilitykey';
      const plaintext = 'Readable Text';
      
      const encrypted = rc4(key, plaintext);
      
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(0);
    });
  });

  describe('Whitespace Handling', () => {
    test('should handle text with newlines', () => {
      const key = 'newlinekey';
      const plaintext = 'Line 1\nLine 2\nLine 3';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should handle text with tabs', () => {
      const key = 'tabkey';
      const plaintext = 'Col1\tCol2\tCol3';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });

    test('should handle mixed whitespace', () => {
      const key = 'whitespacekey';
      const plaintext = ' \t\n Mixed \r\n Whitespace \t ';
      
      const encrypted = rc4(key, plaintext);
      expect(rc4(key, encrypted)).toBe(plaintext);
    });
  });
});
