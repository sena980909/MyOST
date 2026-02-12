-- MyOST Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  provider TEXT,
  provider_account_id TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  emotions TEXT[] NOT NULL,
  context TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dj_comment TEXT NOT NULL,
  emotion_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_music_url TEXT NOT NULL,
  commentary TEXT NOT NULL
);

-- Usage tracking kept for analytics
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, usage_date)
);

-- Rate limiting: track generation attempts per user/IP
CREATE TABLE generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generation_logs_user_id_created ON generation_logs(user_id, created_at);
CREATE INDEX idx_generation_logs_ip_created ON generation_logs(ip, created_at);

-- Migration: add email/password auth support
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
-- ALTER TABLE users ALTER COLUMN provider DROP NOT NULL;
-- ALTER TABLE users ALTER COLUMN provider_account_id DROP NOT NULL;

-- Migration: run on existing DB to remove paid model columns/functions
-- ALTER TABLE users DROP COLUMN IF EXISTS tier;
-- ALTER TABLE users DROP COLUMN IF EXISTS points;
-- DROP FUNCTION IF EXISTS increment_usage;
-- DROP FUNCTION IF EXISTS deduct_point;
