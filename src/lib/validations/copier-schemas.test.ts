import { describe, it, expect } from 'vitest'
import {
  saveTradovateCredentialSchema,
  copierRuleSchema,
} from './schemas'

describe('Copier Schemas Validation', () => {
  it('validates tradovate credentials schema', () => {
    const valid = {
      account_environment: 'demo',
      username_encrypted: 'trader123',
      app_id: 'app_id_123',
    }
    const result = saveTradovateCredentialSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects invalid account environment', () => {
    const invalid = {
      account_environment: 'staging',
      username_encrypted: 'trader123',
      app_id: 'app_id_123',
    }
    const result = saveTradovateCredentialSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates copier rule schema', () => {
    const validRule = {
      master_account_id: '123e4567-e89b-12d3-a456-426614174000',
      master_account_name: 'Master Account 1',
      slave_account_id: '123e4567-e89b-12d3-a456-426614174001',
      slave_account_name: 'Slave Account 1',
      multiplier: 1.5,
      convert_mini_to_micro: true,
      max_daily_loss: 500,
    }
    const result = copierRuleSchema.safeParse(validRule)
    expect(result.success).toBe(true)
  })

  it('rejects negative or zero multiplier', () => {
    const invalidRule = {
      master_account_id: '123e4567-e89b-12d3-a456-426614174000',
      master_account_name: 'Master Account 1',
      slave_account_id: '123e4567-e89b-12d3-a456-426614174001',
      slave_account_name: 'Slave Account 1',
      multiplier: 0,
      convert_mini_to_micro: false,
    }
    const result = copierRuleSchema.safeParse(invalidRule)
    expect(result.success).toBe(false)
  })
})
