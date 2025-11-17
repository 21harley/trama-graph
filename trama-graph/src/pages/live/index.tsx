/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from "react";
import GasChart from "./components/GasChart";
import ControlPanel from "./components/ControlPanel";
import { useLiveStore, GAS_KEYS, DEFAULT_THRESHOLD, type GasKey } from "./store";
import { useIntroGate } from "../../core/hooks/useIntroGate";

import type { ChartPoint, AlertItem, ActiveAlert } from "./types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WINDOW_TIME = 30;

type MeasurementPayload = {
  id_type_gas: number;
  valor: number;
  fecha: string;
  umbral: number;
};

const GAS_ID_MAP: Record<string, number> = {
  CO: 1,
  AL: 2,
  H2: 3,
  CH4: 4,
  LPG: 5,
};

export default function LivePage() {
  const gateStatus = useIntroGate();

  if (gateStatus !== "allowed") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "#e2e8f0",
        }}
      >
        Cargando...
      </div>
    );
  }

  return <LivePageContent />;
}

function LivePageContent() {
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const bufferRef = useRef<ChartPoint[]>([]);
  const textBufferRef = useRef<string>("");
  const logsRef = useRef<string[]>([]);
  const alertFlagsRef = useRef<Record<string, boolean>>(
    GAS_KEYS.reduce((acc, gas) => {
      acc[gas] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const textDecoderRef = useRef<TextDecoder | null>(null);

  const alerts = useLiveStore((state) => state.alerts);
  const setAlerts = useLiveStore((state) => state.setAlerts);
  const setActiveAlerts = useLiveStore((state) => state.setActiveAlerts);
  const visibleGases = useLiveStore((state) => state.visibleGases);
  const resetAlertsState = useLiveStore((state) => state.resetAlertsState);
  const thresholds = useLiveStore((state) => state.thresholds);
  const alarmEnabled = useLiveStore((state) => state.alarmEnabled);
  const backendBlocked = useLiveStore((state) => state.backendBlocked);
  const incrementBackendFailure = useLiveStore((state) => state.incrementBackendFailure);
  const resetBackendFailure = useLiveStore((state) => state.resetBackendFailure);
  const backendFailures = useLiveStore((state) => state.backendFailures);

  const [data, setData] = useState<ChartPoint[]>([]);

  const maxTime = data.length ? data[data.length - 1].time : WINDOW_TIME;
  const minTime = Math.max(0, maxTime - WINDOW_TIME);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (logsRef.current.length === 0) return;

      const content = logsRef.current.join("\n") + "\n";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registro-alertas-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.txt`;
      a.click();

      URL.revokeObjectURL(url);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [alerts]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bufferRef.current.length > 0) {
        setData((prev) => {
          const combined = [...prev, ...bufferRef.current];
          bufferRef.current = [];
          const latestTime = combined.length ? combined[combined.length - 1].time : 0;
          const earliestTime = latestTime - WINDOW_TIME;
          return combined.filter((point) => point.time >= earliestTime);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const disconnectArduino = async () => {
    try {
      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
        } catch {
          // ignore cancel errors
        } finally {
          if (readerRef.current && (readerRef.current as any).releaseLock) {
            (readerRef.current as any).releaseLock();
          }
          readerRef.current = null;
        }
      }

      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }

      textDecoderRef.current = null;
      resetSimulation();
    } catch (err) {
      console.error("Error al desconectar:", err);
    }
  };

  useEffect(() => {
    const handleDisconnect = () => {
      void disconnectArduino();
    };

    window.addEventListener("trama:disconnect-arduino", handleDisconnect);
    return () => {
      window.removeEventListener("trama:disconnect-arduino", handleDisconnect);
    };
  }, [disconnectArduino]);

  const pushAlert = (timeStr: string, gas: string, value: number, thresholdVal: number) => {
    const item: AlertItem = { time: timeStr, gas, value, threshold: thresholdVal };

    const next = [...alerts, item];
    setAlerts(next);

    const line = `[${timeStr}] ALARMA → ${gas}: ${value} > ${thresholdVal}`;
    logsRef.current.push(line);
    try {
      localStorage.setItem("gasAlertLogs", JSON.stringify(logsRef.current));
    } catch {
      /* ignore */
    }

    toast.warning(`⚠️ ${gas} superó el umbral (${value.toFixed(0)} > ${thresholdVal})`, {
      position: "bottom-right",
    });
  };

  const downloadLogs = () => {
    if (logsRef.current.length === 0) {
      alert("No hay registros para descargar.");
      return;
    }

    const content = logsRef.current.join("\n") + "\n";
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `registro-alertas-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const sendMeasurements = useCallback(async (batch: MeasurementPayload[]) => {
    if (batch.length === 0 || backendBlocked) {
      return;
    }

    try {
      await fetch("http://localhost:3000/api/v1/measurements/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch),
      });
      resetBackendFailure();
    } catch (error) {
      console.error("Error enviando mediciones al backend:", error);
      incrementBackendFailure();
    }
  }, [backendBlocked, incrementBackendFailure, resetBackendFailure]);

  const readSerial = async (port: SerialPort) => {
    const readable = port.readable as ReadableStream<Uint8Array> | null;
    if (!readable) return;

    const reader = readable.getReader();
    readerRef.current = reader;
    const textDecoder = new TextDecoder();
    textDecoderRef.current = textDecoder;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        const chunkText = textDecoder.decode(value, { stream: true });
        textBufferRef.current += chunkText;
        const lines = textBufferRef.current.split("\n");
        textBufferRef.current = lines.pop() || "";

        const batch: MeasurementPayload[] = [];

        for (const line of lines) {
          const parts = line.trim().split(",");
          if (parts.length < 6) continue;

          const [
            millisStr,
            coStr,
            alStr,
            h2Str,
            ch4Str,
            lpgStr,
          ] = parts.map((segment) => segment.replace("\r", ""));

          const [millis, CO, AL, H2, CH4, LPG] = [
            Number(millisStr),
            Number(coStr),
            Number(alStr),
            Number(h2Str),
            Number(ch4Str),
            Number(lpgStr),
          ];

          void millis;

          if ([CO, AL, H2, CH4, LPG].some(Number.isNaN)) continue;

          const now = Date.now();
          const time = (now - (startTimeRef.current ?? now)) / 1000;
          const gases: Record<string, number> = { CO, AL, H2, CH4, LPG };

          Object.entries(gases).forEach(([gas, value]) => {
            const gasKey = gas as GasKey;
            const gasThreshold = thresholds[gasKey] ?? DEFAULT_THRESHOLD;
            const isAlarmEnabled = alarmEnabled[gasKey] !== false;
            const overThreshold = isAlarmEnabled && value > gasThreshold;

            if (overThreshold && !alertFlagsRef.current[gas]) {
              const timeStr = new Date().toLocaleString();
              pushAlert(timeStr, gas, value, gasThreshold);
              alertFlagsRef.current[gas] = true;
            }

            if ((!overThreshold || !isAlarmEnabled) && alertFlagsRef.current[gas]) {
              alertFlagsRef.current[gas] = false;
            }
          });

          const activeList: ActiveAlert[] = Object.entries(gases)
            .filter(([gas, value]) => {
              const gasKey = gas as GasKey;
              const gasThreshold = thresholds[gasKey] ?? DEFAULT_THRESHOLD;
              const isAlarmEnabled = alarmEnabled[gasKey] !== false;
              return isAlarmEnabled && value > gasThreshold;
            })
            .map(([gas, value]) => ({ gas, value }));

          setActiveAlerts(activeList);

          bufferRef.current.push({
            time,
            CO,
            AL,
            H2,
            CH4,
            LPG,
          });

          const timestamp = new Date().toISOString();
          const gasEntries: Array<[string, number]> = [
            ["CO", CO],
            ["AL", AL],
            ["H2", H2],
            ["CH4", CH4],
            ["LPG", LPG],
          ];

          for (const [gasKey, value] of gasEntries) {
            const gasId = GAS_ID_MAP[gasKey];
            if (!gasId) continue;

            const thresholdValue = thresholds[gasKey as GasKey] ?? DEFAULT_THRESHOLD;

            batch.push({
              id_type_gas: gasId,
              valor: value,
              fecha: timestamp,
              umbral: thresholdValue,
            });
          }
        }

        if (batch.length > 0) {
          void sendMeasurements(batch);
        }
      }
    } catch (err) {
      console.error("Error leyendo serial:", err);
    } finally {
      reader.releaseLock();
      if (readerRef.current === reader) {
        readerRef.current = null;
      }
    }
  };

  const connectArduino = async () => {
    try {
      resetSimulation();
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      portRef.current = port;
      startTimeRef.current = Date.now();
      readSerial(port);
    } catch (err) {
      console.error("Error al conectar Arduino:", err);
    }
  };

  const resetSimulation = () => {
    setData([]);
    bufferRef.current = [];
    textBufferRef.current = "";
    startTimeRef.current = Date.now();
    resetAlertsState();

    logsRef.current = [];
    try {
      localStorage.removeItem("gasAlerts");
      localStorage.removeItem("gasAlertLogs");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="w-[95%] grid place-items-center ">
      <div className="w-[95%]">
        <ControlPanel
          onDownloadLogs={downloadLogs}
          onConnectArduino={connectArduino}
          onDisconnectArduino={disconnectArduino}
          onResetSimulation={resetSimulation}
          isConnected={!!portRef.current}
          showDownloadButton={!backendBlocked || backendFailures >= 5}
        />

        <GasChart
          data={data}
          minTime={minTime}
          maxTime={maxTime}
          visibleGases={visibleGases}
        />

        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </div>
  );
}