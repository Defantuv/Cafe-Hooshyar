import confetti from 'canvas-confetti';
import { AppState, Nomination, UserProfile } from '../types';

const STORAGE_KEY = 'hooshyar_cafe_app_state_v1';

// Initial state
export const DEFAULT_INITIAL_STATE: AppState = {
  theme: 'dark',
  view: 'onboarding',
  onboardingStep: 1,
  activeTab: 'missions',
  user: null,
  missionsProgress: {
    1: { status: 'active', data: {} },
    2: { status: 'locked', data: {} },
    3: { status: 'locked', data: {} },
    4: { status: 'locked', data: {} },
    5: { status: 'locked', data: {} },
    6: { status: 'locked', data: {} },
    7: { status: 'locked', data: {} },
    8: { status: 'locked', data: {} },
    9: { status: 'locked', data: {} },
    10: { status: 'locked', data: {} }
  },
  nominations: [],
  peerVotes: {},
  webhookLogs: [],
  devBypassConsensusGate: false
};

// Check if string contains English characters (A-Z, a-z)
export function containsEnglishLetters(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

// Telegram WebApp detection and interaction
export function getTelegramUser(): {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  username?: string;
} | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
  } catch (err) {
    console.warn('Telegram WebApp not detected:', err);
  }
  return null;
}

export function initTelegramWebApp(): void {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      // Set header color if supported
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#0B132B');
      }
    }
  } catch (err) {
    console.warn('Could not init Telegram WebApp:', err);
  }
}

export function triggerTelegramHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): void {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (['light', 'medium', 'heavy'].includes(type)) {
        tg.HapticFeedback.impactOccurred(type);
      } else if (['success', 'warning', 'error'].includes(type)) {
        tg.HapticFeedback.notificationOccurred(type);
      }
    }
  } catch (err) {
    // Graceful fallback
  }
}

export function celebrateConfetti(): void {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF6F59', '#F4B41A', '#2A7BE4', '#10B981']
    });
  } catch (err) {
    // Ignore in unsupported environments
  }
}

// Load State from LocalStorage
export function loadSavedState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_INITIAL_STATE,
        ...parsed,
        // Ensure mission progress has keys
        missionsProgress: {
          ...DEFAULT_INITIAL_STATE.missionsProgress,
          ...(parsed.missionsProgress || {})
        }
      };
    }
  } catch (e) {
    console.error('Failed to load saved state:', e);
  }
  return DEFAULT_INITIAL_STATE;
}

// Save State to LocalStorage
export function saveStateToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// Webhook Logger: Logs nomination events to state and sends event payload
export function dispatchNominationWebhook(
  nomination: Nomination,
  nominatorId: string | number
): {
  event: string;
  timestamp: string;
  data: Record<string, any>;
} {
  const payload = {
    event: 'NEW_NOMINATION',
    timestamp: new Date().toISOString(),
    data: {
      nomination_id: nomination.id,
      nominee_name: nomination.fullName,
      father_name: nomination.fatherName || 'درج‌نشده',
      category_slug: nomination.categorySlug,
      category_title: nomination.categoryTitle,
      nominator_id: String(nominatorId),
      created_at: nomination.createdAt
    }
  };

  // Log in browser console for operator tracking
  console.info('📡 [TELEGRAM_WEBHOOK_EVENT]:', payload);
  return payload;
}
