'use server';

import { createClient } from '@/lib/supabase/server';
import { AccountRiskConfig } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getAccountRiskConfig(
  accountId: string
): Promise<AccountRiskConfig | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // First try exact account_id match
    if (accountId) {
      const { data, error } = await supabase
        .from('account_risk_configs')
        .select('*')
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        return data as AccountRiskConfig;
      }
    }

    // Fallback: retrieve the most recently updated config for this user across accounts/desktop
    const { data: fallbackData } = await supabase
      .from('account_risk_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackData) {
      return fallbackData as AccountRiskConfig;
    }

    return null;
  } catch (err) {
    return null;
  }
}

export async function saveAccountRiskConfig(
  config: AccountRiskConfig
): Promise<AccountRiskConfig> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id || 'demo-user';

  try {
    const payload = {
      account_id: config.account_id,
      user_id: userId,
      template_id: config.template_id || null,
      daily_loss_limit_amount: config.daily_loss_limit_amount,
      daily_loss_limit_action: config.daily_loss_limit_action,
      daily_profit_target_amount: config.daily_profit_target_amount,
      max_contracts_limit: config.max_contracts_limit,
      trailing_drawdown_limit: config.trailing_drawdown_limit,
      consistency_percentage_limit: config.consistency_percentage_limit,
      auto_eod_close_time: config.auto_eod_close_time || null,
      is_active: config.is_active,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('account_risk_configs')
      .upsert(payload, { onConflict: 'account_id' })
      .select()
      .single();

    if (!error && data) {
      revalidatePath('/risk-config');
      revalidatePath('/cuentas');
      return data as AccountRiskConfig;
    }
  } catch (err) {
    // Fallback handled on client
  }

  revalidatePath('/risk-config');
  return config;
}
