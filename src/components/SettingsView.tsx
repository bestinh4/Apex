import React, { useState, useRef } from 'react';
import { useBankroll } from '../context/BankrollContext';
import {
  SUPABASE_PROJECT_REF,
  SUPABASE_REGION,
  DEFAULT_SUPABASE_URL,
  SUPABASE_SQL_SCHEMA
} from '../lib/supabase';

interface SettingsViewProps {
  onSuccessToast?: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onSuccessToast,
  onNavigateTab
}) => {
  const {
    bets,
    treasury,
    freebets,
    freeSpins,
    settings,
    updateSettings,
    resetData,
    loadDemoData,
    importBackup,
    syncNow
  } = useBankroll();

  const [initialBankroll, setInitialBankroll] = useState(settings.initialBankroll.toString());
  const [unitValue, setUnitValue] = useState(settings.unitValue.toString());
  const [confirmClear, setConfirmClear] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const numBankroll = parseFloat(initialBankroll) || 1000;
  const numUnit = parseFloat(unitValue) || 25;
  const unitPct = numBankroll > 0 ? (numUnit / numBankroll) * 100 : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      initialBankroll: numBankroll,
      unitValue: numUnit
    });
    onSuccessToast?.('Configurações da banca salvas com sucesso!');
  };

  const applyUnitPctPreset = (pct: number) => {
    const calculated = ((numBankroll * pct) / 100).toFixed(2);
    setUnitValue(calculated);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const ok = await syncNow();
    setIsSyncing(false);
    if (ok) {
      onSuccessToast?.('Dados sincronizados com o Supabase com sucesso!');
    } else {
      setShowSqlModal(true);
      onSuccessToast?.('Copie e execute o script SQL abaixo no Supabase para criar as tabelas.');
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      onSuccessToast?.('Script SQL copiado para a área de transferência!');
    } catch {
      onSuccessToast?.('Selecione e copie o script SQL abaixo.');
      setShowSqlModal(true);
    }
  };

  const handleExportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      bets,
      treasury,
      freebets,
      freeSpins
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex_bankroll_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    onSuccessToast?.('Backup completo exportado com sucesso!');
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || '{}'));
        importBackup(parsed);
        if (parsed.settings?.initialBankroll) {
          setInitialBankroll(String(parsed.settings.initialBankroll));
        }
        if (parsed.settings?.unitValue) {
          setUnitValue(String(parsed.settings.unitValue));
        }
        onSuccessToast?.('Backup restaurado com sucesso!');
      } catch {
        onSuccessToast?.('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#0e1422]/95 border border-white/[0.07] rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Ajustes & Gestão da Banca
        </h2>
        <p className="text-xs text-slate-400">
          Defina sua banca inicial, tamanho da unidade (stake padrão) e gerencie a persistência dos dados
        </p>
      </div>

      {/* Main Settings Form */}
      <div className="bg-[#0e1422]/95 border border-white/[0.07] rounded-2xl p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Banca Inicial de Referência (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={initialBankroll}
                onChange={(e) => setInitialBankroll(e.target.value)}
                className="bg-[#080c14] border border-white/[0.08] text-white font-mono px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <span className="text-[11px] text-slate-400">
                Ponto de partida usado no gráfico de evolução e cálculo de crescimento
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Valor de 1.0 Unidade / Stake (R$)
                </label>
                <span className="text-[11px] font-mono text-blue-400 font-semibold tabular-nums">
                  {unitPct.toFixed(1)}% da banca
                </span>
              </div>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
                className="bg-[#080c14] border border-white/[0.08] text-white font-mono px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                required
              />
              {/* Quick Unit % Presets */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-400 mr-1">Atalhos:</span>
                {[1, 2, 2.5, 5].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyUnitPctPreset(pct)}
                    className="px-2.5 py-1 rounded-lg bg-[#080c14] hover:bg-slate-800 border border-white/[0.07] text-[11px] font-mono text-slate-300 transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-white/[0.06]">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>

      {/* Supabase Cloud Database Integration */}
      <div className="bg-[#0e1422]/95 border border-white/[0.07] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Persistência em Nuvem (Supabase)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Projeto configurado: <span className="font-mono text-slate-200">{SUPABASE_PROJECT_REF}</span> ({SUPABASE_REGION}) • <span className="font-mono text-slate-300">{DEFAULT_SUPABASE_URL}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-2 bg-[#080c14] hover:bg-slate-800 border border-white/[0.08] text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-400">content_copy</span>
              <span>Copiar SQL das Tabelas</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSqlModal((v) => !v)}
              className="px-3 py-2 bg-[#080c14] hover:bg-slate-800 border border-white/[0.08] text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              {showSqlModal ? 'Ocultar SQL' : 'Ver SQL'}
            </button>
          </div>
        </div>

        {showSqlModal && (
          <div className="bg-[#080c14] border border-white/[0.08] rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300">
                Execute este script uma única vez no SQL Editor do seu projeto Supabase ({SUPABASE_PROJECT_REF}):
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
              >
                Copiar Tudo
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64 p-2 bg-[#05080f] rounded-lg border border-white/[0.05] select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>

      {/* Backup & Data Control */}
      <div className="bg-[#0e1422]/95 border border-white/[0.07] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Backup & Controle de Dados
          </h3>
          <p className="text-xs text-slate-400">
            Exporte um backup completo em JSON, restaure registros ou limpe os dados quando desejar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-3 bg-[#080c14] hover:bg-slate-800/80 border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-400">download</span>
            <span>Exportar Backup (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 bg-[#080c14] hover:bg-slate-800/80 border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-400">upload_file</span>
            <span>Importar Backup (.json)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackupFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              loadDemoData();
              onSuccessToast?.('Dados de demonstração carregados!');
              onNavigateTab('dashboard');
            }}
            className="px-4 py-3 bg-[#080c14] hover:bg-slate-800/80 border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-indigo-400">science</span>
            <span>Carregar Exemplo</span>
          </button>

          {confirmClear ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  resetData();
                  setConfirmClear(false);
                  onSuccessToast?.('Todos os registros foram limpos!');
                  onNavigateTab('dashboard');
                }}
                className="flex-1 py-3 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Confirmar Limpeza
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="py-3 px-3 bg-[#080c14] border border-white/[0.08] text-slate-400 rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="px-4 py-3 bg-[#080c14] hover:bg-rose-500/10 text-rose-400 border border-white/[0.08] hover:border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Zerar Todos os Dados</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
