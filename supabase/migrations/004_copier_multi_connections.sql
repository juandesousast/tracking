-- Migration: 004_copier_multi_connections.sql
-- Description: Add connection_name and password_encrypted to tradovate_credentials to support multiple connections per user.

ALTER TABLE public.tradovate_credentials
ADD COLUMN IF NOT EXISTS connection_name TEXT NOT NULL DEFAULT 'Mi Conexión',
ADD COLUMN IF NOT EXISTS password_encrypted TEXT;
