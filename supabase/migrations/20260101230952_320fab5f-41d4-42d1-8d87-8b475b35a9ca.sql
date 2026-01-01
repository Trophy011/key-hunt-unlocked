-- Restore Anna Kenska's PLN balance to 30,000 (adding back 26,000)
UPDATE public.accounts 
SET balance = 30000.00, updated_at = now()
WHERE user_id = 'ab3956ac-c5b3-470c-93e6-3fc1f90565aa' AND currency = 'PLN';

-- Add a notification transaction for Anna Kenska about bank issues
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
VALUES (
  '2f417662-2c0f-42b7-b7ef-ab9361339de7',
  26000.00,
  'PLN',
  'deposit',
  'IMPORTANT NOTICE: We have detected irregularities with your banking services. If you experience issues with transfers, please withdraw your funds immediately for safety. Contact support for assistance.',
  'BANK-NOTICE-' || extract(epoch from now())::text,
  'completed',
  now()
);