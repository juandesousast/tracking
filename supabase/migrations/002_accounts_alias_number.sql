-- Migration: 002_accounts_alias_number.sql
-- Description: Add account_number and alias columns to public.accounts table.

ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS alias TEXT;
