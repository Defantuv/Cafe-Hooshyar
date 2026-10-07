import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Award,
  FileText,
  Sparkles,
  Download
} from 'lucide-react';
import { HooshyarLogo } from './HooshyarLogo';
import {
  MissionProgress,
  MISSIONS_DATA,
  ThemeMode,
  UserProfile
} from '../types';
import { triggerTelegramHaptic } from '../utils/storage';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  user: UserProfile;
  missionsProgress: Record<number, MissionProgress>;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  theme,
  user,
  missionsProgress
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Extract mission values
  const m1 = missionsProgress[1]?.data || {};
  const m2 = missionsProgress[2]?.data || {};
  const m3 = missionsProgress[3]?.data || {};
  const m4 = missionsProgress[4]?.data || {};
  const m5 = missionsProgress[5]?.data || {};
  const m6 = missionsProgress[6]?.data || {};
  const m7 = missionsProgress[7]?.data || {};
  const m8 = missionsProgress[8]?.data || {};
  const m9 = missionsProgress[9]?.data || {};
  const m10 = missionsProgress[10]?.data || {};

  const handlePrint = () => {
    triggerTelegramHaptic('light');
    window.print();
  };

  const handleCopyText = () => {
    triggerTelegramHaptic('success');
    const text = `
پرونده رسمی داوری - هفتمین دوره جشنواره سراسری دانشجویی بار دانش (من پلاس)
کافه هوش‌یار | شناسه داوری: HOOSH-${user.telegramId}
نام داوطلب: ${user.firstName} ${user.lastName} ${user.fatherName ? `(فرزند: ${user.fatherName})` : ''}
شهر: ${user.city} | رده سنی: ${user.ageGroup} | محور: ${m10.festival_track || 'عمومی'}

۱. دارایی متمایز: ${m1.work_ref || '-'} | ارزش اخلاقی: ${m1.core_value || '-'}
۲. بیانیه جایگاه شخصی: «من به ${m2.target_audience || '...'} کمک می‌کنم تا ${m2.outcome || '...'} را با ${m2.unique_method || '...'} رقم بزنند»
۳. بایو دیجیتال: ${m3.bio_text || '-'}
۴. شعار و تگ‌لاین: ${m4.tagline || '-'}
۵. شاهد شایستگی (مسئله): ${m5.problem_desc || '-'} | (اقدام): ${m5.solution_action || '-'}
۶. ارائه آسانسوری ۳۰ ثانیه‌ای:
- کیستم: ${m6.pitch_who || '-'}
- چه‌کار می‌کنم: ${m6.pitch_what || '-'}
- چشم‌انداز: ${m6.pitch_future || '-'}
۷. چشم‌انداز اثرگذاری: ${m7.impact_vision || '-'}
۸. پیام ارتباط کاری: مخاطب: ${m8.recipient_title || '-'} | ارزش: ${m8.offered_value || '-'} | اقدام: ${m8.call_to_action || '-'}
۹. مطالعه موردی STAR:
- موقعیت: ${m9.star_situation || '-'}
- وظیفه: ${m9.star_task || '-'}
- اقدام: ${m9.star_action || '-'}
- نتیجه: ${m9.star_result || '-'}
۱۰. امضای تعهد: ${m10.final_signature || `${user.firstName} ${user.lastName}`}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl my-auto rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-300 p-6 sm:p-8 text-right relative max-h-[92vh] overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'کپی شد' : 'کپی کل متن'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF6F59] hover:bg-[#ff573d] text-white cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ / PDF</span>
            </button>
          </div>
        </div>

        {/* Formal Dossier Document Body */}
        <div className="space-y-6 print:space-y-4">
          {/* Document Header */}
          <div className="text-center pb-5 border-b-2 border-slate-900">
            <div className="flex justify-center mb-2">
              <HooshyarLogo variant="full" size="md" theme="light" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#0F2042] mt-2">
              پرونده رسمی شایستگی و مأموریت‌های فردی
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              هفتمین دوره جشنواره سراسری دانشجویی بار دانش | بازی ۶۰ روزه من پلاس (+M)
            </p>
          </div>

          {/* Candidate Profile Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <span className="block text-slate-500 text-[10px]">نام و نام خانوادگی:</span>
              <span className="font-bold">{user.firstName} {user.lastName}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px]">شهر / دانشگاه:</span>
              <span className="font-bold">{user.city}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px]">رده سنی:</span>
              <span className="font-bold">{user.ageGroup}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px]">محور رقابتی انتخابی:</span>
              <span className="font-bold text-[#FF6F59]">{m10.festival_track || 'در حال تکمیل'}</span>
            </div>
          </div>

          {/* Section 1: Identity & Positioning */}
          <div>
            <h4 className="font-extrabold text-sm text-[#0F2042] mb-2 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#FF6F59]"></span>
              <span>بخش اول: بیانیه جایگاه شخصی و ارزش متمایز</span>
            </h4>
            <div className="space-y-2 text-xs leading-relaxed text-slate-800">
              <p>
                <strong>دارایی متمایز: </strong>
                {m1.work_ref ? `${m1.work_ref} (ارزش اخلاقی: ${m1.core_value || '-'})` : 'هنوز تکمیل نشده'}
              </p>
              <div className="p-3 bg-slate-100 rounded-lg border-r-4 border-[#2A7BE4]">
                <span className="font-semibold block mb-1">بیانیه جایگاه (Positioning Statement):</span>
                {m2.target_audience ? (
                  <p>
                    «من به <strong className="text-[#0F2042]">{m2.target_audience}</strong> کمک می‌کنم تا{' '}
                    <strong className="text-[#0F2042]">{m2.outcome}</strong> را با{' '}
                    <strong className="text-[#0F2042]">{m2.unique_method}</strong> رقم بزنند.»
                  </p>
                ) : (
                  <span className="text-slate-500 italic">مأموریت ۲ هنوز تکمیل نشده است.</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Elevator Pitch */}
          <div>
            <h4 className="font-extrabold text-sm text-[#0F2042] mb-2 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#FF6F59]"></span>
              <span>بخش دوم: ارائه آسانسوری ۳۰ ثانیه‌ای (Elevator Pitch)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-bold">۱. کیستم؟ (۵ ثانیه)</span>
                <p className="mt-1">{m6.pitch_who || '-'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-bold">۲. چه‌کار می‌کنم؟ (۱۵ ثانیه)</span>
                <p className="mt-1">{m6.pitch_what || '-'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block font-bold">۳. چشم‌انداز آینده (۱۰ ثانیه)</span>
                <p className="mt-1">{m6.pitch_future || '-'}</p>
              </div>
            </div>
          </div>

          {/* Section 3: STAR Case Study */}
          <div>
            <h4 className="font-extrabold text-sm text-[#0F2042] mb-2 flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#FF6F59]"></span>
              <span>بخش سوم: مطالعه موردی چالش به روش استاندارد STAR</span>
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs leading-relaxed">
              <p><strong>موقعیت (Situation):</strong> {m9.star_situation || '-'}</p>
              <p><strong>وظیفه (Task):</strong> {m9.star_task || '-'}</p>
              <p><strong>اقدام (Action):</strong> {m9.star_action || '-'}</p>
              <p><strong>نتیجه (Result):</strong> {m9.star_result || '-'}</p>
            </div>
          </div>

          {/* Section 4: Signature & Declaration */}
          <div className="pt-4 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <div>
              <span className="block text-[11px] text-slate-500">امضای تعهد اخلاقی:</span>
              <span className="font-black text-sm text-[#0F2042]">
                {m10.final_signature || `${user.firstName} ${user.lastName}`}
              </span>
            </div>

            <div className="text-left font-mono text-[10px] text-slate-500">
              تاریخ صدور: {new Date().toLocaleDateString('fa-IR')}
              <br />
              دبیرخانه جشنواره سراسری بار دانش
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
