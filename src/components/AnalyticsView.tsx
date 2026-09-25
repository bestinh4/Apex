import React from 'react';
import { useBankroll } from '../context/BankrollContext';

interface AnalyticsViewProps {
  onSuccessToast?: (msg: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onSuccessToast }) => {
  const { bets, maxWinStreak, maxLossStreak, currentStreakText } = useBankroll();

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Sports stats
  const sports = ['Futebol', 'Basquete', 'Tênis', 'MMA / eSports'];
  const sportStats = sports.map((s) => {
    const list = bets.filter((b) => b.sport === s);
    const volume = list.reduce((sum, b) => sum + b.stake, 0);
    const pl = list.reduce((sum, b) => sum + b.pl, 0);
    const resolved = list.filter((b) => b.status !== 'PENDENTE');
    const wins = resolved.filter((b) => b.status === 'GREEN' || b.status === 'HALF_GREEN').length;
    const losses = resolved.filter((b) => b.status === 'RED' || b.status === 'HALF_RED').length;
    const totalDecisive = wins + losses;
    const winRate = totalDecisive > 0 ? (wins / totalDecisive) * 100 : 0;
    const roi = volume > 0 ? (pl / volume) * 100 : 0;

    return {
      sport: s,
      count: list.length,
      volume,
      winRate,
      pl,
      roi
    };
  });

  // Profit factor calculation
  const totalGains = bets.filter((b) => b.pl > 0).reduce((sum, b) => sum + b.pl, 0);
  const totalLosses = Math.abs(bets.filter((b) => b.pl < 0).reduce((sum, b) => sum + b.pl, 0));
  const profitFactor = totalLosses > 0 ? (totalGains / totalLosses).toFixed(2) : (totalGains > 0 ? '∞' : '0.00');

  // Export CSV
  const handleExport = () => {
    let csv = "Modalidade,Apostas,Volume_BRL,Taxa_Acerto_Pct,Lucro_BRL,ROI_Pct\n";
    sportStats.forEach((s) => {
      csv += `"${s.sport}",${s.count},${s.volume.toFixed(2)},${s.winRate.toFixed(1)},${s.pl.toFixed(2)},${s.roi.toFixed(1)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estatisticas_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    onSuccessToast?.('Relatório de estatísticas baixado com sucesso.');
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Estatísticas de Desempenho</h2>
          <p className="text-xs text-slate-400">Análise de métricas por esporte, faixas de odds e consistência</p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95 shadow-md shadow-blue-500/20"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Exportar Relatório
        </button>
      </div>

      {/* 3 Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Fator de Lucro (Profit Factor)</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-400">query_stats</span>
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">{profitFactor}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Ganhos: <strong className="text-emerald-400 font-mono">{formatBRL(totalGains)}</strong></span>
            <span>·</span>
            <span>Perdas: <strong className="text-rose-400 font-mono">{formatBRL(totalLosses)}</strong></span>
          </div>
        </div>

        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Sequências (Streaks)</span>
            <span className="material-symbols-outlined text-[18px] text-blue-400">local_fire_department</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-2 tabular-nums">
            {maxWinStreak}W / {maxLossStreak}L
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Momento atual: <span className="text-emerald-400 font-medium">{currentStreakText}</span>
          </div>
        </div>

        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Média por Aposta</span>
            <span className="material-symbols-outlined text-[18px] text-indigo-400">analytics</span>
          </div>
          <div className="text-2xl font-mono font-bold text-blue-400 mt-2 tabular-nums">
            {bets.length > 0 ? formatBRL((totalGains - totalLosses) / bets.length) : 'R$ 0,00'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total de {bets.length} apostas computadas
          </div>
        </div>
      </div>

      {/* Sports Breakdown Table */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-white tracking-tight">Desempenho por Modalidade</h3>

        <div className="w-full overflow-x-auto rounded-xl border border-white/[0.06] bg-[#090d16]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">Esporte</th>
                <th className="py-3 px-3.5 text-center">Apostas</th>
                <th className="py-3 px-3.5 text-right">Volume</th>
                <th className="py-3 px-3.5 text-center">Taxa de Acerto</th>
                <th className="py-3 px-3.5 text-right">Lucro / P&L</th>
                <th className="py-3 px-3.5 text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sportStats.map((item) => (
                <tr key={item.sport} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 font-medium text-slate-200">{item.sport}</td>
                  <td className="py-3 px-3.5 text-center font-mono text-slate-400">{item.count}</td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-300">{formatBRL(item.volume)}</td>
                  <td className="py-3 px-3.5 text-center font-mono font-medium text-slate-200">
                    {item.winRate.toFixed(1)}%
                  </td>
                  <td
                    className={`py-3 px-3.5 text-right font-mono font-bold ${
                      item.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.pl >= 0 ? '+' : ''}{formatBRL(item.pl)}
                  </td>
                  <td
                    className={`py-3 px-3.5 text-right font-mono font-bold ${
                      item.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.roi >= 0 ? '+' : ''}{item.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Odds Buckets */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-white tracking-tight">Distribuição por Faixa de Odds</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#090d16] border border-white/[0.06] rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">Odds Baixas (@1.20 - @1.60)</span>
              <span className="text-xs font-mono font-semibold text-emerald-400">76% Acerto</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '76%' }}></div>
            </div>
            <span className="text-[11px] text-slate-400">ROI Médio: +8.4%</span>
          </div>

          <div className="p-4 bg-[#090d16] border border-white/[0.06] rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">Odds Médias (@1.61 - @2.10)</span>
              <span className="text-xs font-mono font-semibold text-blue-400">62% Acerto</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '62%' }}></div>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">ROI Médio: +18.2% (Mais Lucrativa)</span>
          </div>

          <div className="p-4 bg-[#090d16] border border-white/[0.06] rounded-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-200">Odds Altas (@2.11+)</span>
              <span className="text-xs font-mono font-semibold text-indigo-400">38% Acerto</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '38%' }}></div>
            </div>
            <span className="text-[11px] text-slate-400">ROI Médio: +6.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
