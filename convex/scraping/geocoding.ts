import type { ScrapedVdscEvent } from './vdscTypes';

const DRESDEN_FALLBACK_CITY = 'Dresden';

export type GeocodedLocation = {
  latitude: number;
  longitude: number;
  displayName?: string;
};

type NominatimResponseRow = {
  lat?: string;
  lon?: string;
  display_name?: string;
  importance?: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country_code?: string;
  };
};

function normalizeAscii(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function buildGeocodingQueryKey(queryText: string) {
  return normalizeAscii(queryText)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function buildClubGeocodingQuery(event: ScrapedVdscEvent, canonicalClubName: string) {
  const city = event.city?.trim() || DRESDEN_FALLBACK_CITY;
  const normalizedCity = normalizeAscii(city);

  if (event.addressLine?.trim()) {
    const addressLine = event.addressLine.trim();
    const hasCityInAddress = normalizeAscii(addressLine).includes(normalizedCity);
    if (hasCityInAddress) {
      return `${canonicalClubName}, ${addressLine}, Germany`;
    }
    return `${canonicalClubName}, ${addressLine}, ${city}, Germany`;
  }

  if (event.locationName?.trim()) {
    return `${event.locationName.trim()}, ${city}, Germany`;
  }

  return `${canonicalClubName}, ${city}, Germany`;
}

function scoreCandidate(candidate: NominatimResponseRow, preferredCity: string) {
  const city = candidate.address?.city ?? candidate.address?.town ?? candidate.address?.village;
  const cityScore = city && normalizeAscii(city) === normalizeAscii(preferredCity) ? 2 : 0;
  const countryScore = candidate.address?.country_code === 'de' ? 1 : 0;
  const importanceScore = candidate.importance ?? 0;
  return importanceScore + cityScore + countryScore;
}

export function pickBestNominatimCandidate(
  rows: NominatimResponseRow[],
  preferredCity: string,
): GeocodedLocation | null {
  let best: NominatimResponseRow | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const row of rows) {
    if (!row.lat || !row.lon) {
      continue;
    }

    const latitude = Number(row.lat);
    const longitude = Number(row.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue;
    }

    const score = scoreCandidate(row, preferredCity);
    if (score > bestScore) {
      best = row;
      bestScore = score;
    }
  }

  if (!best?.lat || !best.lon) {
    return null;
  }

  return {
    latitude: Number(best.lat),
    longitude: Number(best.lon),
    displayName: best.display_name,
  };
}

export async function geocodeWithNominatim(
  queryText: string,
  preferredCity: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeocodedLocation | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', queryText);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'de');
  url.searchParams.set('limit', '5');

  const response = await fetchImpl(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'DDiscover/1.0 (student project geocoder)',
    },
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as unknown;
  if (!Array.isArray(json)) {
    return null;
  }

  return pickBestNominatimCandidate(json as NominatimResponseRow[], preferredCity);
}
