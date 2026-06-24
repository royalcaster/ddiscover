import { cronJobs } from 'convex/server';

import { internal } from './_generated/api';

const crons = cronJobs();

crons.interval(
  'import vdsc events',
  { hours: 24 },
  internal.scraping.vdsc.importEvents,
  { geocode: true, images: true },
);

export default crons;
