import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  UserPlus,
  Coins,
  ShieldAlert,
  Unlock,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  Category,
  CATEGORIES,
  Nomination,
  ThemeMode,
  UserProfile
} from '../types';
import {
  celebrateConfetti,
  triggerTelegramHaptic
} from '../utils/storage';

interface ConsensusTabProps {
  theme: ThemeMode;
  user: UserProfile;
  missionsCompletedStage1: boolean;
  devBypassConsensusGate: boolean;
  onToggleDevBypass: () => void;
  nominations: Nomination[];
  onVote: (nomineeId: string, voteType: 'promote' | 'demote' | 'skip') => void;
  onOpenNewNomination: () => void;
  onTriggerSuspension: (minutes: number) => void;
}

export const ConsensusTab: React.FC<ConsensusTabProps> = ({
  theme,
  user,
  missionsCompletedStage1,
  devBypassConsensusGate,
  onToggleDevBypass,
  nominations,
  onVote,
  onOpenNewNomination,
  onTriggerSuspension
}) => {
  // Current index in the consensus queue
  const [currentIndex, setCurrentIndex] = useState(0);

  // Anti-spam click tracker: store timestamps of recent votes
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);

  // Suspension countdown state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const isSuspended = user.suspensionUntil ? Date.now() < user.suspensionUntil : false;

  useEffect(() => {
    if (user.suspensionUntil) {
      const interval = setInterval(() => {
        const diff = Math.max(0, Math.floor((user.suspensionUntil! - Date.now()) / 1000));
        setRemainingSeconds(diff);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user.suspensionUntil]);

  // Access check: locked until Mission 3 completed unless bypassed
  const isUnlocked = missionsCompletedStage1 || devBypassConsensusGate;

  // Filter out nominees user has already voted on, or show available ones
  // We can show nominees
  const currentNominee = nominations.length > 0 ? nominations[currentIndex % nominations.length] : null;

  const handleCastVote = (voteType: 'promote' | 'demote' | 'skip') => {
    if (!currentNominee || isSuspended) return;

    const now = Date.now();
    const updatedClicks = [...clickTimestamps.filter((t) => now - t < 3000), now];
    setClickTimestamps(updatedClicks);

    // Anti-spam trigger: 4 rapid clicks in under 3 seconds triggers 15 min suspension
    if (updatedClicks.length >= 4) {
      triggerTelegramHaptic('error');
      onTriggerSuspension(15);
      return;
    }

    triggerTelegramHaptic(voteType === 'promote' ? 'success' : 'medium');
    onVote(currentNominee.id, voteType);
    setCurrentIndex((prev) => prev + 1);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cardBg = theme === 'dark' ? 'bg-[#162238] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-[#0F2042] shadow-sm';

  // 1. If Suspended
  if (isSuspended) {
    return (
      <div className="py-8 px-4 max-w-lg mx-auto text-center">
        <div className={`p-6 sm:p-8 rounded-2xl border ${
          theme === 'dark' ? 'bg-red-950/20 border-red-500/40 text-red-200' : 'bg-red-50 border-red-300 text-red-900'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black mb-2">
            قفل تعلیق موقت تقلب (Anti-Spam Cooldown)
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed mb-6 opacity-90">
            به دلیل ثبت کلیک‌های پی‌درپی و غیرعادی، دسترسی شما به تالار داوری موقتاً مسدود شده است. لطفاً پس از پایان زمان تعلیق مجدداً مراجعه نمایید.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/30 text-red-100 font-mono text-2xl font-bold mb-6 tabular-nums">
            <Clock className="w-5 h-5 text-red-300" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          <div>
            <button
              onClick={() => onTriggerSuspension(0)}
              className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              [حالت تست: بازنشانی فوری تایمر تعلیق]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. If Locked by Stage 1 gate
  if (!isUnlocked) {
    return (
      <div className="py-8 px-4 max-w-lg mx-auto text-center">
        <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg}`}>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <Award className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold mb-2">
            تالار شناخت و داوری همتایان در انتظار شماست
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            جهت حفظ کیفیت ارزیابی‌ها، تالار داوری پس از اتمام <strong>مأموریت‌های سطح ۱ (خودشناسی و هویت)</strong> فعال می‌گردد.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/60 text-xs text-slate-300 mb-6 flex items-center gap-2 text-right">
            <Info className="w-4 h-4 text-[#2A7BE4] shrink-0" />
            <span>
              برای باز شدن قفل، مأموریت‌های ۱، ۲ و ۳ را در تب «مأموریت‌ها» تکمیل نمایید.
            </span>
          </div>

          {/* Dev Test Bypass Toggle */}
          <button
            onClick={() => {
              triggerTelegramHaptic('success');
              onToggleDevBypass();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>حالت تست: باز کردن قفل داوری</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. If No Nominees exist yet (No dummy data rule!)
  if (!currentNominee) {
    return (
      <div className="py-8 px-4 max-w-lg mx-auto text-center">
        <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg}`}>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center mb-4">
            <UserPlus className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black mb-2">
            صف ارزیابی در انتظار اولین کاندیداها
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            هنوز کاندیدایی برای ارزیابی در صف وجود ندارد. شما می‌توانید اولین استعدادهای شایسته‌ای را که می‌شناسید معرفی کنید تا وارد تالار داوری همتایان شوند.
          </p>

          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              onOpenNewNomination();
            }}
            className="w-full py-3 rounded-xl font-bold text-sm bg-[#FF6F59] hover:bg-[#ff573d] text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>معرفی استعداد شایسته جدید (+۱۵ سکه)</span>
          </button>
        </div>
      </div>
    );
  }

  // Find category details for current nominee
  const nomineeCategory = CATEGORIES.find((c) => c.slug === currentNominee.categorySlug) || {
    id: 0,
    slug: currentNominee.categorySlug,
    title: currentNominee.categoryTitle,
    desc: '',
    type: 'skill' as const,
    iconName: 'Sparkles'
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-12">
      {/* Top Controls: Status, Combo Multiplier, Dev test */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${cardBg}`}>
        <div className="flex items-center gap-2 text-right">
          <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>موتور ضریب کمبو:</span>
              <span className="text-[#FF6F59] tabular-nums font-black">{user.comboMultiplier}×</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {user.consecutiveVotes === 0
                ? '۱ رأی تا ضریب ۱.۲۵×'
                : user.consecutiveVotes === 1
                ? '۱ رأی تا ضریب ۱.۵× و جایزه +۵ سکه'
                : 'ضریب حداکثری فعال است!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerTelegramHaptic('light');
              onOpenNewNomination();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6F59]/20 hover:bg-[#FF6F59]/30 text-[#FF6F59] border border-[#FF6F59]/40 cursor-pointer flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">معرفی کاندیدای دیگر</span>
          </button>
        </div>
      </div>

      {/* Main Peer Consensus Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border text-center transition-all relative overflow-hidden ${cardBg}`}>
        {/* Category tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2A7BE4]/15 text-[#2A7BE4] border border-[#2A7BE4]/30 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{nomineeCategory.type === 'skill' ? 'مهارت تخصصی' : 'امضای رفتاری و اخلاقی'}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black mb-2 text-right sm:text-center leading-snug">
          آیا <span className="text-[#FF6F59]">{currentNominee.fullName}</span>
          {currentNominee.fatherName ? ` (فرزند: ${currentNominee.fatherName})` : ''} را برای شایستگی{' '}
          <span className="text-amber-400">«{currentNominee.categoryTitle}»</span> تایید می‌کنید؟
        </h3>

        <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto text-right sm:text-center leading-relaxed">
          {nomineeCategory.desc || 'با ثبت نظر منصفانه خود، به شکل‌گیری تصویر واقعی شایستگی‌ها در جامعه دانشگاهی کمک فرمایید.'}
        </p>

        {/* Voting Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Promote */}
          <button
            onClick={() => handleCastVote('promote')}
            className="py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>کاملاً درسته 👍</span>
          </button>

          {/* Skip */}
          <button
            onClick={() => handleCastVote('skip')}
            className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all border active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>اطلاع ندارم 🔄</span>
          </button>

          {/* Demote */}
          <button
            onClick={() => handleCastVote('demote')}
            className="py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-rose-600/90 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>فکر نکنم 👎</span>
          </button>
        </div>

        {/* Reward footnote */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>
              پاداش داور: ۳ سکه × ضریب کمبو ({Math.round(3 * user.comboMultiplier)} سکه)
            </span>
          </div>

          <div className="text-[11px] opacity-80">
            کاندیدا شماره {currentIndex + 1} از {nominations.length}
          </div>
        </div>
      </div>

      {/* Passive Income Info Box */}
      <div className={`p-4 rounded-2xl border text-right text-xs leading-relaxed ${
        theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>جریان درآمد انفعالی (Passive Income) چیست؟</span>
        </p>
        <p>
          هر زمان کاربری که توسط شما معرفی شده، توسط سایر دانشجویان رأی مثبت (Promote) دریافت کند، سیستم به صورت خودکار <strong>۳ سکه طلا</strong> به حساب شما به عنوان معرف واریز می‌نماید!
        </p>
      </div>
    </div>
  );
};
