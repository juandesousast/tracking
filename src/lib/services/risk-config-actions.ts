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

    const { data, error } = await supabase
      .from('account_risk_configs')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      ...data,
      daily_loss_limit_amount: data.daily_loss_limit_amount
        ? Number(data.daily_loss_limit_amount)
        : null,
      daily_profit_target_amount: data.daily_profit_target_amount
        ? Number(data.daily_profit_target_amount)
        : null,
      max_contracts_limit: data.max_contracts_limit ? Number(data.max_contracts_limit) : null,
      trailing_drawdown_limit: data.trailing_drawdown_limit
        ? Number(data.trailing_drawdown_limit)
        : null,
      consistency_percentage_limit: data.consistency_percentage_limit
        ? Number(data.consistency_percentage_limit)
        : null,
    } as AccountRiskConfig;
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
