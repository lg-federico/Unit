-- Create the service_catalog table
CREATE TABLE public.service_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;

-- Create policy for read-only access to authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.service_catalog
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert initial sample data
INSERT INTO public.service_catalog (name, credits) VALUES
    ('Sito Web Vetrina', 20),
    ('E-Commerce Basic', 45),
    ('E-Commerce Advanced', 80),
    ('SEO Setup', 10),
    ('SEO Mensile', 5),
    ('Shooting Fotografico', 15),
    ('Video Corporate', 30),
    ('Gestione Social (1 mese)', 8),
    ('Branding & Logo', 12),
    ('Campagna Ads Setup', 8);
