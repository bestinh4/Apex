-- ============================================================================
-- APEX BANKROLL - MULTI-USER SUPABASE SCHEMA (Project: giwvoaxkqmuepnjlrxgz)
-- Isolamento individual por usuário autenticado (Row Level Security)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data DATE DEFAULT CURRENT_DATE,
  evento TEXT NOT NULL,
  mercado TEXT NOT NULL,
  odd NUMERIC(10, 2) NOT NULL,
  stake NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'GREEN',
  lucro_prejuizo NUMERIC(12, 2) NOT NULL DEFAULT 0,
  categoria TEXT DEFAULT 'Futebol',
  notas TEXT DEFAULT '',
  user_id UUID DEFAULT auth.uid()
);

CREATE TABLE IF NOT EXISTS public.treasury (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  details TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Compensado',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.freebets (
  id TEXT PRIMARY KEY,
  bookmaker TEXT NOT NULL,
  event TEXT NOT NULL,
  selection TEXT NOT NULL,
  bonus_amount NUMERIC(12, 2) NOT NULL,
  odd NUMERIC(10, 2) NOT NULL,
  net_return NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Ao Vivo',
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.free_spins (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  game TEXT NOT NULL,
  bookmaker TEXT NOT NULL,
  spins_count INTEGER NOT NULL DEFAULT 0,
  net_profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY,
  initial_bankroll NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
  unit_value NUMERIC(12, 2) NOT NULL DEFAULT 25.00,
  kelly_fraction TEXT NOT NULL DEFAULT 'KELLY CRITERION 2.4 FRACTIONAL',
  max_drawdown_limit_pct NUMERIC(6, 2) NOT NULL DEFAULT 25.00,
  monthly_target_pct NUMERIC(6, 2) NOT NULL DEFAULT 30.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freebets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to bets" ON public.bets;
DROP POLICY IF EXISTS "Users manage own bets" ON public.bets;
CREATE POLICY "Users manage own bets" ON public.bets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow full access to treasury" ON public.treasury;
DROP POLICY IF EXISTS "Users manage own treasury" ON public.treasury;
CREATE POLICY "Users manage own treasury" ON public.treasury
  FOR ALL USING (id LIKE auth.uid()::text || '__%') WITH CHECK (id LIKE auth.uid()::text || '__%');

DROP POLICY IF EXISTS "Allow full access to freebets" ON public.freebets;
DROP POLICY IF EXISTS "Users manage own freebets" ON public.freebets;
CREATE POLICY "Users manage own freebets" ON public.freebets
  FOR ALL USING (id LIKE auth.uid()::text || '__%') WITH CHECK (id LIKE auth.uid()::text || '__%');

DROP POLICY IF EXISTS "Allow full access to free_spins" ON public.free_spins;
DROP POLICY IF EXISTS "Users manage own free_spins" ON public.free_spins;
CREATE POLICY "Users manage own free_spins" ON public.free_spins
  FOR ALL USING (id LIKE auth.uid()::text || '__%') WITH CHECK (id LIKE auth.uid()::text || '__%');

DROP POLICY IF EXISTS "Allow full access to app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users manage own settings" ON public.app_settings;
CREATE POLICY "Users manage own settings" ON public.app_settings
  FOR ALL USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text);
