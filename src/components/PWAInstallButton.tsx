import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'card' | 'auth';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isIOS, canShowInstallUI, install, markAsInstalled } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Completely hide button when app is installed or when native install prompt is not available
  if (!canShowInstallUI) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
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
                    Instalar no iPhone / iPad
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

            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <p className="text-slate-400">
                No Safari do iOS, adicione o aplicativo em tela cheia em 2 passos:
              </p>
              <div className="p-3.5 rounded-xl bg-[#080c14] border border-white/[0.06] flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Toque no botão <strong>Compartilhar</strong> na barra do Safari.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  markAsInstalled();
                  setShowGuideModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#080c14] hover:bg-slate-800 border border-white/[0.08] text-slate-300 text-xs font-semibold transition-colors"
              >
                Já instalei (ocultar botão)
              </button>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
