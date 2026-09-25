import React, { useState } from 'react';
import { useBankroll } from '../context/BankrollContext';
import { BetEntry, BetStatus } from '../types';

interface DashboardViewProps {
  onOpenNewBetModal: () => void;
  onOpenFreebetModal: () => void;
  onEditBet: (bet: BetEntry) => void;
  onSuccessToast?: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewBetModal,
  onEditBet,
  onSuccessToast
}) => {
  const {
    bets,
    deleteBet,
    resolveBet,
    currentEquity,
    settings,
    netBetProfit,
    winRate,
    turnoverVolume,
    roi,
    winCount,
    lossCount,
    voidCount
  } = useBankroll();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const plPct = settings.initialBankroll > 0 ? (netBetProfit / settings.initialBankroll) * 100 : 0;
  const plUnits = netBetProfit / settings.unitValue;

  const filteredBets = bets.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.bookmaker && b.bookmaker.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'GREEN' && (b.status === 'GREEN' || b.status === 'HALF_GREEN')) ||
      (filterStatus === 'RED' && (b.status === 'RED' || b.status === 'HALF_RED')) ||
      (filterStatus === 'PENDENTE' && b.status === 'PENDENTE');

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BetStatus) => {
    switch (status) {
      case 'GREEN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Green
          </span>
        );
      case 'RED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Red
          </span>
        );
      case 'HALF_GREEN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
            ½ Green
          </span>
        );
      case 'HALF_RED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/20">
            ½ Red
          </span>
        );
      case 'VOID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Reembolso
          </span>
        );
      case 'CASHOUT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Cashout
          </span>
        );
      case 'PENDENTE':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 4 Modern Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Saldo Total */}
        <div className="group relative bg-[#0e1422]/90 border border-white/[0.07] hover:border-slate-700/80 rounded-2xl p-5 shadow-sm transition-all overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Saldo Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-2xl lg:text-3xl font-mono font-bold text-white tracking-tight tabular-nums">
              {formatBRL(currentEquity)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span>Banca Inicial:</span>
              <span className="font-mono text-slate-300">{formatBRL(settings.initialBankroll)}</span>
            </div>
          </div>
        </div>

        {/* 2. Lucro Líquido */}
        <div className="group relative bg-[#0e1422]/90 border border-white/[0.07] hover:border-slate-700/80 rounded-2xl p-5 shadow-sm transition-all overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Lucro Líquido
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              netBetProfit >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {netBetProfit >= 0 ? 'trending_up' : 'trending_down'}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl lg:text-3xl font-mono font-bold tracking-tight tabular-nums ${
                netBetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {netBetProfit >= 0 ? '+' : ''}{formatBRL(netBetProfit)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs mt-1 text-slate-400">
              <span className={`font-mono font-semibold ${netBetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netBetProfit >= 0 ? '+' : ''}{plPct.toFixed(1)}%
              </span>
              <span>·</span>
              <span className="font-mono text-slate-300">
                {plUnits >= 0 ? '+' : ''}{plUnits.toFixed(1)}u
              </span>
            </div>
          </div>
        </div>

        {/* 3. Taxa de Acerto (Win Rate) */}
        <div className="group relative bg-[#0e1422]/90 border border-white/[0.07] hover:border-slate-700/80 rounded-2xl p-5 shadow-sm transition-all overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Taxa de Acerto
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="mt-3 flex flex-col">
            <span className="text-2xl lg:text-3xl font-mono font-bold text-white tracking-tight tabular-nums">
              {winRate.toFixed(1)}%
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <span className="text-emerald-400 font-medium">{winCount}W</span>
              <span>·</span>
              <span className="text-rose-400 font-medium">{lossCount}L</span>
              {voidCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-slate-400">{voidCount}V</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4. ROI (Retorno sobre Investimento) */}
        <div className="group relative bg-[#0e1422]/90 border border-white/[0.07] hover:border-slate-700/80 rounded-2xl p-5 shadow-sm transition-all overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Retorno (ROI)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">pie_chart</span>
            </div>
          </div>
          <div className="mt-3 flex flex-col">
            <span className={`text-2xl lg:text-3xl font-mono font-bold tracking-tight tabular-nums ${
              roi >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
              <span>Giro:</span>
              <span className="font-mono text-slate-300">{formatBRL(turnoverVolume)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Equity Curve Chart */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Evolução da Banca
            </h3>
            <p className="text-xs text-slate-400">Curva de rendimento acumulado</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
              {netBetProfit >= 0 ? '+' : ''}{formatBRL(netBetProfit)} no total
            </span>
          </div>
        </div>

        {/* Clean SVG Canvas */}
        <div className="w-full h-48 bg-[#090d16] border border-white/[0.05] rounded-xl p-4 relative flex flex-col justify-end overflow-hidden">
          {/* Subtle Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
            <div className="w-full border-b border-slate-700"></div>
            <div className="w-full border-b border-slate-700"></div>
            <div className="w-full border-b border-slate-700"></div>
          </div>

          <svg className="w-full h-full relative z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 130">
            <defs>
              <linearGradient id="modernEquityGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Baseline */}
            <line stroke="#334155" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="500" y1="85" y2="85" />

            {/* Smooth Fill */}
            <polygon
              fill="url(#modernEquityGradient)"
              points="0,85 50,85 100,82 150,86 200,75 250,72 300,64 350,68 400,56 450,52 500,46 500,130 0,130"
            />

            {/* Sharp Line */}
            <polyline
              fill="none"
              points="0,85 50,85 100,82 150,86 200,75 250,72 300,64 350,68 400,56 450,52 500,46"
              stroke="#10b981"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />

            {/* Current Value Pulsing Node */}
            <circle cx="500" cy="46" fill="#10b981" r="4.5" />
            <circle cx="500" cy="46" fill="#10b981" opacity="0.3" r="10" className="animate-ping" />
          </svg>
        </div>
      </div>

      {/* Recent Bets Table Section */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Apostas Recentes
            </h3>
            <p className="text-xs text-slate-400">Últimos registros e resultados</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar time ou mercado..."
                className="bg-[#090d16] border border-white/[0.08] text-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-44 sm:w-52 placeholder:text-slate-500 transition-colors"
              />
            </div>

            {/* Status Segmented Tabs */}
            <div className="flex items-center bg-[#090d16] p-1 rounded-xl border border-white/[0.08]">
              {(['ALL', 'GREEN', 'RED', 'PENDENTE'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    filterStatus === st
                      ? 'bg-slate-800 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'Todas' : st === 'GREEN' ? 'Greens' : st === 'RED' ? 'Reds' : 'Pendentes'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenNewBetModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Nova Aposta</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full overflow-x-auto rounded-xl border border-white/[0.06] bg-[#090d16]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">Data</th>
                <th className="py-3 px-3.5">Casa</th>
                <th className="py-3 px-3.5">Evento / Mercado</th>
                <th className="py-3 px-3.5 text-right">Odd</th>
                <th className="py-3 px-3.5 text-right">Valor</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-right">Lucro / P&L</th>
                <th className="py-3 px-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredBets.map((bet) => (
                <tr key={bet.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 font-mono text-slate-400 whitespace-nowrap">{bet.date}</td>
                  <td className="py-3 px-3.5 font-medium text-slate-300">{bet.bookmaker || '-'}</td>
                  <td className="py-3 px-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">{bet.event}</span>
                      <span className="text-[11px] text-slate-400">{bet.market}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-blue-400">
                    @{bet.odd.toFixed(2)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-200">
                    {formatBRL(bet.stake)}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    {getStatusBadge(bet.status)}
                  </td>
                  <td
                    className={`py-3 px-3.5 text-right font-mono font-bold text-xs sm:text-sm ${
                      bet.status === 'PENDENTE'
                        ? 'text-slate-500'
                        : bet.pl >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {bet.status === 'PENDENTE'
                      ? 'Pendente'
                      : `${bet.pl >= 0 ? '+' : ''}${formatBRL(bet.pl)}`}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {bet.status === 'PENDENTE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              resolveBet(bet.id, 'GREEN');
                              onSuccessToast?.(`Aposta #${bet.id} resolvida como GREEN!`);
                            }}
                            className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Definir Green"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              resolveBet(bet.id, 'RED');
                              onSuccessToast?.(`Aposta #${bet.id} resolvida como RED.`);
                            }}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Definir Red"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => onEditBet(bet)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Excluir esta aposta?`)) {
                            deleteBet(bet.id);
                            onSuccessToast?.(`Aposta removida.`);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhuma aposta encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
