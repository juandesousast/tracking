'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PropFirm, Account, Expense, Withdrawal } from '@/types/database'
import {
  firmSchema,
  accountSchema,
  expenseSchema,
  withdrawalSchema,
} from '@/lib/validations/schemas'

export async function getFirms(): Promise<PropFirm[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('prop_firms')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching prop_firms:', error)
    return []
  }

  return data as PropFirm[]
}

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching accounts:', error)
    return []
  }

  return (data || []).map((acc) => ({
    ...acc,
    account_size: Number(acc.account_size),
  })) as Account[]
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }

  return (data || []).map((exp) => ({
    ...exp,
    amount: Number(exp.amount),
  })) as Expense[]
}

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching withdrawals:', error)
    return []
  }

  return (data || []).map((w) => ({
    ...w,
    gross_amount: Number(w.gross_amount),
    fee_amount: Number(w.fee_amount),
    net_amount: Number(w.net_amount),
  })) as Withdrawal[]
}

export async function addFirm(firmData: { name: string; website?: string | null }) {
  const validated = firmSchema.parse(firmData)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('prop_firms')
    .insert({
      user_id: user.id,
      name: validated.name,
      website: validated.website || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return data as PropFirm
}

export async function addAccount(accData: {
  firm_id: string
  account_size: number
  account_type: string
  status: string
  account_number?: string | null
  alias?: string | null
}) {
  const validated = accountSchema.parse(accData)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      firm_id: validated.firm_id,
      account_size: validated.account_size,
      account_type: validated.account_type,
      status: validated.status,
      account_number: validated.account_number || null,
      alias: validated.alias || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return {
    ...data,
    account_size: Number(data.account_size),
  } as Account
}

export async function updateFirm(id: string, firmData: { name: string; website?: string | null }) {
  const validated = firmSchema.parse(firmData)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('prop_firms')
    .update({
      name: validated.name,
      website: validated.website || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return data as PropFirm
}

export async function deleteFirm(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase
    .from('prop_firms')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return true
}

export async function updateAccount(
  id: string,
  accData: {
    firm_id: string
    account_size: number
    account_type: string
    status: string
    account_number?: string | null
    alias?: string | null
  }
) {
  const validated = accountSchema.parse(accData)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('accounts')
    .update({
      firm_id: validated.firm_id,
      account_size: validated.account_size,
      account_type: validated.account_type,
      status: validated.status,
      account_number: validated.account_number || null,
      alias: validated.alias || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return {
    ...data,
    account_size: Number(data.account_size),
  } as Account
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return true
}

export async function addExpense(expenseData: {
  firm_id?: string | null
  account_id?: string | null
  amount: number
  category: string
  description?: string | null
  date: string
}) {
  const validated = expenseSchema.parse(expenseData)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      firm_id: validated.firm_id || null,
      account_id: validated.account_id || null,
      amount: validated.amount,
      category: validated.category,
      description: validated.description || null,
      date: validated.date,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return {
    ...data,
    amount: Number(data.amount),
  } as Expense
}

export async function updateExpense(
  id: string,
  expenseData: {
    firm_id?: string | null
    account_id?: string | null
    amount: number
    category: string
    description?: string | null
    date: string
  }
) {
  const validated = expenseSchema.parse(expenseData)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('expenses')
    .update({
      firm_id: validated.firm_id || null,
      account_id: validated.account_id || null,
      amount: validated.amount,
      category: validated.category,
      description: validated.description || null,
      date: validated.date,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return {
    ...data,
    amount: Number(data.amount),
  } as Expense
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return true
}

export async function addWithdrawal(wData: {
  firm_id?: string | null
  account_id?: string | null
  gross_amount: number
  fee_amount: number
  status: string
  date: string
}) {
  const validated = withdrawalSchema.parse(wData)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('withdrawals')
    .insert({
      user_id: user.id,
      firm_id: validated.firm_id || null,
      account_id: validated.account_id || null,
      gross_amount: validated.gross_amount,
      fee_amount: validated.fee_amount,
      status: validated.status,
      date: validated.date,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return {
    ...data,
    gross_amount: Number(data.gross_amount),
    fee_amount: Number(data.fee_amount),
    net_amount: Number(data.net_amount),
  } as Withdrawal
}

export async function updateWithdrawal(
  id: string,
  wData: {
    firm_id?: string | null
    account_id?: string | null
    gross_amount: number
    fee_amount: number
    status: string
    date: string
  }
) {
  const validated = withdrawalSchema.parse(wData)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('withdrawals')
    .update({
      firm_id: validated.firm_id || null,
      account_id: validated.account_id || null,
      gross_amount: validated.gross_amount,
      fee_amount: validated.fee_amount,
      status: validated.status,
      date: validated.date,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return {
    ...data,
    gross_amount: Number(data.gross_amount),
    fee_amount: Number(data.fee_amount),
    net_amount: Number(data.net_amount),
  } as Withdrawal
}

export async function deleteWithdrawal(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { error } = await supabase
    .from('withdrawals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return true
}

