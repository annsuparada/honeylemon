/**
 * @jest-environment node
 */

import { extractHeadings, addIdsToHeadings } from '@/app/lib/toc-helpers';

describe('toc-helpers', () => {
  describe('extractHeadings', () => {
    it('extracts h2 headings from HTML', () => {
      const html = '<h2>First Heading</h2><p>Content</p><h2>Second Heading</h2>';
      const result = extractHeadings(html);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'first-heading',
        text: 'First Heading',
        level: 2,
      });
      expect(result[1]).toEqual({
        id: 'second-heading',
        text: 'Second Heading',
        level: 2,
      });
    });

    it('extracts h3 headings', () => {
      const html = '<h3>Nested Heading</h3>';
      const result = extractHeadings(html);

      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(3);
      expect(result[0].text).toBe('Nested Heading');
    });

    it('extracts multiple heading levels', () => {
      const html = '<h2>H2 Heading</h2><h3>H3 Heading</h3><h4>H4 Heading</h4>';
      const result = extractHeadings(html);

      expect(result).toHaveLength(3);
      expect(result[0].level).toBe(2);
      expect(result[1].level).toBe(3);
      expect(result[2].level).toBe(4);
    });

    it('ignores h1 headings', () => {
      const html = '<h1>H1 Heading</h1><h2>H2 Heading</h2>';
      const result = extractHeadings(html);

      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(2);
    });

    it('handles headings with HTML tags inside', () => {
      const html = '<h2>Heading with <strong>bold</strong> text</h2>';
      const result = extractHeadings(html);

      expect(result[0].text).toBe('Heading with bold text');
    });

    it('handles empty headings', () => {
      const html = '<h2></h2><h2>Valid Heading</h2>';
      const result = extractHeadings(html);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Valid Heading');
    });

    it('handles headings with attributes', () => {
      const html = '<h2 class="custom" data-test="value">Heading</h2>';
      const result = extractHeadings(html);

      expect(result[0].text).toBe('Heading');
    });

    it('generates URL-friendly IDs', () => {
      const html = '<h2>Heading With Spaces & Special Chars!</h2>';
      const result = extractHeadings(html);

      expect(result[0].id).toBe('heading-with-spaces-special-chars');
    });

    it('handles empty HTML string', () => {
      const result = extractHeadings('');
      expect(result).toHaveLength(0);
    });

    it('handles HTML without headings', () => {
      const html = '<p>Just some content</p><div>More content</div>';
      const result = extractHeadings(html);

      expect(result).toHaveLength(0);
    });
  });

  describe('addIdsToHeadings', () => {
    it('adds id attributes to h2 headings', () => {
      const html = '<h2>First Heading</h2>';
      const result = addIdsToHeadings(html);

      expect(result).toContain('id="first-heading"');
    });

    it('adds id attributes to multiple headings', () => {
      const html = '<h2>First</h2><h3>Second</h3>';
      const result = addIdsToHeadings(html);

      expect(result).toContain('id="first"');
      expect(result).toContain('id="second"');
    });

    it('preserves existing attributes when adding id', () => {
      const html = '<h2 class="custom">Heading</h2>';
      const result = addIdsToHeadings(html);

      expect(result).toContain('class="custom"');
      expect(result).toContain('id="heading"');
    });

    it('does not add duplicate id if already exists', () => {
      const html = '<h2 id="existing-id">Heading</h2>';
      const result = addIdsToHeadings(html);

      // Should not add another id attribute
      const idMatches = result.match(/id=/g);
      expect(idMatches).toHaveLength(1);
      expect(result).toContain('id="existing-id"');
    });

    it('handles headings with HTML content inside', () => {
      const html = '<h2>Heading with <strong>bold</strong> text</h2>';
      const result = addIdsToHeadings(html);

      expect(result).toContain('id="heading-with-bold-text"');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('skips empty headings', () => {
      const html = '<h2></h2><h2>Valid Heading</h2>';
      const result = addIdsToHeadings(html);

      // Should only add id to valid heading
      expect(result.match(/id=/g)).toHaveLength(1);
      expect(result).toContain('id="valid-heading"');
    });

    it('generates consistent IDs for same text', () => {
      const html = '<h2>Test Heading</h2><h3>Test Heading</h3>';
      const result = addIdsToHeadings(html);

      // Both should have same base ID (though they're different levels)
      expect(result).toContain('id="test-heading"');
    });

    it('handles special characters in heading text', () => {
      const html = '<h2>Heading & More!</h2>';
      const result = addIdsToHeadings(html);

      expect(result).toContain('id="heading-more"');
    });

    it('handles multiple spaces in heading text', () => {
      const html = '<h2>Heading   with    spaces</h2>';
      const result = addIdsToHeadings(html);

      expect(result).toContain('id="heading-with-spaces"');
    });

    it('handles headings with leading/trailing spaces', () => {
      const html = '<h2>  Padded Heading  </h2>';
      const result = addIdsToHeadings(html);

      expect(result).toContain('id="padded-heading"');
    });

    it('handles empty HTML string', () => {
      const result = addIdsToHeadings('');
      expect(result).toBe('');
    });

    it('handles HTML without headings', () => {
      const html = '<p>Just content</p>';
      const result = addIdsToHeadings(html);

      expect(result).toBe(html);
    });

    it('works with h2 through h6', () => {
      const html = '<h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>';
      const result = addIdsToHeadings(html);

      expect(result).toContain('id="h2"');
      expect(result).toContain('id="h3"');
      expect(result).toContain('id="h4"');
      expect(result).toContain('id="h5"');
      expect(result).toContain('id="h6"');
    });
  });
});

