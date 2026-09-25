import { BetEntry, TreasuryEntry, FreebetEntry, FreeSpinEntry, AppSettings } from '../types';

export const initialBets: BetEntry[] = [
  {
    id: "APX-9821",
    date: "2025-05-18 16:00",
    sport: "Futebol",
    event: "Real Madrid vs Manchester City",
    market: "Over 2.5 Gols FT",
    odd: 1.95,
    stake: 50.00,
    units: 2.0,
    type: "Saldo Real",
    status: "GREEN",
    gross: 97.50,
    pl: 47.50,
    bookmaker: "Bet365",
    closingOdd: 1.88
  },
  {
    id: "APX-9820",
    date: "2025-05-18 14:30",
    sport: "Basquete",
    event: "Boston Celtics vs NY Knicks",
    market: "Boston -5.5 Spread",
    odd: 1.90,
    stake: 75.00,
    units: 3.0,
    type: "Saldo Real",
    status: "GREEN",
    gross: 142.50,
    pl: 67.50,
    bookmaker: "Pinnacle",
    closingOdd: 1.84
  },
  {
    id: "APX-9819",
    date: "2025-05-17 21:00",
    sport: "Futebol",
    event: "Flamengo vs Palmeiras",
    market: "Ambas Marcam (BTTS)",
    odd: 1.83,
    stake: 50.00,
    units: 2.0,
    type: "Saldo Real",
    status: "RED",
    gross: 0.00,
    pl: -50.00,
    bookmaker: "Betano",
    closingOdd: 1.81
  },
  {
    id: "APX-9818",
    date: "2025-05-17 19:15",
    sport: "Tênis",
    event: "C. Alcaraz vs J. Sinner",
    market: "Alcaraz Vence 1º Set",
    odd: 2.10,
    stake: 25.00,
    units: 1.0,
    type: "Saldo Real",
    status: "GREEN",
    gross: 52.50,
    pl: 27.50,
    bookmaker: "Bet365",
    closingOdd: 2.02
  },
  {
    id: "APX-9817",
    date: "2025-05-16 22:00",
    sport: "MMA / eSports",
    event: "UFC 305: Main Card Fight",
    market: "Luta Não Vai Até o Fim",
    odd: 1.72,
    stake: 100.00,
    units: 4.0,
    type: "Saldo Real",
    status: "HALF_GREEN",
    gross: 136.00,
    pl: 36.00,
    bookmaker: "Betfair",
    closingOdd: 1.68
  },
  {
    id: "APX-9816",
    date: "2025-05-16 17:00",
    sport: "Futebol",
    event: "Arsenal vs Chelsea",
    market: "Arsenal -1.0 HA",
    odd: 2.05,
    stake: 50.00,
    units: 2.0,
    type: "Saldo Real",
    status: "VOID",
    gross: 50.00,
    pl: 0.00,
    bookmaker: "Pinnacle",
    closingOdd: 1.99
  },
  {
    id: "APX-9815",
    date: "2025-05-15 20:30",
    sport: "Basquete",
    event: "Golden State vs LA Lakers",
    market: "S. Curry Over 4.5 Triplos",
    odd: 1.92,
    stake: 25.00,
    units: 1.0,
    type: "Freebet",
    status: "GREEN",
    gross: 48.00,
    pl: 23.00,
    bookmaker: "Betano",
    closingOdd: 1.85
  },
  {
    id: "APX-9814",
    date: "2025-05-15 15:45",
    sport: "Futebol",
    event: "Bayern München vs Dortmund",
    market: "Over 3.5 Gols FT",
    odd: 2.15,
    stake: 60.00,
    units: 2.4,
    type: "Saldo Real",
    status: "RED",
    gross: 0.00,
    pl: -60.00,
    bookmaker: "Bet365",
    closingOdd: 2.10
  },
  {
    id: "APX-9813",
    date: "2025-05-14 18:00",
    sport: "Tênis",
    event: "D. Medvedev vs A. Zverev",
    market: "Over 22.5 Games",
    odd: 1.88,
    stake: 50.00,
    units: 2.0,
    type: "Saldo Real",
    status: "CASHOUT",
    gross: 65.00,
    pl: 15.00,
    bookmaker: "Betfair",
    closingOdd: 1.85
  },
  {
    id: "APX-9812",
    date: "2025-05-14 13:00",
    sport: "Futebol",
    event: "Liverpool vs Aston Villa",
    market: "Handicap Asiático +0.25 Aston",
    odd: 2.02,
    stake: 50.00,
    units: 2.0,
    type: "Saldo Real",
    status: "HALF_RED",
    gross: 25.00,
    pl: -25.00,
    bookmaker: "Pinnacle",
    closingOdd: 1.98
  },
  {
    id: "APX-9811",
    date: "2025-05-13 21:00",
    sport: "MMA / eSports",
    event: "CS2 Major: Navi vs Furia",
    market: "Navi ML",
    odd: 1.65,
    stake: 125.00,
    units: 5.0,
    type: "Saldo Real",
    status: "GREEN",
    gross: 206.25,
    pl: 81.25,
    bookmaker: "Bet365",
    closingOdd: 1.58
  },
  {
    id: "APX-9810",
    date: "2025-05-12 16:30",
    sport: "Basquete",
    event: "Milwaukee Bucks vs Pacers",
    market: "G. Antetokounmpo +12.5 Reb",
    odd: 1.85,
    stake: 50.00,
    units: 2.0,
    type: "Saldo Real",
    status: "GREEN",
    gross: 92.50,
    pl: 42.50,
    bookmaker: "Betano",
    closingOdd: 1.80
  }
];

