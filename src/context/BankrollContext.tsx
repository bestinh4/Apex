import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { BetEntry, TreasuryEntry, FreebetEntry, FreeSpinEntry, AppSettings, BetStatus } from '../types';
import {
  initialBets,
  initialTreasury,
  initialFreebets,
  initialFreeSpins,
  demoBets,
  demoTreasury,
  demoFreebets,
  demoFreeSpins,
  defaultSettings
} from '../data/initialData';
import {
  isSupabaseConfigured,
  fetchAllFromSupabase,
  upsertBetToSupabase,
  deleteBetFromSupabase,
  upsertTreasuryToSupabase,
  deleteTreasuryFromSupabase,
  upsertFreebetToSupabase,
  deleteFreebetFromSupabase,
  upsertFreeSpinToSupabase,
  deleteFreeSpinFromSupabase,
  upsertSettingsToSupabase,
  pushAllStateToSupabase,
  clearAllSupabaseTables
} from '../lib/supabase';

interface BankrollContextType {
  bets: BetEntry[];
  treasury: TreasuryEntry[];
  freebets: FreebetEntry[];
  freeSpins: FreeSpinEntry[];
  settings: AppSettings;
  addBet: (bet: Omit<BetEntry, 'id' | 'gross' | 'pl'> & { gross?: number; pl?: number }) => void;
  updateBet: (id: string, updated: Partial<BetEntry>) => void;
  deleteBet: (id: string) => void;
  resolveBet: (id: string, status: BetStatus) => void;
  addTreasury: (tx: Omit<TreasuryEntry, 'id'>) => void;
  deleteTreasury: (id: string) => void;
  addFreebet: (fb: Omit<FreebetEntry, 'id'>) => void;
  updateFreebetStatus: (id: string, status: FreebetEntry['status']) => void;
  deleteFreebet: (id: string) => void;
  addFreeSpin: (spin: Omit<FreeSpinEntry, 'id'>) => void;
  deleteFreeSpin: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetData: () => void;
  loadDemoData: () => void;
  importBackup: (data: {
    bets?: BetEntry[];
    treasury?: TreasuryEntry[];
    freebets?: FreebetEntry[];
    freeSpins?: FreeSpinEntry[];
    settings?: AppSettings;
  }) => void;
  syncNow: () => Promise<boolean>;
  // Computed metrics
  totalDeposits: number;
  totalWithdrawals: number;
  netBetProfit: number;
  totalSpinsProfit: number;
  totalFreebetsProfit: number;
  currentEquity: number;
  activeExposure: number;
  openPositionsCount: number;
  settledBetsCount: number;
  winCount: number;
  lossCount: number;
  voidCount: number;
  winRate: number;
  turnoverVolume: number;
  roi: number;
  maxDrawdownPct: number;
  currentStreakText: string;
  maxWinStreak: number;
  maxLossStreak: number;
  monthlyTargetAmount: number;
  stopLossDistance: number;
  unitValue: number;
}

const BankrollContext = createContext<BankrollContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'apex_bankroll_clean_v1_';

