-- Insert Tom Kaulitz user directly into auth.users
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
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'tomkaulitz@gmail.com',
  crypt('tom446688', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"first_name": "Tom", "last_name": "Kaulitz"}',
  false,
  'authenticated'
);