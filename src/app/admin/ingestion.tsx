import { useAuth, useUser } from '@clerk/expo';
import { ConvexHttpClient } from 'convex/browser';
import type { FunctionReturnType } from 'convex/server';
import { Check, RefreshCw, RotateCcw, X } from 'lucide-react-native';
import React from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { publicConvexUrl } from '@/lib/public-config';
import { useTheme } from '@/hooks/use-theme';

type ReviewData = FunctionReturnType<typeof api.ingestion.listReviewCandidates>;
type VenueCandidate = ReviewData['venueCandidates'][number];
type EventCandidate = ReviewData['eventCandidates'][number];

function createAuthenticatedConvexClient(token: string) {
  if (!publicConvexUrl) {
    throw new Error('EXPO_PUBLIC_CONVEX_URL is not configured.');
  }

  return new ConvexHttpClient(publicConvexUrl, { auth: token, logger: false });
}

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function CandidateMeta({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return (
    <View className="gap-0.5">
      <Text className="text-muted-foreground text-xs font-semibold uppercase">{label}</Text>
      <Text className="text-sm text-foreground">{String(value)}</Text>
    </View>
  );
}

function EvidenceList({ snippets }: { snippets: string[] }) {
  if (snippets.length === 0) {
    return <Text className="text-muted-foreground text-sm">No evidence snippets were provided.</Text>;
  }

  return (
    <View className="gap-2">
      {snippets.map((snippet) => (
        <View key={snippet} className="rounded-md bg-secondary px-3 py-2">
          <Text className="text-sm leading-5 text-secondary-foreground">{snippet}</Text>
        </View>
      ))}
    </View>
  );
}

function ActionButton({
  children,
  icon,
  onPress,
  variant = 'secondary',
}: {
  children: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  return (
    <Button className="min-w-[136px]" onPress={onPress} size="sm" variant={variant}>
      {icon}
      <Text>{children}</Text>
    </Button>
  );
}

function VenueCandidateCard({
  candidate,
  isBusy,
  onApprove,
  onReject,
  onNeedsRecheck,
}: {
  candidate: VenueCandidate;
  isBusy: boolean;
  onApprove: (candidateId: Id<'venueCandidates'>) => void;
  onReject: (candidateId: Id<'venueCandidates'>) => void;
  onNeedsRecheck: (candidateId: Id<'venueCandidates'>) => void;
}) {
  const theme = useTheme();

  return (
    <Card className="gap-4 rounded-lg py-4">
      <CardHeader className="gap-3 px-4">
        <View className="flex-row flex-wrap items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <CardTitle className="text-xl leading-6">{candidate.googleName ?? candidate.name}</CardTitle>
            <CardDescription>{candidate.googleFormattedAddress ?? candidate.addressLine ?? candidate.city}</CardDescription>
          </View>
          <Badge variant={candidate.status === 'needs_recheck' ? 'outline' : 'secondary'}>
            <Text>{candidate.status}</Text>
          </Badge>
        </View>
      </CardHeader>

      <CardContent className="gap-4 px-4">
        <View className="grid-cols-2 gap-3 md:grid">
          <CandidateMeta label="Confidence" value={`${Math.round(candidate.confidence * 100)}%`} />
          <CandidateMeta label="Source" value={candidate.sourceName} />
          <CandidateMeta label="Google Place ID" value={candidate.googlePlaceId} />
          <CandidateMeta label="Business status" value={candidate.googleBusinessStatus} />
          <CandidateMeta label="Types" value={candidate.googleTypes?.join(', ')} />
          <CandidateMeta label="Website" value={candidate.googleWebsiteUri ?? candidate.websiteUrl} />
        </View>

        <EvidenceList snippets={candidate.evidenceSnippets} />

        <View className="flex-row flex-wrap gap-2">
          <ActionButton
            icon={<Check size={16} color={theme.primaryForeground} />}
            onPress={() => onApprove(candidate._id)}
            variant="default">
            Approve venue
          </ActionButton>
          <ActionButton
            icon={<RotateCcw size={16} color={theme.foreground} />}
            onPress={() => onNeedsRecheck(candidate._id)}
            variant="outline">
            Recheck
          </ActionButton>
          <ActionButton
            icon={<X size={16} color="#ffffff" />}
            onPress={() => onReject(candidate._id)}
            variant="destructive">
            Reject
          </ActionButton>
          {candidate.googleWebsiteUri || candidate.websiteUrl ? (
            <Button
              onPress={() => void Linking.openURL((candidate.googleWebsiteUri ?? candidate.websiteUrl)!)}
              size="sm"
              variant="ghost">
              <Text>Open source</Text>
            </Button>
          ) : null}
        </View>

        {isBusy ? <Text className="text-muted-foreground text-xs">Saving decision...</Text> : null}
      </CardContent>
    </Card>
  );
}

function EventCandidateCard({
  candidate,
  isBusy,
  onApprove,
  onReject,
  onNeedsRecheck,
}: {
  candidate: EventCandidate;
  isBusy: boolean;
  onApprove: (candidateId: Id<'eventCandidates'>) => void;
  onReject: (candidateId: Id<'eventCandidates'>) => void;
  onNeedsRecheck: (candidateId: Id<'eventCandidates'>) => void;
}) {
  const theme = useTheme();

  return (
    <Card className="gap-4 rounded-lg py-4">
      <CardHeader className="gap-3 px-4">
        <View className="flex-row flex-wrap items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <CardTitle className="text-xl leading-6">{candidate.title}</CardTitle>
            <CardDescription>
              {candidate.venueName} · {formatDateTime(candidate.startsAt)}
            </CardDescription>
          </View>
          <Badge variant={candidate.status === 'needs_recheck' ? 'outline' : 'secondary'}>
            <Text>{candidate.status}</Text>
          </Badge>
        </View>
      </CardHeader>

      <CardContent className="gap-4 px-4">
        <View className="grid-cols-2 gap-3 md:grid">
          <CandidateMeta label="Confidence" value={`${Math.round(candidate.confidence * 100)}%`} />
          <CandidateMeta label="Source" value={candidate.sourceName} />
          <CandidateMeta label="Tags" value={candidate.tags.join(', ')} />
          <CandidateMeta label="Ticket URL" value={candidate.ticketUrl} />
          <CandidateMeta label="Warnings" value={candidate.warnings.join(', ')} />
        </View>

        {candidate.description ? (
          <Text className="rounded-md bg-secondary px-3 py-2 text-sm leading-5 text-secondary-foreground">
            {candidate.description}
          </Text>
        ) : null}
        <EvidenceList snippets={candidate.evidenceSnippets} />

        <View className="flex-row flex-wrap gap-2">
          <ActionButton
            icon={<Check size={16} color={theme.primaryForeground} />}
            onPress={() => onApprove(candidate._id)}
            variant="default">
            Approve event
          </ActionButton>
          <ActionButton
            icon={<RotateCcw size={16} color={theme.foreground} />}
            onPress={() => onNeedsRecheck(candidate._id)}
            variant="outline">
            Recheck
          </ActionButton>
          <ActionButton
            icon={<X size={16} color="#ffffff" />}
            onPress={() => onReject(candidate._id)}
            variant="destructive">
            Reject
          </ActionButton>
          <Button onPress={() => void Linking.openURL(candidate.sourceUrl)} size="sm" variant="ghost">
            <Text>Open source</Text>
          </Button>
        </View>

        {isBusy ? <Text className="text-muted-foreground text-xs">Saving decision...</Text> : null}
      </CardContent>
    </Card>
  );
}

export default function IngestionAdminScreen() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [reviewData, setReviewData] = React.useState<ReviewData | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [busyCandidateId, setBusyCandidateId] = React.useState<string | null>(null);

  const loadCandidates = React.useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setReviewData(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = await getToken({ template: 'convex', skipCache: true });
      if (!token) {
        throw new Error('Clerk did not return a Convex JWT.');
      }

      const client = createAuthenticatedConvexClient(token);
      const result = await client.query(api.ingestion.listReviewCandidates, { limit: 60 });
      setReviewData(result);
    } catch (error) {
      console.error('[Ingestion admin] Could not load candidates', error);
      setErrorMessage(error instanceof Error ? error.message : 'Could not load ingestion candidates.');
      setReviewData(null);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  React.useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  const runDecision = React.useCallback(
    async (candidateId: string, action: 'approveVenue' | 'approveEvent' | 'rejectVenue' | 'rejectEvent' | 'recheckVenue' | 'recheckEvent') => {
      setBusyCandidateId(candidateId);
      setErrorMessage(null);

      try {
        const token = await getToken({ template: 'convex', skipCache: true });
        if (!token) {
          throw new Error('Clerk did not return a Convex JWT.');
        }

        const client = createAuthenticatedConvexClient(token);
        if (action === 'approveVenue') {
          await client.mutation(api.ingestion.approveVenueCandidate, {
            candidateId: candidateId as Id<'venueCandidates'>,
          });
        } else if (action === 'approveEvent') {
          await client.mutation(api.ingestion.approveEventCandidate, {
            candidateId: candidateId as Id<'eventCandidates'>,
          });
        } else if (action === 'rejectVenue') {
          await client.mutation(api.ingestion.updateCandidateStatus, {
            candidateType: 'venue',
            candidateId,
            status: 'rejected',
          });
        } else if (action === 'rejectEvent') {
          await client.mutation(api.ingestion.updateCandidateStatus, {
            candidateType: 'event',
            candidateId,
            status: 'rejected',
          });
        } else if (action === 'recheckVenue') {
          await client.mutation(api.ingestion.updateCandidateStatus, {
            candidateType: 'venue',
            candidateId,
            status: 'needs_recheck',
          });
        } else {
          await client.mutation(api.ingestion.updateCandidateStatus, {
            candidateType: 'event',
            candidateId,
            status: 'needs_recheck',
          });
        }

        await loadCandidates();
      } catch (error) {
        console.error('[Ingestion admin] Could not save decision', error);
        setErrorMessage(error instanceof Error ? error.message : 'Could not save review decision.');
      } finally {
        setBusyCandidateId(null);
      }
    },
    [getToken, loadCandidates],
  );

  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;
  const venueCandidates = reviewData?.venueCandidates ?? [];
  const eventCandidates = reviewData?.eventCandidates ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[1120px] gap-4 px-4 pb-16 pt-4">
        <View className="flex-row flex-wrap items-start justify-between gap-4">
          <View className="max-w-[760px] gap-1">
            <Text variant="h1" className="text-left text-[30px] leading-9">
              Ingestion Review
            </Text>
            <Text className="text-muted-foreground text-sm leading-5">
              Review scraped nightlife venues and events before they become public in DDiscover.
            </Text>
            {email ? <Text className="text-muted-foreground text-xs">Signed in as {email}</Text> : null}
          </View>
          <Button disabled={isLoading} onPress={() => void loadCandidates()} variant="outline">
            <RefreshCw size={16} />
            <Text>{isLoading ? 'Loading' : 'Refresh'}</Text>
          </Button>
        </View>

        {!isLoaded ? (
          <Card>
            <CardContent>
              <Text>Loading account state...</Text>
            </CardContent>
          </Card>
        ) : !isSignedIn ? (
          <Card>
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>Use the profile tab to sign in with an admin account, then reload this page.</CardDescription>
            </CardHeader>
          </Card>
        ) : errorMessage ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Review access unavailable</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <View className="gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-3">
            <Text variant="h2" className="border-b-0 pb-0 text-2xl">
              Venue candidates
            </Text>
            <Badge variant="outline">
              <Text>{venueCandidates.length}</Text>
            </Badge>
          </View>

          {venueCandidates.length === 0 ? (
            <Text className="text-muted-foreground text-sm">No venue candidates are waiting for review.</Text>
          ) : (
            venueCandidates.map((candidate) => (
              <VenueCandidateCard
                key={candidate._id}
                candidate={candidate}
                isBusy={busyCandidateId === candidate._id}
                onApprove={(candidateId) => void runDecision(candidateId, 'approveVenue')}
                onNeedsRecheck={(candidateId) => void runDecision(candidateId, 'recheckVenue')}
                onReject={(candidateId) => void runDecision(candidateId, 'rejectVenue')}
              />
            ))
          )}
        </View>

        <View className="gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-3">
            <Text variant="h2" className="border-b-0 pb-0 text-2xl">
              Event candidates
            </Text>
            <Badge variant="outline">
              <Text>{eventCandidates.length}</Text>
            </Badge>
          </View>

          {eventCandidates.length === 0 ? (
            <Text className="text-muted-foreground text-sm">No event candidates are waiting for review.</Text>
          ) : (
            eventCandidates.map((candidate) => (
              <EventCandidateCard
                key={candidate._id}
                candidate={candidate}
                isBusy={busyCandidateId === candidate._id}
                onApprove={(candidateId) => void runDecision(candidateId, 'approveEvent')}
                onNeedsRecheck={(candidateId) => void runDecision(candidateId, 'recheckEvent')}
                onReject={(candidateId) => void runDecision(candidateId, 'rejectEvent')}
              />
            ))
          )}
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL('https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured/')}>
          <Text className="text-muted-foreground text-xs underline">
            n8n should send validated candidate JSON to the Convex ingestion endpoint.
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
