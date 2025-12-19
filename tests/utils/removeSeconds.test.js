import removeSeconds from '@/utils/removeSeconds.js';

describe('removeSeconds', () => {
  describe('Valid Time Formats', () => {
    test('should remove seconds from standard time format', () => {
      expect(removeSeconds('08:15:45')).toBe('08:15');
      expect(removeSeconds('12:30:00')).toBe('12:30');
      expect(removeSeconds('23:59:59')).toBe('23:59');
    });

    test('should handle morning times', () => {
      expect(removeSeconds('00:00:00')).toBe('00:00');
      expect(removeSeconds('01:23:45')).toBe('01:23');
      expect(removeSeconds('09:08:07')).toBe('09:08');
    });

    test('should handle afternoon times', () => {
      expect(removeSeconds('13:14:15')).toBe('13:14');
      expect(removeSeconds('18:30:22')).toBe('18:30');
      expect(removeSeconds('20:45:50')).toBe('20:45');
    });

    test('should handle times with single-digit components', () => {
      expect(removeSeconds('1:2:3')).toBe('1:2');
      expect(removeSeconds('5:5:5')).toBe('5:5');
      expect(removeSeconds('9:9:9')).toBe('9:9');
    });

    test('should handle edge case times', () => {
      expect(removeSeconds('00:00:01')).toBe('00:00');
      expect(removeSeconds('23:59:00')).toBe('23:59');
      expect(removeSeconds('12:00:00')).toBe('12:00');
    });
  });

  describe('Invalid Time Formats', () => {
    test('should return original string if not HH:MM:SS format', () => {
      expect(removeSeconds('08:15')).toBe('08:15');
      expect(removeSeconds('12:30')).toBe('12:30');
    });

    test('should return original if too many colons', () => {
      expect(removeSeconds('08:15:45:00')).toBe('08:15:45:00');
      expect(removeSeconds('12:30:00:00:00')).toBe('12:30:00:00:00');
    });

    test('should return original if too few colons', () => {
      expect(removeSeconds('0815')).toBe('0815');
      expect(removeSeconds('12')).toBe('12');
    });

    test('should process strings with 3 colon-separated parts regardless of validity', () => {
      // The function only checks format (3 parts), not if values are valid times
      expect(removeSeconds('not:a:time')).toBe('not:a');
      expect(removeSeconds('aa:bb:cc')).toBe('aa:bb');
      expect(removeSeconds('25:70:99')).toBe('25:70');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      expect(removeSeconds('')).toBe('');
    });

    test('should handle strings with only colons', () => {
      // '::' splits into ['', '', ''] which has 3 parts, so first 2 joined = ':'
      expect(removeSeconds('::')).toBe(':');
      // ':::' splits into ['', '', '', ''] which has 4 parts, returns original
      expect(removeSeconds(':::')).toBe(':::');
    });

    test('should handle strings with spaces', () => {
      // '08 : 15 : 45' has 3 colon-separated parts, so it processes it
      expect(removeSeconds('08 : 15 : 45')).toBe('08 : 15 ');
      // ' 08:15:45 ' also has 3 parts
      expect(removeSeconds(' 08:15:45 ')).toBe(' 08:15');
    });

    test('should handle partial time components', () => {
      expect(removeSeconds('08::45')).toBe('08:');
      expect(removeSeconds(':15:45')).toBe(':15');
      expect(removeSeconds('08:15:')).toBe('08:15');
    });
  });

  describe('Non-string Inputs', () => {
    test('should return non-string inputs unchanged', () => {
      expect(removeSeconds(null)).toBe(null);
      expect(removeSeconds(undefined)).toBe(undefined);
      expect(removeSeconds(123)).toBe(123);
      expect(removeSeconds(true)).toBe(true);
      expect(removeSeconds(false)).toBe(false);
    });

    test('should return objects unchanged', () => {
      const obj = { time: '08:15:45' };
      expect(removeSeconds(obj)).toBe(obj);
    });

    test('should return arrays unchanged', () => {
      const arr = ['08:15:45'];
      expect(removeSeconds(arr)).toBe(arr);
    });
  });

  describe('Special Time Values', () => {
    test('should handle midnight', () => {
      expect(removeSeconds('00:00:00')).toBe('00:00');
      expect(removeSeconds('24:00:00')).toBe('24:00');
    });

    test('should handle noon', () => {
      expect(removeSeconds('12:00:00')).toBe('12:00');
    });

    test('should handle times with high seconds', () => {
      expect(removeSeconds('08:15:59')).toBe('08:15');
      expect(removeSeconds('23:59:58')).toBe('23:59');
    });
  });

  describe('Real-world Use Cases', () => {
    test('should format publication times from API', () => {
      expect(removeSeconds('08:15:45')).toBe('08:15');
      expect(removeSeconds('14:30:22')).toBe('14:30');
      expect(removeSeconds('17:45:00')).toBe('17:45');
    });

    test('should work with splitDateTime output', () => {
      const dateTime = '27/11/2025 08:15:45';
      const [date, time] = dateTime.split(' ');
      expect(removeSeconds(time)).toBe('08:15');
    });

    test('should format multiple times in sequence', () => {
      const times = ['08:15:45', '09:30:00', '14:45:30'];
      const formatted = times.map(removeSeconds);
      expect(formatted).toEqual(['08:15', '09:30', '14:45']);
    });
  });

  describe('Whitespace and Special Characters', () => {
    test('should process times with leading/trailing whitespace', () => {
      // The function splits by ':' so spaces become part of the components
      expect(removeSeconds(' 08:15:45')).toBe(' 08:15');
      // Trailing space is part of the last component (45 ), which gets removed
      expect(removeSeconds('08:15:45 ')).toBe('08:15');
    });

    test('should handle time with tabs', () => {
      expect(removeSeconds('08\t15\t45')).toBe('08\t15\t45');
    });

    test('should handle time with newlines', () => {
      expect(removeSeconds('08\n15\n45')).toBe('08\n15\n45');
    });
  });

  describe('Boundary Values', () => {
    test('should handle maximum time values', () => {
      expect(removeSeconds('23:59:59')).toBe('23:59');
      expect(removeSeconds('99:99:99')).toBe('99:99'); // Invalid but correct format
    });

    test('should handle minimum time values', () => {
      expect(removeSeconds('00:00:00')).toBe('00:00');
      expect(removeSeconds('0:0:0')).toBe('0:0');
    });

    test('should handle three-digit components', () => {
      expect(removeSeconds('123:456:789')).toBe('123:456');
    });
  });

  describe('Consistency', () => {
    test('should produce consistent results for same input', () => {
      const time = '08:15:45';
      expect(removeSeconds(time)).toBe(removeSeconds(time));
    });

    test('should be idempotent for already formatted times', () => {
      const time = '08:15';
      expect(removeSeconds(time)).toBe(time);
      expect(removeSeconds(removeSeconds(time))).toBe(time);
    });
  });

  describe('Integration with Other Utilities', () => {
    test('should work with time strings from datetime splits', () => {
      // Simulating usage with splitDateTime
      const datetime = '27/11/2025 08:15:45';
      const parts = datetime.split(' ');
      if (parts.length === 2) {
        expect(removeSeconds(parts[1])).toBe('08:15');
      }
    });

    test('should handle batch processing', () => {
      const times = [
        '08:15:45',
        '09:30:00',
        '10:45:30',
        '12:00:15',
        '14:30:45'
      ];
      
      const result = times.map(removeSeconds);
      
      expect(result).toEqual([
        '08:15',
        '09:30',
        '10:45',
        '12:00',
        '14:30'
      ]);
    });
  });

  describe('Error Resilience', () => {
    test('should handle very long strings', () => {
      const longString = '08:15:45' + ':'.repeat(100);
      expect(removeSeconds(longString)).toBe(longString);
    });

    test('should handle strings with multiple valid time patterns', () => {
      expect(removeSeconds('08:15:45:16:30:00')).toBe('08:15:45:16:30:00');
    });

    test('should not throw errors on unusual inputs', () => {
      expect(() => removeSeconds('☺:☺:☺')).not.toThrow();
      expect(() => removeSeconds('🕐:🕑:🕒')).not.toThrow();
    });
  });
});
