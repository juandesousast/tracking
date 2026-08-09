import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js cache module before importing copier actions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase server module before importing copier actions
vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: vi.fn(),
  }
})

import { createClient } from '@/lib/supabase/server'
import {
  getTradovateCredentials,
  saveTradovateCredentials,
  getCopierRules,
  saveCopierRule,
  updateCopierRule,
  deleteCopierRule,
  getCopierLogs,
  executeKillSwitch,
} from './copier'

describe('Copier Server Actions', () => {
  const mockUser = { id: 'user-123', email: 'trader@example.com' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get tradovate credentials for authenticated user', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'cred-1',
              user_id: 'user-123',
              account_environment: 'demo',
              username_encrypted: 'user_enc',
              app_id: 'app_1',
              access_token_encrypted: 'token_enc',
              is_connected: true,
              created_at: '2026-01-01T00:00:00Z',
            },
            error: null,
          }),
        }),
      }),
    })

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: mockFrom,
    } as any)

    const creds = await getTradovateCredentials()
    expect(creds).not.toBeNull()
    expect(creds?.app_id).toBe('app_1')
    expect(creds?.is_connected).toBe(true)
  })

  it('should save tradovate credentials', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'cred-1',
        user_id: 'user-123',
        account_environment: 'live',
        username_encrypted: 'enc_user',
        app_id: 'my_app',
        access_token_encrypted: null,
        is_connected: true,
        created_at: '2026-01-01T00:00:00Z',
      },
      error: null,
    })

    const mockUpsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    })

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
    } as any)

    const res = await saveTradovateCredentials({
      account_environment: 'live',
      username_encrypted: 'enc_user',
      app_id: 'my_app',
      is_connected: true,
    })

    expect(res.account_environment).toBe('live')
    expect(res.is_connected).toBe(true)
  })

  it('should get copier rules', async () => {
    const mockRules = [
      {
        id: 'rule-1',
        user_id: 'user-123',
        master_account_id: 'acc-1',
        master_account_name: 'Master 1',
        slave_account_id: 'acc-2',
        slave_account_name: 'Slave 1',
        multiplier: 2,
        convert_mini_to_micro: true,
        max_daily_loss: 500,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
    ]

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRules,
              error: null,
            }),
          }),
        }),
      }),
    } as any)

    const rules = await getCopierRules()
    expect(rules).toHaveLength(1)
    expect(rules[0].multiplier).toBe(2)
  })

  it('should execute kill switch and disable active rules', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })

    const mockInsert = vi.fn().mockResolvedValue({ error: null })

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'copier_rules') {
          return { update: mockUpdate }
        }
        if (table === 'copier_logs') {
          return { insert: mockInsert }
        }
        return {}
      }),
    } as any)

    const result = await executeKillSwitch()
    expect(result.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith({ is_active: false })
    expect(mockInsert).toHaveBeenCalled()
  })
})
