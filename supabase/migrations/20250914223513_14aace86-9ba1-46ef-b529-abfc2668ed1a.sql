-- First, let's clean up the previous attempt and create Tom's account properly
-- Delete any existing Tom Kaulitz user
DELETE FROM auth.users WHERE email = 'tomkaulitz@gmail.com';

-- Use Supabase's admin function to create the user properly
SELECT auth.admin_create_user(
  email := 'tomkaulitz@gmail.com',
  password := 'tom446688',
  email_confirm := true,
  user_metadata := '{"first_name": "Tom", "last_name": "Kaulitz"}'::jsonb
);