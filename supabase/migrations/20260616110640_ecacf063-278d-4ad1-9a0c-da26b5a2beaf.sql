
CREATE TABLE public.problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
  topic TEXT,
  description TEXT NOT NULL,
  starter_code TEXT,
  language TEXT NOT NULL DEFAULT 'python',
  solution_code TEXT,
  solution_explanation TEXT,
  resources JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.problems TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.problems TO authenticated;
GRANT ALL ON public.problems TO service_role;

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

-- Public read of published problems
CREATE POLICY "Public can read published problems" ON public.problems
  FOR SELECT TO anon, authenticated USING (published = true);

-- No client-side writes; admin writes go through server functions using service role
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER problems_set_updated_at BEFORE UPDATE ON public.problems
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX problems_display_order_idx ON public.problems (display_order, created_at);
