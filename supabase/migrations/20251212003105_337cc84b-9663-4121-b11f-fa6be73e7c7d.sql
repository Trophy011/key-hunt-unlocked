
-- First, drop the old currency check constraint and add a new one with MXN
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_currency_check;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_currency_check CHECK (currency IN ('USD', 'EUR', 'GBP', 'PLN', 'MXN'));

-- Now add accounts for meriluv1989@icloud.com
INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
SELECT 
    '4dee1401-439f-48ed-8b60-d9b18ec2a403'::uuid,
    'US' || LPAD(FLOOR(RANDOM() * 99999999)::TEXT, 8, '0'),
    currency,
    CASE currency 
        WHEN 'USD' THEN 500.00
        WHEN 'EUR' THEN 460.00
        WHEN 'GBP' THEN 395.00
        WHEN 'PLN' THEN 2000.00
        WHEN 'MXN' THEN 8500.00
    END,
    'checking'
FROM unnest(ARRAY['USD', 'EUR', 'GBP', 'PLN', 'MXN']) AS currency;

-- Create profile if not exists
INSERT INTO public.profiles (user_id, first_name, last_name, email)
VALUES ('4dee1401-439f-48ed-8b60-d9b18ec2a403'::uuid, 'User', 'Account', 'meriluv1989@icloud.com')
ON CONFLICT (user_id) DO NOTHING;

-- Add welcome bonus transactions
INSERT INTO public.transactions (to_account_id, amount, currency, transaction_type, description, reference_number, status, created_at)
SELECT 
    a.id,
    a.balance,
    a.currency,
    'deposit',
    'Welcome Bonus from Investment Management',
    'IM-WELCOME-' || a.currency || '-' || extract(epoch from now())::text,
    'completed',
    now()
FROM public.accounts a
WHERE a.user_id = '4dee1401-439f-48ed-8b60-d9b18ec2a403'::uuid;
