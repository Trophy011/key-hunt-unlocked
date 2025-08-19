-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts table for multi-currency support
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'GBP', 'PLN')),
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  account_type TEXT NOT NULL DEFAULT 'checking',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create countries table
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL
);

-- Create banks table
CREATE TABLE public.banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  swift_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal', 'international_transfer')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  reference_number TEXT NOT NULL UNIQUE,
  to_bank_id UUID REFERENCES public.banks(id) ON DELETE SET NULL,
  to_account_number TEXT,
  recipient_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts"
ON public.accounts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
ON public.accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
ON public.accounts FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.accounts WHERE id = from_account_id
    UNION
    SELECT user_id FROM public.accounts WHERE id = to_account_id
  )
);

CREATE POLICY "Users can insert transactions for their accounts"
ON public.transactions FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.accounts WHERE id = from_account_id
    UNION
    SELECT user_id FROM public.accounts WHERE id = to_account_id
  )
);

-- Countries and banks are readable by all authenticated users
CREATE POLICY "Countries are viewable by authenticated users"
ON public.countries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Banks are viewable by authenticated users"
ON public.banks FOR SELECT
TO authenticated
USING (true);

-- Function to generate random account numbers
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'US' || LPAD(FLOOR(RANDOM() * 99999999)::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to create default accounts for new users
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

  -- Create accounts for each currency
  INSERT INTO public.accounts (user_id, account_number, currency, balance, account_type)
  VALUES 
    (NEW.id, generate_account_number(), 'USD', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'EUR', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'GBP', 0.00, 'checking'),
    (NEW.id, generate_account_number(), 'PLN', 0.00, 'checking');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_accounts();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();