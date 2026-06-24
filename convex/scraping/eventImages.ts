const IMAGE_META_KEYS = new Set([
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'twitter:image',
  'twitter:image:src',
  'image',
]);

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function getHtmlAttribute(tag: string, name: string) {
  const pattern = new RegExp(`${name}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = tag.match(pattern);
  return match ? decodeHtmlAttribute(match[2].trim()) : null;
}

function normalizeImageUrl(candidate: string, pageUrl: string) {
  const firstSrcsetEntry = candidate.split(',')[0]?.trim() ?? candidate;
  const rawUrl = firstSrcsetEntry.split(/\s+/)[0]?.trim();

  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl, pageUrl);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function extractEventImageUrlFromHtml(html: string, pageUrl: string) {
  const head = html.slice(0, 200_000);
  const metaTags = head.match(/<meta\b[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    const key =
      getHtmlAttribute(tag, 'property') ??
      getHtmlAttribute(tag, 'name') ??
      getHtmlAttribute(tag, 'itemprop');
    const content = getHtmlAttribute(tag, 'content');

    if (!key || !content || !IMAGE_META_KEYS.has(key.toLowerCase())) {
      continue;
    }

    const imageUrl = normalizeImageUrl(content, pageUrl);
    if (imageUrl) {
      return imageUrl;
    }
  }

  const linkTags = head.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of linkTags) {
    const rel = getHtmlAttribute(tag, 'rel');
    const href = getHtmlAttribute(tag, 'href');

    if (!rel || !href || !rel.toLowerCase().split(/\s+/).includes('image_src')) {
      continue;
    }

    const imageUrl = normalizeImageUrl(href, pageUrl);
    if (imageUrl) {
      return imageUrl;
    }
  }

  return null;
}
