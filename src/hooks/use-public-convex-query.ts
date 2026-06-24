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
      setError(queryError instanceof Error ? queryError : new Error('Convex query failed.'));
      setData(undefined);
    } finally {
      if (requestId !== requestIdRef.current) return;
      setIsLoading(false);
    }
  }, [stableQuery]);

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
