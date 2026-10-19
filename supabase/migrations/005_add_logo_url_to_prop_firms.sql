-- Migration: 005_add_logo_url_to_prop_firms.sql
-- Description: Add logo_url column to public.prop_firms table.

ALTER TABLE public.prop_firms ADD COLUMN IF NOT EXISTS logo_url TEXT;
