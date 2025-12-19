import { jest } from '@jest/globals';

// Mock the configs module before any imports
const mockRc4Key = 'testkey123';
jest.unstable_mockModule('@/configs', () => ({
  rc4key: {
    new: mockRc4Key
  }
}));

// Now import the modules after mocking
const { default: AxiosDecode } = await import('@/utils/decode.js');
const { default: rc4 } = await import('@/utils/rc4.js');
const { default: toBase64Safe } = await import('@/utils/toBase64Safe.js');

describe('AxiosDecode', () => {

  // Helper function to create encoded data
  const encodeData = (data, urlEncodeCount = 1) => {
    const jsonString = JSON.stringify(data);
    let encoded = rc4(mockRc4Key, jsonString);
    encoded = toBase64Safe(encoded);
    
    for (let i = 0; i < urlEncodeCount; i++) {
      encoded = encodeURIComponent(encoded);
    }
    
    return encoded;
  };

  describe('Basic Decoding', () => {
    test('should decode simple JSON object', () => {
      const originalData = { name: 'Test', value: 123 };
      const encoded = encodeData(originalData);
      const encodedWithJson = JSON.stringify(encoded);
      
      const decoded = AxiosDecode(encodedWithJson, true);
      expect(decoded).toEqual(originalData);
    });

    test('should decode with jsdec=false (already a string)', () => {
      const originalData = { name: 'Test', value: 123 };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should handle single URL encoding', () => {
      const originalData = { message: 'Hello World' };
      const encoded = encodeData(originalData, 1);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should handle multiple URL encodings', () => {
      const originalData = { test: 'data' };
      const encoded = encodeData(originalData, 3);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });
  });

  describe('Complex Data Structures', () => {
    test('should decode nested objects', () => {
      const originalData = {
        user: {
          name: 'John',
          details: {
            age: 30,
            city: 'Rome'
          }
        }
      };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should decode arrays', () => {
      const originalData = {
        items: [1, 2, 3, 4, 5],
        names: ['Alice', 'Bob', 'Charlie']
      };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should decode mixed data types', () => {
      const originalData = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { key: 'value' }
      };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });
  });

  describe('Special Characters', () => {
    test('should handle special characters in data', () => {
      const originalData = {
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?/',
        unicode: '世界 🌍'
      };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should handle spaces and newlines', () => {
      const originalData = {
        text: 'Line 1\nLine 2\nLine 3',
        spaces: '  multiple   spaces  '
      };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });
  });

  describe('URL Decoding Loop', () => {
    test('should decode until no more URL encoding is present', () => {
      const originalData = { test: 'value' };
      const encoded = encodeData(originalData, 5);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should stop decoding when decodeURIComponent returns same value', () => {
      const originalData = { simple: 'test' };
      const encoded = encodeData(originalData, 1);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });
  });

  describe('Real-world API Response Simulation', () => {
    test('should decode typical API response structure', () => {
      const originalData = {
        status: 'success',
        data: {
          user: {
            id: 123,
            name: 'Test User',
            email: 'test@example.com'
          },
          timestamp: '2025-12-19T10:00:00Z'
        }
      };
      const encoded = encodeData(originalData, 2);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should decode error response', () => {
      const originalData = {
        status: 'error',
        error: {
          code: 404,
          message: 'Not Found'
        }
      };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty object', () => {
      const originalData = {};
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should handle empty array', () => {
      const originalData = { items: [] };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });

    test('should handle large data', () => {
      const originalData = {
        items: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          value: Math.random()
        }))
      };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });
  });

  describe('jsdec Parameter', () => {
    test('should parse JSON when jsdec is true (default)', () => {
      const originalData = { test: 'data' };
      const encoded = encodeData(originalData);
      const jsonWrapped = JSON.stringify(encoded);
      
      const decoded = AxiosDecode(jsonWrapped);
      expect(decoded).toEqual(originalData);
    });

    test('should not parse JSON when jsdec is false', () => {
      const originalData = { test: 'data' };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      expect(decoded).toEqual(originalData);
    });
  });

  describe('Data Integrity', () => {
    test('should preserve data types after decode', () => {
      const originalData = {
        stringValue: 'text',
        numberValue: 42,
        floatValue: 3.14,
        booleanTrue: true,
        booleanFalse: false,
        nullValue: null,
        arrayValue: [1, 2, 3],
        objectValue: { key: 'value' }
      };
      const encoded = encodeData(originalData);
      
      const decoded = AxiosDecode(encoded, false);
      
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
});
