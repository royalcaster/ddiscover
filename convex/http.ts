import { httpRouter } from 'convex/server';
import type { Infer } from 'convex/values';

import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { ingestionCandidatePayloadValidator } from './ingestion';

type IngestionCandidatePayload = Infer<typeof ingestionCandidatePayloadValidator>;

const http = httpRouter();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

http.route({
  path: '/ingestion/candidates',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const expectedToken = process.env.DDISCOVER_INGESTION_TOKEN;
    if (!expectedToken) {
      return jsonResponse({ error: 'Ingestion token is not configured' }, 503);
    }

    const authorization = request.headers.get('authorization');
    if (authorization !== `Bearer ${expectedToken}`) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const result = await ctx.runMutation(internal.ingestion.ingestCandidatePayload, {
      payload: payload as IngestionCandidatePayload,
    });

    return jsonResponse(result);
  }),
});

export default http;
