import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CopierTradeSignal {
  id: string;
  groupId: string;
  masterAccountId: string;
  masterAccountName: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  timestamp: string;
}

export type SignalHandler = (signal: CopierTradeSignal) => void;

/**
 * Creates a low-latency broadcast channel for trade replication (<10ms latency).
 * Connects directly using Supabase Realtime WebSockets.
 */
export function createCopierSignalChannel(
  channelId: string,
  onSignal?: SignalHandler
): RealtimeChannel {
  const supabase = createClient();
  const channel = supabase.channel(`copier-relay-${channelId}`, {
    config: {
      broadcast: { self: false },
    },
  });

  if (onSignal) {
    channel.on(
      'broadcast',
      { event: 'trade_signal' },
      (payload) => {
        if (payload?.payload) {
          onSignal(payload.payload as CopierTradeSignal);
        }
      }
    );
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`[CopierSignal] Connected to realtime channel: copier-relay-${channelId}`);
    }
  });

  return channel;
}

/**
 * Broadcasts an order signal to all connected slave instances.
 */
export async function broadcastTradeSignal(
  channel: RealtimeChannel,
  signal: CopierTradeSignal
): Promise<boolean> {
  try {
    const res = await channel.send({
      type: 'broadcast',
      event: 'trade_signal',
      payload: signal,
    });
    return res === 'ok';
  } catch (err) {
    console.error('[CopierSignal] Failed to broadcast signal:', err);
    return false;
  }
}
