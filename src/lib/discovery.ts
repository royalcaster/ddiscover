export type PreviewClub = {
  id: string;
  name: string;
  district: string;
  category: string;
  minutesAway: number;
  x: `${number}%`;
  y: `${number}%`;
};

export const previewClubs: PreviewClub[] = [
  {
    id: 'club-11',
    name: 'Club 11',
    district: 'Altstadt',
    category: 'Party',
    minutesAway: 18,
    x: '73%',
    y: '60%',
  },
  {
    id: 'countdown',
    name: 'CountDown',
    district: 'Suedvorstadt',
    category: 'Live / Party',
    minutesAway: 11,
    x: '61%',
    y: '72%',
  },
  {
    id: 'wu5',
    name: 'Wu5',
    district: 'Neustadt',
    category: 'Electro',
    minutesAway: 22,
    x: '42%',
    y: '34%',
  },
  {
    id: 'haengemathe',
    name: 'Club HangeMathe',
    district: 'Suedvorstadt',
    category: 'Student Club',
    minutesAway: 9,
    x: '36%',
    y: '66%',
  },
  {
    id: 'aquarium',
    name: 'Club Aquarium',
    district: 'Johannstadt',
    category: 'Concert',
    minutesAway: 26,
    x: '81%',
    y: '42%',
  },
];

export const previewRoute = [
  { time: '22:15', title: 'Louisenstrasse', detail: 'Zu Fuss (3 Min.)' },
  { time: '22:18', title: 'Louisenstrasse', detail: '7 Weixdorf' },
  { time: '22:34', title: 'Albertplatz', detail: 'Zu Fuss (2 Min.)' },
  { time: '22:38', title: 'Pulse', detail: 'Koenigsbruecker Str. 39' },
];
