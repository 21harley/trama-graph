/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import GasChart from "./components/GasChart";
import ControlPanel from "./components/ControlPanel";
import GasVisibilityPanel from "./components/GasVisibilityPanel";
import ActiveAlertsPanel from "./components/ActiveAlertsPanel";
import ThresholdControl from "./components/ThresholdControl";
import { useLiveStore } from "./store";
import type { ChartPoint, AlertItem, ActiveAlert } from "./types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WINDOW_TIME = 30;

export default function LivePage() {
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const bufferRef = useRef<ChartPoint[]>([]);
  const textBufferRef = useRef<string>("");
  const logsRef = useRef<string[]>([]);
  const alertFlagsRef = useRef<Record<string, boolean>>({
    CO: false,
    AL: false,
    H2: false,
    CH4: false,
    LPG: false,
  });
  const textDecoderRef = useRef<TextDecoder | null>(null);

  const threshold = useLiveStore((state) => state.threshold);
  const alerts = useLiveStore((state) => state.alerts);
  const setAlerts = useLiveStore((state) => state.setAlerts);
  const setActiveAlerts = useLiveStore((state) => state.setActiveAlerts);
  const visibleGases = useLiveStore((state) => state.visibleGases);
  const resetAlertsState = useLiveStore((state) => state.resetAlertsState);

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
            const overThreshold = value > threshold;

            if (overThreshold && !alertFlagsRef.current[gas]) {
              const timeStr = new Date().toLocaleString();
              pushAlert(timeStr, gas, value, threshold);
              alertFlagsRef.current[gas] = true;
            }

            if (!overThreshold && alertFlagsRef.current[gas]) {
              alertFlagsRef.current[gas] = false;
            }
          });

          const activeList: ActiveAlert[] = Object.entries(gases)
            .filter(([, value]) => value > threshold)
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
    <div className="w-[100%] grid place-items-center ">
      <div className="w-[95%]">
        <ControlPanel
          onDownloadLogs={downloadLogs}
          onConnectArduino={connectArduino}
          onDisconnectArduino={disconnectArduino}
          onResetSimulation={resetSimulation}
          isConnected={!!portRef.current}
        />

        <GasChart
          data={data}
          minTime={minTime}
          maxTime={maxTime}
          visibleGases={visibleGases}
        />
        
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
         <ThresholdControl /> 
        <GasVisibilityPanel />
        </div>

        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </div>
  );
}