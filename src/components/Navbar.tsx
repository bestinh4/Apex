import React, { useState } from 'react';
import { useBankroll } from '../context/BankrollContext';

export type TabKey = 'dashboard' | 'livro-razao' | 'analise-estatistica' | 'fluxo-de-caixa' | 'giros-gratis-promocoes' | 'ajustes';

interface NavbarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenNewBetModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewBetModal
}) => {
  const { currentEquity } = useBankroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(val);
  };

  const navItems: { key: TabKey; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'livro-razao', label: 'Livro-Razão', icon: 'table_rows' },
    { key: 'analise-estatistica', label: 'Estatísticas', icon: 'monitoring' },
    { key: 'fluxo-de-caixa', label: 'Fluxo de Caixa', icon: 'account_balance' },
    { key: 'giros-gratis-promocoes', label: 'Apostas Grátis', icon: 'redeem' },
    { key: 'ajustes', label: 'Ajustes', icon: 'settings' }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#090d16]/85 backdrop-blur-xl border-b border-white/[0.06] transition-all">
      <div className="h-16 w-full max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-[1.5px] shadow-sm shadow-blue-500/10 shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WoZ2OonAZtgfbpjmyqDMC7BwP47wp2q4JhTlWIwcDw3qYB4YkaPjOWU977gMq1EItDzj8mCvCVt9B5eySB_SUTup3fEOtEbXe_lgs3UvFeb0pLAIQOLLsVhvL_WBJgCcS7EjBoTT68czBA0UmmbDRlB0lDq3W1LEi3o4LY-1ud7gw6fuwPl20gPGIsVyo1iIGZWFgzU3EFf40Wrt74w8hNIQjBbkuJWtee9Phs5lAadnmJAHD6EehcIA"
                  alt="Apex"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                Apex Bankroll
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Terminal Pro
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Tabs - Modern Segmented Control */}
        <nav className="hidden lg:flex items-center bg-[#0d1322] p-1 rounded-xl border border-white/[0.06]">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Bankroll + Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Live Bankroll Balance Card */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d1322] border border-white/[0.06]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Banca Atual
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 tracking-tight tabular-nums">
                {formatBRL(currentEquity)}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onOpenNewBetModal}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] font-bold">add</span>
            <span className="hidden sm:inline">Nova Aposta</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#0d1322] border border-white/[0.06] text-slate-400 hover:text-white"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#090d16]/98 backdrop-blur-2xl p-4 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelectTab(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 text-xs font-medium rounded-xl text-left flex items-center gap-2.5 transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
