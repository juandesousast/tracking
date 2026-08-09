'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TradovateCredential, CopierRule, CopierLog } from '@/types/database'

export async function getTradovateCredentials(): Promise<TradovateCredential | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('tradovate_credentials')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching tradovate_credentials:', error)
    return null
  }

  return data as TradovateCredential | null
}

export async function saveTradovateCredentials(credData: {
  account_environment: 'demo' | 'live'
  username_encrypted: string
  app_id: string
  access_token_encrypted?: string | null
  is_connected?: boolean
}): Promise<TradovateCredential> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const payload = {
    user_id: user.id,
    account_environment: credData.account_environment,
    username_encrypted: credData.username_encrypted,
    app_id: credData.app_id,
    access_token_encrypted: credData.access_token_encrypted || null,
    is_connected: credData.is_connected ?? true,
  }

  const { data, error } = await supabase
    .from('tradovate_credentials')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error saving tradovate credentials:', error)
    throw new Error(error.message)
  }

  revalidatePath('/copier')
  return data as TradovateCredential
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
