export type PreviewClub = {
  id: string;
  name: string;
  district: string;
  category: string;
  minutesAway: number;
  walkDistance: string;
  tonight: string;
  imageUrl: string;
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
    walkDistance: '420 m',
    tonight: '2000er Party',
    imageUrl:
      'https://images.unsplash.com/photo-1571266028243-9b0f0a6f7e7d?auto=format&fit=crop&w=900&q=80',
    x: '73%',
    y: '60%',
  },
  {
    id: 'countdown',
    name: 'CountDown',
    district: 'Suedvorstadt',
    category: 'Live / Party',
    minutesAway: 11,
    walkDistance: '280 m',
    tonight: 'Campus Warm-up',
    imageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    x: '61%',
    y: '72%',
  },
  {
    id: 'wu5',
    name: 'Wu5',
    district: 'Neustadt',
    category: 'Electro',
    minutesAway: 22,
    walkDistance: '360 m',
    tonight: 'Bassgarten',
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
    x: '42%',
    y: '34%',
  },
  {
    id: 'haengemathe',
    name: 'Club HangeMathe',
    district: 'Suedvorstadt',
    category: 'Student Club',
    minutesAway: 9,
    walkDistance: '190 m',
    tonight: 'Tresengefluester',
    imageUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    x: '36%',
    y: '66%',
  },
  {
    id: 'aquarium',
    name: 'Club Aquarium',
    district: 'Johannstadt',
    category: 'Concert',
    minutesAway: 26,
    walkDistance: '510 m',
    tonight: 'Live Session',
    imageUrl:
      'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?auto=format&fit=crop&w=900&q=80',
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

export const calendarDays = [
  { shortLabel: 'Mo', day: '27' },
  { shortLabel: 'Di', day: '28' },
  { shortLabel: 'Mi', day: '29' },
  { shortLabel: 'Do', day: '30' },
  { shortLabel: 'Fr', day: '31' },
  { shortLabel: 'Sa', day: '01' },
  { shortLabel: 'So', day: '02' },
] as const;
