import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  UserCheck,
  ArrowLeft,
  GraduationCap,
  Plus,
  Coins
} from 'lucide-react';
import { HooshyarLogo } from './HooshyarLogo';
import {
  AgeGroup,
  Category,
  CATEGORIES,
  Nomination,
  ThemeMode,
  UserProfile
} from '../types';
import {
  containsEnglishLetters,
  getTelegramUser,
  triggerTelegramHaptic,
  celebrateConfetti,
  dispatchNominationWebhook
} from '../utils/storage';

interface OnboardingFlowProps {
  theme: ThemeMode;
  step: 1 | 2 | 3;
  onSetStep: (step: 1 | 2 | 3) => void;
  existingNominations: Nomination[];
  onCompleteOnboarding: (user: UserProfile, initialNominations: Nomination[], webhookLogs: any[]) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  theme,
  step,
  onSetStep,
  existingNominations,
  onCompleteOnboarding
}) => {
  // Screen 1: Identity fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [city, setCity] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('دانشجویی');
  const [isAcademyParticipant, setIsAcademyParticipant] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [tgId, setTgId] = useState<string | number>(Date.now());
  const [persianError, setPersianError] = useState<string | null>(null);

  // Claim Profile detection
  const [matchedNominee, setMatchedNominee] = useState<Nomination | null>(null);
  const [isClaimConfirmed, setIsClaimConfirmed] = useState(false);

  // Screen 3: Nomination Hall state
  // Display 10 categories at a time from the 22 categories
  const [categoryPageOffset, setCategoryPageOffset] = useState(0);
  const [nominationsInput, setNominationsInput] = useState<
    Record<number, { fullName: string; fatherName: string }>
  >({});
  const [nominationError, setNominationError] = useState<string | null>(null);

  // Pre-fill from Telegram WebApp
  useEffect(() => {
    const tgUser = getTelegramUser();
    if (tgUser) {
      if (tgUser.id) setTgId(tgUser.id);
      if (tgUser.photo_url) setPhotoUrl(tgUser.photo_url);
      if (tgUser.first_name && !containsEnglishLetters(tgUser.first_name)) {
        setFirstName(tgUser.first_name);
      }
      if (tgUser.last_name && !containsEnglishLetters(tgUser.last_name)) {
        setLastName(tgUser.last_name);
      }
    }
  }, []);

  // Check for Claim Profile match when user types first and last name
  useEffect(() => {
    if (firstName.trim().length >= 2 && lastName.trim().length >= 2) {
      const fullTarget = `${firstName.trim()} ${lastName.trim()}`.toLowerCase();
      const match = existingNominations.find(
        (n) => n.fullName.trim().toLowerCase() === fullTarget && !n.claimedByUserId
      );
      if (match) {
        setMatchedNominee(match);
      } else {
        setMatchedNominee(null);
      }
    } else {
      setMatchedNominee(null);
    }
  }, [firstName, lastName, existingNominations]);

  // Screen 1: Validate and submit
  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPersianError(null);

    // Validation checks
    if (!firstName.trim() || !lastName.trim() || !city.trim()) {
      setPersianError('لطفاً تمام فیلدهای ستاره‌دار را تکمیل نمایید.');
      triggerTelegramHaptic('warning');
      return;
    }

    // Persian Lock rule
    if (
      containsEnglishLetters(firstName) ||
      containsEnglishLetters(lastName) ||
      containsEnglishLetters(fatherName) ||
      containsEnglishLetters(city)
    ) {
      setPersianError('قفل رسم‌الخط فارسی: استفاده از حروف انگلیسی مجاز نیست. لطفاً با رسم‌الخط فارسی وارد کنید.');
      triggerTelegramHaptic('error');
      return;
    }

    triggerTelegramHaptic('success');
    onSetStep(2); // Go to Privacy Shield
  };

  // Screen 3: Rotate 10 categories
  const displayedCategories: Category[] = [];
  for (let i = 0; i < 10; i++) {
    const idx = (categoryPageOffset + i) % CATEGORIES.length;
    displayedCategories.push(CATEGORIES[idx]);
  }

  const handleRotateCategories = () => {
    triggerTelegramHaptic('light');
    setCategoryPageOffset((prev) => (prev + 10) % CATEGORIES.length);
  };

  const handleNomineeChange = (categoryId: number, field: 'fullName' | 'fatherName', value: string) => {
    if (containsEnglishLetters(value)) {
      setNominationError('قفل رسم‌الخط فارسی: نام کاندید باید به فارسی وارد شود.');
      return;
    }
    setNominationError(null);
    setNominationsInput((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || { fullName: '', fatherName: '' }),
        [field]: value
      }
    }));
  };

  // Screen 3: Complete onboarding
  const handleFinalizeOnboarding = () => {
    // Collect all entered valid nominations
    const validNominees: Array<{ category: Category; fullName: string; fatherName: string }> = [];

    Object.entries(nominationsInput).forEach(([catIdStr, val]) => {
      const catId = Number(catIdStr);
      if (val.fullName && val.fullName.trim().length >= 3) {
        const cat = CATEGORIES.find((c) => c.id === catId);
        if (cat) {
          validNominees.push({
            category: cat,
            fullName: val.fullName.trim(),
            fatherName: val.fatherName ? val.fatherName.trim() : ''
          });
        }
      }
    });

    // Requirement: introduce at least 2 people in 2 different categories
    if (validNominees.length < 2) {
      setNominationError('معرفی حداقل ۲ نفر در دو دسته مختلف برای ورود به کافه هوش‌یار الزامی است.');
      triggerTelegramHaptic('warning');
      return;
    }

    // Calculate initial coins
    let baseCoins = 20; // Welcome entry bonus
    if (isClaimConfirmed && matchedNominee) {
      // 5 coins per previous promote
      const claimedBonus = Math.max(matchedNominee.promoteCount, 1) * 5;
      baseCoins += claimedBonus;
    }

    // Extra nominations bonus: +15 coins for each beyond 2
    const extraCount = Math.max(0, validNominees.length - 2);
    const extraBonus = extraCount * 15;
    const finalCoins = baseCoins + extraBonus;

    const userProfile: UserProfile = {
      telegramId: tgId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fatherName: fatherName.trim() || undefined,
      city: city.trim(),
      ageGroup,
      isAcademyParticipant,
      photoUrl,
      coins: finalCoins,
      stage: 1,
      comboMultiplier: 1.0,
      consecutiveVotes: 0,
      suspensionUntil: null,
      totalVotesCast: 0,
      totalNominated: validNominees.length
    };

    // Format nominations
    const newNominations: Nomination[] = [];
    const webhookLogs: any[] = [];

    validNominees.forEach((item) => {
      const newNom: Nomination = {
        id: `nom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fullName: item.fullName,
        fatherName: item.fatherName || undefined,
        categorySlug: item.category.slug,
        categoryTitle: item.category.title,
        referrerUserId: String(tgId),
        referrerName: `${firstName.trim()} ${lastName.trim()}`,
        promoteCount: 0,
        demoteCount: 0,
        skipCount: 0,
        createdAt: new Date().toISOString(),
        earnedCoins: 0
      };
      newNominations.push(newNom);

      // Dispatch Webhook event
      const log = dispatchNominationWebhook(newNom, tgId);
      webhookLogs.push(log);
    });

    celebrateConfetti();
    triggerTelegramHaptic('success');
    onCompleteOnboarding(userProfile, newNominations, webhookLogs);
  };

  const cardBg = theme === 'dark' ? 'bg-[#162238] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-[#0F2042] shadow-sm';
  const inputBg = theme === 'dark' ? 'bg-slate-900/80 border-slate-700 text-slate-100 focus:border-[#FF6F59]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF6F59]';

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl mx-auto">
        {/* Logo and Subtitle Header */}
        <div className="mb-6 flex flex-col items-center">
          <HooshyarLogo variant="full" size="lg" theme={theme} />
          <p className="mt-2 text-xs text-center text-slate-400">
            هفتمین دوره جشنواره سراسری دانشجویی بار دانش | من پلاس (+M)
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
            <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-[#FF6F59] text-white' : 'bg-slate-700 text-slate-400'}`}>
              ۱. هویت و ورود
            </span>
            <span className="text-slate-500">←</span>
            <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-[#FF6F59] text-white' : 'bg-slate-700 text-slate-400'}`}>
              ۲. سوگندنامه امنیت
            </span>
            <span className="text-slate-500">←</span>
            <span className={`px-2.5 py-1 rounded-full ${step === 3 ? 'bg-[#FF6F59] text-white' : 'bg-slate-700 text-slate-400'}`}>
              ۳. معرفی استعدادها
            </span>
          </div>
        </div>

        {/* ================= STEP 1: Fast Identity & Claim Profile ================= */}
        {step === 1 && (
          <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${cardBg}`}>
            <div className="mb-5 text-right">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6F59]" />
                <span>ثبت مشخصات و ورود به بازی ۶۰ روزه</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                اطلاعات شما با استاندارد رسم‌الخط فارسی و اتصال خودکار تلگرام ثبت می‌گردد.
              </p>
            </div>

            {persianError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{persianError}</span>
              </div>
            )}

            {/* Smart Claim Profile Banner if matched nominee is found in previous storage */}
            {matchedNominee && (
              <div className="mb-5 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs">
                <div className="flex items-start gap-2.5">
                  <UserCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-amber-200">
                      پروفایل از پیش کاندیدشده پیدا شد!
                    </p>
                    <p className="mt-1 leading-relaxed">
                      کاربری با نام <strong className="text-white">{matchedNominee.fullName}</strong>
                      {matchedNominee.fatherName ? ` (فرزند ${matchedNominee.fatherName})` : ''} در دسته «{matchedNominee.categoryTitle}» توسط همتایان کاندید شده و {matchedNominee.promoteCount} تایید مثبت دارد.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsClaimConfirmed(true);
                          triggerTelegramHaptic('success');
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                          isClaimConfirmed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                        }`}
                      >
                        {isClaimConfirmed ? '✓ تایید شد (+۵ سکه به ازای هر تایید)' : 'بله، این من هستم (Claim Profile)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchedNominee(null)}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        خیر، شخص دیگری هستم
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleIdentitySubmit} className="space-y-4 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    نام <span className="text-[#FF6F59]">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: محمد"
                    className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-all ${inputBg}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    نام خانوادگی <span className="text-[#FF6F59]">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: رضایی"
                    className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-all ${inputBg}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    نام پدر <span className="text-slate-500 text-[11px]">(اختیاری - جهت تفکیک)</span>
                  </label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="مثال: حسین"
                    className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-all ${inputBg}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-300">
                    شهر سکونت / دانشگاه <span className="text-[#FF6F59]">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: مشهد / تهران"
                    className={`w-full px-3 py-2 rounded-xl text-sm border outline-none transition-all ${inputBg}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-300">
                  رده سنی و تحصیلی <span className="text-[#FF6F59]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['دانش‌آموزی', 'دانشجویی', 'حرفه‌ای‌ها'] as AgeGroup[]).map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => {
                        triggerTelegramHaptic('light');
                        setAgeGroup(group);
                      }}
                      className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        ageGroup === group
                          ? 'bg-[#FF6F59] text-white border-[#FF6F59] shadow-xs'
                          : theme === 'dark'
                          ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Academy Webinar Checkbox */}
              <div
                onClick={() => {
                  triggerTelegramHaptic('light');
                  setIsAcademyParticipant(!isAcademyParticipant);
                }}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all ${
                  isAcademyParticipant
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                    : theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700/60 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isAcademyParticipant
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-500 bg-transparent'
                  }`}
                >
                  {isAcademyParticipant && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <span>در وبینارهای مهارتی آکادمی هوش‌یار شرکت کرده‌ام</span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    اعطای نشان افتخاری «دانش‌پژوه آکادمی» به پروفایل شما
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-[#FF6F59] hover:bg-[#ff573d] text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>مرحله بعد: حریم امن و محرمانگی</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 2: Privacy Shield (سوگندنامه حریم امن) ================= */}
        {step === 2 && (
          <div className={`p-6 sm:p-8 rounded-2xl border text-right transition-all ${cardBg}`}>
            <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-center mb-3">
              سوگندنامه حریم امن و اخلاق جمعی
            </h2>

            <div className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed mb-6 ${
              theme === 'dark' ? 'bg-slate-900/60 border-slate-700/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <p className="font-bold text-[#FF6F59] mb-2 text-sm">
                اصول بنیادی کافه هوش‌یار:
              </p>
              <p className="mb-3">
                «تمامی نظرات، کاندیداتوری‌ها و آرای ثبت‌شده در کافه هوش‌یار کاملاً ناشناس و محرمانه است. افراد تنها متوجه می‌شوند که در جامعه برای یک نقطه قوت برگزیده شده‌اند، اما هویت شما برای هیچ کاربری فاش نخواهد شد.»
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-xs opacity-90">
                <li>هیچ نامی از شما پای کاندیداتوری افراد نمایش داده نمی‌شود.</li>
                <li>داوری همتایان در محیطی امن و بدون قضاوت‌های فردی انجام می‌گیرد.</li>
                <li>هدف ما تکریم نقاط قوت و روایتگری استعدادهای اصیل دانشجویی است.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  triggerTelegramHaptic('success');
                  onSetStep(3);
                }}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#FF6F59] hover:bg-[#ff573d] text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>پذیرش و ورود به تالار استعدادیابی 🤝</span>
              </button>

              <button
                onClick={() => onSetStep(1)}
                className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                بازگشت و اصلاح اطلاعات هویتی
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: Nomination Hall (تالار کاندیداتوری اولیه) ================= */}
        {step === 3 && (
          <div className={`p-6 sm:p-8 rounded-2xl border text-right transition-all ${cardBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  تالار استعدادیابی و کاندیداتوری
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  معرفی حداقل <strong className="text-[#FF6F59]">۲ نفر</strong> در دسته‌های مختلف الزامی است. (هر نفر اضافه: +۱۵ سکه طلا)
                </p>
              </div>

              <button
                type="button"
                onClick={handleRotateCategories}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="مشاهده ۱۰ دسته مهارتی دیگر"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#2A7BE4]" />
                <span className="hidden sm:inline">دسته‌های دیگر</span>
                <span>(🔄)</span>
              </button>
            </div>

            {nominationError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{nominationError}</span>
              </div>
            )}

            {/* List of 10 Displayed Categories with Inputs */}
            <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pl-1 pr-1 pb-2">
              {displayedCategories.map((cat) => {
                const currentVal = nominationsInput[cat.id] || { fullName: '', fatherName: '' };
                const isFilled = currentVal.fullName.trim().length >= 3;

                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isFilled
                        ? theme === 'dark'
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-emerald-50 border-emerald-200'
                        : theme === 'dark'
                        ? 'bg-slate-900/50 border-slate-700/60'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#FF6F59]">
                          #{cat.id}
                        </span>
                        <span className="font-bold text-xs sm:text-sm">
                          {cat.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
                          {cat.type === 'skill' ? 'مهارت' : 'امضای رفتاری'}
                        </span>
                      </div>
                      {isFilled && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ثبت شد</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2.5">
                      {cat.desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={currentVal.fullName}
                        onChange={(e) => handleNomineeChange(cat.id, 'fullName', e.target.value)}
                        placeholder="نام و نام خانوادگی کاندید..."
                        className={`w-full px-3 py-1.5 rounded-lg text-xs border outline-none ${inputBg}`}
                      />
                      <input
                        type="text"
                        value={currentVal.fatherName}
                        onChange={(e) => handleNomineeChange(cat.id, 'fatherName', e.target.value)}
                        placeholder="نام پدر (جهت تفکیک - اختیاری)..."
                        className={`w-full px-3 py-1.5 rounded-lg text-xs border outline-none ${inputBg}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom summary and submit */}
            <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>
                  پاداش اولیه: ۲۰ سکه ورودی + به ازای هر معرفی مازاد بر ۲ نفر (+۱۵ سکه)
                </span>
              </div>

              <button
                type="button"
                onClick={handleFinalizeOnboarding}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#FF6F59] hover:bg-[#ff573d] text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ورود به داشبورد و آغاز مأموریت‌ها</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