export const initialTreasury: TreasuryEntry[] = [
  {
    id: "TX-1001",
    date: "25/01/2025 14:32",
    type: "DEPOSIT",
    desc: "Aporte Inicial via Pix Banco Inter",
    details: "Liquidação Imediata • Chave CNPJ Apex Liquidity",
    amount: 1000.00,
    status: "Compensado"
  }
];

export const initialFreebets: FreebetEntry[] = [
  {
    id: "FB-001",
    bookmaker: "Betano",
    event: "Arsenal vs Bayern Munique",
    selection: "Mais de 2.5 Gols",
    bonusAmount: 50.00,
    odd: 2.10,
    netReturn: 55.00,
    status: "Ao Vivo",
    date: "Hoje, 16:00"
  },
  {
    id: "FB-002",
    bookmaker: "Bet365",
    event: "Real Madrid vs Man City",
    selection: "Ambas Marcam: Sim",
    bonusAmount: 50.00,
    odd: 1.80,
    netReturn: 40.00,
    status: "Creditado",
    date: "Ontem, 16:00"
  },
  {
    id: "FB-003",
    bookmaker: "Stake",
    event: "Palmeiras vs Flamengo",
    selection: "Empate Anula: Palmeiras",
    bonusAmount: 40.00,
    odd: 2.25,
    netReturn: 50.00,
    status: "Creditado",
    date: "14 Out, 19:00"
  },
  {
    id: "FB-004",
    bookmaker: "Pinnacle",
    event: "Liverpool vs Chelsea",
    selection: "Liverpool ML",
    bonusAmount: 40.00,
    odd: 1.75,
    netReturn: 30.00,
    status: "Creditado",
    date: "12 Out, 12:30"
  }
];

export const initialFreeSpins: FreeSpinEntry[] = [
  {
    id: "FS-001",
    provider: "Pragmatic Play",
    game: "Gates of Olympus",
    bookmaker: "Betano",
    spinsCount: 10,
    netProfit: 28.50,
    date: "Ontem, 21:14"
  },
  {
    id: "FS-002",
    provider: "Spribe",
    game: "Aviator Rain Promo",
    bookmaker: "EstrelaBet",
    spinsCount: 1,
    netProfit: 20.00,
    date: "14 Out, 18:30"
  },
  {
    id: "FS-003",
    provider: "Play'n GO",
    game: "Book of Dead",
    bookmaker: "Bet365",
    spinsCount: 5,
    netProfit: 14.00,
    date: "12 Out, 11:05"
  },
  {
    id: "FS-004",
    provider: "Playtech",
    game: "Roleta Brasileira Ao Vivo",
    bookmaker: "Betfair",
    spinsCount: 1,
    netProfit: 12.50,
    date: "09 Out, 23:40"
  }
];

export const defaultSettings: AppSettings = {
  initialBankroll: 1000.00,
  unitValue: 25.00,
  kellyFraction: "KELLY CRITERION 2.4 FRACTIONAL",
  maxDrawdownLimitPct: 25.0,
  monthlyTargetPct: 60.0,
  supabaseEndpoint: "giwvoaxkqmuepnjlrxgz.supabase.co",
  supabaseSyncIntervalSec: 10,
  autoSync: true
};
