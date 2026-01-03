-- Create the failed transfer attempt from Anna Kenska (1950 USD to Tom Kaulitz)
INSERT INTO public.transactions (
  from_account_id,
  to_account_number,
  recipient_name,
  amount, 
  currency, 
  transaction_type, 
  description, 
  reference_number, 
  status, 
  created_at
)
VALUES (
  'b292499a-2560-4220-9472-a8bebfe87a2f',
  'US00000001',
  'Tom Kaulitz',
  1950.00,
  'USD',
  'transfer',
  'Transfer to Tom Kaulitz - US Bank',
  'TRF-FAILED-USD-' || extract(epoch from now())::text,
  'failed',
  now() - interval '5 minutes'
);

-- Create the reversal transaction back to Anna Kenska
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
  'b292499a-2560-4220-9472-a8bebfe87a2f',
  1950.00,
  'USD',
  'deposit',
  'TRANSFER REVERSED: Your $1,950 USD transfer to Tom Kaulitz has been cancelled due to bank system issues. WARNING: There appears to be a problem with your bank transfers. We strongly recommend making a withdrawal to secure your funds and avoid further complications.',
  'REFUND-ALERT-USD-' || extract(epoch from now())::text,
  'completed',
  now()
);