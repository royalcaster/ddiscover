import { describe, expect, test } from 'vitest';

import { parseVdscCalendarEvents } from './vdscParser';

describe('parseVdscCalendarEvents', () => {
  test('normalizes VDSC calendar JSON events', () => {
    const events = parseVdscCalendarEvents([
      {
        summary: 'Semester Opening',
        dtstart: '2026-04-24T20:00:00+02:00',
        location: 'Club Aquarium e. V.\nSt. Petersburger Str. 21\n01069 Dresden',
        url: 'https://club-aquarium.de/events/semester-opening/',
      },
    ]);

    expect(events).toEqual([
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
        startsAt: Date.parse('2026-04-24T20:00:00+02:00'),
        source: 'vdsc',
        sourceKey:
          '2026-04-24t18-00-00-000z__club-aquarium-e-v__semester-opening__https-club-aquarium-de-events-semester-opening',
        sourceUrl: 'https://club-aquarium.de/events/semester-opening/',
      },
    ]);
  });

  test('skips malformed events', () => {
    expect(parseVdscCalendarEvents([{ summary: 'Missing date' }])).toEqual([]);
    expect(parseVdscCalendarEvents({ summary: 'Not an array' })).toEqual([]);
  });

  test('parses inline venue and address formats', () => {
    const events = parseVdscCalendarEvents([
      {
        summary: 'Club Night',
        dtstart: '2026-04-28T20:30:00+02:00',
        location: 'CountDown, Güntzstraße 22, Dresden, Sachsen, 01307, Germany',
        url: 'https://countdowndresden.de/event/club-night',
      },
    ]);

    expect(events[0]).toMatchObject({
      clubName: 'CountDown',
      locationName: 'CountDown',
      addressLine: 'Güntzstraße 22, Dresden, Sachsen, 01307, Germany',
      postalCode: '01307',
      city: 'Dresden',
    });
  });
});
