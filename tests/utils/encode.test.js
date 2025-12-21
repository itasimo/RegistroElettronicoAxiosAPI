import { jest } from '@jest/globals';

// Mock the configs module before any imports
const mockRc4Key = 'testkey123';
jest.unstable_mockModule('@/configs', () => ({
  rc4key: {
    new: mockRc4Key
  }
}));

// Now import the modules after mocking
const { default: AxiosEncode } = await import('@/utils/encode.js');
const { default: rc4 } = await import('@/utils/rc4.js');

describe('AxiosEncode', () => {

  // Helper to decode and verify
  const decodeData = (encoded, urlDecodeCount = 1) => {
    let decoded = encoded;
    
    // URL decode
    for (let i = 0; i < urlDecodeCount; i++) {
      decoded = decodeURIComponent(decoded);
    }
    
    // Base64 decode
    decoded = atob(decoded);
    
    // RC4 decrypt
    decoded = rc4(mockRc4Key, decoded);
    
    // Parse JSON
    return JSON.parse(decoded);
  };

  describe('Basic Encoding', () => {
    test('should encode simple object with default URL encoding (1 time)', () => {
      const data = { name: 'Test', value: 123 };
      const encoded = AxiosEncode(data);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
      
      const decoded = decodeData(encoded, 1);
      expect(decoded).toEqual(data);
    });

    test('should encode with custom URL encoding count', () => {
      const data = { test: 'value' };
      const encoded = AxiosEncode(data, 3);
      
      const decoded = decodeData(encoded, 3);
      expect(decoded).toEqual(data);
    });

    test('should encode with zero URL encoding', () => {
      const data = { test: 'value' };
      const encoded = AxiosEncode(data, 0);
      
      const decoded = decodeData(encoded, 0);
      expect(decoded).toEqual(data);
    });
  });

  describe('Complex Data Structures', () => {
    test('should encode nested objects', () => {
      const data = {
        user: {
          name: 'John',
          details: {
            age: 30,
            city: 'Rome'
          }
        }
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });

    test('should encode arrays', () => {
      const data = {
        items: [1, 2, 3, 4, 5],
        names: ['Alice', 'Bob', 'Charlie']
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });

    test('should encode mixed data types', () => {
      const data = {
        string: 'text',
        number: 42,
        float: 3.14,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { key: 'value' }
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });
  });

  describe('Special Characters', () => {

    test('should encode data with spaces and newlines', () => {
      const data = {
        text: 'Line 1\nLine 2\nLine 3',
        spaces: '  multiple   spaces  '
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });

    test('should encode data with quotes', () => {
      const data = {
        singleQuote: "It's working",
        doubleQuote: 'He said "Hello"',
        both: `Both 'single' and "double"`
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });
  });

  describe('URL Encoding Variations', () => {
    test('should apply multiple URL encodings correctly', () => {
      const data = { test: 'value with spaces' };
      
      const encoded1 = AxiosEncode(data, 1);
      const encoded2 = AxiosEncode(data, 2);
      const encoded3 = AxiosEncode(data, 3);
      
      expect(encoded1).not.toBe(encoded2);
      expect(encoded2).not.toBe(encoded3);
      
      expect(decodeData(encoded1, 1)).toEqual(data);
      expect(decodeData(encoded2, 2)).toEqual(data);
      expect(decodeData(encoded3, 3)).toEqual(data);
    });

    test('should handle large URL encoding count', () => {
      const data = { small: 'data' };
      const encoded = AxiosEncode(data, 10);
      
      const decoded = decodeData(encoded, 10);
      expect(decoded).toEqual(data);
    });
  });

  describe('Real-world API Data', () => {
    test('should encode typical API request payload', () => {
      const data = {
        action: 'getData',
        userId: 12345,
        parameters: {
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          includeDetails: true
        }
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });

    test('should encode authentication data', () => {
      const data = {
        username: 'testuser',
        password: 'secret123',
        token: 'abc123xyz',
        timestamp: Date.now()
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });

    test('should encode form data', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+39 123 456 7890',
        address: {
          street: 'Via Roma 123',
          city: 'Rome',
          zipCode: '00100'
        }
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });
  });

  describe('Edge Cases', () => {
    test('should encode empty object', () => {
      const data = {};
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });

    test('should encode object with empty array', () => {
      const data = { items: [] };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });

    test('should encode object with empty string', () => {
      const data = { text: '' };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });

    test('should encode large data structure', () => {
      const data = {
        items: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          value: Math.random(),
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          }
        }))
      };
      const encoded = AxiosEncode(data);
      
      const decoded = decodeData(encoded);
      expect(decoded).toEqual(data);
    });
  });

  describe('Output Format', () => {
    test('should return a string', () => {
      const data = { test: 'data' };
      const encoded = AxiosEncode(data);
      
      expect(typeof encoded).toBe('string');
    });

    test('should return non-empty string for non-empty data', () => {
      const data = { test: 'data' };
      const encoded = AxiosEncode(data);
      
      expect(encoded.length).toBeGreaterThan(0);
    });

    test('should produce different outputs for different inputs', () => {
      const data1 = { test: 'data1' };
      const data2 = { test: 'data2' };
      
      const encoded1 = AxiosEncode(data1);
      const encoded2 = AxiosEncode(data2);
      
      expect(encoded1).not.toBe(encoded2);
    });

    test('should produce consistent output for same input', () => {
      const data = { test: 'data' };
      
      const encoded1 = AxiosEncode(data, 2);
      const encoded2 = AxiosEncode(data, 2);
      
      expect(encoded1).toBe(encoded2);
    });
  });

  describe('Data Preservation', () => {
    test('should preserve all data types through encode/decode cycle', () => {
      const data = {
        stringValue: 'text',
        numberValue: 42,
        floatValue: 3.14159,
        booleanTrue: true,
        booleanFalse: false,
        nullValue: null,
        arrayValue: [1, 'two', 3],
        objectValue: { nested: { deep: 'value' } }
      };
      const encoded = AxiosEncode(data);
      const decoded = decodeData(encoded);
      
      expect(decoded).toEqual(data);
      expect(typeof decoded.stringValue).toBe('string');
      expect(typeof decoded.numberValue).toBe('number');
      expect(typeof decoded.floatValue).toBe('number');
      expect(typeof decoded.booleanTrue).toBe('boolean');
      expect(typeof decoded.booleanFalse).toBe('boolean');
      expect(decoded.nullValue).toBeNull();
      expect(Array.isArray(decoded.arrayValue)).toBe(true);
      expect(typeof decoded.objectValue).toBe('object');
    });
  });

  describe('Integration', () => {
    test('should work with numbers as encoding count', () => {
      const data = { test: 'integration' };
      
      for (let i = 0; i <= 5; i++) {
        const encoded = AxiosEncode(data, i);
        const decoded = decodeData(encoded, i);
        expect(decoded).toEqual(data);
      }
    });

    test('should handle consecutive encode operations', () => {
      const data1 = { first: 'data' };
      const data2 = { second: 'data' };
      const data3 = { third: 'data' };
      
      const encoded1 = AxiosEncode(data1);
      const encoded2 = AxiosEncode(data2);
      const encoded3 = AxiosEncode(data3);
      
      expect(decodeData(encoded1)).toEqual(data1);
      expect(decodeData(encoded2)).toEqual(data2);
      expect(decodeData(encoded3)).toEqual(data3);
    });
  });
});
