import removeHtmlTags from '@/utils/removeHtmlTags.js';

describe('removeHtmlTags', () => {
  describe('Basic HTML Tag Removal', () => {
    test('should remove simple HTML tags', () => {
      expect(removeHtmlTags('<p>Hello</p>')).toBe('Hello');
      expect(removeHtmlTags('<div>World</div>')).toBe('World');
      expect(removeHtmlTags('<span>Test</span>')).toBe('Test');
    });

    test('should remove self-closing tags', () => {
      expect(removeHtmlTags('Line 1<br/>Line 2')).toBe('Line 1Line 2');
      expect(removeHtmlTags('Image: <img/>')).toBe('Image: ');
      expect(removeHtmlTags('Break<hr/>here')).toBe('Breakhere');
    });

    test('should remove tags with attributes', () => {
      expect(removeHtmlTags('<div class="test">Content</div>')).toBe('Content');
      expect(removeHtmlTags('<a href="http://example.com">Link</a>')).toBe('Link');
      expect(removeHtmlTags('<img src="image.jpg" alt="test"/>')).toBe('');
      expect(removeHtmlTags('<span style="color: red;">Red text</span>')).toBe('Red text');
    });

    test('should remove multiple tags', () => {
      expect(removeHtmlTags('<p><strong>Bold</strong> text</p>')).toBe('Bold text');
      expect(removeHtmlTags('<div><span>Nested</span> content</div>')).toBe('Nested content');
    });
  });

  describe('Complex HTML Structures', () => {
    test('should remove nested tags', () => {
      const html = '<div><p><span>Deeply</span> nested</p> content</div>';
      expect(removeHtmlTags(html)).toBe('Deeply nested content');
    });

    test('should remove tags from formatted text', () => {
      const html = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
      expect(removeHtmlTags(html)).toBe('This is bold and italic text.');
    });

    test('should handle multiple paragraphs', () => {
      const html = '<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>';
      expect(removeHtmlTags(html)).toBe('First paragraphSecond paragraphThird paragraph');
    });

    test('should remove lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
      expect(removeHtmlTags(html)).toBe('Item 1Item 2Item 3');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      expect(removeHtmlTags('')).toBe('');
    });

    test('should handle string with no tags', () => {
      expect(removeHtmlTags('Plain text')).toBe('Plain text');
      expect(removeHtmlTags('Text with numbers 123')).toBe('Text with numbers 123');
    });

    test('should handle string with only tags', () => {
      expect(removeHtmlTags('<div></div>')).toBe('');
      expect(removeHtmlTags('<p><span></span></p>')).toBe('');
    });

    test('should handle incomplete tags', () => {
      expect(removeHtmlTags('Text with < symbol')).toBe('Text with < symbol');
      expect(removeHtmlTags('Text with > symbol')).toBe('Text with > symbol');
    });

    test('should not remove tags with newlines inside them', () => {
      // The regex matches tags on a single line, not across newlines
      const html = '<div\n  class="test"\n>Content</div>';
      // The opening tag spans multiple lines, so it won't be matched
      expect(removeHtmlTags(html)).toBe('<div\n  class="test"\n>Content');
    });
  });

  describe('Special Characters and Entities', () => {
    test('should preserve HTML entities', () => {
      expect(removeHtmlTags('<p>&nbsp;&lt;&gt;&amp;</p>')).toBe('&nbsp;&lt;&gt;&amp;');
      expect(removeHtmlTags('<div>&copy; 2025</div>')).toBe('&copy; 2025');
    });

    test('should handle tags with special characters', () => {
      expect(removeHtmlTags('<p>Price: $100</p>')).toBe('Price: $100');
      expect(removeHtmlTags('<div>Email: test@example.com</div>')).toBe('Email: test@example.com');
    });

    test('should handle unicode characters', () => {
      expect(removeHtmlTags('<p>こんにちは 世界</p>')).toBe('こんにちは 世界');
      expect(removeHtmlTags('<div>🌍 Hello World 🚀</div>')).toBe('🌍 Hello World 🚀');
    });
  });

  describe('Whitespace Handling', () => {
    test('should preserve spaces between text', () => {
      expect(removeHtmlTags('<p>Hello World</p>')).toBe('Hello World');
      expect(removeHtmlTags('<span>First</span> <span>Second</span>')).toBe('First Second');
    });

    test('should preserve leading and trailing spaces', () => {
      expect(removeHtmlTags('<p>  Spaces  </p>')).toBe('  Spaces  ');
      expect(removeHtmlTags(' <div>Content</div> ')).toBe(' Content ');
    });

    test('should handle tabs and newlines in content', () => {
      expect(removeHtmlTags('<p>Line 1\nLine 2</p>')).toBe('Line 1\nLine 2');
      expect(removeHtmlTags('<div>Tab\there</div>')).toBe('Tab\there');
    });
  });

  describe('Script and Style Tags', () => {
    test('should remove script tags but keep content', () => {
      expect(removeHtmlTags('<script>alert("test");</script>')).toBe('alert("test");');
      expect(removeHtmlTags('Text<script>var x = 1;</script>More')).toBe('Textvar x = 1;More');
    });

    test('should remove style tags but keep content', () => {
      expect(removeHtmlTags('<style>.class { color: red; }</style>')).toBe('.class { color: red; }');
      expect(removeHtmlTags('Text<style>body { margin: 0; }</style>More')).toBe('Textbody { margin: 0; }More');
    });
  });

  describe('Comments', () => {
    test('should remove HTML comments', () => {
      expect(removeHtmlTags('Text<!-- Comment -->More')).toBe('TextMore');
      expect(removeHtmlTags('<!-- Start --><p>Content</p><!-- End -->')).toBe('Content');
    });

    test('should not handle multi-line comments', () => {
      // The regex doesn't match across newlines
      const html = `Text<!-- Multi
      line
      comment -->More`;
      expect(removeHtmlTags(html)).toBe(`Text<!-- Multi
      line
      comment -->More`);
    });
  });

  describe('Real-world Use Cases', () => {
    test('should clean formatted lesson descriptions', () => {
      const html = '<p>Argomento: <strong>Matematica</strong></p><p>Descrizione: <em>Equazioni di secondo grado</em></p>';
      expect(removeHtmlTags(html)).toBe('Argomento: MatematicaDescrizione: Equazioni di secondo grado');
    });

    test('should clean simple text with inline formatting', () => {
      const html = 'Il <b>teorema di Pitagora</b> afferma che in un triangolo rettangolo...';
      expect(removeHtmlTags(html)).toBe('Il teorema di Pitagora afferma che in un triangolo rettangolo...');
    });

    test('should handle mixed content', () => {
      const html = 'Testo normale <a href="#">link</a> più testo <span class="highlight">evidenziato</span>.';
      expect(removeHtmlTags(html)).toBe('Testo normale link più testo evidenziato.');
    });
  });

  describe('Malformed HTML', () => {
    test('should handle unclosed tags', () => {
      expect(removeHtmlTags('<p>Unclosed paragraph')).toBe('Unclosed paragraph');
      expect(removeHtmlTags('<div><span>Nested unclosed')).toBe('Nested unclosed');
    });

    test('should handle mismatched tags', () => {
      expect(removeHtmlTags('<p>Text</div>')).toBe('Text');
      expect(removeHtmlTags('<div>Text</span>')).toBe('Text');
    });

    test('should handle tags with angle brackets in attributes', () => {
      // The regex matches from first < to first >, so it removes '<test>' first
      // leaving the rest: 'div data-value="">Content</div>'
      expect(removeHtmlTags('<div data-value="<test>">Content</div>')).toBe('">Content');
    });
  });

  describe('Performance Cases', () => {
    test('should handle long strings', () => {
      const longText = 'Lorem ipsum '.repeat(100);
      const html = `<p>${longText}</p>`;
      expect(removeHtmlTags(html)).toBe(longText);
    });

    test('should handle many tags', () => {
      let html = 'Start';
      for (let i = 0; i < 50; i++) {
        html += `<span>${i}</span>`;
      }
      html += 'End';
      
      let expected = 'Start';
      for (let i = 0; i < 50; i++) {
        expected += i;
      }
      expected += 'End';
      
      expect(removeHtmlTags(html)).toBe(expected);
    });
  });
});
