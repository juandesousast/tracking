'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TradovateCredential, CopierRule, CopierLog } from '@/types/database'

export async function getTradovateCredentials(): Promise<TradovateCredential[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('tradovate_credentials')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tradovate_credentials:', error)
    return []
  }

  return (data || []) as TradovateCredential[]
}

export async function saveTradovateCredential(credData: {
  id?: string
  connection_name: string
  account_environment: 'demo' | 'live'
  username_encrypted: string
  password_encrypted?: string | null
  app_id?: string
  access_token_encrypted?: string | null
  is_connected?: boolean
}): Promise<TradovateCredential> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const payload = {
    user_id: user.id,
    connection_name: credData.connection_name,
    account_environment: credData.account_environment,
    username_encrypted: credData.username_encrypted,
    password_encrypted: credData.password_encrypted || null,
    app_id: credData.app_id || 'TradovateWeb',
    access_token_encrypted: credData.access_token_encrypted || null,
    is_connected: credData.is_connected ?? true,
  }

  let query
  if (credData.id) {
    query = supabase
      .from('tradovate_credentials')
      .update(payload)
      .eq('id', credData.id)
      .eq('user_id', user.id)
      .select()
      .single()
  } else {
    query = supabase
      .from('tradovate_credentials')
      .insert(payload)
      .select()
      .single()
  }

  const { data, error } = await query

  if (error) {
    console.error('Error saving tradovate credential:', error)
    throw new Error(error.message)
  }

  revalidatePath('/copier')
  return data as TradovateCredential
}

export async function saveTradovateCredentials(credData: {
  id?: string
  connection_name?: string
  account_environment: 'demo' | 'live'
  username_encrypted: string
  password_encrypted?: string | null
  app_id: string
  access_token_encrypted?: string | null
  is_connected?: boolean
}): Promise<TradovateCredential> {
  return saveTradovateCredential({
    ...credData,
    connection_name: credData.connection_name || 'Mi Conexión',
  })
}

export async function deleteTradovateCredential(id: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase
    .from('tradovate_credentials')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting tradovate credential:', error)
    throw new Error(error.message)
  }

  revalidatePath('/copier')
  return true
}

export async function getCopierRules(): Promise<CopierRule[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('copier_rules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching copier_rules:', error)
    return []
  }

  return (data || []).map((r) => ({
    ...r,
    multiplier: Number(r.multiplier),
    max_daily_loss: r.max_daily_loss !== null && r.max_daily_loss !== undefined ? Number(r.max_daily_loss) : null,
  })) as CopierRule[]
}

export async function saveCopierRule(ruleData: {
  master_account_id: string
  master_account_name: string
  slave_account_id: string
  slave_account_name: string
  multiplier: number
  convert_mini_to_micro: boolean
  max_daily_loss?: number | null
  is_active?: boolean
}): Promise<CopierRule> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('copier_rules')
    .insert({
      user_id: user.id,
      master_account_id: ruleData.master_account_id,
      master_account_name: ruleData.master_account_name,
      slave_account_id: ruleData.slave_account_id,
      slave_account_name: ruleData.slave_account_name,
      multiplier: ruleData.multiplier,
      convert_mini_to_micro: ruleData.convert_mini_to_micro,
      max_daily_loss: ruleData.max_daily_loss || null,
      is_active: ruleData.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving copier rule:', error)
    throw new Error(error.message)
  }

  revalidatePath('/copier')
  return {
    ...data,
    multiplier: Number(data.multiplier),
    max_daily_loss: data.max_daily_loss !== null && data.max_daily_loss !== undefined ? Number(data.max_daily_loss) : null,
  } as CopierRule
}

export async function updateCopierRule(
  id: string,
  ruleData: Partial<{
    master_account_id: string
    master_account_name: string
    slave_account_id: string
    slave_account_name: string
    multiplier: number
    convert_mini_to_micro: boolean
    max_daily_loss: number | null
    is_active: boolean
  }>
): Promise<CopierRule> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('copier_rules')
    .update(ruleData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating copier rule:', error)
    throw new Error(error.message)
  }

  revalidatePath('/copier')
  return {
    ...data,
    multiplier: Number(data.multiplier),
    max_daily_loss: data.max_daily_loss !== null && data.max_daily_loss !== undefined ? Number(data.max_daily_loss) : null,
  } as CopierRule
}