export function BankrollProvider({ children }: { children: ReactNode }) {
  const [bets, setBets] = useState<BetEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}bets`);
      return saved ? JSON.parse(saved) : initialBets;
    } catch {
      return initialBets;
    }
  });

  const [treasury, setTreasury] = useState<TreasuryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}treasury`);
      return saved ? JSON.parse(saved) : initialTreasury;
    } catch {
      return initialTreasury;
    }
  });

  const [freebets, setFreebets] = useState<FreebetEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}freebets`);
      return saved ? JSON.parse(saved) : initialFreebets;
    } catch {
      return initialFreebets;
    }
  });

  const [freeSpins, setFreeSpins] = useState<FreeSpinEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}freespins`);
      return saved ? JSON.parse(saved) : initialFreeSpins;
    } catch {
      return initialFreeSpins;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}settings`);
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}bets`, JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}treasury`, JSON.stringify(treasury));
  }, [treasury]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}freebets`, JSON.stringify(freebets));
  }, [freebets]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}freespins`, JSON.stringify(freeSpins));
  }, [freeSpins]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}settings`, JSON.stringify(settings));
  }, [settings]);

  // Initial & Manual Cloud Sync with Supabase
  const syncNow = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      const remote = await fetchAllFromSupabase();
      if (!remote) return false;

      const hasRemoteData =
        remote.bets.length > 0 ||
        remote.treasury.length > 0 ||
        remote.freebets.length > 0 ||
        remote.freeSpins.length > 0;

      const hasLocalData =
        bets.length > 0 ||
        treasury.length > 0 ||
        freebets.length > 0 ||
        freeSpins.length > 0;

      if (hasRemoteData) {
        setBets(remote.bets);
        setTreasury(remote.treasury);
        setFreebets(remote.freebets);
        setFreeSpins(remote.freeSpins);
        if (remote.settings) {
          setSettings((prev) => ({
            ...prev,
            ...remote.settings
          }));
        }
      } else if (hasLocalData) {
        await pushAllStateToSupabase({
          bets,
          treasury,
          freebets,
          freeSpins,
          settings
        });
      } else if (remote.settings) {
        setSettings((prev) => ({
          ...prev,
          ...remote.settings
        }));
      }
      return true;
    } catch {
      return false;
    }
  }, [bets, treasury, freebets, freeSpins, settings]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    syncNow();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncNow();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    return () => window.removeEventListener('visibilitychange', handleVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute Bet outcomes accurately based on status and fund type
  const calculateGrossAndPL = (stake: number, odd: number, status: BetStatus, type: string) => {
    let gross = 0;
    let pl = 0;

    if (status === 'GREEN') {
      if (type === 'Freebet') {
        gross = stake * (odd - 1);
        pl = gross;
      } else {
        gross = stake * odd;
        pl = gross - stake;
      }
    } else if (status === 'HALF_GREEN') {
      if (type === 'Freebet') {
        gross = (stake * (odd - 1)) / 2;
        pl = gross;
      } else {
        gross = stake + (stake * (odd - 1)) / 2;
        pl = gross - stake;
      }
    } else if (status === 'RED') {
      gross = 0;
      pl = type === 'Freebet' ? 0 : -stake;
    } else if (status === 'HALF_RED') {
      gross = type === 'Freebet' ? 0 : stake / 2;
      pl = type === 'Freebet' ? 0 : -stake / 2;
    } else if (status === 'VOID') {
      gross = type === 'Freebet' ? 0 : stake;
      pl = 0;
    } else if (status === 'CASHOUT') {
      gross = stake * 1.15;
      pl = gross - stake;
    } else if (status === 'PENDENTE') {
      gross = 0;
      pl = 0;
    }

    return { gross, pl };
  };

  const addBet = (newBet: Omit<BetEntry, 'id' | 'gross' | 'pl'> & { gross?: number; pl?: number }) => {
    const { gross, pl } =
      newBet.gross !== undefined && newBet.pl !== undefined
        ? { gross: newBet.gross, pl: newBet.pl }
        : calculateGrossAndPL(newBet.stake, newBet.odd, newBet.status, newBet.type);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const entry: BetEntry = {
      ...newBet,
      id: `APX-${randomSuffix}`,
      units: Number((newBet.stake / (settings.unitValue || 1)).toFixed(2)),
      gross,
      pl
    };

    setBets((prev) => [entry, ...prev]);
    upsertBetToSupabase(entry).catch(() => {});
  };

  const updateBet = (id: string, updated: Partial<BetEntry>) => {
    setBets((prev) =>
      prev.map((bet) => {
        if (bet.id !== id) return bet;
        const merged = { ...bet, ...updated };
        const { gross, pl } = calculateGrossAndPL(merged.stake, merged.odd, merged.status, merged.type);
        const finalBet: BetEntry = {
          ...merged,
          units: Number((merged.stake / (settings.unitValue || 1)).toFixed(2)),
          gross,
          pl
        };
        upsertBetToSupabase(finalBet).catch(() => {});
        return finalBet;
      })
    );
  };

  const deleteBet = (id: string) => {
    setBets((prev) => prev.filter((bet) => bet.id !== id));
    deleteBetFromSupabase(id).catch(() => {});
  };

  const resolveBet = (id: string, status: BetStatus) => {
    setBets((prev) =>
      prev.map((bet) => {
        if (bet.id !== id) return bet;
        const { gross, pl } = calculateGrossAndPL(bet.stake, bet.odd, status, bet.type);
        const finalBet: BetEntry = {
          ...bet,
          status,
          gross,
          pl
        };
        upsertBetToSupabase(finalBet).catch(() => {});
        return finalBet;
      })
    );
  };

  const addTreasury = (tx: Omit<TreasuryEntry, 'id'>) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const entry: TreasuryEntry = {
      ...tx,
      id: `TX-${randomSuffix}`
    };
    setTreasury((prev) => [entry, ...prev]);
    upsertTreasuryToSupabase(entry).catch(() => {});
  };

  const deleteTreasury = (id: string) => {
    setTreasury((prev) => prev.filter((tx) => tx.id !== id));
    deleteTreasuryFromSupabase(id).catch(() => {});
  };

  const addFreebet = (fb: Omit<FreebetEntry, 'id'>) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const entry: FreebetEntry = { ...fb, id: `FB-${randomSuffix}` };
    setFreebets((prev) => [entry, ...prev]);
    upsertFreebetToSupabase(entry).catch(() => {});
  };

  const updateFreebetStatus = (id: string, status: FreebetEntry['status']) => {
    setFreebets((prev) =>
      prev.map((fb) => {
        if (fb.id !== id) return fb;
        const updated = { ...fb, status };
        upsertFreebetToSupabase(updated).catch(() => {});
        return updated;
      })
    );
  };

  const deleteFreebet = (id: string) => {
    setFreebets((prev) => prev.filter((fb) => fb.id !== id));
    deleteFreebetFromSupabase(id).catch(() => {});
  };

  const addFreeSpin = (spin: Omit<FreeSpinEntry, 'id'>) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const entry: FreeSpinEntry = { ...spin, id: `FS-${randomSuffix}` };
    setFreeSpins((prev) => [entry, ...prev]);
    upsertFreeSpinToSupabase(entry).catch(() => {});
  };

  const deleteFreeSpin = (id: string) => {
    setFreeSpins((prev) => prev.filter((fs) => fs.id !== id));
    deleteFreeSpinFromSupabase(id).catch(() => {});
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      upsertSettingsToSupabase(merged).catch(() => {});
      return merged;
    });
  };

  const resetData = () => {
    setBets([]);
    setTreasury([]);
    setFreebets([]);
    setFreeSpins([]);
    clearAllSupabaseTables().catch(() => {});
  };

  const loadDemoData = () => {
    setBets(demoBets);
    setTreasury(demoTreasury);
    setFreebets(demoFreebets);
    setFreeSpins(demoFreeSpins);
    pushAllStateToSupabase({
      bets: demoBets,
      treasury: demoTreasury,
      freebets: demoFreebets,
      freeSpins: demoFreeSpins,
      settings
    }).catch(() => {});
  };

  const importBackup = (data: {
    bets?: BetEntry[];
    treasury?: TreasuryEntry[];
    freebets?: FreebetEntry[];
    freeSpins?: FreeSpinEntry[];
    settings?: AppSettings;
  }) => {
    const nextBets = Array.isArray(data.bets) ? data.bets : bets;
    const nextTreasury = Array.isArray(data.treasury) ? data.treasury : treasury;
    const nextFreebets = Array.isArray(data.freebets) ? data.freebets : freebets;
    const nextFreeSpins = Array.isArray(data.freeSpins) ? data.freeSpins : freeSpins;
    const nextSettings =
      data.settings && typeof data.settings === 'object'
        ? { ...settings, ...data.settings }
        : settings;

    setBets(nextBets);
    setTreasury(nextTreasury);
    setFreebets(nextFreebets);
    setFreeSpins(nextFreeSpins);
    setSettings(nextSettings);

    pushAllStateToSupabase({
      bets: nextBets,
      treasury: nextTreasury,
      freebets: nextFreebets,
      freeSpins: nextFreeSpins,
      settings: nextSettings
    }).catch(() => {});
  };

  // Computations
  const totalDeposits = useMemo(() => {
    return treasury
      .filter((t) => t.type === 'DEPOSIT' || t.type === 'BONUS')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [treasury]);

  const totalWithdrawals = useMemo(() => {
    return treasury
      .filter((t) => t.type === 'WITHDRAW')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [treasury]);

  const totalSpinsProfit = useMemo(() => {
    return freeSpins.reduce((sum, s) => sum + s.netProfit, 0);
  }, [freeSpins]);

  const totalFreebetsProfit = useMemo(() => {
    return freebets
      .filter((f) => f.status === 'Creditado')
      .reduce((sum, f) => sum + f.netReturn, 0);
  }, [freebets]);

  const {
    netBetProfit,
    activeExposure,
    openPositionsCount,
    settledBetsCount,
    winCount,
    lossCount,
    voidCount,
    turnoverVolume
  } = useMemo(() => {
    let profit = 0;
    let exposure = 0;
    let openCount = 0;
    let settledCount = 0;
    let wins = 0;
    let losses = 0;
    let voids = 0;
    let turnover = 0;

    bets.forEach((b) => {
      if (b.status === 'PENDENTE') {
        exposure += b.stake;
        openCount++;
      } else {
        settledCount++;
        profit += b.pl;
        turnover += b.stake;

        if (b.status === 'GREEN' || b.status === 'HALF_GREEN') {
          wins++;
        } else if (b.status === 'RED' || b.status === 'HALF_RED') {
          losses++;
        } else if (b.status === 'VOID') {
          voids++;
        }
      }
    });

    return {
      netBetProfit: profit,
      activeExposure: exposure,
      openPositionsCount: openCount,
      settledBetsCount: settledCount,
      winCount: wins,
      lossCount: losses,
      voidCount: voids,
      turnoverVolume: turnover
    };
  }, [bets]);

  const currentEquity = useMemo(() => {
    return settings.initialBankroll + netBetProfit + totalSpinsProfit + totalDeposits - totalWithdrawals;
  }, [settings.initialBankroll, netBetProfit, totalSpinsProfit, totalDeposits, totalWithdrawals]);

  const winRate = useMemo(() => {
    const totalDecisive = winCount + lossCount;
    return totalDecisive > 0 ? (winCount / totalDecisive) * 100 : 0;
  }, [winCount, lossCount]);

  const roi = useMemo(() => {
    return turnoverVolume > 0 ? (netBetProfit / turnoverVolume) * 100 : 0;
  }, [netBetProfit, turnoverVolume]);

  // Real streaks & drawdown computation
  const { maxWinStreak, maxLossStreak, currentStreakText, maxDrawdownPct } = useMemo(() => {
    let maxW = 0;
    let maxL = 0;
    let currentW = 0;
    let currentL = 0;

    // Chronological order (oldest to newest)
    const chronological = [...bets].filter((b) => b.status !== 'PENDENTE').reverse();

    let runningEquity = settings.initialBankroll;
    let peakEquity = settings.initialBankroll;
    let maxDd = 0;

    chronological.forEach((b) => {
      runningEquity += b.pl;
      if (runningEquity > peakEquity) {
        peakEquity = runningEquity;
      }
      if (peakEquity > 0) {
        const dd = ((peakEquity - runningEquity) / peakEquity) * 100;
        if (dd > maxDd) maxDd = dd;
      }

      if (b.status === 'VOID') return;

      if (b.status === 'GREEN' || b.status === 'HALF_GREEN') {
        currentW++;
        currentL = 0;
        if (currentW > maxW) maxW = currentW;
      } else if (b.status === 'RED' || b.status === 'HALF_RED') {
        currentL++;
        currentW = 0;
        if (currentL > maxL) maxL = currentL;
      }
    });

    let streakText = 'Sem histórico';
    if (currentW > 0) {
      streakText = `+${currentW} ${currentW === 1 ? 'Green seguido' : 'Greens seguidos'}`;
    } else if (currentL > 0) {
      streakText = `-${currentL} ${currentL === 1 ? 'Red seguido' : 'Reds seguidos'}`;
    }

    return {
      maxWinStreak: maxW,
      maxLossStreak: maxL,
      currentStreakText: streakText,
      maxDrawdownPct: maxDd
    };
  }, [bets, settings.initialBankroll]);

  const monthlyTargetAmount = (settings.initialBankroll * settings.monthlyTargetPct) / 100;
  const stopLossDistance = (settings.initialBankroll * settings.maxDrawdownLimitPct) / 100;

  return (
    <BankrollContext.Provider
      value={{
        bets,
        treasury,
        freebets,
        freeSpins,
        settings,
        addBet,
        updateBet,
        deleteBet,
        resolveBet,
        addTreasury,
        deleteTreasury,
        addFreebet,
        updateFreebetStatus,
        deleteFreebet,
        addFreeSpin,
        deleteFreeSpin,
        updateSettings,
        resetData,
        loadDemoData,
        importBackup,
        syncNow,
        totalDeposits,
        totalWithdrawals,
        netBetProfit,
        totalSpinsProfit,
        totalFreebetsProfit,
        currentEquity,
        activeExposure,
        openPositionsCount,
        settledBetsCount,
        winCount,
        lossCount,
        voidCount,
        winRate,
        turnoverVolume,
        roi,
        maxDrawdownPct,
        currentStreakText,
        maxWinStreak,
        maxLossStreak,
        monthlyTargetAmount,
        stopLossDistance,
        unitValue: settings.unitValue
      }}
    >
      {children}
    </BankrollContext.Provider>
  );
}

export function useBankroll() {
  const context = useContext(BankrollContext);
  if (!context) {
    throw new Error('useBankroll must be used within a BankrollProvider');
  }
  return context;
}
