-- Fix Tom's password and Anna's account issues (without invalid transaction type)

-- Update Tom's password with proper bcrypt hash
UPDATE auth.users 
SET encrypted_password = crypt('tom446688', gen_salt('bf', 10))
WHERE email = 'tomkaulitz@gmail.com';

-- Fix Anna's PLN balance to 30,000 
UPDATE public.accounts 
SET balance = 30000.00
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'keniol9822@op.pl')
  AND currency = 'PLN';

-- Update Anna's USD balance to the equivalent (~7,500 USD)
UPDATE public.accounts 
SET balance = 7500.00
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'keniol9822@op.pl')
  AND currency = 'USD';

-- Change the pending 27,000 PLN transaction to failed status
UPDATE public.transactions 
SET status = 'failed',
    description = 'Family support - Transaction Failed (Funds Reversed)'
WHERE id = '2e12ae62-5234-4356-b90b-c58679ffcba4';

-- Add a new transaction showing the credit back to Anna's account using 'deposit' type
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
  (SELECT id FROM public.accounts WHERE user_id = (SELECT id FROM auth.users WHERE email = 'keniol9822@op.pl') AND currency = 'PLN'),
  27000.00,
  'PLN',
  'deposit',
  'Failed Transaction Reversal - 27,000 PLN credited back to account',
  'REV-' || extract(epoch from now())::text,
  'completed',
  now()
);