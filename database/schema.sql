-- PostgreSQL Schema for Story Engine
-- Generated automatically on 2025-06-26T17:26:11.164Z
-- Database: storyengine

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Table: account
CREATE TABLE IF NOT EXISTS account (
  id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE account ADD CONSTRAINT fk_account_user_id FOREIGN KEY (user_id) REFERENCES user(id);

-- Table: adventure_characters
CREATE TABLE IF NOT EXISTS adventure_characters (
  id TEXT NOT NULL,
  adventure_id TEXT NOT NULL,
  original_character_id TEXT,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(50),
  tags ARRAY,
  appearance JSONB,
  scents_aromas JSONB,
  personality JSONB,
  background TEXT,
  avatar_url TEXT,
  state_updates JSONB DEFAULT '{}'::jsonb,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE adventure_characters ADD CONSTRAINT fk_adventure_characters_adventure_id FOREIGN KEY (adventure_id) REFERENCES adventures(id);
ALTER TABLE adventure_characters ADD CONSTRAINT fk_adventure_characters_original_character_id FOREIGN KEY (original_character_id) REFERENCES characters(id);
ALTER TABLE adventure_characters ADD CONSTRAINT fk_adventure_characters_user_id FOREIGN KEY (user_id) REFERENCES user(id);

-- Table: adventure_locations
CREATE TABLE IF NOT EXISTS adventure_locations (
  id TEXT NOT NULL,
  adventure_id TEXT NOT NULL,
  original_location_id TEXT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_type VARCHAR(100),
  geography TEXT,
  climate VARCHAR(100),
  population INTEGER,
  notable_features ARRAY,
  connected_locations ARRAY,
  tags ARRAY,
  state_updates JSONB DEFAULT '{}'::jsonb,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE adventure_locations ADD CONSTRAINT fk_adventure_locations_adventure_id FOREIGN KEY (adventure_id) REFERENCES adventures(id);
ALTER TABLE adventure_locations ADD CONSTRAINT fk_adventure_locations_original_location_id FOREIGN KEY (original_location_id) REFERENCES locations(id);
ALTER TABLE adventure_locations ADD CONSTRAINT fk_adventure_locations_user_id FOREIGN KEY (user_id) REFERENCES user(id);

-- Table: adventure_messages
CREATE TABLE IF NOT EXISTS adventure_messages (
  id TEXT NOT NULL,
  adventure_id TEXT NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE adventure_messages ADD CONSTRAINT fk_adventure_messages_adventure_id FOREIGN KEY (adventure_id) REFERENCES adventures(id);
ALTER TABLE adventure_messages ADD CONSTRAINT fk_adventure_messages_user_id FOREIGN KEY (user_id) REFERENCES user(id);

-- Table: adventure_settings
CREATE TABLE IF NOT EXISTS adventure_settings (
  id TEXT NOT NULL,
  adventure_id TEXT NOT NULL,
  original_setting_id TEXT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  world_type VARCHAR(100),
  time_period VARCHAR(100),
  technology_level VARCHAR(100),
  magic_system TEXT,
  social_structure TEXT,
  geography TEXT,
  culture TEXT,
  politics TEXT,
  economy TEXT,
  religion TEXT,
  history TEXT,
  tags ARRAY,
  state_updates JSONB DEFAULT '{}'::jsonb,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE adventure_settings ADD CONSTRAINT fk_adventure_settings_adventure_id FOREIGN KEY (adventure_id) REFERENCES adventures(id);
ALTER TABLE adventure_settings ADD CONSTRAINT fk_adventure_settings_original_setting_id FOREIGN KEY (original_setting_id) REFERENCES settings(id);
ALTER TABLE adventure_settings ADD CONSTRAINT fk_adventure_settings_user_id FOREIGN KEY (user_id) REFERENCES user(id);

-- Table: adventure_state_events
CREATE TABLE IF NOT EXISTS adventure_state_events (
  id TEXT NOT NULL,
  adventure_id TEXT NOT NULL,
  adventure_character_id TEXT,
  adventure_location_id TEXT,
  adventure_setting_id TEXT,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  validated BOOLEAN DEFAULT false,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE adventure_state_events ADD CONSTRAINT fk_adventure_state_events_adventure_id FOREIGN KEY (adventure_id) REFERENCES adventures(id);
ALTER TABLE adventure_state_events ADD CONSTRAINT fk_adventure_state_events_adventure_character_id FOREIGN KEY (adventure_character_id) REFERENCES adventure_characters(id);
ALTER TABLE adventure_state_events ADD CONSTRAINT fk_adventure_state_events_adventure_location_id FOREIGN KEY (adventure_location_id) REFERENCES adventure_locations(id);
ALTER TABLE adventure_state_events ADD CONSTRAINT fk_adventure_state_events_adventure_setting_id FOREIGN KEY (adventure_setting_id) REFERENCES adventure_settings(id);
ALTER TABLE adventure_state_events ADD CONSTRAINT fk_adventure_state_events_user_id FOREIGN KEY (user_id) REFERENCES user(id);

-- Table: adventures
CREATE TABLE IF NOT EXISTS adventures (
  id TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  character_id TEXT,
  location_id TEXT,
  setting_id TEXT,
  setting_description TEXT,
  status VARCHAR(20) DEFAULT 'active'::character varying,
  system_prompt TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE adventures ADD CONSTRAINT fk_adventures_character_id FOREIGN KEY (character_id) REFERENCES characters(id);
ALTER TABLE adventures ADD CONSTRAINT fk_adventures_location_id FOREIGN KEY (location_id) REFERENCES locations(id);
ALTER TABLE adventures ADD CONSTRAINT fk_adventures_setting_id FOREIGN KEY (setting_id) REFERENCES settings(id);
ALTER TABLE adventures ADD CONSTRAINT fk_adventures_user_id FOREIGN KEY (user_id) REFERENCES user(id);

-- Table: characters
CREATE TABLE IF NOT EXISTS characters (
  id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(50),
  tags ARRAY,
  appearance JSONB,
  scents_aromas JSONB,
  personality JSONB,
  background TEXT,
  image_url TEXT,
  avatar_url TEXT,
  visibility VARCHAR(20) DEFAULT 'private'::character varying,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE characters ADD CONSTRAINT fk_characters_created_by FOREIGN KEY (created_by) REFERENCES user(id);

-- Table: entity_embeddings
CREATE TABLE IF NOT EXISTS entity_embeddings (
  id TEXT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id TEXT NOT NULL,
  embedding VECTOR(1024),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

-- Table: locations
CREATE TABLE IF NOT EXISTS locations (
  id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_type VARCHAR(100),
  geography TEXT,
  climate VARCHAR(100),
  population INTEGER,
  notable_features ARRAY,
  connected_locations ARRAY,
  tags ARRAY,
  image_url TEXT,
  visibility VARCHAR(20) DEFAULT 'private'::character varying,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE locations ADD CONSTRAINT fk_locations_created_by FOREIGN KEY (created_by) REFERENCES user(id);

-- Table: session
CREATE TABLE IF NOT EXISTS session (
  id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE session ADD CONSTRAINT fk_session_user_id FOREIGN KEY (user_id) REFERENCES user(id);

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
  id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  world_type VARCHAR(100),
  time_period VARCHAR(100),
  technology_level VARCHAR(100),
  magic_system TEXT,
  social_structure TEXT,
  geography TEXT,
  culture TEXT,
  politics TEXT,
  economy TEXT,
  religion TEXT,
  history TEXT,
  tags ARRAY,
  image_url TEXT,
  visibility VARCHAR(20) DEFAULT 'private'::character varying,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE settings ADD CONSTRAINT fk_settings_created_by FOREIGN KEY (created_by) REFERENCES user(id);

-- Table: user
CREATE TABLE IF NOT EXISTS user (
  id TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  email_verified TIMESTAMPTZ,
  name VARCHAR(255),
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  email_verified_boolean BOOLEAN DEFAULT false,
  PRIMARY KEY (id)
);

-- Table: verification
CREATE TABLE IF NOT EXISTS verification (
  id TEXT NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id)
);

-- Indexes
CREATE UNIQUE INDEX account_provider_id_account_id_key ON public.account USING btree (provider_id, account_id);
CREATE INDEX idx_account_user_id ON public.account USING btree (user_id);
CREATE INDEX idx_adventure_characters_adventure_id ON public.adventure_characters USING btree (adventure_id);
CREATE INDEX idx_adventure_characters_user_id ON public.adventure_characters USING btree (user_id);
CREATE INDEX idx_adventure_messages_adventure_id ON public.adventure_messages USING btree (adventure_id);
CREATE INDEX idx_adventure_messages_created_at ON public.adventure_messages USING btree (created_at);
CREATE INDEX idx_adventure_messages_role ON public.adventure_messages USING btree (role);
CREATE INDEX idx_adventure_state_events_adventure_id ON public.adventure_state_events USING btree (adventure_id);
CREATE INDEX idx_adventure_state_events_created_at ON public.adventure_state_events USING btree (created_at);
CREATE INDEX idx_adventures_created_at ON public.adventures USING btree (created_at DESC);
CREATE INDEX idx_adventures_status ON public.adventures USING btree (status);
CREATE INDEX idx_adventures_user_id ON public.adventures USING btree (user_id);
CREATE INDEX idx_characters_created_at ON public.characters USING btree (created_at DESC);
CREATE INDEX idx_characters_created_by ON public.characters USING btree (created_by);
CREATE INDEX idx_characters_visibility ON public.characters USING btree (visibility);
CREATE INDEX idx_locations_created_by ON public.locations USING btree (created_by);
CREATE INDEX idx_locations_visibility ON public.locations USING btree (visibility);
CREATE INDEX idx_session_token ON public.session USING btree (token);
CREATE INDEX idx_session_user_id ON public.session USING btree (user_id);
CREATE UNIQUE INDEX session_token_key ON public.session USING btree (token);
CREATE INDEX idx_settings_created_by ON public.settings USING btree (created_by);
CREATE INDEX idx_settings_visibility ON public.settings USING btree (visibility);
CREATE INDEX idx_user_email ON public."user" USING btree (email);
CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);
CREATE INDEX idx_verification_identifier ON public.verification USING btree (identifier);
