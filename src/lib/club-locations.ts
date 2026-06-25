const DRESDEN_CENTER = {
  latitude: 51.0504,
  longitude: 13.7373,
};

type MvpClubLocation = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  reviewStatus: 'verified' | 'needs-review';
};

/**
 * Fixed MVP fallback registry. The Convex clubs table is the preferred MVP
 * source once a reviewed club row has latitude and longitude.
 */
const MVP_CLUB_LOCATIONS: Record<string, MvpClubLocation> = {
  'club-11': {
    name: 'Club 11',
    address: 'Hochschulstrasse 48, 01069 Dresden',
    latitude: 51.0319016,
    longitude: 13.7307345,
    reviewStatus: 'verified',
  },
  'club-aquarium': {
    name: 'Club Aquarium',
    address: 'St. Petersburger Strasse 21, 01069 Dresden',
    latitude: 51.044806,
    longitude: 13.739937,
    reviewStatus: 'needs-review',
  },
  'club-haengemathe': {
    name: 'Club HaengeMathe',
    address: 'Zeunerstrasse 1f, 01069 Dresden',
    latitude: 51.026865,
    longitude: 13.736716,
    reviewStatus: 'needs-review',
  },
  countdown: {
    name: 'CountDown',
    address: 'Guentzstrasse 22, 01069 Dresden',
    latitude: 51.048418,
    longitude: 13.756782,
    reviewStatus: 'needs-review',
  },
  wu5: {
    name: 'Wu5',
    address: 'August-Bebel-Strasse 12, 01219 Dresden',
    latitude: 51.032329,
    longitude: 13.751618,
    reviewStatus: 'needs-review',
  },
};

function deterministicOffset(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  const latOffset = ((hash % 700) - 350) / 10_000;
  const lngOffset = (((hash >> 3) % 900) - 450) / 10_000;
  return { latOffset, lngOffset };
}

/**
 * Resolves the coordinate shown on the discovery map for a club.
 *
 * Reviewed Convex coordinates win first, curated MVP fallbacks are second, and
 * a deterministic Dresden-area offset is used last so unknown clubs never all
 * collapse onto one marker.
 */
export function resolveClubCoordinates(
  slug: string,
  latitude?: number,
  longitude?: number,
) {
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { latitude, longitude };
  }

  const fixedLocation = MVP_CLUB_LOCATIONS[slug];
  if (fixedLocation) {
    return {
      latitude: fixedLocation.latitude,
      longitude: fixedLocation.longitude,
    };
  }

  const { latOffset, lngOffset } = deterministicOffset(slug);
  return {
    latitude: DRESDEN_CENTER.latitude + latOffset,
    longitude: DRESDEN_CENTER.longitude + lngOffset,
  };
}

export { DRESDEN_CENTER, MVP_CLUB_LOCATIONS };
