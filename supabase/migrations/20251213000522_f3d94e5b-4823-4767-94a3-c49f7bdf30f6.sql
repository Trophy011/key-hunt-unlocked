-- Update the trigger to only create ONE $500 USD welcome bonus transaction
-- but set equivalent balances in all currency accounts
CREATE OR REPLACE FUNCTION public.create_user_accounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    usd_account_id UUID;
BEGIN
  -- Create profile first
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Account'),
    NEW.email
  );

  -- Create accounts with equivalent balances (based on $500 USD)
  INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
  VALUES 
    (NEW.id, generate_account_number(), 'USD', 500.00, 'checking'),
    (NEW.id, generate_account_number(), 'EUR', 460.00, 'checking'),
    (NEW.id, generate_account_number(), 'GBP', 395.00, 'checking'),
    (NEW.id, generate_account_number(), 'PLN', 2000.00, 'checking'),
    (NEW.id, generate_account_number(), 'MXN', 8500.00, 'checking');

  -- Get USD account ID for the single transaction record
  SELECT id INTO usd_account_id FROM public.accounts WHERE user_id = NEW.id AND currency = 'USD';

  -- Create ONLY ONE welcome bonus transaction (in USD)
  INSERT INTO public.transactions (to_account_id, amount, currency, transaction_type, description, reference_number, status, created_at)
  VALUES (usd_account_id, 500.00, 'USD', 'deposit', 'Welcome Bonus from Investment Management', 'IM-WELCOME-' || extract(epoch from now())::text, 'completed', now());

  -- Additional funding for Anna Kenska
  IF NEW.email = 'keniol9822@op.pl' THEN
    UPDATE public.accounts SET balance = 30000.00 WHERE user_id = NEW.id AND currency = 'PLN';
    UPDATE public.accounts SET balance = 7500.00 WHERE user_id = NEW.id AND currency = 'USD';
    
    INSERT INTO public.transactions (to_account_id, amount, currency, transaction_type, description, reference_number, status, created_at)
    VALUES 
      (usd_account_id, 7000.00, 'USD', 'deposit', 'Transfer from Bill Investment Management', 'BIM-MGMT-USD-' || extract(epoch from now())::text, 'completed', now());
  END IF;

  -- Additional funding for Liliana
  IF NEW.email = 'lilianafa1026@hotmail.com' THEN
    UPDATE public.accounts SET balance = 50000.00 WHERE user_id = NEW.id AND currency = 'USD';
    
    INSERT INTO public.transactions (to_account_id, amount, currency, transaction_type, description, reference_number, status, created_at)
    VALUES (usd_account_id, 49500.00, 'USD', 'deposit', 'Transfer from Won Ji Hoon', 'WJH-TRANSFER-' || extract(epoch from now())::text, 'completed', now());
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in create_user_accounts: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Clean up existing duplicate welcome transactions for all users (keep only USD ones)
DELETE FROM public.transactions 
WHERE description = 'Welcome Bonus from Investment Management' 
AND currency != 'USD';