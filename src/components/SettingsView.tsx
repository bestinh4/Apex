import React, { useState } from 'react';
import { useBankroll } from '../context/BankrollContext';

interface SettingsViewProps {
  onSuccessToast?: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onSuccessToast
}) => {
  const { settings, updateSettings, resetData } = useBankroll();

  const [initialBankroll, setInitialBankroll] = useState(settings.initialBankroll.toString());
  const [unitValue, setUnitValue] = useState(settings.unitValue.toString());
  const [copiedLink, setCopiedLink] = useState(false);

  const htmlLogoUrl = "https://lh3.googleusercontent.com/aida/AEtjO1WoZ2OonAZtgfbpjmyqDMC7BwP47wp2q4JhTlWIwcDw3qYB4YkaPjOWU977gMq1EItDzj8mCvCVt9B5eySB_SUTup3fEOtEbXe_lgs3UvFeb0pLAIQOLLsVhvL_WBJgCcS7EjBoTT68czBA0UmmbDRlB0lDq3W1LEi3o4LY-1ud7gw6fuwPl20gPGIsVyo1iIGZWFgzU3EFf40Wrt74w8hNIQjBbkuJWtee9Phs5lAadnmJAHD6EehcIA";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      initialBankroll: parseFloat(initialBankroll) || 1000,
      unitValue: parseFloat(unitValue) || 25
    });
    onSuccessToast?.('Configurações salvas com sucesso!');
  };

  const handleCopyLogoUrl = () => {
    navigator.clipboard.writeText(htmlLogoUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onSuccessToast?.('Link da imagem copiado!');
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white tracking-tight">Ajustes da Banca</h2>
        <p className="text-xs text-slate-400">Defina o valor inicial de referência e o tamanho padrão das suas unidades</p>
      </div>

      {/* Main Settings Form */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Banca Inicial (R$)
              </label>
              <input
                type="number"
                step="10"
                min="10"
                value={initialBankroll}
                onChange={(e) => setInitialBankroll(e.target.value)}
                className="bg-[#090d16] border border-white/[0.08] text-slate-200 font-mono px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                required
              />
              <span className="text-[11px] text-slate-500">Capital de referência para cálculo de ROI e lucros</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Valor de 1.0 Unidade / Stake Padrão (R$)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
                className="bg-[#090d16] border border-white/[0.08] text-slate-200 font-mono px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                required
              />
              <span className="text-[11px] text-slate-500">
                Representa {((parseFloat(unitValue) / (parseFloat(initialBankroll) || 1)) * 100).toFixed(1)}% da sua banca inicial
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar os dados de demonstração?')) {
                  resetData();
                  onSuccessToast?.('Dados restaurados para o padrão.');
                }
              }}
              className="px-3.5 py-2 bg-[#090d16] hover:bg-rose-500/10 text-rose-400 border border-white/[0.08] hover:border-rose-500/30 rounded-xl text-xs font-medium transition-colors"
            >
              Restaurar Dados de Exemplo
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-semibold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-blue-500/20"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* Direct HTML Asset Link Section */}
      <div className="bg-[#0e1422]/90 border border-white/[0.07] rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Link Direto da Imagem (HTML)</h3>
            <p className="text-xs text-slate-400">URL direta do ativo visual extraído do HTML original</p>
          </div>
          <img
            src={htmlLogoUrl}
            alt="Logo"
            className="w-8 h-8 rounded-lg bg-[#090d16] p-1 border border-white/[0.08]"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={htmlLogoUrl}
            className="flex-1 bg-[#090d16] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopyLogoUrl}
            className="px-3.5 py-2 bg-[#090d16] hover:bg-slate-800 border border-white/[0.08] text-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            {copiedLink ? 'Copiado!' : 'Copiar URL'}
          </button>
        </div>
      </div>
    </div>
  );
};
