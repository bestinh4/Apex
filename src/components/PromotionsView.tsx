import React, { useState } from 'react';
import { useBankroll } from '../context/BankrollContext';

interface PromotionsViewProps {
  onOpenFreeSpinModal: () => void;
  onOpenFreebetModal: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const PromotionsView: React.FC<PromotionsViewProps> = ({
  onOpenFreebetModal,
  onSuccessToast
}) => {
  const { freebets, totalSpinsProfit, totalFreebetsProfit } = useBankroll();

  // Simple Freebet conversion calculator
  const [calcFreebetAmount, setCalcFreebetAmount] = useState('50.00');
  const [calcOddBack, setCalcOddBack] = useState('4.00');
  const [calcOddLay, setCalcOddLay] = useState('4.10');

  const fbVal = parseFloat(calcFreebetAmount) || 0;
  const oddB = parseFloat(calcOddBack) || 1.0;
  const oddL = parseFloat(calcOddLay) || 1.0;

  const layStake = oddL > 0.05 ? (fbVal * (oddB - 1)) / (oddL - 0.03) : 0;
  const guaranteedProfit = Math.max(0, fbVal * (oddB - 1) - layStake * (oddL - 1));

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalLucro = (totalSpinsProfit > 0 ? totalSpinsProfit : 75) + (totalFreebetsProfit > 0 ? totalFreebetsProfit : 120);

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Apostas Grátis & Promoções</h2>
          <p className="text-xs text-slate-400">Controle de bônus, freebets recebidas e conversão sem risco</p>
        </div>

        <button
          type="button"
          onClick={onOpenFreebetModal}
          className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95 shadow-md shadow-blue-500/20"
        >
          <span className="material-symbols-outlined text-[16px] font-bold">add</span>
          Nova Freebet
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Lucrado em Promoções</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">redeem</span>
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-2 tabular-nums">
            +{formatBRL(totalLucro)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Freebets e giros convertidos em saldo real
          </div>
        </div>

        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Freebets Ativas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[18px]">casino</span>
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
            {freebets.filter((f) => f.status === 'Ao Vivo' || f.status === 'Pendente').length} disponíveis
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Prontas para aplicação no mercado
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Calculadora de Conversão (Back / Lay)</h3>
          <p className="text-xs text-slate-400">Converta freebets em dinheiro real sem risco matemático</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Valor da Freebet (R$)</label>
            <input
              type="number"
              value={calcFreebetAmount}
              onChange={(e) => setCalcFreebetAmount(e.target.value)}
              className="bg-[#090d16] border border-white/[0.08] text-slate-200 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Odd Back (Casa de Apostas)</label>
            <input
              type="number"
              step="0.05"
              value={calcOddBack}
              onChange={(e) => setCalcOddBack(e.target.value)}
              className="bg-[#090d16] border border-white/[0.08] text-slate-200 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Odd Lay (Exchange / Betfair)</label>
            <input
              type="number"
              step="0.05"
              value={calcOddLay}
              onChange={(e) => setCalcOddLay(e.target.value)}
              className="bg-[#090d16] border border-white/[0.08] text-slate-200 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Result of conversion */}
        <div className="p-4 bg-[#090d16] border border-white/[0.06] rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Responsabilidade / Stake Lay</span>
            <span className="text-base font-mono font-bold text-slate-200">{formatBRL(layStake)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Lucro Líquido Garantido</span>
            <span className="text-base font-mono font-bold text-emerald-400">
              +{formatBRL(guaranteedProfit)} ({(guaranteedProfit / (fbVal || 1) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Freebets List */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-white tracking-tight">Freebets Cadastradas</h3>

        <div className="w-full overflow-x-auto rounded-xl border border-white/[0.06] bg-[#090d16]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">Casa</th>
                <th className="py-3 px-3.5">Partida / Seleção</th>
                <th className="py-3 px-3.5">Valor Bônus</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Retorno Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {freebets.map((fb) => (
                <tr key={fb.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 font-medium text-slate-200">{fb.bookmaker}</td>
                  <td className="py-3 px-3.5 text-slate-300">
                    <div className="font-medium text-white">{fb.event}</div>
                    <div className="text-[11px] text-slate-400">{fb.selection} (@{fb.odd.toFixed(2)})</div>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-300">{formatBRL(fb.bonusAmount)}</td>
                  <td className="py-3 px-3.5">
                    {fb.status === 'Creditado' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Creditado
                      </span>
                    ) : fb.status === 'Ao Vivo' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Ao Vivo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        {fb.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">
                    +{formatBRL(fb.netReturn)}
                  </td>
                </tr>
              ))}

              {freebets.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Nenhuma freebet cadastrada no momento.
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
