
-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix function search path for generate_account_number
CREATE OR REPLACE FUNCTION public.generate_account_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  RETURN 'US' || LPAD(FLOOR(RANDOM() * 99999999)::TEXT, 8, '0');
END;
$function$;
