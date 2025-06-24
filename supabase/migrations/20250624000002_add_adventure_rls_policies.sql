-- Add Row Level Security policies for adventure tables
-- Migration: 20250624000002_add_adventure_rls_policies

-- Enable RLS on adventure tables
alter table adventures enable row level security;
alter table adventure_messages enable row level security;
alter table adventure_characters enable row level security;

-- Adventures table policies
create policy "Users can view their own adventures"
  on adventures for select
  using (auth.uid() = user_id);

create policy "Users can create their own adventures"
  on adventures for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own adventures"
  on adventures for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own adventures"
  on adventures for delete
  using (auth.uid() = user_id);

-- Adventure messages table policies
create policy "Users can view messages from their adventures"
  on adventure_messages for select
  using (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_messages.adventure_id 
      and adventures.user_id = auth.uid()
    )
  );

create policy "Users can create messages in their adventures"
  on adventure_messages for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_messages.adventure_id 
      and adventures.user_id = auth.uid()
    )
  );

create policy "Users can update messages in their adventures"
  on adventure_messages for update
  using (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_messages.adventure_id 
      and adventures.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_messages.adventure_id 
      and adventures.user_id = auth.uid()
    )
  );

create policy "Users can delete messages from their adventures"
  on adventure_messages for delete
  using (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_messages.adventure_id 
      and adventures.user_id = auth.uid()
    )
  );

-- Adventure characters table policies
create policy "Users can view their adventure characters"
  on adventure_characters for select
  using (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_characters.adventure_id 
      and adventures.user_id = auth.uid()
    )
  );

create policy "Users can create their adventure characters"
  on adventure_characters for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_characters.adventure_id 
      and adventures.user_id = auth.uid()
    )
  );

create policy "Users can update their adventure characters"
  on adventure_characters for update
  using (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_characters.adventure_id 
      and adventures.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_characters.adventure_id 
      and adventures.user_id = auth.uid()
    )
  );

create policy "Users can delete their adventure characters"
  on adventure_characters for delete
  using (
    auth.uid() = user_id and
    exists (
      select 1 from adventures 
      where adventures.id = adventure_characters.adventure_id 
      and adventures.user_id = auth.uid()
    )
  );