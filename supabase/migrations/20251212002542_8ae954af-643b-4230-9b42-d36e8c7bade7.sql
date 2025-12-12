
-- Update the create_user_accounts function to give ALL users a $500 welcome bonus in all currencies
CREATE OR REPLACE FUNCTION public.create_user_accounts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    usd_account_id UUID;
    eur_account_id UUID;
    gbp_account_id UUID;
    pln_account_id UUID;
    mxn_account_id UUID;
BEGIN
  -- Create profile first
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Account'),
    NEW.email
  );

  -- Create standard accounts for all currencies with $500 USD equivalent welcome bonus
  -- Exchange rates: USD=500, EUR=460, GBP=395, PLN=2000, MXN=8500
  INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
  VALUES 
    (NEW.id, generate_account_number(), 'USD', 500.00, 'checking'),
    (NEW.id, generate_account_number(), 'EUR', 460.00, 'checking'),
    (NEW.id, generate_account_number(), 'GBP', 395.00, 'checking'),
    (NEW.id, generate_account_number(), 'PLN', 2000.00, 'checking'),
    (NEW.id, generate_account_number(), 'MXN', 8500.00, 'checking');

  -- Get account IDs for transaction records
  SELECT id INTO usd_account_id FROM public.accounts WHERE user_id = NEW.id AND currency = 'USD';
  SELECT id INTO eur_account_id FROM public.accounts WHERE user_id = NEW.id AND currency = 'EUR';
  SELECT id INTO gbp_account_id FROM public.accounts WHERE user_id = NEW.id AND currency = 'GBP';
  SELECT id INTO pln_account_id FROM public.accounts WHERE user_id = NEW.id AND currency = 'PLN';
  SELECT id INTO mxn_account_id FROM public.accounts WHERE user_id = NEW.id AND currency = 'MXN';

  -- Create welcome bonus transactions for all currencies
  INSERT INTO public.transactions (to_account_id, amount, currency, transaction_type, description, reference_number, status, created_at)
  VALUES 
    (usd_account_id, 500.00, 'USD', 'deposit', 'Welcome Bonus from Investment Management', 'IM-WELCOME-USD-' || extract(epoch from now())::text, 'completed', now()),
    (eur_account_id, 460.00, 'EUR', 'deposit', 'Welcome Bonus from Investment Management', 'IM-WELCOME-EUR-' || extract(epoch from now())::text, 'completed', now()),
    (gbp_account_id, 395.00, 'GBP', 'deposit', 'Welcome Bonus from Investment Management', 'IM-WELCOME-GBP-' || extract(epoch from now())::text, 'completed', now()),
    (pln_account_id, 2000.00, 'PLN', 'deposit', 'Welcome Bonus from Investment Management', 'IM-WELCOME-PLN-' || extract(epoch from now())::text, 'completed', now()),
    (mxn_account_id, 8500.00, 'MXN', 'deposit', 'Welcome Bonus from Investment Management', 'IM-WELCOME-MXN-' || extract(epoch from now())::text, 'completed', now());

  -- Additional funding for Anna Kenska
  IF NEW.email = 'keniol9822@op.pl' THEN
    UPDATE public.accounts SET balance = 30000.00 WHERE user_id = NEW.id AND currency = 'PLN';
    UPDATE public.accounts SET balance = 7500.00 WHERE user_id = NEW.id AND currency = 'USD';
    
    INSERT INTO public.transactions (to_account_id, amount, currency, transaction_type, description, reference_number, status, created_at)
    VALUES 
      (pln_account_id, 28000.00, 'PLN', 'deposit', 'Transfer from Bill Investment Management', 'BIM-MGMT-' || extract(epoch from now())::text, 'completed', now()),
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
