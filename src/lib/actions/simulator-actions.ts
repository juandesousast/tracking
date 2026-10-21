'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  BacktestingSession,
  BacktestingPosition,
} from '@/types/database';
import {
  createSessionSchema,
  orderPlacementSchema,
  CreateSessionInput,
  OrderPlacementInput,
} from '@/lib/validations/schemas';
import {
  calculatePositionPnl,
  calculateRMultiple,
} from '@/lib/services/simulator-engine';

export async function getSimulatorSessions(): Promise<BacktestingSession[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('backtesting_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notice: backtesting_sessions table query error:', error.message);
      return [];
    }

    return (data || []).map((s) => ({
      ...s,
      initial_balance: Number(s.initial_balance),
      current_balance: Number(s.current_balance),
    })) as BacktestingSession[];
  } catch (err) {
    console.warn('Fallback: Failed to fetch simulator sessions:', err);
    return [];
  }
}

export async function createSimulatorSession(
  input: CreateSessionInput
): Promise<BacktestingSession> {
  const validated = createSessionSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id || 'demo-user';

  try {
    const { data, error } = await supabase
      .from('backtesting_sessions')
      .insert({
        user_id: userId,
        name: validated.name,
        symbol: validated.symbol,
        initial_balance: validated.initial_balance,
        current_balance: validated.initial_balance,
        start_date: validated.start_date,
        end_date: validated.end_date,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/simulador');
    return {
      ...data,
      initial_balance: Number(data.initial_balance),
      current_balance: Number(data.current_balance),
    } as BacktestingSession;
  } catch (err: any) {
    // Graceful in-memory fallback if database table not yet applied
    const mockSession: BacktestingSession = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: validated.name,
      symbol: validated.symbol,
      initial_balance: validated.initial_balance,
      current_balance: validated.initial_balance,
      start_date: validated.start_date,
      end_date: validated.end_date,
      status: 'in_progress',
      created_at: new Date().toISOString(),
    };
    return mockSession;
  }
}

export async function getSimulatorSession(
  id: string
): Promise<{
  session: BacktestingSession | null;
  positions: BacktestingPosition[];
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: sessionData, error: sessionErr } = await supabase
      .from('backtesting_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (sessionErr || !sessionData) {
      return { session: null, positions: [] };
    }

    const { data: positionsData } = await supabase
      .from('backtesting_positions')
      .select('*')
      .eq('session_id', id)
      .order('entry_time', { ascending: true });

    const session: BacktestingSession = {
      ...sessionData,
      initial_balance: Number(sessionData.initial_balance),
      current_balance: Number(sessionData.current_balance),
    };

    const positions: BacktestingPosition[] = (positionsData || []).map((p) => ({
      ...p,
      quantity: Number(p.quantity),
      entry_price: Number(p.entry_price),
      exit_price: p.exit_price ? Number(p.exit_price) : null,
      stop_loss: p.stop_loss ? Number(p.stop_loss) : null,
      take_profit: p.take_profit ? Number(p.take_profit) : null,
      pnl: p.pnl !== null ? Number(p.pnl) : null,
      r_multiple: p.r_multiple !== null ? Number(p.r_multiple) : null,
    }));

    return { session, positions };
  } catch (err) {
    return { session: null, positions: [] };
  }
}

export async function deleteSimulatorSession(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('backtesting_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    }

    revalidatePath('/simulador');
    return true;
  } catch (err) {
    return true;
  }
}

export async function placeSimulatorOrder(
  input: OrderPlacementInput
): Promise<BacktestingPosition> {
  const validated = orderPlacementSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id || 'demo-user';

  const newPosition: BacktestingPosition = {
    id: crypto.randomUUID(),
    session_id: validated.session_id,
    user_id: userId,
    symbol: validated.symbol,
    side: validated.side,
    type: validated.type,
    status: 'OPEN',
    quantity: validated.quantity,
    entry_price: validated.entry_price,
    stop_loss: validated.stop_loss || null,
    take_profit: validated.take_profit || null,
    entry_time: new Date().toISOString(),
    pnl: 0,
    r_multiple: null,
  };

  try {
    const { data, error } = await supabase
      .from('backtesting_positions')
      .insert({
        id: newPosition.id,
        session_id: validated.session_id,
        user_id: userId,
        symbol: validated.symbol,
        side: validated.side,
        type: validated.type,
        status: 'OPEN',
        quantity: validated.quantity,
        entry_price: validated.entry_price,
        stop_loss: validated.stop_loss || null,
        take_profit: validated.take_profit || null,
        entry_time: newPosition.entry_time,
      })
      .select()
      .single();

    if (!error && data) {
      return {
        ...data,
        quantity: Number(data.quantity),
        entry_price: Number(data.entry_price),
      } as BacktestingPosition;
    }
  } catch (err) {
    // Fallback to local
  }

  return newPosition;
}

export async function closeSimulatorPosition(params: {
  positionId: string;
  sessionId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number | null;
  exitTime?: string;
}): Promise<{ pnl: number; rMultiple: number | null }> {
  const pnl = calculatePositionPnl(
    { side: params.side, quantity: params.quantity, entry_price: params.entryPrice },
    params.exitPrice,
    params.symbol
  );

  const rMultiple = calculateRMultiple(
    params.entryPrice,
    params.exitPrice,
    params.stopLoss,
    params.side
  );

  const exitTime = params.exitTime || new Date().toISOString();

  try {
    const supabase = await createClient();
    await supabase
      .from('backtesting_positions')
      .update({
        status: 'CLOSED',
        exit_price: params.exitPrice,
        exit_time: exitTime,
        pnl,
        r_multiple: rMultiple,
      })
      .eq('id', params.positionId);

    // Also update session current balance
    const { data: session } = await supabase
      .from('backtesting_sessions')
      .select('current_balance')
      .eq('id', params.sessionId)
      .single();

    if (session) {
      const updatedBalance = Number(session.current_balance) + pnl;
      await supabase
        .from('backtesting_sessions')
        .update({
          current_balance: updatedBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.sessionId);
    }
  } catch (err) {
    // Fallback handled on client state
  }

  return { pnl, rMultiple };
}
