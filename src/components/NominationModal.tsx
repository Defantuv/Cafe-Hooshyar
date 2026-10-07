import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Coins,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import {
  Category,
  CATEGORIES,
  Nomination,
  ThemeMode,
  UserProfile
} from '../types';
import {
  containsEnglishLetters,
  triggerTelegramHaptic,
  celebrateConfetti,
  dispatchNominationWebhook
} from '../utils/storage';

interface NominationModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  user: UserProfile;
  onAddNomination: (nomination: Nomination, webhookLog: any) => void;
}

export const NominationModal: React.FC<NominationModalProps> = ({
  isOpen,
  onClose,
  theme,
  user,
  onAddNomination
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('نام و نام خانوادگی کاندید باید حداقل ۳ حرف باشد.');
      triggerTelegramHaptic('warning');
      return;
    }

    if (containsEnglishLetters(fullName) || containsEnglishLetters(fatherName)) {
      setError('قفل رسم‌الخط فارسی: نام‌ها باید بدون حروف انگلیسی و به فارسی باشند.');
      triggerTelegramHaptic('error');
      return;
    }

    const cat = CATEGORIES.find((c) => c.id === selectedCategoryId) || CATEGORIES[0];

    const newNom: Nomination = {
      id: `nom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: fullName.trim(),
      fatherName: fatherName.trim() || undefined,
      categorySlug: cat.slug,
      categoryTitle: cat.title,
      referrerUserId: String(user.telegramId),
      referrerName: `${user.firstName} ${user.lastName}`,
      promoteCount: 0,
      demoteCount: 0,
      skipCount: 0,
      createdAt: new Date().toISOString(),
      earnedCoins: 0
    };

    const log = dispatchNominationWebhook(newNom, user.telegramId);

    celebrateConfetti();
    triggerTelegramHaptic('success');
    onAddNomination(newNom, log);
    onClose();
    setFullName('');
    setFatherName('');
  };

  const cardBg = theme === 'dark' ? 'bg-[#162238] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-[#0F2042] shadow-xl';
  const inputBg = theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-[#FF6F59]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF6F59]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 transition-all text-right relative max-h-[90vh] overflow-y-auto ${cardBg}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-5 h-5 text-[#FF6F59]" />
          <h3 className="font-extrabold text-base sm:text-lg">
            معرفی استعداد شایسته جدید
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          با معرفی افراد توانمند در ۲۲ دسته مهارتی و رفتاری، به پاداش <strong className="text-amber-400">+۱۵ سکه</strong> دست یابید و از جریان درآمد انفعالی آینده بهره‌مند شوید.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">
              دسته‌بندی شایستگی (مهارت یا امضای رفتاری):
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none ${inputBg}`}
            >
              <optgroup label="۱۲ مهارت تخصصی و عملیاتی">
                {CATEGORIES.filter((c) => c.type === 'skill').map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    #{cat.id} {cat.title} ({cat.desc})
                  </option>
                ))}
              </optgroup>
              <optgroup label="۱۰ ویژگی کاریزما و امضای رفتاری">
                {CATEGORIES.filter((c) => c.type === 'charisma').map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    #{cat.id} {cat.title} ({cat.desc})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">
              نام و نام خانوادگی کاندید <span className="text-[#FF6F59]">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: سهراب حسینی"
              className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${inputBg}`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300">
              نام پدر کاندید <span className="text-slate-500 text-[11px]">(اختیاری - جهت تفکیک دقیق)</span>
            </label>
            <input
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              placeholder="مثال: علیرضا"
              className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${inputBg}`}
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>پاداش معرفی: +۱۵ سکه طلا</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#FF6F59] hover:bg-[#ff573d] text-white shadow-md active:scale-95 cursor-pointer"
              >
                ثبت کاندیداتوری
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
