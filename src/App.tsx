/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  Users,
  Trophy,
  User,
  PlusCircle,
  Clock,
  Layers,
  CheckCircle2,
  Bell
} from 'lucide-react';
import {
  AppState,
  Nomination,
  ThemeMode,
  UserProfile,
  MissionProgress
} from './types';
import {
  initTelegramWebApp,
  loadSavedState,
  saveStateToStorage,
  triggerTelegramHaptic,
  celebrateConfetti
} from './utils/storage';
import { HooshyarLogo } from './components/HooshyarLogo';
import { Header } from './components/Header';
import { OnboardingFlow } from './components/OnboardingFlow';
import { MissionsTab } from './components/MissionsTab';
import { ConsensusTab } from './components/ConsensusTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { ProfileTab } from './components/ProfileTab';
import { NominationModal } from './components/NominationModal';
import { DossierModal } from './components/DossierModal';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadSavedState());
  const [isNominationModalOpen, setIsNominationModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Telegram WebApp on mount
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  // Save to LocalStorage whenever state updates
  useEffect(() => {
    saveStateToStorage(appState);
  }, [appState]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    setAppState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  // Tab switching with haptics
  const handleSelectTab = (tab: 'missions' | 'consensus' | 'leaderboard' | 'profile') => {
    triggerTelegramHaptic('light');
    setAppState((prev) => ({
      ...prev,
      activeTab: tab
    }));
  };

  // Onboarding completion handler
  const handleCompleteOnboarding = (
    user: UserProfile,
    initialNominations: Nomination[],
    webhookLogs: any[]
  ) => {
    setAppState((prev) => ({
      ...prev,
      user,
      view: 'dashboard',
      nominations: [...prev.nominations, ...initialNominations],
      webhookLogs: [...(prev.webhookLogs || []), ...webhookLogs]
    }));
    showToast(`خوش آمدید ${user.firstName}! ۲۰ سکه ورودی به حساب شما واریز شد.`);
  };

  // Mission completion handler
  const handleCompleteMission = (
    missionId: number,
    data: Record<string, string>,
    rewardCoins: number
  ) => {
    setAppState((prev) => {
      if (!prev.user) return prev;

      const updatedProgress: Record<number, MissionProgress> = {
        ...prev.missionsProgress,
        [missionId]: {
          status: 'completed',
          data,
          completedAt: new Date().toISOString()
        }
      };

      // Unlock next mission if existing
      if (missionId < 10) {
        const nextId = missionId + 1;
        if (updatedProgress[nextId]?.status === 'locked') {
          updatedProgress[nextId] = {
            status: 'active',
            data: updatedProgress[nextId]?.data || {}
          };
        }
      }

      // Check current stage level
      let newStage = prev.user.stage;
      const isM1to3Complete = [1, 2, 3].every((id) => updatedProgress[id]?.status === 'completed');
      const isM4to7Complete = [4, 5, 6, 7].every((id) => updatedProgress[id]?.status === 'completed');

      if (isM4to7Complete) {
        newStage = 3;
      } else if (isM1to3Complete) {
        newStage = 2;
      }

      const updatedUser: UserProfile = {
        ...prev.user,
        coins: prev.user.coins + rewardCoins,
        stage: newStage
      };

      return {
        ...prev,
        user: updatedUser,
        missionsProgress: updatedProgress
      };
    });

    showToast(`مأموریت شماره ${missionId} با موفقیت ثبت شد (+${rewardCoins} سکه طلا)`);
  };

  // Voting in Peer Consensus Hall
  const handleVote = (nomineeId: string, voteType: 'promote' | 'demote' | 'skip') => {
    setAppState((prev) => {
      if (!prev.user) return prev;

      // 1. Calculate Combo Multiplier
      let newConsecutive = prev.user.consecutiveVotes + 1;
      let newMultiplier = 1.0;
      let instantBonus = 0;

      if (newConsecutive === 1) {
        newMultiplier = 1.0;
      } else if (newConsecutive === 2) {
        newMultiplier = 1.25;
      } else if (newConsecutive >= 3) {
        newMultiplier = 1.5;
        instantBonus = 5; // Instant bonus on combo streak
      }

      // Voter reward: 3 coins * combo multiplier
      const voterCoinsEarned = Math.round(3 * newMultiplier) + instantBonus;

      // 2. Update Nominee promote/demote counts
      let referrerRewardNotice: string | null = null;
      let updatedUserCoins = prev.user.coins + voterCoinsEarned;

      const updatedNominations = prev.nominations.map((nom) => {
        if (nom.id === nomineeId) {
          const updated = { ...nom };
          if (voteType === 'promote') {
            updated.promoteCount += 1;
            // Passive income to Referrer: If this user is the referrer, add 3 passive coins
            if (nom.referrerUserId === String(prev.user?.telegramId)) {
              updatedUserCoins += 3;
              referrerRewardNotice = `+۳ سکه درآمد انفعالی بابت تایید مثبت کاندیدای شما (${nom.fullName})!`;
            }
          } else if (voteType === 'demote') {
            updated.demoteCount += 1;
          } else {
            updated.skipCount += 1;
          }
          return updated;
        }
        return nom;
      });

      const updatedUser: UserProfile = {
        ...prev.user,
        coins: updatedUserCoins,
        comboMultiplier: newMultiplier,
        consecutiveVotes: newConsecutive,
        totalVotesCast: prev.user.totalVotesCast + 1
      };

      if (referrerRewardNotice) {
        setTimeout(() => showToast(referrerRewardNotice!), 1200);
      }

      return {
        ...prev,
        user: updatedUser,
        nominations: updatedNominations,
        peerVotes: {
          ...prev.peerVotes,
          [nomineeId]: voteType
        }
      };
    });

    if (voteType === 'promote') {
      showToast('رأی تایید شما ثبت شد (+۳ سکه داور)');
    } else {
      showToast('نظر شما با موفقیت در سامانه داوری ثبت شد (+۳ سکه داور)');
    }
  };

  // Trigger Anti-Spam Suspension
  const handleTriggerSuspension = (minutes: number) => {
    setAppState((prev) => {
      if (!prev.user) return prev;
      const suspensionUntil = minutes > 0 ? Date.now() + minutes * 60 * 1000 : null;
      return {
        ...prev,
        user: {
          ...prev.user,
          suspensionUntil,
          consecutiveVotes: 0,
          comboMultiplier: 1.0
        }
      };
    });
  };

  // Toggle Developer Test Bypass for Consensus Hall
  const handleToggleDevBypass = () => {
    setAppState((prev) => ({
      ...prev,
      devBypassConsensusGate: !prev.devBypassConsensusGate
    }));
  };

  // Add a new Nomination
  const handleAddNomination = (newNom: Nomination, webhookLog: any) => {
    setAppState((prev) => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: {
          ...prev.user,
          coins: prev.user.coins + 15,
          totalNominated: prev.user.totalNominated + 1
        },
        nominations: [newNom, ...prev.nominations],
        webhookLogs: [webhookLog, ...(prev.webhookLogs || [])]
      };
    });

    showToast(`کاندیداتوری ${newNom.fullName} در دسته «${newNom.categoryTitle}» ثبت گردید (+۱۵ سکه)`);
  };

  const theme = appState.theme;
  const isDark = theme === 'dark';

  // Check if Stage 1 missions are all done
  const missionsCompletedStage1 = [1, 2, 3].every(
    (id) => appState.missionsProgress[id]?.status === 'completed'
  );

  return (
    <div
      dir="rtl"
      className={`min-h-screen transition-colors duration-200 font-sans ${
        isDark ? 'bg-[#0B132B] text-slate-100' : 'bg-[#F8F9FA] text-[#0F2042]'
      }`}
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 text-white border border-amber-400/40 text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= Onboarding View ================= */}
      {(!appState.user || appState.view === 'onboarding') ? (
        <OnboardingFlow
          theme={theme}
          step={appState.onboardingStep}
          onSetStep={(step) => setAppState((prev) => ({ ...prev, onboardingStep: step }))}
          existingNominations={appState.nominations}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      ) : (
        /* ================= Dashboard View ================= */
        <div className="flex flex-col min-h-screen">
          {/* Top Bar Header */}
          <Header
            theme={theme}
            onToggleTheme={handleToggleTheme}
            user={appState.user}
            activeTab={appState.activeTab}
            onSelectTab={handleSelectTab}
            onOpenNewNomination={() => setIsNominationModalOpen(true)}
          />

          {/* Main App Content */}
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:py-6">
            {appState.activeTab === 'missions' && (
              <MissionsTab
                theme={theme}
                user={appState.user}
                missionsProgress={appState.missionsProgress}
                onCompleteMission={handleCompleteMission}
                onOpenDossier={() => setIsDossierModalOpen(true)}
              />
            )}

            {appState.activeTab === 'consensus' && (
              <ConsensusTab
                theme={theme}
                user={appState.user}
                missionsCompletedStage1={missionsCompletedStage1}
                devBypassConsensusGate={appState.devBypassConsensusGate}
                onToggleDevBypass={handleToggleDevBypass}
                nominations={appState.nominations}
                onVote={handleVote}
                onOpenNewNomination={() => setIsNominationModalOpen(true)}
                onTriggerSuspension={handleTriggerSuspension}
              />
            )}

            {appState.activeTab === 'leaderboard' && (
              <LeaderboardTab
                theme={theme}
                user={appState.user}
                nominations={appState.nominations}
              />
            )}

            {appState.activeTab === 'profile' && (
              <ProfileTab
                theme={theme}
                user={appState.user}
                missionsProgress={appState.missionsProgress}
                nominations={appState.nominations}
                onOpenNewNomination={() => setIsNominationModalOpen(true)}
                onOpenDossier={() => setIsDossierModalOpen(true)}
                webhookLogs={appState.webhookLogs || []}
              />
            )}
          </main>

          {/* Bottom Navigation Bar (Telegram Mini App Style) */}
          <nav
            className={`sticky bottom-0 z-40 w-full backdrop-blur-md border-t transition-colors ${
              isDark
                ? 'bg-[#0B132B]/95 border-slate-700/80 text-slate-400'
                : 'bg-white/95 border-slate-200 text-slate-500 shadow-lg'
            }`}
          >
            <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
              <button
                onClick={() => handleSelectTab('missions')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                  appState.activeTab === 'missions'
                    ? 'text-[#FF6F59] font-bold'
                    : 'hover:text-slate-200'
                }`}
              >
                <Layers className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] sm:text-xs">مأموریت‌ها</span>
              </button>

              <button
                onClick={() => handleSelectTab('consensus')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                  appState.activeTab === 'consensus'
                    ? 'text-[#FF6F59] font-bold'
                    : 'hover:text-slate-200'
                }`}
              >
                <Users className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] sm:text-xs">تالار داوری</span>
                {!missionsCompletedStage1 && !appState.devBypassConsensusGate && (
                  <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                onClick={() => handleSelectTab('leaderboard')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                  appState.activeTab === 'leaderboard'
                    ? 'text-[#FF6F59] font-bold'
                    : 'hover:text-slate-200'
                }`}
              >
                <Trophy className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] sm:text-xs">لیدربرد</span>
              </button>

              <button
                onClick={() => handleSelectTab('profile')}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                  appState.activeTab === 'profile'
                    ? 'text-[#FF6F59] font-bold'
                    : 'hover:text-slate-200'
                }`}
              >
                <User className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] sm:text-xs">پروفایل و آینه</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Nomination Modal */}
      {appState.user && (
        <NominationModal
          isOpen={isNominationModalOpen}
          onClose={() => setIsNominationModalOpen(false)}
          theme={theme}
          user={appState.user}
          onAddNomination={handleAddNomination}
        />
      )}

      {/* Official Dossier Modal */}
      {appState.user && (
        <DossierModal
          isOpen={isDossierModalOpen}
          onClose={() => setIsDossierModalOpen(false)}
          theme={theme}
          user={appState.user}
          missionsProgress={appState.missionsProgress}
        />
      )}
    </div>
  );
}
