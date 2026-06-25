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

  test('falls back to normal image tags when metadata is missing', () => {
    const html = '<img alt="Startseite" src="/sites/default/files/LOGO_2.png" width="150" />';

    expect(extractEventImageUrlFromHtml(html, 'https://wu5.de/kalender')).toBe(
      'https://wu5.de/sites/default/files/LOGO_2.png',
    );
  });

  test('uses the first srcset image candidate from normal image tags', () => {
    const html = '<img alt="Event" srcset="/small.jpg 320w, /large.jpg 960w" />';

    expect(extractEventImageUrlFromHtml(html, 'https://club.example/events/opening/')).toBe(
      'https://club.example/small.jpg',
    );
  });
});
