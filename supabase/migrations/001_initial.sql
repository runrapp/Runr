-- Runr Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  timezone text default 'UTC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  command text not null,
  status text not null default 'pending',
  result text,
  source text default 'dashboard',
  duration_ms integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Integrations table
create table if not exists public.integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider text not null,
  status text not null default 'disconnected',
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  connected_at timestamp with time zone,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Skills table
create table if not exists public.skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  enabled boolean default true,
  definition text,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_created_at on public.tasks(created_at desc);
create index if not exists idx_tasks_source on public.tasks(source);
create index if not exists idx_integrations_user_id on public.integrations(user_id);
create index if not exists idx_integrations_provider on public.integrations(provider);
create index if not exists idx_skills_user_id on public.skills(user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.integrations enable row level security;
alter table public.skills enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Tasks: users can CRUD their own tasks
create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can create tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);

-- Allow tasks without user_id (from bots)
create policy "Service can create tasks" on public.tasks
  for insert with check (true);

create policy "Service can update tasks" on public.tasks
  for update using (true);

create policy "Service can read tasks" on public.tasks
  for select using (true);

-- Integrations: users can CRUD their own integrations
create policy "Users can view own integrations" on public.integrations
  for select using (auth.uid() = user_id);

create policy "Users can create integrations" on public.integrations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own integrations" on public.integrations
  for update using (auth.uid() = user_id);

create policy "Users can delete own integrations" on public.integrations
  for delete using (auth.uid() = user_id);

-- Skills: users can CRUD their own skills
create policy "Users can view own skills" on public.skills
  for select using (auth.uid() = user_id);

create policy "Users can create skills" on public.skills
  for insert with check (auth.uid() = user_id);

create policy "Users can update own skills" on public.skills
  for update using (auth.uid() = user_id);

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Realtime for tasks (for dashboard live updates)
alter publication supabase_realtime add table public.tasks;
