import { create } from "zustand";
import type { AlertItem, ActiveAlert } from "./types";

interface LiveState {
  threshold: number;
  pendingThreshold: number;
  alerts: AlertItem[];
  activeAlerts: ActiveAlert[];
  visibleGases: Record<string, boolean>;
  setPendingThreshold: (value: number) => void;
  setThreshold: (value: number) => void;
  setAlerts: (alerts: AlertItem[]) => void;
  setActiveAlerts: (alerts: ActiveAlert[]) => void;
  toggleGasVisibility: (gas: string) => void;
  resetAlertsState: () => void;
}

const DEFAULT_THRESHOLD = 20000;

const defaultVisibleGases: Record<string, boolean> = {
  CO: true,
  AL: true,
  H2: true,
  CH4: true,
  LPG: true,
};

const safeGetLocalStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const useLiveStore = create<LiveState>((set) => ({
  threshold: (() => {
    if (typeof window === "undefined") return DEFAULT_THRESHOLD;
    const saved = window.localStorage.getItem("gasThreshold");
    return saved ? Number(saved) || DEFAULT_THRESHOLD : DEFAULT_THRESHOLD;
  })(),
  pendingThreshold: (() => {
    if (typeof window === "undefined") return DEFAULT_THRESHOLD;
    const saved = window.localStorage.getItem("gasThreshold");
    return saved ? Number(saved) || DEFAULT_THRESHOLD : DEFAULT_THRESHOLD;
  })(),
  alerts: safeGetLocalStorage<AlertItem[]>("gasAlerts", []),
  activeAlerts: [],
  visibleGases: defaultVisibleGases,

  setPendingThreshold: (value) => set({ pendingThreshold: value }),

  setThreshold: (value) => {
    set({ threshold: value, pendingThreshold: value });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("gasThreshold", String(value));
    }
  },

  setAlerts: (alerts) => {
    set({ alerts });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("gasAlerts", JSON.stringify(alerts));
    }
  },

  setActiveAlerts: (activeAlerts) => set({ activeAlerts }),

  toggleGasVisibility: (gas) =>
    set((state) => ({
      visibleGases: {
        ...state.visibleGases,
        [gas]: !state.visibleGases[gas],
      },
    })),

  resetAlertsState: () => {
    set({ alerts: [], activeAlerts: [] });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("gasAlerts");
      window.localStorage.removeItem("gasAlertLogs");
    }
  },
}));
