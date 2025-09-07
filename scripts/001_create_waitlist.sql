-- Create waitlist table for PetRide early adopters
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  pet_type text,
  city text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.waitlist enable row level security;

-- Create policies for waitlist access
create policy "Anyone can insert into waitlist"
  on public.waitlist for insert
  with check (true);

create policy "Users can view their own waitlist entries"
  on public.waitlist for select
  using (auth.uid() = user_id or user_id is null);

-- Create index for better performance
create index if not exists waitlist_email_idx on public.waitlist(email);
create index if not exists waitlist_created_at_idx on public.waitlist(created_at);
