import React, { useState, useMemo } from 'react';
import { useBankroll } from '../context/BankrollContext';
import { BetEntry, BetStatus } from '../types';

interface LedgerViewProps {
  onOpenNewBetModal: () => void;
  onEditBet: (bet: BetEntry) => void;
  onSuccessToast?: (msg: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  onOpenNewBetModal,
  onEditBet,
  onSuccessToast
}) => {
  const { bets, deleteBet, resolveBet } = useBankroll();

  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedMarketCat, setSelectedMarketCat] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  const months = [
    { key: 'ALL', label: 'Ano Completo' },
    { key: '01', label: 'Jan' },
    { key: '02', label: 'Fev' },
    { key: '03', label: 'Mar' },
    { key: '04', label: 'Abr' },
    { key: '05', label: 'Mai' },
    { key: '06', label: 'Jun' },
    { key: '07', label: 'Jul' },
    { key: '08', label: 'Ago' },
    { key: '09', label: 'Set' },
    { key: '10', label: 'Out' },
    { key: '11', label: 'Nov' },
    { key: '12', label: 'Dez' }
  ];

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const filteredBets = useMemo(() => {
    return bets.filter((b) => {
      if (selectedMonth !== 'ALL') {
        const match = b.date.match(/(\d{4})-(\d{2})|(\d{2})\/(\d{2})/);
        const mNum = match ? match[2] || match[4] : b.date.includes('Mai') || b.date.includes('-05-') ? '05' : '';
        if (mNum !== selectedMonth) return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTerm =
          b.event.toLowerCase().includes(term) ||
          b.market.toLowerCase().includes(term) ||
          (b.bookmaker && b.bookmaker.toLowerCase().includes(term));
        if (!matchesTerm) return false;
      }

      if (selectedSport !== 'ALL' && b.sport !== selectedSport) {
        return false;
      }

      if (selectedMarketCat !== 'ALL') {
        const mLower = b.market.toLowerCase();
        if (selectedMarketCat === 'Gols' && !(mLower.includes('gol') || mLower.includes('over') || mLower.includes('under') || mLower.includes('btts') || mLower.includes('marcam'))) {
          return false;
        }
        if (selectedMarketCat === 'Handicap' && !(mLower.includes('handicap') || mLower.includes('ha ') || mLower.includes('asiático') || mLower.includes('dnb'))) {
          return false;
        }
        if (selectedMarketCat === 'Escanteios' && !(mLower.includes('escanteio') || mLower.includes('corner'))) {
          return false;
        }
        if (selectedMarketCat === 'Cartões' && !(mLower.includes('cart') || mLower.includes('card') || mLower.includes('vermelho'))) {
          return false;
        }
        if (selectedMarketCat === 'Resultado' && !(mLower.includes('resultado') || mLower.includes('1x2') || mLower.includes('dupla chance') || mLower.includes('moneyline') || mLower.includes('vencedor'))) {
          return false;
        }
        if (selectedMarketCat === 'Props' && !(mLower.includes('chute') || mLower.includes('finaliza') || mLower.includes('jogador') || mLower.includes('marcador') || mLower.includes('assist'))) {
          return false;
        }
      }

      if (statusFilter !== 'ALL') {
        if (statusFilter === 'GREEN' && !(b.status === 'GREEN' || b.status === 'HALF_GREEN')) return false;
        if (statusFilter === 'RED' && !(b.status === 'RED' || b.status === 'HALF_RED')) return false;
        if (statusFilter === 'PENDENTE' && b.status !== 'PENDENTE') return false;
      }

      return true;
    });
  }, [bets, selectedMonth, searchTerm, selectedSport, selectedMarketCat, statusFilter]);

  const periodStats = useMemo(() => {
    let volume = 0;
    let pl = 0;

    filteredBets.forEach((b) => {
      volume += b.stake;
      if (b.status !== 'PENDENTE') {
        pl += b.pl;
      }
    });

    const roi = volume > 0 ? (pl / volume) * 100 : 0;

    return {
      count: filteredBets.length,
      volume,
      pl,
      roi
    };
  }, [filteredBets]);

  const totalPages = Math.max(1, Math.ceil(filteredBets.length / rowsPerPage));
  const paginatedBets = filteredBets.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const exportCSV = () => {
    let csv = "Data,Casa,Esporte,Evento,Mercado,Odd,Valor,Status,Lucro\n";
    filteredBets.forEach((r) => {
      csv += `"${r.date}","${r.bookmaker || ''}","${r.sport}","${r.event}","${r.market}",${r.odd},${r.stake},"${r.status}",${r.pl}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apostas_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    onSuccessToast?.('Planilha CSV exportada com sucesso.');
  };

  const getStatusBadge = (status: BetStatus) => {
    switch (status) {
      case 'GREEN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Green</span>;
      case 'RED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Red</span>;
      case 'HALF_GREEN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">½ Green</span>;
      case 'HALF_RED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/20">½ Red</span>;
      case 'VOID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">Reembolso</span>;
      case 'CASHOUT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Cashout</span>;
      case 'PENDENTE':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pendente</span>;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Livro-Razão</h2>
          <p className="text-xs text-slate-400">Extrato detalhado e histórico de operações esportivas</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportCSV}
            className="px-3.5 py-2 bg-[#090d16] hover:bg-slate-800 border border-white/[0.08] rounded-xl text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={onOpenNewBetModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">add</span>
            Nova Aposta
          </button>
        </div>
      </div>

      {/* Month Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {months.map((m) => {
          const isSelected = selectedMonth === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setSelectedMonth(m.key);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-[#0e1422]/80 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-white/[0.06]'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Period Summary 4-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Apostas</span>
          <div className="text-xl font-mono font-bold text-white mt-1 tabular-nums">{periodStats.count}</div>
        </div>
        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Volume</span>
          <div className="text-xl font-mono font-bold text-white mt-1 tabular-nums">{formatBRL(periodStats.volume)}</div>
        </div>
        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Lucro / P&L</span>
          <div className={`text-xl font-mono font-bold mt-1 tabular-nums ${periodStats.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {periodStats.pl >= 0 ? '+' : ''}{formatBRL(periodStats.pl)}
          </div>
        </div>
        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">ROI</span>
          <div className={`text-xl font-mono font-bold mt-1 tabular-nums ${periodStats.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {periodStats.roi >= 0 ? '+' : ''}{periodStats.roi.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por time, evento ou mercado..."
              className="bg-[#090d16] border border-white/[0.08] text-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-full placeholder:text-slate-500"
            />
          </div>

          <select
            value={selectedSport}
            onChange={(e) => {
              setSelectedSport(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#090d16] border border-white/[0.08] text-slate-200 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todos os Esportes</option>
            <option value="Futebol">⚽ Futebol</option>
            <option value="Basquete">🏀 Basquete</option>
            <option value="Tênis">🎾 Tênis</option>
            <option value="MMA / eSports">🎮 MMA / eSports</option>
          </select>

          <select
            value={selectedMarketCat}
            onChange={(e) => {
              setSelectedMarketCat(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#090d16] border border-white/[0.08] text-slate-200 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todos os Mercados</option>
            <option value="Gols">Gols & BTTS</option>
            <option value="Handicap">Handicap Asiático</option>
            <option value="Resultado">Resultado / 1X2</option>
            <option value="Escanteios">Escanteios</option>
            <option value="Cartões">Cartões</option>
            <option value="Props">Props / Jogadores</option>
          </select>
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center bg-[#090d16] p-1 rounded-xl border border-white/[0.08] self-start sm:self-auto">
          {(['ALL', 'GREEN', 'RED', 'PENDENTE'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todas' : st === 'GREEN' ? 'Greens' : st === 'RED' ? 'Reds' : 'Pendentes'}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#090d16] shadow-sm">
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
            {paginatedBets.map((bet) => (
              <tr key={bet.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3.5 font-mono text-slate-400 whitespace-nowrap">{bet.date}</td>
                <td className="py-3 px-3.5 font-medium text-slate-300">{bet.bookmaker || '-'}</td>
                <td className="py-3 px-3.5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-100">{bet.event}</span>
                    <span className="text-[11px] text-slate-400">{bet.market} · {bet.sport}</span>
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
                    bet.status === 'PENDENTE' ? 'text-slate-500' : bet.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {bet.status === 'PENDENTE' ? '-' : `${bet.pl >= 0 ? '+' : ''}${formatBRL(bet.pl)}`}
                </td>
                <td className="py-3 px-3.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {bet.status === 'PENDENTE' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            resolveBet(bet.id, 'GREEN');
                            onSuccessToast?.(`Aposta resolvida como GREEN`);
                          }}
                          className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/20"
                          title="Green"
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            resolveBet(bet.id, 'RED');
                            onSuccessToast?.(`Aposta resolvida como RED`);
                          }}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20"
                          title="Red"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onEditBet(bet)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Excluir esta aposta?`)) {
                          deleteBet(bet.id);
                          onSuccessToast?.('Aposta excluída com sucesso.');
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {paginatedBets.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Nenhuma aposta encontrada no período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Mostrando {paginatedBets.length} de {filteredBets.length} apostas</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-[#0e1422] border border-white/[0.08] rounded-lg disabled:opacity-40 hover:text-white"
            >
              Anterior
            </button>
            <span className="px-2 font-mono text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-[#0e1422] border border-white/[0.08] rounded-lg disabled:opacity-40 hover:text-white"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
