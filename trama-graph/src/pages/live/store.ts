import { create } from "zustand";
import type { AlertItem, ActiveAlert } from "./types";

export const GAS_KEYS = ["CO", "AL", "H2", "CH4", "LPG"] as const;
export type GasKey = (typeof GAS_KEYS)[number];

type ThresholdRecord = Record<GasKey, number>;
type AlarmEnabledRecord = Record<GasKey, boolean>;

interface LiveState {
  thresholds: ThresholdRecord;
  alarmEnabled: AlarmEnabledRecord;
  alerts: AlertItem[];
  activeAlerts: ActiveAlert[];
  visibleGases: Record<string, boolean>;
  setThresholds: (values: ThresholdRecord) => void;
  setAlarmEnabledState: (values: AlarmEnabledRecord) => void;
  updateThreshold: (gas: GasKey, value: number) => void;
  setAlarmEnabledForGas: (gas: GasKey, enabled: boolean) => void;
  setAlerts: (alerts: AlertItem[]) => void;
  setActiveAlerts: (alerts: ActiveAlert[]) => void;
  toggleGasVisibility: (gas: string) => void;
  resetAlertsState: () => void;
  backendFailures: number;
  backendBlocked: boolean;
  incrementBackendFailure: () => void;
  resetBackendFailure: () => void;
}

export const DEFAULT_THRESHOLD = 1000;

const createDefaultThresholds = (): ThresholdRecord =>
  GAS_KEYS.reduce((acc, key) => {
    acc[key] = DEFAULT_THRESHOLD;
    return acc;
  }, {} as ThresholdRecord);

const createDefaultAlarmEnabled = (): AlarmEnabledRecord =>
  GAS_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as AlarmEnabledRecord);

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
  thresholds: (() => {
    const fallback = createDefaultThresholds();
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem("gasThresholds");
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<Record<string, number>>;
      return GAS_KEYS.reduce((acc, key) => {
        const value = parsed[key];
        acc[key] = typeof value === "number" && Number.isFinite(value) ? value : DEFAULT_THRESHOLD;
        return acc;
      }, {} as ThresholdRecord);
    } catch {
      return fallback;
    }
  })(),
  alarmEnabled: (() => {
    const fallback = createDefaultAlarmEnabled();
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem("gasAlarmEnabled");
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<Record<string, boolean>>;
      return GAS_KEYS.reduce((acc, key) => {
        const value = parsed[key];
        acc[key] = typeof value === "boolean" ? value : true;
        return acc;
      }, {} as AlarmEnabledRecord);
    } catch {
      return fallback;
    }
  })(),
  alerts: safeGetLocalStorage<AlertItem[]>("gasAlerts", []),
  activeAlerts: [],
  visibleGases: defaultVisibleGases,
  backendFailures: 0,
  backendBlocked: false,

  setThresholds: (values) => {
    const normalized = GAS_KEYS.reduce((acc, key) => {
      const rawValue = values[key];
      acc[key] = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : DEFAULT_THRESHOLD;
      return acc;
    }, {} as ThresholdRecord);

    set({ thresholds: normalized });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("gasThresholds", JSON.stringify(normalized));
    }
  },

  setAlarmEnabledState: (values) => {
    const normalized = GAS_KEYS.reduce((acc, key) => {
      const rawValue = values[key];
      acc[key] = typeof rawValue === "boolean" ? rawValue : true;
      return acc;
    }, {} as AlarmEnabledRecord);

    set({ alarmEnabled: normalized });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("gasAlarmEnabled", JSON.stringify(normalized));
    }
  },

  updateThreshold: (gas, value) => {
    set((state) => {
      const current = state.thresholds[gas];
      const nextValue = Number.isFinite(value) && value > 0 ? value : current;
      const thresholds = { ...state.thresholds, [gas]: nextValue };

      if (typeof window !== "undefined") {
        window.localStorage.setItem("gasThresholds", JSON.stringify(thresholds));
      }

      return { thresholds };
    });
  },

  setAlarmEnabledForGas: (gas, enabled) => {
    set((state) => {
      const alarmEnabled = { ...state.alarmEnabled, [gas]: enabled };

      if (typeof window !== "undefined") {
        window.localStorage.setItem("gasAlarmEnabled", JSON.stringify(alarmEnabled));
      }

      return { alarmEnabled };
    });
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

  incrementBackendFailure: () =>
    set((state) => {
      const failures = state.backendFailures + 1;
      const backendBlocked = failures >= 5;
      return { backendFailures: failures, backendBlocked };
    }),

  resetBackendFailure: () => set({ backendFailures: 0, backendBlocked: false }),
}));
