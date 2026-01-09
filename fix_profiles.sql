-- Run this in Supabase SQL Editor to fix the missing profile error

-- 1. Insert missing profiles for existing users
insert into public.profiles (id, username, role)
select id, COALESCE(raw_user_meta_data->>'username', email), 'user'
from auth.users
where id not in (select id from public.profiles);

-- 2. Optional: If you want to make yourself an admin in the profiles table (for RLS policies that still use it)
-- Replace 'your_email@example.com' with your actual email
update public.profiles
set role = 'admin'
where id in (select id from auth.users where email = 'your_email@example.com');
