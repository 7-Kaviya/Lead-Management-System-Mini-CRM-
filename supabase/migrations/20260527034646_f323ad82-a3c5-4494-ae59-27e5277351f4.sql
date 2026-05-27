
CREATE TYPE public.lead_source AS ENUM ('Call', 'WhatsApp', 'Field');
CREATE TYPE public.lead_status AS ENUM ('New', 'Interested', 'Not Interested', 'Converted');

CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  source public.lead_source NOT NULL,
  status public.lead_status NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view leads" ON public.leads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update leads" ON public.leads FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Public can delete leads" ON public.leads FOR DELETE TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
