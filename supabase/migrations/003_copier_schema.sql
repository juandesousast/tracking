-- Migration: 003_copier_schema.sql
-- Description: Schema for Tradovate Copier including credentials, rules, and execution logs.

-- 1. Create Tables

-- Table: tradovate_credentials
CREATE TABLE IF NOT EXISTS public.tradovate_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_environment TEXT NOT NULL,
    username_encrypted TEXT NOT NULL,
    app_id TEXT NOT NULL,
    access_token_encrypted TEXT,
    is_connected BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: copier_rules
CREATE TABLE IF NOT EXISTS public.copier_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    master_account_id TEXT NOT NULL,
    master_account_name TEXT,
    slave_account_id TEXT NOT NULL,
    slave_account_name TEXT,
    multiplier NUMERIC DEFAULT 1.0,
    convert_mini_to_micro BOOLEAN DEFAULT false,
    max_daily_loss NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: copier_logs
CREATE TABLE IF NOT EXISTS public.copier_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    master_order_id TEXT,
    symbol TEXT,
    action TEXT,
    quantity NUMERIC,
    slaves_count INTEGER,
    latency_ms INTEGER,
    status TEXT DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 2. Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.tradovate_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copier_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copier_logs ENABLE ROW LEVEL SECURITY;

-- Policies for tradovate_credentials
CREATE POLICY "Users can view their own tradovate credentials"
    ON public.tradovate_credentials FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tradovate credentials"
    ON public.tradovate_credentials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tradovate credentials"
    ON public.tradovate_credentials FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tradovate credentials"
    ON public.tradovate_credentials FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for copier_rules
CREATE POLICY "Users can view their own copier rules"
    ON public.copier_rules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own copier rules"
    ON public.copier_rules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own copier rules"
    ON public.copier_rules FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own copier rules"
    ON public.copier_rules FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for copier_logs
CREATE POLICY "Users can view their own copier logs"
    ON public.copier_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own copier logs"
    ON public.copier_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own copier logs"
    ON public.copier_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own copier logs"
    ON public.copier_logs FOR DELETE
    USING (auth.uid() = user_id);


-- 3. Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_tradovate_credentials_user_id ON public.tradovate_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_copier_rules_user_id ON public.copier_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_copier_logs_user_id ON public.copier_logs(user_id);
