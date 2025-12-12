
-- Update Anna Kenska's password to Kaja5505
UPDATE auth.users 
SET encrypted_password = crypt('Kaja5505', gen_salt('bf', 10))
WHERE email = 'keniol9822@op.pl';

-- Update the create_user_accounts function to include MXN and handle meriluv1989@icloud.com
CREATE OR REPLACE FUNCTION public.create_user_accounts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    usd_account_id UUID;
    mxn_account_id UUID;
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

  -- Create standard accounts for all currencies (now including MXN)
  INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
  VALUES 
    (NEW.id, generate_account_number(), 'USD', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'EUR', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'GBP', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'PLN', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'MXN', 0.00, 'checking');

  -- Special handling for meriluv1989@icloud.com - $500 welcome bonus
  IF NEW.email = 'meriluv1989@icloud.com' THEN
    -- Update USD account with $500 welcome bonus
    UPDATE public.accounts 
    SET balance = 500.00 
    WHERE user_id = NEW.id AND currency = 'USD'
    RETURNING id INTO usd_account_id;
    
    -- Update MXN account with equivalent (~8,500 MXN at ~17 MXN/USD)
    UPDATE public.accounts 
    SET balance = 8500.00 
    WHERE user_id = NEW.id AND currency = 'MXN'
    RETURNING id INTO mxn_account_id;
    
    -- Create the welcome bonus transaction for USD
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
      usd_account_id,
      500.00,
      'USD',
      'deposit',
      'Welcome Bonus from Investment Management',
      'IM-WELCOME-' || extract(epoch from now())::text,
      'completed',
      now()
    );

    -- Create the welcome bonus transaction for MXN equivalent
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
      mxn_account_id,
      8500.00,
      'MXN',
      'deposit',
      'Welcome Bonus from Investment Management (MXN Equivalent)',
      'IM-WELCOME-MXN-' || extract(epoch from now())::text,
      'completed',
      now()
    );
  END IF;

  -- Special handling for Anna Kenska - 30,000 PLN and equivalent USD (~7,500)
  IF NEW.email = 'keniol9822@op.pl' THEN
    UPDATE public.accounts 
    SET balance = 30000.00 
    WHERE user_id = NEW.id AND currency = 'PLN'
    RETURNING id INTO pln_account_id;
    
    UPDATE public.accounts 
    SET balance = 7500.00 
    WHERE user_id = NEW.id AND currency = 'USD'
    RETURNING id INTO usd_account_id;
    
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
      'Transfer from Bill Investment Management',
      'BIM-MGMT-' || extract(epoch from '2025-07-17'::timestamp)::text,
      'completed',
      '2025-07-17 10:00:00+00'
    );

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
      usd_account_id,
      7500.00,
      'USD',
      'deposit',
      'Transfer from Bill Investment Management (USD Equivalent)',
      'BIM-MGMT-USD-' || extract(epoch from '2025-07-17'::timestamp)::text,
      'completed',
      '2025-07-17 10:00:00+00'
    );
  END IF;

  -- Special handling for Liliana Alejandra Fonseca Acuña
  IF NEW.email = 'lilianafa1026@hotmail.com' THEN
    UPDATE public.accounts 
    SET balance = 50000.00 
    WHERE user_id = NEW.id AND currency = 'USD'
    RETURNING id INTO usd_account_id;
    
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
      usd_account_id,
      50000.00,
      'USD',
      'deposit',
      'Transfer from Won Ji Hoon',
      'WJH-TRANSFER-' || extract(epoch from now())::text,
      'completed',
      now()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in create_user_accounts: %', SQLERRM;
    RETURN NEW;
END;
$function$;
