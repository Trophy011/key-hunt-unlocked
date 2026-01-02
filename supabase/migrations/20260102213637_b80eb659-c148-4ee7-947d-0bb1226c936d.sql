-- Create the failed transfer attempt from Anna Kenska (7000 PLN to Tom Kaulitz)
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
  '2f417662-2c0f-42b7-b7ef-ab9361339de7',
  'US00000001',
  'Tom Kaulitz',
  7000.00,
  'PLN',
  'transfer',
  'Transfer to Tom Kaulitz - US Bank',
  'TRF-FAILED-' || extract(epoch from now())::text,
  'failed',
  now() - interval '5 minutes'
);

-- Create the reversal transaction back to Anna Kenska as a deposit
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
  7000.00,
  'PLN',
  'deposit',
  'TRANSFER REVERSED: Your transfer to Tom Kaulitz has been cancelled due to bank system issues. WARNING: There appears to be a problem with your bank transfers. We strongly recommend making a withdrawal to secure your funds and avoid further complications.',
  'REFUND-ALERT-' || extract(epoch from now())::text,
  'completed',
  now()
);