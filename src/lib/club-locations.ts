const DRESDEN_CENTER = {
  latitude: 51.0504,
  longitude: 13.7373,
};

const KNOWN_CLUB_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'club-aquarium': { latitude: 51.0448, longitude: 13.7446 },
  'club-haengemathe': { latitude: 51.0284, longitude: 13.7265 },
  'club-countdown': { latitude: 51.0289, longitude: 13.7292 },
  'club-11': { latitude: 51.0463, longitude: 13.7412 },
  'club-wu5': { latitude: 51.0625, longitude: 13.7524 },
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

export function resolveClubCoordinates(
  slug: string,
  latitude?: number,
  longitude?: number,
) {
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { latitude, longitude };
  }

  const known = KNOWN_CLUB_COORDINATES[slug];
  if (known) {
    return known;
  }

  const { latOffset, lngOffset } = deterministicOffset(slug);
  return {
    latitude: DRESDEN_CENTER.latitude + latOffset,
    longitude: DRESDEN_CENTER.longitude + lngOffset,
  };
}

export { DRESDEN_CENTER };
