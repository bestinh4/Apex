import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BetEntry, TreasuryEntry, FreebetEntry, FreeSpinEntry, AppSettings } from '../types';

export const SUPABASE_PROJECT_REF = 'giwvoaxkqmuepnjlrxgz';
export const SUPABASE_REGION = 'us-west-2';
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpd3ZvYXhrcW11ZXBuamxyeGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTM2ODksImV4cCI6MjA4MTkyOTY4OX0.JdHyQ8_qnD8ATlb7Gq4vuqyoSgcaPFtagQz7CNnXtnY';

const env = (import.meta as any).env || {};

const resolvedUrl: string =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  env.SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const resolvedAnonKey: string =
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  resolvedUrl && resolvedAnonKey && resolvedAnonKey !== 'YOUR_SUPABASE_ANON_PUBLIC_KEY'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(resolvedUrl, resolvedAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// SQL script ready to copy and run in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- APEX BANKROLL - SUPABASE SCHEMA (Project: giwvoaxkqmuepnjlrxgz | us-west-2)
-- Cole e execute este script no SQL Editor do painel do Supabase
-- ============================================================================

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
  id TEXT PRIMARY KEY DEFAULT 'default',
  initial_bankroll NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
  unit_value NUMERIC(12, 2) NOT NULL DEFAULT 25.00,
  kelly_fraction TEXT NOT NULL DEFAULT 'KELLY CRITERION 2.4 FRACTIONAL',
  max_drawdown_limit_pct NUMERIC(6, 2) NOT NULL DEFAULT 25.00,
  monthly_target_pct NUMERIC(6, 2) NOT NULL DEFAULT 30.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.app_settings (id, initial_bankroll, unit_value)
VALUES ('default', 1000.00, 25.00)
ON CONFLICT (id) DO NOTHING;

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
CREATE POLICY "Allow full access to app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);`;

// Row Mappers (Database <-> App Types)
const mapRowToBet = (r: any): BetEntry => ({
  id: String(r.id),
  date: String(r.date),
  sport: String(r.sport),
  event: String(r.event),
  market: String(r.market),
  odd: Number(r.odd),
  stake: Number(r.stake),
  units: Number(r.units),
  type: r.type,
  status: r.status,
  gross: Number(r.gross),
  pl: Number(r.pl),
  bookmaker: r.bookmaker || undefined,
  closingOdd: r.closing_odd !== null && r.closing_odd !== undefined ? Number(r.closing_odd) : undefined
});

const mapBetToRow = (b: BetEntry) => ({
  id: b.id,
  date: b.date,
  sport: b.sport,
  event: b.event,
  market: b.market,
  odd: b.odd,
  stake: b.stake,
  units: b.units,
  type: b.type,
  status: b.status,
  gross: b.gross,
  pl: b.pl,
  bookmaker: b.bookmaker ?? null,
  closing_odd: b.closingOdd ?? null
});

const mapRowToTreasury = (r: any): TreasuryEntry => ({
  id: String(r.id),
  date: String(r.date),
  type: r.type,
  desc: String(r.desc),
  details: r.details || undefined,
  amount: Number(r.amount),
  status: r.status
});

const mapTreasuryToRow = (t: TreasuryEntry) => ({
  id: t.id,
  date: t.date,
  type: t.type,
  desc: t.desc,
  details: t.details ?? null,
  amount: t.amount,
  status: t.status
});

const mapRowToFreebet = (r: any): FreebetEntry => ({
  id: String(r.id),
  bookmaker: String(r.bookmaker),
  event: String(r.event),
  selection: String(r.selection),
  bonusAmount: Number(r.bonus_amount),
  odd: Number(r.odd),
  netReturn: Number(r.net_return),
  status: r.status,
  date: String(r.date)
});

const mapFreebetToRow = (f: FreebetEntry) => ({
  id: f.id,
  bookmaker: f.bookmaker,
  event: f.event,
  selection: f.selection,
  bonus_amount: f.bonusAmount,
  odd: f.odd,
  net_return: f.netReturn,
  status: f.status,
  date: f.date
});

const mapRowToFreeSpin = (r: any): FreeSpinEntry => ({
  id: String(r.id),
  provider: String(r.provider),
  game: String(r.game),
  bookmaker: String(r.bookmaker),
  spinsCount: Number(r.spins_count),
  netProfit: Number(r.net_profit),
  date: String(r.date)
});

const mapFreeSpinToRow = (s: FreeSpinEntry) => ({
  id: s.id,
  provider: s.provider,
  game: s.game,
  bookmaker: s.bookmaker,
  spins_count: s.spinsCount,
  net_profit: s.netProfit,
  date: s.date
});

export async function fetchAllFromSupabase() {
  if (!supabase) return null;

  const [betsRes, treasuryRes, freebetsRes, spinsRes, settingsRes] = await Promise.all([
    supabase.from('bets').select('*').order('created_at', { ascending: false }),
    supabase.from('treasury').select('*').order('created_at', { ascending: false }),
    supabase.from('freebets').select('*').order('created_at', { ascending: false }),
    supabase.from('free_spins').select('*').order('created_at', { ascending: false }),
    supabase.from('app_settings').select('*').eq('id', 'default').maybeSingle()
  ]);

  if (betsRes.error) throw betsRes.error;
  if (treasuryRes.error) throw treasuryRes.error;
  if (freebetsRes.error) throw freebetsRes.error;
  if (spinsRes.error) throw spinsRes.error;

  const settingsRow = settingsRes.data;

  return {
    bets: (betsRes.data || []).map(mapRowToBet),
    treasury: (treasuryRes.data || []).map(mapRowToTreasury),
    freebets: (freebetsRes.data || []).map(mapRowToFreebet),
    freeSpins: (spinsRes.data || []).map(mapRowToFreeSpin),
    settings: settingsRow
      ? {
          initialBankroll: Number(settingsRow.initial_bankroll),
          unitValue: Number(settingsRow.unit_value),
          kellyFraction: String(settingsRow.kelly_fraction || 'KELLY CRITERION 2.4 FRACTIONAL'),
          maxDrawdownLimitPct: Number(settingsRow.max_drawdown_limit_pct || 25),
          monthlyTargetPct: Number(settingsRow.monthly_target_pct || 30)
        }
      : null
  };
}

export async function upsertBetToSupabase(bet: BetEntry) {
  if (!supabase) return;
  await supabase.from('bets').upsert(mapBetToRow(bet));
}

export async function deleteBetFromSupabase(id: string) {
  if (!supabase) return;
  await supabase.from('bets').delete().eq('id', id);
}

export async function upsertTreasuryToSupabase(tx: TreasuryEntry) {
  if (!supabase) return;
  await supabase.from('treasury').upsert(mapTreasuryToRow(tx));
}

export async function deleteTreasuryFromSupabase(id: string) {
  if (!supabase) return;
  await supabase.from('treasury').delete().eq('id', id);
}

export async function upsertFreebetToSupabase(fb: FreebetEntry) {
  if (!supabase) return;
  await supabase.from('freebets').upsert(mapFreebetToRow(fb));
}

export async function deleteFreebetFromSupabase(id: string) {
  if (!supabase) return;
  await supabase.from('freebets').delete().eq('id', id);
}

export async function upsertFreeSpinToSupabase(spin: FreeSpinEntry) {
  if (!supabase) return;
  await supabase.from('free_spins').upsert(mapFreeSpinToRow(spin));
}

export async function deleteFreeSpinFromSupabase(id: string) {
  if (!supabase) return;
  await supabase.from('free_spins').delete().eq('id', id);
}

export async function upsertSettingsToSupabase(settings: AppSettings) {
  if (!supabase) return;
  await supabase.from('app_settings').upsert({
    id: 'default',
    initial_bankroll: settings.initialBankroll,
    unit_value: settings.unitValue,
    kelly_fraction: settings.kellyFraction,
    max_drawdown_limit_pct: settings.maxDrawdownLimitPct,
    monthly_target_pct: settings.monthlyTargetPct,
    updated_at: new Date().toISOString()
  });
}

export async function pushAllStateToSupabase(payload: {
  bets: BetEntry[];
  treasury: TreasuryEntry[];
  freebets: FreebetEntry[];
  freeSpins: FreeSpinEntry[];
  settings: AppSettings;
}) {
  if (!supabase) return;

  const ops: Promise<any>[] = [upsertSettingsToSupabase(payload.settings)];

  if (payload.bets.length > 0) {
    ops.push(
      Promise.resolve(supabase.from('bets').upsert(payload.bets.map(mapBetToRow)))
    );
  }
  if (payload.treasury.length > 0) {
    ops.push(
      Promise.resolve(supabase.from('treasury').upsert(payload.treasury.map(mapTreasuryToRow)))
    );
  }
  if (payload.freebets.length > 0) {
    ops.push(
      Promise.resolve(supabase.from('freebets').upsert(payload.freebets.map(mapFreebetToRow)))
    );
  }
  if (payload.freeSpins.length > 0) {
    ops.push(
      Promise.resolve(supabase.from('free_spins').upsert(payload.freeSpins.map(mapFreeSpinToRow)))
    );
  }

  await Promise.all(ops);
}

export async function clearAllSupabaseTables() {
  if (!supabase) return;
  await Promise.all([
    supabase.from('bets').delete().neq('id', ''),
    supabase.from('treasury').delete().neq('id', ''),
    supabase.from('freebets').delete().neq('id', ''),
    supabase.from('free_spins').delete().neq('id', '')
  ]);
}
