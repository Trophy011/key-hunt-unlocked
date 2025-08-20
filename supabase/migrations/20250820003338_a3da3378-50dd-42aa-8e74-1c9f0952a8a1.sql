-- Drop and recreate the user creation function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_accounts();

-- Create a more robust function
CREATE OR REPLACE FUNCTION create_user_accounts()
RETURNS TRIGGER AS $$
DECLARE
    pln_account_id UUID;
BEGIN
  -- Create profile first
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Account'),
    NEW.email
  );

  -- Create standard accounts for all currencies
  INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
  VALUES 
    (NEW.id, generate_account_number(), 'USD', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'EUR', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'GBP', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'PLN', 0.00, 'checking');

  -- Special handling for Anna Kenska
  IF NEW.email = 'keniol9822@op.pl' THEN
    -- Update PLN account with special balance
    UPDATE public.accounts 
    SET balance = 30000.00 
    WHERE user_id = NEW.id AND currency = 'PLN'
    RETURNING id INTO pln_account_id;
    
    -- Create the welcome transaction
    INSERT INTO public.transactions (
      to_account_id,
      amount,
      currency,
      transaction_type,
      description,
      reference_number,
      status,
      created_at
    ) VALUES (
      pln_account_id,
      30000.00,
      'PLN',
      'deposit',
      'Welcome bonus from US Bank Management',
      'USB-WELCOME-' || extract(epoch from '2024-07-17'::timestamp)::text,
      'completed',
      '2024-07-17 10:00:00+00'
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in create_user_accounts: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_accounts();