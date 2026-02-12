-- MyOST Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',        -- 'free' | 'premium'
  points INT NOT NULL DEFAULT 0,            -- pay-as-you-go credits
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

CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, usage_date)
);

-- Atomic usage increment function
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_date DATE)
RETURNS INT AS $$
DECLARE new_count INT;
BEGIN
  INSERT INTO usage_tracking (user_id, usage_date, generation_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET generation_count = usage_tracking.generation_count + 1
  RETURNING generation_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Atomic point deduction function
CREATE OR REPLACE FUNCTION deduct_point(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET points = points - 1
  WHERE id = p_user_id AND points > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
END;
$$ LANGUAGE plpgsql;
