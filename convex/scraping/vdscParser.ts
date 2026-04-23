import type { ScrapedVdscEvent } from './vdscTypes';

type VdscCalendarEvent = {
  summary?: unknown;
  dtstart?: unknown;
  location?: unknown;
  url?: unknown;
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function slugPart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractClubName(location: string) {
  return normalizeText(location.split(/\r?\n|,|·/)[0] ?? location);
}

function parseLocationParts(rawLocation: string) {
  const normalizedLocation = rawLocation.replace(/Â·/g, '·');
  const lineParts = normalizedLocation
    .split(/\r?\n/)
    .map((part) => normalizeText(part))
    .filter(Boolean);

  if (lineParts.length > 1) {
    return {
      locationName: lineParts[0],
      addressLine: lineParts.slice(1).join(', '),
    };
  }

  const separator = normalizedLocation.includes('·') ? '·' : ',';
  const inlineParts = normalizedLocation
    .split(separator)
    .map((part) => normalizeText(part))
    .filter(Boolean);

  return {
    locationName: inlineParts[0] ?? normalizeText(normalizedLocation),
    addressLine: inlineParts.slice(1).join(', ') || undefined,
  };
}

function parsePostalCodeAndCity(addressLine?: string) {
  if (!addressLine) {
    return { postalCode: undefined, city: undefined };
  }

  const parts = addressLine
    .split(',')
    .map((part) => normalizeText(part))
    .filter(Boolean);

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const postalCodeOnly = part.match(/^(\d{5})$/);
    if (postalCodeOnly) {
      return {
        postalCode: postalCodeOnly[1],
        city: parts[index - 2] ?? parts[index - 1],
      };
    }

    const combined = part.match(/^(\d{5})\s+(.+)$/);
    if (combined) {
      return {
        postalCode: combined[1],
        city: normalizeText(combined[2]),
      };
    }
  }

  return { postalCode: undefined, city: undefined };
}

function buildSourceKey(event: Pick<ScrapedVdscEvent, 'clubName' | 'startsAt' | 'title' | 'sourceUrl'>) {
  return [
    new Date(event.startsAt).toISOString(),
    event.clubName,
    event.title,
    event.sourceUrl ?? '',
  ]
    .map(slugPart)
    .join('__');
}

function parseStart(value: string) {
  const timestamp = Date.parse(value);

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateOnlyMatch) {
    return null;
  }

  const [, year, month, day] = dateOnlyMatch;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
}

export function parseVdscCalendarEvents(rawEvents: unknown): ScrapedVdscEvent[] {
  if (!Array.isArray(rawEvents)) {
    return [];
  }

  const events: ScrapedVdscEvent[] = [];

  for (const rawEvent of rawEvents as VdscCalendarEvent[]) {
    if (
      typeof rawEvent.summary !== 'string' ||
      typeof rawEvent.dtstart !== 'string' ||
      typeof rawEvent.location !== 'string'
    ) {
      continue;
    }

    const title = normalizeText(rawEvent.summary);
    const rawLocation = normalizeText(rawEvent.location);
    const { locationName, addressLine } = parseLocationParts(rawEvent.location);
    const clubName = extractClubName(rawEvent.location);
    const { postalCode, city } = parsePostalCodeAndCity(addressLine);
    const startsAt = parseStart(rawEvent.dtstart);
    const sourceUrl = typeof rawEvent.url === 'string' ? rawEvent.url : undefined;

    if (!title || !locationName || !clubName || startsAt === null) {
      continue;
    }

    const event = {
      clubName,
      locationName,
      rawLocation,
      addressLine,
      postalCode,
      city,
      dayText: rawEvent.dtstart.slice(0, 10),
      timeText: rawEvent.dtstart.includes('T') ? rawEvent.dtstart.slice(11, 16) : '00:00',
      title,
      startsAt,
      source: 'vdsc' as const,
      sourceUrl,
    };

    events.push({
      ...event,
      sourceKey: buildSourceKey(event),
    });
  }

  return events;
}
