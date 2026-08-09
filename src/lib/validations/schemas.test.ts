import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  firmSchema,
  accountSchema,
  expenseSchema,
  withdrawalSchema,
} from './schemas'

describe('Validaciones con Zod (schemas.ts)', () => {
  describe('loginSchema', () => {
    it('debe validar y sanitizar un login correcto', () => {
      const result = loginSchema.safeParse({
        email: '  USER@Example.COM  ',
        password: 'password123',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@example.com')
      }
    })

    it('debe fallar con email inválido o password vacío', () => {
      expect(loginSchema.safeParse({ email: 'invalid-email', password: '123' }).success).toBe(false)
      expect(loginSchema.safeParse({ email: 'test@example.com', password: '' }).success).toBe(false)
    })
  })

  describe('firmSchema', () => {
    it('debe validar un firm correcto y transformar website vacío a null', () => {
      const result = firmSchema.safeParse({
        name: '  FTMO  ',
        website: '   ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('FTMO')
        expect(result.data.website).toBeNull()
      }
    })

    it('debe rechazar un nombre de empresa vacío', () => {
      const result = firmSchema.safeParse({ name: '   ' })
      expect(result.success).toBe(false)
    })
  })

  describe('accountSchema', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'

    it('debe validar una cuenta correcta', () => {
      const result = accountSchema.safeParse({
        firm_id: validUuid,
        account_size: 100000,
        account_type: 'Evaluation',
        status: 'Active',
      })
      expect(result.success).toBe(true)
    })

    it('debe rechazar account_size <= 0 o uuid inválido', () => {
      expect(
        accountSchema.safeParse({
          firm_id: 'invalid-uuid',
          account_size: 100000,
          account_type: 'Evaluation',
          status: 'Active',
        }).success
      ).toBe(false)

      expect(
        accountSchema.safeParse({
          firm_id: validUuid,
          account_size: 0,
          account_type: 'Evaluation',
          status: 'Active',
        }).success
      ).toBe(false)
    })
  })

  describe('expenseSchema', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'

    it('debe validar un gasto correcto', () => {
      const result = expenseSchema.safeParse({
        firm_id: validUuid,
        amount: 250,
        category: 'Challenge Fee',
        date: '2026-01-15',
      })
      expect(result.success).toBe(true)
    })

    it('debe permitir firm_id nulo o vacío', () => {
      const resultNull = expenseSchema.safeParse({
        firm_id: null,
        amount: 100,
        category: 'Otro',
        date: '2026-01-15',
      })
      expect(resultNull.success).toBe(true)
      if (resultNull.success) {
        expect(resultNull.data.firm_id).toBeNull()
      }

      const resultEmpty = expenseSchema.safeParse({
        firm_id: '',
        amount: 100,
        category: 'Otro',
        date: '2026-01-15',
      })
      expect(resultEmpty.success).toBe(true)
      if (resultEmpty.success) {
        expect(resultEmpty.data.firm_id).toBeNull()
      }
    })

    it('debe rechazar monto <= 0', () => {
      const result = expenseSchema.safeParse({
        firm_id: validUuid,
        amount: -50,
        category: 'Challenge Fee',
        date: '2026-01-15',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('withdrawalSchema', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'

    it('debe validar un retiro correcto con fee_amount >= 0', () => {
      const result = withdrawalSchema.safeParse({
        firm_id: validUuid,
        gross_amount: 1000,
        fee_amount: 0,
        status: 'Completed',
        date: '2026-02-01',
      })
      expect(result.success).toBe(true)
    })

    it('debe permitir firm_id nulo o vacío', () => {
      const result = withdrawalSchema.safeParse({
        firm_id: null,
        gross_amount: 500,
        fee_amount: 10,
        status: 'Completed',
        date: '2026-02-01',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.firm_id).toBeNull()
      }
    })

    it('debe rechazar fee_amount negativo o gross_amount <= 0', () => {
      expect(
        withdrawalSchema.safeParse({
          firm_id: validUuid,
          gross_amount: 1000,
          fee_amount: -10,
          status: 'Completed',
          date: '2026-02-01',
        }).success
      ).toBe(false)

      expect(
        withdrawalSchema.safeParse({
          firm_id: validUuid,
          gross_amount: 0,
          fee_amount: 5,
          status: 'Completed',
          date: '2026-02-01',
        }).success
      ).toBe(false)
    })
  })
})
