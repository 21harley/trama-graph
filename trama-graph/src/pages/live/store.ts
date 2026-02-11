import { create } from "zustand";
import type { AlertItem, ActiveAlert } from "./types";

export const GAS_KEYS = ["CO", "AL", "H2", "CH4", "LPG"] as const;
export type GasKey = (typeof GAS_KEYS)[number];

type ThresholdRecord = Record<GasKey, number>;
type AlarmEnabledRecord = Record<GasKey, boolean>;
type MeasurementEnabledRecord = Record<GasKey, boolean>;

interface LiveState {
  thresholds: ThresholdRecord;
  alarmEnabled: AlarmEnabledRecord;
  measurementEnabled: MeasurementEnabledRecord;
  storeAllMeasurements: boolean;
  alerts: AlertItem[];
  activeAlerts: ActiveAlert[];
  visibleGases: Record<string, boolean>;
  setThresholds: (values: ThresholdRecord) => void;
  setAlarmEnabledState: (values: AlarmEnabledRecord) => void;
  setMeasurementEnabledState: (values: MeasurementEnabledRecord) => void;
  updateThreshold: (gas: GasKey, value: number) => void;
  setAlarmEnabledForGas: (gas: GasKey, enabled: boolean) => void;
  setMeasurementEnabledForGas: (gas: GasKey, enabled: boolean) => void;
  setStoreAllMeasurements: (value: boolean) => void;
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

const createDefaultMeasurementEnabled = (): MeasurementEnabledRecord =>
  GAS_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as MeasurementEnabledRecord);

const defaultVisibleGases: Record<string, boolean> = {
  CO: true,
  AL: true,
  H2: true,
  CH4: true,
  LPG: true,
};

export const useLiveStore = create<LiveState>((set) => ({
  thresholds: createDefaultThresholds(),
  alarmEnabled: createDefaultAlarmEnabled(),
  measurementEnabled: createDefaultMeasurementEnabled(),
  storeAllMeasurements: false,
  alerts: [],
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

  },

  setAlarmEnabledState: (values) => {
    const normalized = GAS_KEYS.reduce((acc, key) => {
      const rawValue = values[key];
      acc[key] = typeof rawValue === "boolean" ? rawValue : true;
      return acc;
    }, {} as AlarmEnabledRecord);

    set({ alarmEnabled: normalized });
  },

  setMeasurementEnabledState: (values) => {
    const normalized = GAS_KEYS.reduce((acc, key) => {
      const rawValue = values[key];
      acc[key] = typeof rawValue === "boolean" ? rawValue : true;
      return acc;
    }, {} as MeasurementEnabledRecord);

    set({ measurementEnabled: normalized });
  },

  updateThreshold: (gas, value) => {
    set((state) => {
      const current = state.thresholds[gas];
      const nextValue = Number.isFinite(value) && value > 0 ? value : current;
      const thresholds = { ...state.thresholds, [gas]: nextValue };

      return { thresholds };
    });
  },

  setAlarmEnabledForGas: (gas, enabled) => {
    set((state) => {
      const alarmEnabled = { ...state.alarmEnabled, [gas]: enabled };

      return { alarmEnabled };
    });
  },

  setMeasurementEnabledForGas: (gas, enabled) => {
    set((state) => {
      const measurementEnabled = { ...state.measurementEnabled, [gas]: enabled };

      return { measurementEnabled };
    });
  },

  setStoreAllMeasurements: (value) => {
    set({ storeAllMeasurements: value });
  },

  setAlerts: (alerts) => {
    set({ alerts });
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
  },

  incrementBackendFailure: () =>
    set((state) => {
      const failures = state.backendFailures + 1;
      const backendBlocked = failures >= 5;
      return { backendFailures: failures, backendBlocked };
    }),

  resetBackendFailure: () => set({ backendFailures: 0, backendBlocked: false }),
}));
