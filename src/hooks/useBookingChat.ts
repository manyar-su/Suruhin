import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';

export interface BookingChatMessage {
  id: string;
  bookingId: string;
  senderId: string | null;
  senderRole: 'customer' | 'talent' | 'admin' | 'system';
  senderName: string;
  message: string;
  createdAt: string;
}

interface UseBookingChatOptions {
  bookingId: string;
  senderId?: string | null;
  senderName: string;
  senderRole: 'customer' | 'talent' | 'admin';
}

const STORAGE_KEY_PREFIX = 'suruhin_booking_chat';

/**
 * Loads and syncs booking chat messages from Supabase with local fallback.
 */
export function useBookingChat({ bookingId, senderId, senderName, senderRole }: UseBookingChatOptions) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [messages, setMessages] = useState<BookingChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const storageKey = getChatStorageKey(bookingId);

    const loadFallback = () => {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as BookingChatMessage[];
          setMessages(parsed);
        } catch (reason) {
          console.error(reason);
        }
      }
      setIsLoading(false);
    };

    if (!supabase) {
      loadFallback();
      return;
    }

    const syncMessages = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: selectError } = await supabase
        .from('booking_messages')
        .select('id, booking_id, sender_id, sender_role, sender_name, message, created_at')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (cancelled) {
        return;
      }

      if (selectError) {
        setError(selectError.message);
        loadFallback();
        return;
      }

      const nextMessages = (data || []).map(mapBookingMessageRow);
      setMessages(nextMessages);
      localStorage.setItem(storageKey, JSON.stringify(nextMessages));
      setIsLoading(false);
    };

    syncMessages().catch((reason) => {
      if (!cancelled) {
        setError(reason instanceof Error ? reason.message : 'Gagal memuat chat.');
        loadFallback();
      }
    });

    const channel = supabase
      .channel(`booking-chat:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const next = mapBookingMessageRow(payload.new);
          setMessages((current) => {
            const filtered = current.filter((item) => item.id !== next.id);
            const updated = [...filtered, next].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
            localStorage.setItem(storageKey, JSON.stringify(updated));
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [bookingId, supabase]);

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return false;
    }

    const storageKey = getChatStorageKey(bookingId);

    if (!supabase) {
      const fallbackMessage: BookingChatMessage = {
        id: `${bookingId}-${Date.now()}`,
        bookingId,
        senderId: senderId || null,
        senderRole,
        senderName,
        message: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => {
        const updated = [...current, fallbackMessage];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
      return true;
    }

    const { error: insertError } = await supabase.from('booking_messages').insert({
      booking_id: bookingId,
      sender_id: senderId || null,
      sender_role: senderRole,
      sender_name: senderName,
      message: trimmed,
    });

    if (insertError) {
      setError(insertError.message);
      return false;
    }

    return true;
  };

  return {
    error,
    isLoading,
    messages,
    sendMessage,
  };
}

function getChatStorageKey(bookingId: string) {
  return `${STORAGE_KEY_PREFIX}:${bookingId}`;
}

function mapBookingMessageRow(row: any): BookingChatMessage {
  return {
    id: String(row.id),
    bookingId: String(row.booking_id),
    senderId: row.sender_id ? String(row.sender_id) : null,
    senderRole: row.sender_role,
    senderName: String(row.sender_name),
    message: String(row.message),
    createdAt: String(row.created_at),
  };
}
