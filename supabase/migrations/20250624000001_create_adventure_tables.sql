-- Create adventure system tables
-- Migration: 20250624000001_create_adventure_tables

-- Adventures table
create table adventures (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  character_id uuid references characters(id) not null,
  location_id uuid references locations(id),
  setting_description text,
  status text not null check (status in ('active', 'paused', 'completed')) default 'active',
  system_prompt text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

-- Chat messages table  
create table adventure_messages (
  id uuid default gen_random_uuid() primary key,
  adventure_id uuid references adventures(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

-- Adventure characters table (copies of original characters)
create table adventure_characters (
  id uuid default gen_random_uuid() primary key,
  adventure_id uuid references adventures(id) on delete cascade not null,
  original_character_id uuid references characters(id),
  
  -- Character fields copied from original
  name text not null,
  age integer,
  gender text,
  tags text[],
  
  -- Appearance fields
  appearance_general text,
  appearance_face text,
  appearance_hair text,
  appearance_body text,
  appearance_clothing text,
  appearance_accessories text,
  
  -- Fragrance fields
  fragrances_hair text[],
  fragrances_breath text[],
  fragrances_body text[],
  fragrances_feet text[],
  fragrances_clothes text[],
  fragrances_other text[],
  
  -- Personality and background
  personality text,
  background text,
  
  -- Adventure-specific state
  state_updates jsonb default '{}',
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

-- Indexes for performance
create index idx_adventures_user_id on adventures(user_id);
create index idx_adventures_character_id on adventures(character_id);
create index idx_adventures_status on adventures(status);
create index idx_adventure_messages_adventure_id on adventure_messages(adventure_id);
create index idx_adventure_messages_user_id on adventure_messages(user_id);
create index idx_adventure_messages_created_at on adventure_messages(created_at);
create index idx_adventure_characters_adventure_id on adventure_characters(adventure_id);
create index idx_adventure_characters_user_id on adventure_characters(user_id);

-- Update trigger for adventures
create or replace function update_adventures_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_adventures_updated_at
  before update on adventures
  for each row
  execute function update_adventures_updated_at();

-- Update trigger for adventure_characters
create or replace function update_adventure_characters_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_adventure_characters_updated_at
  before update on adventure_characters
  for each row
  execute function update_adventure_characters_updated_at();