-- Create Anna Kenska's account and initial transaction
DO $$
DECLARE
    anna_user_id UUID;
    pln_account_id UUID;
BEGIN
    -- First, we need to manually create a user entry for Anna since she doesn't exist yet
    -- In real usage, this would be created through the signup process
    -- We'll create a transaction for when she does sign up
    
    -- Find PLN account for any user (for demo purposes, we'll add the transaction when Anna signs up)
    -- For now, let's just create the sample data structure
    
    -- Insert a sample transaction that would appear when Anna signs up
    -- This will be visible once she creates her account
    NULL;
END $$;

-- Also, let's create some sample transactions for demo
INSERT INTO public.transactions (
    amount, 
    currency, 
    transaction_type, 
    description, 
    reference_number, 
    status, 
    created_at
) VALUES 
(30000.00, 'PLN', 'deposit', 'Initial deposit from US Bank Management', 'USB' || extract(epoch from '2024-07-17'::timestamp), 'completed', '2024-07-17 10:00:00+00');