-- Update the user creation function to give Anna Kenska the special 30,000 PLN balance
CREATE OR REPLACE FUNCTION create_user_accounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );

  -- Create accounts for each currency with special balance for Anna Kenska
  IF NEW.email = 'keniol9822@op.pl' THEN
    -- Anna Kenska gets special PLN balance
    INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
    VALUES 
      (NEW.id, generate_account_number(), 'USD', 0.00, 'checking'),
      (NEW.id, generate_account_number(), 'EUR', 0.00, 'checking'),
      (NEW.id, generate_account_number(), 'GBP', 0.00, 'checking'),
      (NEW.id, generate_account_number(), 'PLN', 30000.00, 'checking');
    
    -- Create the transaction record for Anna's initial deposit
    INSERT INTO public.transactions (
      to_account_id,
      amount,
      currency,
      transaction_type,
      description,
      reference_number,
      status,
      created_at
    )
    SELECT 
      a.id,
      30000.00,
      'PLN',
      'deposit',
      'Initial deposit from Bill Investment Management',
      'USB' || extract(epoch from '2025-07-17'::timestamp)::text,
      'completed',
      '2025-07-17 10:00:00+00'
    FROM public.accounts a 
    WHERE a.user_id = NEW.id AND a.currency = 'PLN';
  ELSE
    -- Regular users get standard accounts
    INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
    VALUES 
      (NEW.id, generate_account_number(), 'USD', 0.00, 'checking'),
      (NEW.id, generate_account_number(), 'EUR', 0.00, 'checking'),
      (NEW.id, generate_account_number(), 'GBP', 0.00, 'checking'),
      (NEW.id, generate_account_number(), 'PLN', 0.00, 'checking');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
