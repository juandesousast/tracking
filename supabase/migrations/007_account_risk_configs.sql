-- Migration: 007_account_risk_configs.sql
-- Description: Schema for Account Risk Configuration rules and shield status

CREATE TABLE IF NOT EXISTS public.account_risk_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id TEXT,
    daily_loss_limit_amount NUMERIC(15, 2),
    daily_loss_limit_action TEXT DEFAULT 'liquidate',
    daily_profit_target_amount NUMERIC(15, 2),
    max_contracts_limit INTEGER,
    trailing_drawdown_limit NUMERIC(15, 2),
    consistency_percentage_limit NUMERIC(5, 2),
    auto_eod_close_time TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_account_risk_config UNIQUE (account_id)
);

-- Enable RLS
ALTER TABLE public.account_risk_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own account risk configs"
    ON public.account_risk_configs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_account_risk_configs_account_id
    ON public.account_risk_configs(account_id);
