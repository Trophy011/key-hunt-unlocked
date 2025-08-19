-- Insert sample banks with corrected SWIFT codes
INSERT INTO public.banks (country_id, name, swift_code)
SELECT c.id, bank_data.name, bank_data.swift_code
FROM public.countries c
CROSS JOIN (
  VALUES 
    ('US', 'US Bank', 'USBKUS44'),
    ('US', 'Bank of America', 'BOFAUS3N'),
    ('US', 'JPMorgan Chase', 'CHASUS33'),
    ('PL', 'PKO Bank Polski', 'PKOPPLPW'),
    ('PL', 'Bank Pekao', 'PKOPPLPX'),
    ('PL', 'mBank', 'BREXPLPWMBK'),
    ('CO', 'Bancolombia', 'COLOCOBB'),
    ('CO', 'Banco de Bogotá', 'BBOGCOBB'),
    ('EC', 'Banco Pichincha', 'PICHECEG'),
    ('EC', 'Banco del Pacífico', 'BDEPECEG'),
    ('PE', 'Banco de Crédito del Perú', 'BCPLPEPL'),
    ('PE', 'Interbank', 'BINPPEPL'),
    ('DE', 'Deutsche Bank', 'DEUTDEFF'),
    ('DE', 'Commerzbank', 'COBADEFF'),
    ('GB', 'Barclays Bank', 'BARCGB22'),
    ('GB', 'HSBC Bank', 'HBUKGB4B')
) AS bank_data(country_code, name, swift_code)
WHERE c.code = bank_data.country_code;