import { ConvexHttpClient } from 'convex/browser';
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from 'convex/server';
import { getFunctionName, makeFunctionReference } from 'convex/server';
import React from 'react';

import { publicConvexUrl } from '@/lib/public-config';

const publicConvexClient = publicConvexUrl
  ? new ConvexHttpClient(publicConvexUrl, { logger: false })
  : null;

function getPublicConvexHost() {
  if (!publicConvexUrl) return 'not-configured';

  try {
    return new URL(publicConvexUrl).host;
  } catch {
    return publicConvexUrl;
  }
}

function describeConvexError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.trim();
    const name = error.name.trim();
    return [name === 'Error' ? null : name, message || null]
      .filter(Boolean)
      .join(': ') || 'Unknown Convex query error.';
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== '{}') {
      return serialized;
    }
  } catch {
    // Fall through to the generic message.
  }

  return 'Unknown Convex query error.';
}

function inspectConvexError(error: unknown) {
  if (!(error instanceof Error)) {
    return error;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 4).join('\n'),
    cause: error.cause,
    properties: Object.fromEntries(
      Object.getOwnPropertyNames(error).map((key) => [key, (error as unknown as Record<string, unknown>)[key]]),
    ),
  };
}

/**
 * Runs a public Convex query through the HTTP client instead of the realtime
 * React client. This keeps guest-facing reads working in standalone APKs where
 * the websocket/auth setup can differ from local dev builds.
 */
export function usePublicConvexQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query> | null,
) {
  const [data, setData] = React.useState<FunctionReturnType<Query> | undefined>(undefined);
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(Boolean(publicConvexClient));
  const requestIdRef = React.useRef(0);
  const queryName = getFunctionName(query);
  const argsKey = JSON.stringify(args);
  const argsKeyRef = React.useRef(argsKey);
  const stableArgsRef = React.useRef<FunctionArgs<Query> | null>(args);
  const stableQuery = React.useMemo(
    () => makeFunctionReference<'query', FunctionArgs<Query>, FunctionReturnType<Query>>(queryName),
    [queryName],
  );

  if (argsKeyRef.current !== argsKey) {
    argsKeyRef.current = argsKey;
    stableArgsRef.current = args;
  }

  const load = React.useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const stableArgs = stableArgsRef.current;

    if (!publicConvexClient) {
      setData(undefined);
      setError(new Error('EXPO_PUBLIC_CONVEX_URL is not configured.'));
      setIsLoading(false);
      return;
    }

    if (stableArgs === null) {
      setData(undefined);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicConvexClient.query(stableQuery, stableArgs);
      if (requestId !== requestIdRef.current) return;
      setData(result);
    } catch (queryError) {
      if (requestId !== requestIdRef.current) return;
      const errorMessage = describeConvexError(queryError);
      console.error('[Convex public query] failed', {
        queryName,
        convexHost: getPublicConvexHost(),
        errorMessage,
        error: inspectConvexError(queryError),
      });
      setError(new Error(errorMessage));
      setData(undefined);
    } finally {
      if (requestId !== requestIdRef.current) return;
      setIsLoading(false);
    }
  }, [queryName, stableQuery]);

  React.useEffect(() => {
    void argsKey;
    void load();
  }, [argsKey, load]);

  return {
    data,
    error,
    isLoading,
    refetch: load,
  };
}
