import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Coins,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  Send,
  AlertCircle
} from 'lucide-react';
import {
  MissionDefinition,
  MissionProgress,
  MISSIONS_DATA,
  ThemeMode,
  UserProfile
} from '../types';
import {
  celebrateConfetti,
  triggerTelegramHaptic
} from '../utils/storage';

interface MissionsTabProps {
  theme: ThemeMode;
  user: UserProfile;
  missionsProgress: Record<number, MissionProgress>;
  onCompleteMission: (missionId: number, data: Record<string, string>, earnedCoins: number) => void;
  onOpenDossier: () => void;
}

export const MissionsTab: React.FC<MissionsTabProps> = ({
  theme,
  user,
  missionsProgress,
  onCompleteMission,
  onOpenDossier
}) => {
  const [expandedMissionId, setExpandedMissionId] = useState<number | null>(() => {
    // Expand the first active mission by default
    const activeOne = MISSIONS_DATA.find((m) => missionsProgress[m.id]?.status === 'active');
    return activeOne ? activeOne.id : 1;
  });

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Filter missions by stages
  const stage1Missions = MISSIONS_DATA.filter((m) => m.stage === 1);
  const stage2Missions = MISSIONS_DATA.filter((m) => m.stage === 2);
  const stage3Missions = MISSIONS_DATA.filter((m) => m.stage === 3);

  const completedCount = Object.values(missionsProgress).filter((p) => p.status === 'completed').length;
  const progressPercent = Math.round((completedCount / MISSIONS_DATA.length) * 100);

  const handleToggleExpand = (id: number) => {
    if (expandedMissionId === id) {
      setExpandedMissionId(null);
    } else {
      setExpandedMissionId(id);
      // Preload saved data if any
      setFormData(missionsProgress[id]?.data || {});
      setFormError(null);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  const handleColorSelect = (key: string, colorHex: string) => {
    const existing = formData[key] ? formData[key].split(',') : [];
    let updated: string[];
    if (existing.includes(colorHex)) {
      updated = existing.filter((c) => c !== colorHex);
    } else {
      if (existing.length >= 2) {
        updated = [existing[1], colorHex]; // replace oldest
      } else {
        updated = [...existing, colorHex];
      }
    }
    setFormData((prev) => ({ ...prev, [key]: updated.join(',') }));
    setFormError(null);
  };

  const handleSubmitMission = (mission: MissionDefinition) => {
    setFormError(null);

    // Validate fields
    for (const field of mission.fields) {
      const val = formData[field.key] || '';
      if (!val.trim()) {
        setFormError(`فیلد «${field.label}» نمی‌تواند خالی باشد.`);
        triggerTelegramHaptic('warning');
        return;
      }

      if (field.type === 'color-pair') {
        const colors = val.split(',').filter(Boolean);
        if (colors.length < 2) {
          setFormError('لطفاً حداقل ۲ رنگ برای پالت هویتی خود انتخاب کنید.');
          triggerTelegramHaptic('warning');
          return;
        }
      }

      if (field.minLength && val.trim().length < field.minLength) {
        setFormError(`متن «${field.label}» باید حداقل ${field.minLength} کاراکتر باشد.`);
        triggerTelegramHaptic('warning');
        return;
      }
    }

    // Special Mad-libs check for Mission 2 (min 10 words)
    if (mission.id === 2) {
      const allText = `${formData.target_audience || ''} ${formData.outcome || ''} ${formData.unique_method || ''}`;
      const words = allText.trim().split(/\s+/).filter(Boolean);
      if (words.length < 10) {
        setFormError('مجموع کلمات بیانیه جایگاه شخصی باید حداقل ۱۰ کلمه باشد.');
        triggerTelegramHaptic('warning');
        return;
      }
    }

    // Special check for Mission 7 (min 30 words)
    if (mission.id === 7) {
      const words = (formData.impact_vision || '').trim().split(/\s+/).filter(Boolean);
      if (words.length < 25) {
        setFormError('شرح چشم‌انداز اثرگذاری باید حداقل ۲۵ تا ۳۰ کلمه باشد.');
        triggerTelegramHaptic('warning');
        return;
      }
    }

    // Success!
    celebrateConfetti();
    triggerTelegramHaptic('success');
    onCompleteMission(mission.id, formData, mission.rewardCoins);

    // Open next mission if available
    const nextMission = MISSIONS_DATA.find((m) => m.id === mission.id + 1);
    if (nextMission) {
      setExpandedMissionId(nextMission.id);
      setFormData(missionsProgress[nextMission.id]?.data || {});
    } else {
      setExpandedMissionId(null);
    }
  };

  const cardBg = theme === 'dark' ? 'bg-[#162238] border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-[#0F2042] shadow-sm';
  const inputBg = theme === 'dark' ? 'bg-slate-900/80 border-slate-700 text-slate-100 focus:border-[#FF6F59]' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#FF6F59]';

  const renderStageHeader = (stageNum: number, title: string, subtitle: string, badgeReward: string, missions: MissionDefinition[]) => {
    const isStageCompleted = missions.every((m) => missionsProgress[m.id]?.status === 'completed');
    const isStageCurrent = user.stage === stageNum;

    return (
      <div className={`p-4 rounded-2xl border mb-3 flex items-center justify-between ${
        isStageCompleted
          ? theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          : isStageCurrent
          ? theme === 'dark' ? 'bg-blue-950/30 border-blue-500/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
          : theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
            isStageCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-[#FF6F59] text-white'
          }`}>
            {isStageCompleted ? '✓' : stageNum}
          </div>
          <div className="text-right">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
              <span>{title}</span>
              {isStageCompleted && <span className="text-xs font-semibold text-emerald-400">(تکمیل‌شده)</span>}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {subtitle} · <span className="text-amber-400 font-medium">پاداش: نشان {badgeReward}</span>
            </p>
          </div>
        </div>

        <div className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 tabular-nums">
          {missions.filter((m) => missionsProgress[m.id]?.status === 'completed').length} / {missions.length}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Progress Tracker */}
      <div className={`p-5 rounded-2xl border transition-all ${cardBg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6F59]" />
              <h2 className="text-lg sm:text-xl font-black">
                مسیر مأموریت‌های ده‌گانه خوداعتبارسنج
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              طراحی‌شده برای کشف امضا، متمایزسازی فردی و آماده‌سازی پرونده نهایی مسابقه.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDossier}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2A7BE4] hover:bg-blue-600 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>مشاهده پرونده رسمی داوری</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400">پیشرفت کل مأموریت‌ها</span>
            <span className="font-bold text-[#FF6F59] tabular-nums">{progressPercent}٪ تکمیل‌شده ({completedCount} از ۱۰)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-[#FF6F59] via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stage 1: Missions 1 to 3 */}
      <div>
        {renderStageHeader(
          1,
          'سطح ۱: خودشناسی و هویت فردی',
          'مأموریت ۱ تا ۳',
          '«کاوشگر هویت» + بازگشایی تالار داوری',
          stage1Missions
        )}

        <div className="space-y-3">
          {stage1Missions.map((mission) => renderMissionCard(mission))}
        </div>
      </div>

      {/* Stage 2: Missions 4 to 7 */}
      <div>
        {renderStageHeader(
          2,
          'سطح ۲: ابزارها و خلق اثر',
          'مأموریت ۴ تا ۷',
          '«خالق دیجیتال»',
          stage2Missions
        )}

        <div className="space-y-3">
          {stage2Missions.map((mission) => renderMissionCard(mission))}
        </div>
      </div>

      {/* Stage 3: Missions 8 to 10 */}
      <div>
        {renderStageHeader(
          3,
          'سطح ۳: بازار و ارائه اثرگذار',
          'مأموریت ۸ تا ۱۰',
          '«برند اثرگذار» + صدور پرونده رسمی',
          stage3Missions
        )}

        <div className="space-y-3">
          {stage3Missions.map((mission) => renderMissionCard(mission))}
        </div>
      </div>
    </div>
  );

  function renderMissionCard(mission: MissionDefinition) {
    const progress = missionsProgress[mission.id] || { status: 'locked', data: {} };
    const isCompleted = progress.status === 'completed';
    const isLocked = progress.status === 'locked';
    const isExpanded = expandedMissionId === mission.id;

    return (
      <div
        key={mission.id}
        className={`rounded-2xl border transition-all overflow-hidden ${
          isCompleted
            ? theme === 'dark'
              ? 'bg-[#162238]/80 border-emerald-500/30'
              : 'bg-white border-emerald-300 shadow-xs'
            : isLocked
            ? theme === 'dark'
              ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
              : 'bg-slate-100/70 border-slate-200 opacity-70'
            : theme === 'dark'
            ? 'bg-[#162238] border-slate-700/80'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Mission Card Header */}
        <div
          onClick={() => !isLocked && handleToggleExpand(mission.id)}
          className={`p-4 flex items-center justify-between gap-3 text-right ${
            isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : isLocked
                  ? 'bg-slate-800 text-slate-500 border border-slate-700'
                  : 'bg-[#FF6F59]/20 text-[#FF6F59] border border-[#FF6F59]/40'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isLocked ? (
                <Lock className="w-4 h-4 text-slate-500" />
              ) : (
                <span>#{mission.id}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base">
                  {mission.title}
                </h4>
                {isCompleted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    انجام شد
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {mission.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 tabular-nums">
              <Coins className="w-3.5 h-3.5" />
              <span>+{mission.rewardCoins}</span>
            </span>

            {!isLocked && (
              <div className="p-1 text-slate-400">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            )}
          </div>
        </div>

        {/* Mission Expanded Content / Mad-Libs Form */}
        {isExpanded && !isLocked && (
          <div className={`p-4 sm:p-5 border-t text-right ${
            theme === 'dark' ? 'border-slate-700/80 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'
          }`}>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-medium">
              {mission.description}
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3.5">
              {mission.fields.map((field) => {
                const currentVal = formData[field.key] || '';

                if (field.type === 'select') {
                  return (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {field.label}
                      </label>
                      <select
                        value={currentVal}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none ${inputBg}`}
                      >
                        <option value="">{field.placeholder || 'یک مورد را برگزینید...'}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === 'color-pair') {
                  const paletteColors = [
                    '#FF6F59', '#2A7BE4', '#10B981', '#F4B41A', '#8B5CF6', '#EC4899', '#06B6D4', '#1E293B'
                  ];
                  const selectedColors = currentVal ? currentVal.split(',') : [];

                  return (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {field.label} (حداقل ۲ رنگ هویتی انتخاب کنید)
                      </label>
                      <div className="flex flex-wrap gap-2.5 items-center mt-1.5">
                        {paletteColors.map((color) => {
                          const isSel = selectedColors.includes(color);
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleColorSelect(field.key, color)}
                              className={`w-8 h-8 rounded-full transition-transform cursor-pointer border-2 flex items-center justify-center ${
                                isSel ? 'scale-110 border-white shadow-md' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            >
                              {isSel && <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />}
                            </button>
                          );
                        })}
                      </div>
                      {selectedColors.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-1.5">
                          رنگ‌های منتخب: {selectedColors.join(' ، ')}
                        </p>
                      )}
                    </div>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {field.label}
                      </label>
                      <textarea
                        value={currentVal}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none resize-none ${inputBg}`}
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm border outline-none ${inputBg}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleSubmitMission(mission)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FF6F59] hover:bg-[#ff573d] text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isCompleted ? 'بروزرسانی و ثبت مجدد' : 'اعتبارسنجی و ثبت مأموریت (+ سکه)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
};
