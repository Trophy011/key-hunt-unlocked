-- Create Tom Kaulitz account using the same approach as other users
-- First ensure any previous attempt is cleaned up
DELETE FROM public.profiles WHERE email = 'tomkaulitz@gmail.com';
DELETE FROM public.accounts WHERE user_id = (SELECT id FROM auth.users WHERE email = 'tomkaulitz@gmail.com');
DELETE FROM auth.users WHERE email = 'tomkaulitz@gmail.com';

-- Create the user manually with proper password hashing
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'tomkaulitz@gmail.com',
  crypt('tom446688', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Tom", "last_name": "Kaulitz"}'::jsonb,
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  ''
);

-- The trigger will automatically create profile and accounts for Tom