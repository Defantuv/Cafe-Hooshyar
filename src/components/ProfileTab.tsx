import React from 'react';
import {
  User,
  GraduationCap,
  Award,
  Sparkles,
  Coins,
  ShieldCheck,
  Zap,
  UserPlus,
  FileText,
  CheckCircle2,
  Lock,
  Compass,
  Palette,
  Briefcase,
  Flame,
  Activity
} from 'lucide-react';
import {
  BadgeItem,
  MissionProgress,
  Nomination,
  ThemeMode,
  UserProfile
} from '../types';
import { triggerTelegramHaptic } from '../utils/storage';

interface ProfileTabProps {
  theme: ThemeMode;
  user: UserProfile;
  missionsProgress: Record<number, MissionProgress>;
  nominations: Nomination[];
  onOpenNewNomination: () => void;
  onOpenDossier: () => void;
  webhookLogs: any[];
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  theme,
  user,
  missionsProgress,
  nominations,
  onOpenNewNomination,
  onOpenDossier,
  webhookLogs
}) => {
  const cardBg = theme === 'dark' ? 'bg-[#162238] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-[#0F2042] shadow-sm';

  // Check stage completion
  const isStage1Complete = [1, 2, 3].every((id) => missionsProgress[id]?.status === 'completed');
  const isStage2Complete = [4, 5, 6, 7].every((id) => missionsProgress[id]?.status === 'completed');
  const isStage3Complete = [8, 9, 10].every((id) => missionsProgress[id]?.status === 'completed');

  // Define 6 badges
  const badges: BadgeItem[] = [
    {
      id: 'community_explorer',
      title: 'کاوشگر کامیونیتی',
      description: 'ورود و معرفی حداقل ۲ استعداد در تالار',
      iconName: 'Compass',
      unlocked: user.totalNominated >= 2
    },
    {
      id: 'identity_scout',
      title: 'کاوشگر هویت',
      description: 'اتمام مأموریت‌های سطح ۱ و کشف دارایی اصلی',
      iconName: 'Award',
      unlocked: isStage1Complete
    },
    {
      id: 'digital_creator',
      title: 'خالق دیجیتال',
      description: 'اتمام مأموریت‌های سطح ۲، ساخت بایو و پیچ ۳۰ ثانیه‌ای',
      iconName: 'Palette',
      unlocked: isStage2Complete
    },
    {
      id: 'impact_brand',
      title: 'برند اثرگذار',
      description: 'اتمام مأموریت‌های سطح ۳ و صدور پرونده نهایی',
      iconName: 'Briefcase',
      unlocked: isStage3Complete
    },
    {
      id: 'academy_scholar',
      title: 'دانش‌پژوه آکادمی',
      description: 'حضور در وبینارهای مهارتی آکادمی هوش‌یار',
      iconName: 'GraduationCap',
      unlocked: user.isAcademyParticipant
    },
    {
      id: 'community_trustee',
      title: 'امین جامعه',
      description: 'ثبت بیش از ۲۰ داوری منصفانه در تالار همتایان',
      iconName: 'ShieldCheck',
      unlocked: user.totalVotesCast >= 20
    }
  ];

  // Mirror Endorsements for current user
  const myEndorsements = nominations.filter((n) => n.claimedByUserId === String(user.telegramId));

  const renderBadgeIcon = (name: string, unlocked: boolean) => {
    const cls = `w-6 h-6 ${unlocked ? 'text-amber-400' : 'text-slate-500'}`;
    switch (name) {
      case 'Compass':
        return <Compass className={cls} />;
      case 'Award':
        return <Award className={cls} />;
      case 'Palette':
        return <Palette className={cls} />;
      case 'Briefcase':
        return <Briefcase className={cls} />;
      case 'GraduationCap':
        return <GraduationCap className={cls} />;
      case 'ShieldCheck':
        return <ShieldCheck className={cls} />;
      default:
        return <Sparkles className={cls} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16 text-right">
      {/* 1. Digital Identity Card */}
      <div className={`p-6 rounded-2xl border transition-all ${cardBg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#FF6F59] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {user.firstName[0]}
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <span>{user.firstName} {user.lastName}</span>
                {user.fatherName && (
                  <span className="text-xs font-normal text-slate-400">
                    (فرزند: {user.fatherName})
                  </span>
                )}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                <span>{user.city}</span>
                <span>·</span>
                <span>{user.ageGroup}</span>
                <span>·</span>
                <span className="text-amber-400 font-bold">سطح {user.stage} از ۳</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 text-xs sm:text-sm font-black tabular-nums">
              <Coins className="w-4 h-4" />
              <span>{user.coins.toLocaleString('fa-IR')} سکه طلا</span>
            </div>

            {user.isAcademyParticipant && (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>دانش‌پژوه آکادمی هوش‌یار</span>
              </span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-700/60 text-center">
          <div className="p-2 rounded-xl bg-slate-900/30">
            <span className="block text-[11px] text-slate-400">ضریب کمبو</span>
            <span className="text-xs sm:text-sm font-bold text-[#FF6F59]">{user.comboMultiplier}×</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/30">
            <span className="block text-[11px] text-slate-400">آرای داوری ثبت‌شده</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">{user.totalVotesCast} رأی</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/30">
            <span className="block text-[11px] text-slate-400">استعدادهای معرفی‌شده</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">{user.totalNominated} نفر</span>
          </div>
        </div>
      </div>

      {/* 2. تصویر من در نگاه جامعه (آینه من) */}
      <div className={`p-5 rounded-2xl border transition-all ${cardBg}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6F59]" />
            <h4 className="font-bold text-sm sm:text-base">
              تصویر من در نگاه جامعه (آینه من)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            بازخوردهای دریافتی از داوری همتایان
          </span>
        </div>

        {myEndorsements.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 text-center text-xs text-slate-400 leading-relaxed">
            هنوز تایید همتایی برای شما به ثبت نرسیده است. با اشتراک‌گذاری مینی‌اپ و دعوت از هم‌دانشگاهی‌ها، آینه شایستگی‌های خود را مشاهده کنید.
          </div>
        ) : (
          <div className="space-y-2">
            {myEndorsements.map((end) => (
              <div
                key={end.id}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {end.promoteCount} نفر شما را به عنوان «{end.categoryTitle}» تایید کرده‌اند.
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  +{end.promoteCount * 5} سکه
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. گذرنامه نشان‌ها (Badges Grid) */}
      <div className={`p-5 rounded-2xl border transition-all ${cardBg}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm sm:text-base">
              گذرنامه نشان‌های جشنواره (Badges)
            </h4>
          </div>
          <span className="text-xs font-bold text-amber-400 tabular-nums">
            {badges.filter((b) => b.unlocked).length} از {badges.length} فعال
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                badge.unlocked
                  ? theme === 'dark'
                    ? 'bg-amber-400/10 border-amber-400/30 text-slate-100'
                    : 'bg-amber-50 border-amber-200 text-slate-900'
                  : theme === 'dark'
                  ? 'bg-slate-900/30 border-slate-800 text-slate-500 opacity-60'
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2">
                {renderBadgeIcon(badge.iconName, badge.unlocked)}
              </div>
              <h5 className="font-bold text-xs mb-1">
                {badge.title}
              </h5>
              <p className="text-[10px] leading-tight opacity-80">
                {badge.description}
              </p>
              <span className="mt-2 text-[10px] font-semibold">
                {badge.unlocked ? '✓ آزاد شد' : '🔒 قفل'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action Buttons: Dossier & Nominate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => {
            triggerTelegramHaptic('light');
            onOpenDossier();
          }}
          className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#2A7BE4] hover:bg-blue-600 text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>پیش‌نمایش و صدور پرونده رسمی داوری</span>
        </button>

        <button
          onClick={() => {
            triggerTelegramHaptic('light');
            onOpenNewNomination();
          }}
          className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#FF6F59] hover:bg-[#ff573d] text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>معرفی استعداد جدید در ۲۲ دسته</span>
        </button>
      </div>

      {/* 5. Webhook Logs Audit (Footer Info) */}
      {webhookLogs.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 mb-1">
            لاگ‌های ثبتی وب‌هوک دبیرخانه ({webhookLogs.length} رویداد):
          </div>
          <div className="max-h-24 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1">
            {webhookLogs.slice(-3).map((log, i) => (
              <div key={i}>
                • {log.event} [{log.timestamp?.slice(11, 19)}]: {log.data?.nominee_name} ({log.data?.category_title})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
