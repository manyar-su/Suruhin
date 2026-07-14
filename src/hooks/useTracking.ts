import { useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { type MapCoordinate } from '../lib/mapbox/helpers';

export interface TrackingSnapshot extends MapCoordinate {
  bookingId: string;
  recordedAt: string;
  role: 'customer' | 'talent';
}

type TrackingConnectionState = 'idle' | 'connecting' | 'connected' | 'fallback' | 'error';

interface UseTrackingOptions {
  bookingId: string;
  enabled: boolean;
  publishedTalentLocation?: MapCoordinate | null;
  role: 'customer' | 'talent' | 'admin';
}

const STORAGE_KEY_PREFIX = 'suruhin_realtime_tracking';
const LOCAL_EVENT_NAME = 'suruhin_tracking_broadcast';

/**
 * Publishes and subscribes talent tracking updates through Supabase Realtime with local fallback.
 */
export function useTracking({ bookingId, enabled, publishedTalentLocation, role }: UseTrackingOptions) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const channelRef = useRef<any>(null);
  const [talentLocation, setTalentLocation] = useState<TrackingSnapshot | null>(null);
  const [connectionState, setConnectionState] = useState<TrackingConnectionState>('idle');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const handleSnapshot = (snapshot: TrackingSnapshot) => {
      if (snapshot.bookingId !== bookingId || snapshot.role !== 'talent') {
        return;
      }

      setTalentLocation(snapshot);
      setLastUpdatedAt(snapshot.recordedAt);
      localStorage.setItem(getTrackingStorageKey(bookingId), JSON.stringify(snapshot));
    };

    const localListener = (event: Event) => {
      const payload = (event as CustomEvent<TrackingSnapshot>).detail;
      if (payload) {
        handleSnapshot(payload);
      }
    };

    window.addEventListener(LOCAL_EVENT_NAME, localListener as EventListener);

    const cached = localStorage.getItem(getTrackingStorageKey(bookingId));
    if (cached) {
      try {
        handleSnapshot(JSON.parse(cached) as TrackingSnapshot);
      } catch (error) {
        console.error(error);
      }
    }

    if (!enabled) {
      setConnectionState('idle');
      return () => {
        window.removeEventListener(LOCAL_EVENT_NAME, localListener as EventListener);
      };
    }

    if (!supabase) {
      setConnectionState('fallback');
      return () => {
        window.removeEventListener(LOCAL_EVENT_NAME, localListener as EventListener);
      };
    }

    setConnectionState('connecting');

    const channel = supabase.channel(`tracking:${bookingId}`, {
      config: {
        broadcast: {
          self: true,
        },
      },
    });

    channel
      .on('broadcast', { event: 'location_update' }, ({ payload }: { payload: TrackingSnapshot }) => {
        handleSnapshot(payload);
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionState('error');
        }
      });

    channelRef.current = channel;

    return () => {
      window.removeEventListener(LOCAL_EVENT_NAME, localListener as EventListener);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [bookingId, enabled, supabase]);

  useEffect(() => {
    if (!enabled || role !== 'talent' || !publishedTalentLocation) {
      return;
    }

    const snapshot: TrackingSnapshot = {
      ...publishedTalentLocation,
      bookingId,
      role: 'talent',
      recordedAt: new Date().toISOString(),
    };

    setTalentLocation(snapshot);
    setLastUpdatedAt(snapshot.recordedAt);
    localStorage.setItem(getTrackingStorageKey(bookingId), JSON.stringify(snapshot));
    window.dispatchEvent(new CustomEvent<TrackingSnapshot>(LOCAL_EVENT_NAME, { detail: snapshot }));

    if (channelRef.current) {
      channelRef.current
        .send({
          type: 'broadcast',
          event: 'location_update',
          payload: snapshot,
        })
        .catch((error: unknown) => {
          console.error(error);
          setConnectionState('fallback');
        });
    }
  }, [bookingId, enabled, publishedTalentLocation?.latitude, publishedTalentLocation?.longitude, role]);

  return {
    connectionState,
    lastUpdatedAt,
    talentLocation,
  };
}

function getTrackingStorageKey(bookingId: string) {
  return `${STORAGE_KEY_PREFIX}:${bookingId}`;
}
