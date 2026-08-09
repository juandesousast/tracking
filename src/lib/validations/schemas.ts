import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'El correo electrónico no es válido' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria' }),
})

export const firmSchema = z.object({
  name: z.string().trim().min(1, { message: 'El nombre de la empresa es obligatorio' }),
  website: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
})

export const accountSchema = z.object({
  firm_id: z.string().uuid({ message: 'firm_id debe ser un UUID válido' }),
  account_size: z.number().gt(0, { message: 'El tamaño de la cuenta debe ser mayor a 0' }),
  account_type: z.string().trim().min(1, { message: 'El tipo de cuenta es obligatorio' }),
  status: z.string().trim().min(1, { message: 'El estado de la cuenta es obligatorio' }),
  account_number: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  alias: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
})

export const expenseSchema = z.object({
  firm_id: z
    .preprocess((val) => (val === '' ? null : val), z.string().uuid({ message: 'firm_id debe ser un UUID válido' }).nullable())
    .optional()
    .nullable(),
  account_id: z
    .preprocess((val) => (val === '' ? null : val), z.string().uuid({ message: 'account_id debe ser un UUID válido' }).nullable())
    .optional()
    .nullable(),
  amount: z.number().gt(0, { message: 'El monto debe ser mayor a 0' }),
  category: z.string().trim().min(1, { message: 'La categoría es obligatoria' }),
  description: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  date: z.string().trim().min(1, { message: 'La fecha es obligatoria' }),
})

export const withdrawalSchema = z.object({
  firm_id: z
    .preprocess((val) => (val === '' ? null : val), z.string().uuid({ message: 'firm_id debe ser un UUID válido' }).nullable())
    .optional()
    .nullable(),
  account_id: z
    .preprocess((val) => (val === '' ? null : val), z.string().uuid({ message: 'account_id debe ser un UUID válido' }).nullable())
    .optional()
    .nullable(),
  gross_amount: z.number().gt(0, { message: 'El monto bruto debe ser mayor a 0' }),
  fee_amount: z.number().gte(0, { message: 'La comisión no puede ser negativa' }),
  status: z.string().trim().min(1, { message: 'El estado es obligatorio' }),
  date: z.string().trim().min(1, { message: 'La fecha es obligatoria' }),
})

export const saveTradovateCredentialSchema = z.object({
  account_environment: z.enum(['demo', 'live'], { message: 'El entorno debe ser demo o live' }),
  username_encrypted: z.string().trim().min(1, { message: 'El usuario de Tradovate es obligatorio' }),
  app_id: z.string().trim().min(1, { message: 'El App ID es obligatorio' }),
  access_token_encrypted: z.string().trim().optional().nullable(),
  is_connected: z.boolean().optional(),
})

export const copierRuleSchema = z.object({
  master_account_id: z.string().min(1, { message: 'La cuenta Master es obligatoria' }),
  master_account_name: z.string().trim().min(1, { message: 'El nombre de la cuenta Master es obligatorio' }),
  slave_account_id: z.string().min(1, { message: 'La cuenta Slave es obligatoria' }),
  slave_account_name: z.string().trim().min(1, { message: 'El nombre de la cuenta Slave es obligatorio' }),
  multiplier: z.number().gt(0, { message: 'El multiplicador debe ser mayor a 0' }),
  convert_mini_to_micro: z.boolean(),
  max_daily_loss: z.number().nullable().optional(),
  is_active: z.boolean().optional(),
})

export type SaveTradovateCredentialInput = z.infer<typeof saveTradovateCredentialSchema>
export type CopierRuleInput = z.infer<typeof copierRuleSchema>

export type LoginInput = z.infer<typeof loginSchema>
export type FirmInput = z.infer<typeof firmSchema>
export type AccountInput = z.infer<typeof accountSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>

