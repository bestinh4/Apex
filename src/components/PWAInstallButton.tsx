import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'card' | 'auth';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>App Instalado (Modo Nativo Ativo)</span>
        </div>
      );
    }
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          type="button"
          onClick={handleAction}
          title="Instalar aplicativo no dispositivo"
          className="px-2.5 sm:px-3 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span className="hidden sm:inline">Instalar App</span>
        </button>
      )}

      {variant === 'auth' && (
        <button
          type="button"
          onClick={handleAction}
          className="w-full py-2.5 px-4 bg-[#080c14] hover:bg-slate-800/80 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[17px]">install_mobile</span>
          <span>Instalar Aplicativo no Celular / PC</span>
        </button>
      )}

      {variant === 'card' && (
        <button
          type="button"
          onClick={handleAction}
          className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">install_mobile</span>
          <span>Instalar Aplicativo Nativo</span>
        </button>
      )}

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0e1422] border border-white/[0.09] p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">install_mobile</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Instalar Aplicativo Apex Bankroll
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Instalação completa sem barra de navegador
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {isIOS ? (
              <div className="flex flex-col gap-3 text-xs text-slate-300">
                <p className="text-slate-400">
                  No iPhone ou iPad (Safari), a Apple realiza a instalação nativa em 2 toques:
                </p>
                <div className="p-3.5 rounded-xl bg-[#080c14] border border-white/[0.06] flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>
                      Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) na barra do Safari.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>
                      Role para baixo e toque em <strong>Adicionar à Tela de Início</strong> e depois em <strong>Adicionar</strong>.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-xs text-slate-300">
                <p className="text-slate-400">
                  Para instalar o pacote completo do aplicativo (WebAPK no Android ou App Desktop no Windows/Mac):
                </p>
                <div className="p-3.5 rounded-xl bg-[#080c14] border border-white/[0.06] flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>
                      No <strong>Chrome</strong> ou <strong>Edge</strong>, toque no menu <strong>⋮</strong> (três pontos no canto superior) ou no ícone de instalação na barra de endereços.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>
                      Selecione <strong>Instalar aplicativo</strong> (não apenas atalho) e confirme em <strong>Instalar</strong>.
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Nota: Caso você já tenha criado um atalho antigo antes desta atualização, remova o atalho antigo da tela inicial e recarregue a página para o Android gerar o instalador completo.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
