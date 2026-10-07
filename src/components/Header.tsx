import React from 'react';
import { Coins, Moon, Sun, Award, Zap } from 'lucide-react';
import { HooshyarLogo } from './HooshyarLogo';
import { ThemeMode, UserProfile } from '../types';
import { triggerTelegramHaptic } from '../utils/storage';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  user: UserProfile | null;
  activeTab: 'missions' | 'consensus' | 'leaderboard' | 'profile';
  onSelectTab: (tab: 'missions' | 'consensus' | 'leaderboard' | 'profile') => void;
  onOpenNewNomination: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  user,
  activeTab,
  onSelectTab,
  onOpenNewNomination
}) => {
  return (
    <header
      className={`sticky top-0 z-30 w-full backdrop-blur-md transition-colors border-b ${
        theme === 'dark'
          ? 'bg-[#0B132B]/90 border-slate-700/80 text-slate-100'
          : 'bg-[#F8F9FA]/90 border-slate-200/90 text-[#0F2042]'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Zone 1: Brand Wordmark / Logo */}
        <div
          onClick={() => onSelectTab('missions')}
          className="cursor-pointer select-none flex items-center"
          role="button"
          tabIndex={0}
        >
          <HooshyarLogo variant="compact" size="sm" theme={theme} />
        </div>

        {/* Zone 2: Stage & Combo info */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span
              className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                theme === 'dark'
                  ? 'bg-slate-800/80 text-slate-300 border border-slate-700'
                  : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>سطح {user.stage} از ۳</span>
            </span>

            {user.comboMultiplier > 1 && (
              <span className="px-2 py-0.5 rounded-full font-bold bg-[#FF6F59]/20 text-[#FF6F59] border border-[#FF6F59]/30 flex items-center gap-1 animate-pulse">
                <Zap className="w-3 h-3 fill-current" />
                <span>ضریب {user.comboMultiplier}×</span>
              </span>
            )}
          </div>
        )}

        {/* Zone 3: Actions (Coins Counter, Fast Nominate, Theme Switcher) */}
        <div className="flex items-center gap-2">
          {user && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold shadow-xs tabular-nums ${
                theme === 'dark'
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
              title="موجودی سکه‌های طلا"
            >
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400/30" />
              <span>{user.coins.toLocaleString('fa-IR')}</span>
              <span className="text-[10px] font-normal opacity-80">سکه</span>
            </div>
          )}

          {/* Quick Nomination CTA */}
          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              onOpenNewNomination();
            }}
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FF6F59] hover:bg-[#ff573d] text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>+ معرفی استعداد</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              onToggleTheme();
            }}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
            aria-label="تغییر حالت تم"
            title={theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
