-- ============================================================================
-- APEX BANKROLL - SUPABASE SCHEMA (Project: giwvoaxkqmuepnjlrxgz | us-west-2)
-- Execute este script no SQL Editor do painel do Supabase
-- ============================================================================

-- 1. Tabela de Apostas (Livro Razão)
CREATE TABLE IF NOT EXISTS public.bets (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  sport TEXT NOT NULL,
  event TEXT NOT NULL,
  market TEXT NOT NULL,
  odd NUMERIC(10, 2) NOT NULL,
  stake NUMERIC(12, 2) NOT NULL,
  units NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  gross NUMERIC(12, 2) NOT NULL DEFAULT 0,
  pl NUMERIC(12, 2) NOT NULL DEFAULT 0,
  bookmaker TEXT,
  closing_odd NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Fluxo de Caixa (Depósitos, Saques e Bônus)
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

-- 3. Tabela de Apostas Grátis (Freebets)
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

-- 4. Tabela de Giros Grátis (Free Spins)
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

-- 5. Tabela de Configurações da Banca
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  initial_bankroll NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
  unit_value NUMERIC(12, 2) NOT NULL DEFAULT 25.00,
  kelly_fraction TEXT NOT NULL DEFAULT 'KELLY CRITERION 2.4 FRACTIONAL',
  max_drawdown_limit_pct NUMERIC(6, 2) NOT NULL DEFAULT 25.00,
  monthly_target_pct NUMERIC(6, 2) NOT NULL DEFAULT 30.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão inicial caso não exista
INSERT INTO public.app_settings (id, initial_bankroll, unit_value)
VALUES ('default', 1000.00, 25.00)
ON CONFLICT (id) DO NOTHING;

-- Habilitar Row Level Security (RLS) com políticas de acesso para o cliente
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freebets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to bets" ON public.bets;
CREATE POLICY "Allow full access to bets" ON public.bets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to treasury" ON public.treasury;
CREATE POLICY "Allow full access to treasury" ON public.treasury FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to freebets" ON public.freebets;
CREATE POLICY "Allow full access to freebets" ON public.freebets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to free_spins" ON public.free_spins;
CREATE POLICY "Allow full access to free_spins" ON public.free_spins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to app_settings" ON public.app_settings;
CREATE POLICY "Allow full access to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
