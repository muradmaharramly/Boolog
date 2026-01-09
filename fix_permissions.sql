-- Copy and run this in your Supabase SQL Editor to fix permission errors

-- 1. Reset Likes Policies
alter table likes enable row level security;
drop policy if exists "Likes are viewable by everyone." on likes;
drop policy if exists "Allow public like insert" on likes;
drop policy if exists "Allow public like delete" on likes;
drop policy if exists "Enable read access for all users" on likes;
drop policy if exists "Enable insert access for all users" on likes;
drop policy if exists "Enable delete access for all users" on likes;

create policy "Enable read access for all users" on likes for select using (true);
create policy "Enable insert access for all users" on likes for insert with check (true);
create policy "Enable delete access for all users" on likes for delete using (true);

-- 2. Reset Comments Policies
alter table comments enable row level security;
drop policy if exists "Comments are viewable by everyone." on comments;
drop policy if exists "Allow public comment insert" on comments;
drop policy if exists "Allow public comment delete" on comments;
drop policy if exists "Enable read access for all users" on comments;
drop policy if exists "Enable insert access for all users" on comments;
drop policy if exists "Enable delete access for all users" on comments;

create policy "Enable read access for all users" on comments for select using (true);
create policy "Enable insert access for all users" on comments for insert with check (true);
create policy "Enable delete access for all users" on comments for delete using (true);
