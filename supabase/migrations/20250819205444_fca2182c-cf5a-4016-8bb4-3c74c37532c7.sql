-- Insert sample countries and banks
INSERT INTO public.countries (name, code, currency) VALUES
('United States', 'US', 'USD'),
('Poland', 'PL', 'PLN'),
('Colombia', 'CO', 'COP'),
('Ecuador', 'EC', 'USD'),
('Peru', 'PE', 'PEN'),
('Germany', 'DE', 'EUR'),
('United Kingdom', 'GB', 'GBP');

-- Insert sample banks with unique SWIFT codes
INSERT INTO public.banks (country_id, name, swift_code)
SELECT c.id, bank_data.name, bank_data.swift_code
FROM public.countries c
CROSS JOIN (
  VALUES 
    ('US', 'US Bank', 'USBKUS44'),
    ('US', 'Bank of America', 'BOFAUS3N'),
    ('US', 'JPMorgan Chase', 'CHASUS33'),
    ('PL', 'PKO Bank Polski', 'PKOPPLPW'),
    ('PL', 'Bank Pekao', 'PKOPPLPW'),
    ('PL', 'mBank', 'BREXPLPWMBK'),
  ('PL', 'ING Bank Slaski S.A.', 'INGBPLPW'),
  ('PL', 'Santander Bank Polska S.A.', 'WBKPPLPP'),
    ('CO', 'Bancolombia', 'COLOCOBB'),
    ('CO', 'Banco de Bogotá', 'BBOGCOBB'),
  ('CO', 'Banco de Occidente', 'OCCICOBC'),
  ('CO', 'Banco Davivienda S.A.', 'CAFECOBB'),
    ('EC', 'Banco Pichincha', 'PICHECEG'),
    ('EC', 'Banco del Pacífico', 'BDEPECEG'),
  ('EC', 'Banco Guayaquil', 'GUAYECEG'),
  ('EC', 'Banco International', 'BINTECEQ'),
    ('PE', 'Banco de Crédito del Perú', 'BCPLPEPL'),
    ('PE', 'Interbank', 'BINPPEPL'),
  ('PE', 'Banco de la Nación', 'BANCPEPLXXX'),
    ('DE', 'Deutsche Bank', 'DEUTDEFF'),
    ('DE', 'Commerzbank', 'COBADEFF'),
    ('GB', 'Barclays Bank', 'BARCGB22'),
    ('GB', 'HSBC Bank', 'HBUKGB4B')
) AS bank_data(country_code, name, swift_code)
WHERE c.code = bank_data.country_code;
