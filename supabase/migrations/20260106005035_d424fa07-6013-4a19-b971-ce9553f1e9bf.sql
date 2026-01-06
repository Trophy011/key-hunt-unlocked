-- Update the 1000 PLN transfer to failed status
UPDATE public.transactions 
SET status = 'failed', 
    description = 'Life - Transaction Failed (Funds Reversed)'
WHERE id = '291be2e8-a7a0-4ae2-baeb-d5a74157f667';

-- Update the 3000 PLN transfer to failed status  
UPDATE public.transactions 
SET status = 'failed',
    description = 'For food for children - Transaction Failed (Funds Reversed)'
WHERE id = '89e34e15-416d-4853-bc0b-65238ec5dfed';

-- Create reversal for 1000 PLN
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
  1000.00,
  'PLN',
  'deposit',
  'TRANSFER REVERSED: Your 1,000 PLN transfer has been cancelled and funds returned to your account.',
  'REFUND-PLN-1000-' || extract(epoch from now())::text,
  'completed',
  now()
);

-- Create reversal for 3000 PLN
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
  3000.00,
  'PLN',
  'deposit',
  'TRANSFER REVERSED: Your 3,000 PLN transfer has been cancelled and funds returned to your account.',
  'REFUND-PLN-3000-' || extract(epoch from now())::text,
  'completed',
  now()
);

-- Update Anna Kenska's PLN account balance (add back 4000 PLN)
UPDATE public.accounts 
SET balance = balance + 4000.00,
    updated_at = now()
WHERE id = '2f417662-2c0f-42b7-b7ef-ab9361339de7';