import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  Coins,
  ThumbsUp,
  User,
  Users
} from 'lucide-react';
import {
  AgeGroup,
  Nomination,
  ThemeMode,
  UserProfile
} from '../types';
import { triggerTelegramHaptic } from '../utils/storage';

interface LeaderboardTabProps {
  theme: ThemeMode;
  user: UserProfile;
  nominations: Nomination[];
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  theme,
  user,
  nominations
}) => {
  const [boardType, setBoardType] = useState<'endorsement' | 'coins'>('endorsement');
  const [ageFilter, setAgeFilter] = useState<'all' | AgeGroup>('all');

  const cardBg = theme === 'dark' ? 'bg-[#162238] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-[#0F2042] shadow-sm';

  // Build real entries from registered user and real nominees entered
  // (No fake dummy names generated!)

  // 1. Peer Endorsement board: Real nominees sorted by promoteCount
  const endorsementEntries = nominations
    .filter((n) => n.promoteCount > 0)
    .sort((a, b) => b.promoteCount - a.promoteCount)
    .map((nom, idx) => ({
      id: nom.id,
      rank: idx + 1,
      name: nom.fullName,
      subtitle: nom.categoryTitle,
      score: nom.promoteCount,
      isCurrentUser: nom.claimedByUserId === String(user.telegramId)
    }));

  // 2. Activity & Coins board: Current user and claimed profiles
  const coinsEntries = [
    {
      id: `user_${user.telegramId}`,
      rank: 1,
      name: `${user.firstName} ${user.lastName}`,
      subtitle: `${user.city} · ${user.ageGroup}`,
      score: user.coins,
      isCurrentUser: true
    }
  ];

  const currentList = boardType === 'endorsement' ? endorsementEntries : coinsEntries;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* Permanent Closing Ceremony Banner with Shamseh Motif */}
      <div className={`p-4 sm:p-5 rounded-2xl border text-right relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-l from-amber-950/40 via-[#162238] to-[#162238] border-amber-500/40 text-amber-200'
          : 'bg-gradient-to-l from-amber-50 via-white to-white border-amber-300 text-amber-900 shadow-sm'
      }`}>
        {/* Subtle Decorative Shamseh Star SVG */}
        <div className="absolute left-[-15px] top-[-15px] opacity-15 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,0 63,25 90,10 75,37 100,50 75,63 90,90 63,75 50,100 37,75 10,90 25,63 0,50 25,37 10,10 37,25" />
          </svg>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-amber-300">
              اعلان جایزه اختتامیه هفتمین دوره جشنواره بار دانش
            </h4>
            <p className="text-xs leading-relaxed mt-1 opacity-90">
              «به ۱۰ نفر برتر هر دو تابلوی لیدربرد، در مراسم اختتامیه جشنواره در مشهد (۱۹ و ۲۰ آذرماه)، لوح تقدیر رسمی و تندیس بلورین جشنواره بار دانش با امضای دبیرکل اعطا خواهد شد.»
            </p>
          </div>
        </div>
      </div>

      {/* Dual Tab Switcher */}
      <div className={`p-1.5 rounded-2xl border flex items-center gap-1.5 ${cardBg}`}>
        <button
          onClick={() => {
            triggerTelegramHaptic('light');
            setBoardType('endorsement');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            boardType === 'endorsement'
              ? 'bg-[#FF6F59] text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>۱. اعتبار همتایان (Peer Endorsement)</span>
        </button>

        <button
          onClick={() => {
            triggerTelegramHaptic('light');
            setBoardType('coins');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            boardType === 'coins'
              ? 'bg-[#FF6F59] text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>۲. فعالیت و سکه‌ها (Coins Top 10)</span>
        </button>
      </div>

      {/* Filter by Age Group */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-slate-400 font-medium">فیلتر رده:</span>
        <div className="flex items-center gap-1">
          {(['all', 'دانش‌آموزی', 'دانشجویی', 'حرفه‌ای‌ها'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                triggerTelegramHaptic('light');
                setAgeFilter(filter);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                ageFilter === filter
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'all' ? 'همه رده‌ها' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table / List */}
      <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
        {currentList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-bold text-sm text-slate-300 mb-1">
              هنوز تاییداتی در این جدول ثبت نشده است
            </p>
            <p>
              با رأی دادن در «تالار داوری» و معرفی افراد شایسته، لیدربرد فعال می‌گردد.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/40">
            {currentList.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 text-right transition-colors ${
                  item.isCurrentUser
                    ? theme === 'dark'
                      ? 'bg-amber-400/10'
                      : 'bg-amber-50'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      item.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : item.rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.rank}
                  </div>

                  <div>
                    <h5 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FF6F59] text-white">
                          شما
                        </span>
                      )}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black tabular-nums">
                  {boardType === 'endorsement' ? (
                    <>
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.score} تایید مثبت</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.score.toLocaleString('fa-IR')} سکه</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pinned Bottom User Standing */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between text-right ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-[#FF6F59]/50 shadow-lg text-slate-100'
          : 'bg-white border-[#FF6F59]/50 shadow-md text-[#0F2042]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF6F59] text-white flex items-center justify-center font-bold text-xs">
            رتبه ۱
          </div>
          <div>
            <div className="text-xs font-bold">
              وضعیت شما در لیدربرد: {user.firstName} {user.lastName}
            </div>
            <div className="text-[11px] text-slate-400">
              سطح {user.stage} · {user.ageGroup} · موجودی: {user.coins} سکه
            </div>
          </div>
        </div>

        <div className="text-xs font-black text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>صدرنشین</span>
        </div>
      </div>
    </div>
  );
};
