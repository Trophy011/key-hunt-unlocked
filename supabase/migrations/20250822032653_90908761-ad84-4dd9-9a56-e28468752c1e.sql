-- Update the create_user_accounts function to change transaction description and add new user
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

  -- Special handling for Anna Kenska
  IF NEW.email = 'keniol9822@op.pl' THEN
    -- Update PLN account with the transfer amount
    UPDATE public.accounts 
    SET balance = 30000.00 
    WHERE user_id = NEW.id AND currency = 'PLN'
    RETURNING id INTO pln_account_id;
    
    -- Create the transfer transaction from Bill Investment Management
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
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in create_user_accounts: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create table for transaction PINs
CREATE TABLE IF NOT EXISTS public.user_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_pins
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

-- Create policies for user_pins
CREATE POLICY "Users can manage their own PIN" ON public.user_pins
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for user_pins updated_at
CREATE TRIGGER update_user_pins_updated_at
  BEFORE UPDATE ON public.user_pins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for transfer restrictions
CREATE TABLE IF NOT EXISTS public.transfer_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restriction_type text NOT NULL,
  restriction_amount numeric NOT NULL,
  restriction_currency text NOT NULL,
  target_email text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on transfer_restrictions
ALTER TABLE public.transfer_restrictions ENABLE ROW LEVEL SECURITY;

-- Create policies for transfer_restrictions
CREATE POLICY "Users can view their own restrictions" ON public.transfer_restrictions
  FOR SELECT USING (auth.uid() = user_id);

-- Add trigger for transfer_restrictions updated_at
CREATE TRIGGER update_transfer_restrictions_updated_at
  BEFORE UPDATE ON public.transfer_restrictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update transactions table to include PIN verification and pending status
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS pin_verified boolean DEFAULT false;
ALTER TABLE public.transactions ALTER COLUMN status SET DEFAULT 'pending';

-- Insert transfer restriction for Liliana
INSERT INTO public.transfer_restrictions (user_id, restriction_type, restriction_amount, restriction_currency, target_email)
SELECT 
  u.id,
  'conversion_fee',
  2000000,
  'COP',
  'managementofficails001@gmail.com'
FROM auth.users u 
WHERE u.email = 'lilianafa1026@hotmail.com'
ON CONFLICT DO NOTHING;