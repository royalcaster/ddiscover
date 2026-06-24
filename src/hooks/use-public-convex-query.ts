import { ConvexHttpClient } from 'convex/browser';
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from 'convex/server';
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
  const argsKey = React.useMemo(() => JSON.stringify(args), [args]);

  const load = React.useCallback(async () => {
    if (!publicConvexClient) {
      setData(undefined);
      setError(new Error('EXPO_PUBLIC_CONVEX_URL is not configured.'));
      setIsLoading(false);
      return;
    }

    if (args === null) {
      setData(undefined);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await publicConvexClient.query(query, args);
      setData(result);
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError : new Error('Convex query failed.'));
      setData(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [argsKey, query]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    error,
    isLoading,
    refetch: load,
  };
}
