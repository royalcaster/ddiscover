import { describe, expect, test, vi } from 'vitest';

import {
  buildClubGeocodingQuery,
  buildGeocodingQueryKey,
  geocodeWithNominatim,
  pickBestNominatimCandidate,
} from './geocoding';

describe('scraping geocoding helpers', () => {
  test('builds stable query key', () => {
    expect(buildGeocodingQueryKey('Club Aquarium, St. Petersburger Str. 21, 01069 Dresden, Germany')).toBe(
      'club aquarium st petersburger str 21 01069 dresden germany',
    );
  });

  test('builds geocoding query with address preference', () => {
    const query = buildClubGeocodingQuery(
      {
        clubName: 'Club Aquarium e. V.',
        locationName: 'Club Aquarium e. V.',
        rawLocation: 'Club Aquarium e. V. St. Petersburger Str. 21 01069 Dresden',
        addressLine: 'St. Petersburger Str. 21, 01069 Dresden',
        postalCode: '01069',
        city: 'Dresden',
        dayText: '2026-04-24',
        timeText: '20:00',
        title: 'Semester Opening',
        startsAt: new Date(2026, 3, 24, 20, 0).getTime(),
        source: 'vdsc',
        sourceKey: 'key',
      },
      'Club Aquarium',
    );

    expect(query).toBe('Club Aquarium, St. Petersburger Str. 21, 01069 Dresden, Germany');
  });

  test('picks the best candidate by city/country and importance', () => {
    const best = pickBestNominatimCandidate(
      [
        {
          lat: '51.042',
          lon: '13.74',
          importance: 0.7,
          address: { city: 'Leipzig', country_code: 'de' },
        },
        {
          lat: '51.04012',
          lon: '13.73876',
          importance: 0.4,
          display_name: 'Club Aquarium, Dresden, Germany',
          address: { city: 'Dresden', country_code: 'de' },
        },
      ],
      'Dresden',
    );

    expect(best).toMatchObject({
      latitude: 51.04012,
      longitude: 13.73876,
      displayName: 'Club Aquarium, Dresden, Germany',
    });
  });

  test('geocodeWithNominatim returns null for non-ok responses', async () => {
    const fetchMock = vi.fn(async () => new Response('rate limit', { status: 429 }));
    const result = await geocodeWithNominatim('Club Aquarium, Dresden, Germany', 'Dresden', fetchMock as typeof fetch);
    expect(result).toBeNull();
  });
});
