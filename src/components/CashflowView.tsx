import React, { useState } from 'react';
import { useBankroll } from '../context/BankrollContext';

interface CashflowViewProps {
  onOpenCashflowModal: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const CashflowView: React.FC<CashflowViewProps> = ({
  onOpenCashflowModal,
  onSuccessToast
}) => {
  const {
    treasury,
    deleteTreasury,
    totalDeposits,
    totalWithdrawals,
    currentEquity
  } = useBankroll();

  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW'>('ALL');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const filteredTreasury = treasury.filter((tx) => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Fluxo de Caixa</h2>
          <p className="text-xs text-slate-400">Controle de depósitos, saques e saldo disponível nas casas</p>
        </div>

        <button
          type="button"
          onClick={onOpenCashflowModal}
          className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95 shadow-md shadow-blue-500/20"
        >
          <span className="material-symbols-outlined text-[16px] font-bold">add</span>
          Lançar Depósito / Saque
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total de Depósitos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-[18px]">south_east</span>
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
            {formatBRL(totalDeposits)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {treasury.filter((t) => t.type === 'DEPOSIT').length} aporte(s)
          </div>
        </div>

        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total de Saques</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">north_east</span>
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-2 tabular-nums">
            {formatBRL(totalWithdrawals)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {treasury.filter((t) => t.type === 'WITHDRAW').length} retirada(s)
          </div>
        </div>

        <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Saldo Líquido em Caixa</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="text-2xl font-mono font-bold text-blue-400 mt-2 tabular-nums">
            {formatBRL(currentEquity)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Disponível para operações
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">Histórico de Transações</h3>
          <div className="flex items-center bg-[#090d16] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                filterType === 'ALL' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterType('DEPOSIT')}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                filterType === 'DEPOSIT' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Depósitos
            </button>
            <button
              type="button"
              onClick={() => setFilterType('WITHDRAW')}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                filterType === 'WITHDRAW' ? 'bg-slate-800 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Saques
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-white/[0.06] bg-[#090d16]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-slate-900/60 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">Data</th>
                <th className="py-3 px-3.5">Tipo</th>
                <th className="py-3 px-3.5">Descrição</th>
                <th className="py-3 px-3.5">Detalhes</th>
                <th className="py-3 px-3.5 text-right">Valor</th>
                <th className="py-3 px-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredTreasury.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3.5 font-mono text-slate-400 whitespace-nowrap">{item.date}</td>
                  <td className="py-3 px-3.5">
                    {item.type === 'DEPOSIT' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Depósito
                      </span>
                    ) : item.type === 'WITHDRAW' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Saque
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Bônus
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-200">{item.desc}</td>
                  <td className="py-3 px-3.5 text-slate-400">{item.details || 'Compensado'}</td>
                  <td
                    className={`py-3 px-3.5 text-right font-mono font-bold ${
                      item.type === 'WITHDRAW' ? 'text-emerald-400' : 'text-blue-400'
                    }`}
                  >
                    {item.type === 'WITHDRAW' ? '+' : ''}{formatBRL(item.amount)}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        deleteTreasury(item.id);
                        onSuccessToast?.('Transação excluída com sucesso.');
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTreasury.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhuma movimentação registrada.
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