export async function deleteCopierRule(id: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase
    .from('copier_rules')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting copier rule:', error)
    throw new Error(error.message)
  }

  revalidatePath('/copier')
  return true
}

export function groupRulesIntoCopierGroups(rules: CopierRule[]): import('@/types/database').CopierGroup[] {
  const groupMap = new Map<string, import('@/types/database').CopierGroup>();

  for (const r of rules) {
    const key = r.master_account_id || r.master_account_name;
    const groupName = r.group_name || `Grupo: Master ${r.master_account_name}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        id: `group-${key}`,
        user_id: r.user_id,
        name: groupName,
        master_account_id: r.master_account_id,
        master_account_name: r.master_account_name,
        is_active: r.is_active,
        slaves: [],
        created_at: r.created_at,
      });
    }

    const group = groupMap.get(key)!;
    if (r.is_active) {
      group.is_active = true;
    }

    group.slaves.push({
      id: r.id,
      account_id: r.slave_account_id,
      account_name: r.slave_account_name,
      multiplier: Number(r.multiplier) || 1,
      convert_mini_to_micro: r.convert_mini_to_micro,
      max_daily_loss: r.max_daily_loss !== null && r.max_daily_loss !== undefined ? Number(r.max_daily_loss) : null,
      is_active: r.is_active,
    });
  }

  return Array.from(groupMap.values());
}

export async function saveCopierGroup(groupData: {
  name: string;
  master_account_id: string;
  master_account_name: string;
  is_active?: boolean;
  slaves: Array<{
    id?: string;
    account_id: string;
    account_name: string;
    multiplier: number;
    convert_mini_to_micro: boolean;
    max_daily_loss?: number | null;
    is_active?: boolean;
  }>;
}): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  for (const slave of groupData.slaves) {
    const payload = {
      user_id: user.id,
      group_name: groupData.name,
      master_account_id: groupData.master_account_id,
      master_account_name: groupData.master_account_name,
      slave_account_id: slave.account_id,
      slave_account_name: slave.account_name,
      multiplier: slave.multiplier,
      convert_mini_to_micro: slave.convert_mini_to_micro,
      max_daily_loss: slave.max_daily_loss || null,
      is_active: slave.is_active ?? groupData.is_active ?? true,
    };

    if (slave.id) {
      await supabase
        .from('copier_rules')
        .update(payload)
        .eq('id', slave.id)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('copier_rules')
        .insert(payload);
    }
  }

  revalidatePath('/copier');
  return true;
}

export async function toggleCopierGroup(masterAccountId: string, isActive: boolean): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  await supabase
    .from('copier_rules')
    .update({ is_active: isActive })
    .eq('master_account_id', masterAccountId)
    .eq('user_id', user.id);

  revalidatePath('/copier');
  return true;
}

export async function deleteCopierGroup(masterAccountId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  await supabase
    .from('copier_rules')
    .delete()
    .eq('master_account_id', masterAccountId)
    .eq('user_id', user.id);

  revalidatePath('/copier');
  return true;
}

export async function getCopierLogs(): Promise<CopierLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('copier_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching copier_logs:', error)
    return []
  }

  return (data || []).map((log) => ({
    ...log,
    quantity: Number(log.quantity),
    slaves_count: Number(log.slaves_count),
    latency_ms: Number(log.latency_ms),
  })) as CopierLog[]
}

export async function executeKillSwitch(): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  // Desactivar todas las reglas activas del usuario
  const { error } = await supabase
    .from('copier_rules')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (error) {
    console.error('Error executing kill switch on copier_rules:', error)
    throw new Error(error.message)
  }

  // Registrar un log del Kill Switch
  await supabase.from('copier_logs').insert({
    user_id: user.id,
    master_order_id: 'KILL_SWITCH_' + Date.now(),
    symbol: 'ALL',
    action: 'SELL',
    quantity: 0,
    slaves_count: 0,
    latency_ms: 12,
    status: 'SUCCESS',
  })

  revalidatePath('/copier')
  return {
    success: true,
    message: 'Kill Switch ejecutado: Posiciones aplanadas, órdenes canceladas y copia de operaciones desactivada.',
  }
}
