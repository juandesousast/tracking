-- Migration: 006_market_simulator.sql
-- Description: Tables for Simulated Trading / Market Replay (Backtesting Sessions & Positions)

-- 1. Create backtesting_sessions table
CREATE TABLE IF NOT EXISTS public.backtesting_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    initial_balance NUMERIC NOT NULL DEFAULT 10000,
    current_balance NUMERIC NOT NULL DEFAULT 10000,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'finished')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create backtesting_positions table
CREATE TABLE IF NOT EXISTS public.backtesting_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.backtesting_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    type TEXT NOT NULL DEFAULT 'MARKET' CHECK (type IN ('MARKET', 'LIMIT')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    quantity NUMERIC NOT NULL DEFAULT 1,
    entry_price NUMERIC NOT NULL,
    exit_price NUMERIC,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    pnl NUMERIC,
    r_multiple NUMERIC,
    entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    exit_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_backtesting_sessions_user_id ON public.backtesting_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_backtesting_positions_session_id ON public.backtesting_positions(session_id);
CREATE INDEX IF NOT EXISTS idx_backtesting_positions_user_id ON public.backtesting_positions(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.backtesting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtesting_positions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for backtesting_sessions
CREATE POLICY "Users can manage their own backtesting sessions"
    ON public.backtesting_sessions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. RLS Policies for backtesting_positions
CREATE POLICY "Users can manage their own backtesting positions"
    ON public.backtesting_positions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
