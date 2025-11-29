-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'client' check (role in ('admin', 'client')),
  total_credits numeric default 0,
  updated_at timestamp with time zone,
  username text,
  full_name text,
  avatar_url text,
  website text,
  first_name text,
  last_name text,
  company_name text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- This triggers a function every time a new user signs up
-- This inserts a row into public.profiles
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, total_credits)
  values (new.id, new.email, 'client', 0);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
