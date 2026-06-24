import { describe, expect, test } from 'vitest';

import { extractEventImageUrlFromHtml } from './eventImages';

describe('extractEventImageUrlFromHtml', () => {
  test('extracts absolute Open Graph images', () => {
    const html = '<meta property="og:image" content="https://club.example/events/cover.jpg" />';

    expect(extractEventImageUrlFromHtml(html, 'https://club.example/events/opening/')).toBe(
      'https://club.example/events/cover.jpg',
    );
  });

  test('resolves relative image URLs and decodes HTML entities', () => {
    const html = '<meta name="twitter:image" content="/images/cover.jpg?size=large&amp;v=1" />';

    expect(extractEventImageUrlFromHtml(html, 'https://club.example/events/opening/')).toBe(
      'https://club.example/images/cover.jpg?size=large&v=1',
    );
  });

  test('falls back to legacy image_src links', () => {
    const html = '<link rel="preload image_src" href="../cover.png" />';

    expect(extractEventImageUrlFromHtml(html, 'https://club.example/events/opening/')).toBe(
      'https://club.example/events/cover.png',
    );
  });
});
