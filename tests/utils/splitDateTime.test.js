import splitDateTime from '@/utils/splitDateTime.js';

describe('splitDateTime', () => {
  describe('Standard DateTime Formats', () => {
    test('should split standard datetime string with space', () => {
      const result = splitDateTime('27/11/2025 08:15:45');
      expect(result).toEqual(['27/11/2025', '08:15:45']);
    });

    test('should split datetime with different date formats', () => {
      expect(splitDateTime('01/01/2025 00:00:00')).toEqual(['01/01/2025', '00:00:00']);
      expect(splitDateTime('15/12/2025 23:59:59')).toEqual(['15/12/2025', '23:59:59']);
      expect(splitDateTime('31/12/2025 12:30:45')).toEqual(['31/12/2025', '12:30:45']);
    });

    test('should split datetime with milliseconds', () => {
      expect(splitDateTime('27/11/2025 08:15:45.123')).toEqual(['27/11/2025', '08:15:45.123']);
      expect(splitDateTime('01/01/2025 00:00:00.000')).toEqual(['01/01/2025', '00:00:00.000']);
      expect(splitDateTime('15/12/2025 23:59:59.999')).toEqual(['15/12/2025', '23:59:59.999']);
    });

    test('should split ISO format datetime', () => {
      expect(splitDateTime('2025-11-27 08:15:45')).toEqual(['2025-11-27', '08:15:45']);
      expect(splitDateTime('2025-01-01 00:00:00')).toEqual(['2025-01-01', '00:00:00']);
    });
  });

  describe('Multiple Spaces', () => {
    test('should handle multiple spaces by creating empty string elements', () => {
      expect(splitDateTime('10/10/2025  12:30:00')).toEqual(['10/10/2025', '', '12:30:00']);
      expect(splitDateTime('10/10/2025   12:30:00')).toEqual(['10/10/2025', '', '', '12:30:00']);
    });

    test('should handle tabs and mixed whitespace', () => {
      expect(splitDateTime('10/10/2025\t12:30:00')).toEqual(['10/10/2025\t12:30:00']);
      expect(splitDateTime('10/10/2025 \t 12:30:00')).toEqual(['10/10/2025', '\t', '12:30:00']);
    });
  });

  describe('No Spaces', () => {
    test('should return single element array when no spaces', () => {
      expect(splitDateTime('27/11/2025')).toEqual(['27/11/2025']);
      expect(splitDateTime('08:15:45')).toEqual(['08:15:45']);
      expect(splitDateTime('no-spaces-here')).toEqual(['no-spaces-here']);
    });

    test('should handle date with dashes or other separators', () => {
      expect(splitDateTime('2025-11-27')).toEqual(['2025-11-27']);
      expect(splitDateTime('27/11/2025-08:15:45')).toEqual(['27/11/2025-08:15:45']);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      expect(splitDateTime('')).toEqual(['']);
    });

    test('should handle string with only spaces', () => {
      expect(splitDateTime(' ')).toEqual(['', '']);
      expect(splitDateTime('  ')).toEqual(['', '', '']);
      expect(splitDateTime('   ')).toEqual(['', '', '', '']);
    });

    test('should handle leading and trailing spaces', () => {
      expect(splitDateTime(' 27/11/2025 08:15:45')).toEqual(['', '27/11/2025', '08:15:45']);
      expect(splitDateTime('27/11/2025 08:15:45 ')).toEqual(['27/11/2025', '08:15:45', '']);
      expect(splitDateTime(' 27/11/2025 08:15:45 ')).toEqual(['', '27/11/2025', '08:15:45', '']);
    });

    test('should handle single space', () => {
      expect(splitDateTime(' ')).toEqual(['', '']);
    });
  });

  describe('Multiple Components', () => {
    test('should split string with more than two parts', () => {
      expect(splitDateTime('date time zone')).toEqual(['date', 'time', 'zone']);
      expect(splitDateTime('27/11/2025 08:15:45 UTC')).toEqual(['27/11/2025', '08:15:45', 'UTC']);
      expect(splitDateTime('Mon 27/11/2025 08:15:45')).toEqual(['Mon', '27/11/2025', '08:15:45']);
    });

    test('should handle full datetime with day name', () => {
      expect(splitDateTime('Monday 27/11/2025 08:15:45')).toEqual(['Monday', '27/11/2025', '08:15:45']);
      expect(splitDateTime('Wed 15/12/2025 23:59:59 GMT')).toEqual(['Wed', '15/12/2025', '23:59:59', 'GMT']);
    });
  });

  describe('Special Characters', () => {
    test('should not split on other separators', () => {
      expect(splitDateTime('27/11/2025T08:15:45')).toEqual(['27/11/2025T08:15:45']);
      expect(splitDateTime('27/11/2025_08:15:45')).toEqual(['27/11/2025_08:15:45']);
      expect(splitDateTime('27/11/2025-08:15:45')).toEqual(['27/11/2025-08:15:45']);
    });

    test('should handle strings with special characters', () => {
      expect(splitDateTime('date@time zone')).toEqual(['date@time', 'zone']);
      expect(splitDateTime('2025-11-27T08:15:45Z')).toEqual(['2025-11-27T08:15:45Z']);
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle typical API datetime response format', () => {
      expect(splitDateTime('27/11/2025 00:00:00')).toEqual(['27/11/2025', '00:00:00']);
    });

    test('should handle publication datetime format', () => {
      expect(splitDateTime('27/11/2025 08:15:45')).toEqual(['27/11/2025', '08:15:45']);
    });

    test('should allow destructuring date and time', () => {
      const [date, time] = splitDateTime('27/11/2025 08:15:45');
      expect(date).toBe('27/11/2025');
      expect(time).toBe('08:15:45');
    });
  });
});
