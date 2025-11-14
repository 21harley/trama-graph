/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AppDeviceInfo } from "../../core/types.ts";
import { GAS_KEYS, type ActiveAlert, type AlertItem, type ChartPoint, type GasKey } from "./types.ts";
import "./live.css";

const WINDOW_TIME = 30;
const DEFAULT_THRESHOLD = 20000;

const GAS_COLORS: Record<GasKey, string> = {
  CO: "#ff0000",
  AL: "#00bfff",
  H2: "#00ff00",
  CH4: "#ffa500",
  LPG: "#800080",
};

const createGasSelection = (value: boolean): Record<GasKey, boolean> => {
  const map = {} as Record<GasKey, boolean>;
  GAS_KEYS.forEach((gas) => {
    map[gas] = value;
  });
  return map;
};

const formatHex = (value: number | undefined) =>
  value !== undefined ? `0x${value.toString(16).toUpperCase().padStart(4, "0")}` : undefined;

const formatPortId = (info: SerialPortInfo | undefined): string => {
  if (!info) return "Puerto serial";
  if (info.serialNumber) return info.serialNumber;
  const vendor = formatHex(info.usbVendorId);
  const product = formatHex(info.usbProductId);
  if (vendor || product) {
    return [vendor && `VID ${vendor}`, product && `PID ${product}`].filter(Boolean).join(" / ");
  }
  return "Puerto serial";
};

export default function LivePage() {
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const bufferRef = useRef<ChartPoint[]>([]);
  const textBufferRef = useRef<string>("");
  const logsRef = useRef<string[]>([]);
  const alertFlagsRef = useRef<Record<GasKey, boolean>>(createGasSelection(false));

  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("gasThreshold");
    return saved ? Number(saved) : DEFAULT_THRESHOLD;
  });
  const [pendingThreshold, setPendingThreshold] = useState<number>(threshold);
  const [data, setData] = useState<ChartPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem("gasAlerts");
    return saved ? (JSON.parse(saved) as AlertItem[]) : [];
  });
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedGases, setSelectedGases] = useState<Record<GasKey, boolean>>(() => createGasSelection(true));
  const [deviceInfo, setDeviceInfo] = useState<AppDeviceInfo | null>(null);

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
      a.download = `registro-alertas-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [alerts]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bufferRef.current.length === 0) {
        return;
      }

      setData((prev) => {
        const combined = [...prev, ...bufferRef.current];
        bufferRef.current = [];

        const latestTime = combined.length ? combined[combined.length - 1].time : 0;
        const earliestTime = latestTime - WINDOW_TIME;
        return combined.filter((point) => point.time >= earliestTime);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const pushAlert = (timeStr: string, gas: GasKey, value: number, thresholdVal: number) => {
    const item: AlertItem = { time: timeStr, gas, value, threshold: thresholdVal };
    setAlerts((prev) => {
      const next = [...prev, item];
      try {
        localStorage.setItem("gasAlerts", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    const line = `[${timeStr}] ALARMA → ${gas}: ${value} > ${thresholdVal}`;
    logsRef.current.push(line);
    try {
      localStorage.setItem("gasAlertLogs", JSON.stringify(logsRef.current));
    } catch {
      /* ignore */
    }
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
    a.download = `registro-alertas-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const readSerial = async (port: SerialPort) => {
    const textDecoder = new TextDecoderStream();
    const readable = port.readable as ReadableStream<Uint8Array> | null;
    if (readable) {
      readable
        .pipeTo(textDecoder.writable as WritableStream<Uint8Array>)
        .catch((err) => console.error("Error en tubería serial:", err));
    }
    const reader = textDecoder.readable.getReader();
    readerRef.current = reader;

    startTimeRef.current = startTimeRef.current ?? Date.now();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        textBufferRef.current += value;
        const lines = textBufferRef.current.split("\n");
        textBufferRef.current = lines.pop() || "";

        for (const line of lines) {
          const parts = line.trim().split(",");
          if (parts.length < GAS_KEYS.length + 1) continue;

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

          if ([CO, AL, H2, CH4, LPG].some(Number.isNaN)) continue;

          const now = Date.now();
          const startedAt = startTimeRef.current ?? now;
          const time = Number.isFinite(millis) && !Number.isNaN(millis)
            ? millis / 1000
            : (now - startedAt) / 1000;

          const gases: Record<GasKey, number> = { CO, AL, H2, CH4, LPG };
          const currentlyActive: ActiveAlert[] = [];

          GAS_KEYS.forEach((gas) => {
            const value = gases[gas];
            const overThreshold = value > threshold;

            if (overThreshold && !alertFlagsRef.current[gas]) {
              const timeStr = new Date().toLocaleString();
              pushAlert(timeStr, gas, value, threshold);
              alertFlagsRef.current[gas] = true;
            }

            if (!overThreshold && alertFlagsRef.current[gas]) {
              alertFlagsRef.current[gas] = false;
            }

            if (overThreshold) {
              currentlyActive.push({ gas, value });
            }
          });

          setActiveAlerts(currentlyActive);

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
    }
  };

  const connectArduino = async () => {
    try {
      const port = await navigator.serial.requestPort();
      const info = port.getInfo?.();
      setDeviceInfo({
        portId: formatPortId(info),
        productName: info?.usbProductName ?? undefined,
      });
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      startTimeRef.current = Date.now();
      setIsConnected(true);
      void readSerial(port);
    } catch (err) {
      console.error("Error al conectar Arduino:", err);
    }
  };

  const disconnectArduino = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (err) {
      console.error("Error al desconectar:", err);
    } finally {
      setIsConnected(false);
      setDeviceInfo(null);
    }
  };

  const resetSimulation = () => {
    setData([]);
    bufferRef.current = [];
    textBufferRef.current = "";
    startTimeRef.current = Date.now();
    setAlerts([]);
    setActiveAlerts([]);
    logsRef.current = [];
    alertFlagsRef.current = { ...createGasSelection(false) };
    setSelectedGases(createGasSelection(true));
    try {
      localStorage.removeItem("gasAlerts");
      localStorage.removeItem("gasAlertLogs");
    } catch {
      /* ignore */
    }
  };

  const updateThreshold = () => {
    setThreshold(pendingThreshold);
    localStorage.setItem("gasThreshold", String(pendingThreshold));
  };

  const handleThresholdSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (threshold !== pendingThreshold) {
      updateThreshold();
    }
  };

  const toggleGas = (gas: GasKey) => {
    setSelectedGases((prev) => ({
      ...prev,
      [gas]: !prev[gas],
    }));
  };

  const renderStatus = () => {
    if (!isConnected) {
      return "Sin conexión";
    }

    const portLabel = deviceInfo?.portId ?? "Puerto serial";
    const productLabel = deviceInfo?.productName;
    return productLabel ? `${portLabel} · ${productLabel}` : portLabel;
  };

  const showSinglePoint = data.length <= 1;
  const filteredGases = GAS_KEYS.filter((gas) => selectedGases[gas]);

  return (
    <div className="live-container">
      <section className="live-chart-area">
        <div className="live-chart-card">
          {activeAlerts.length > 0 && (
            <section className="active-alerts">
              <h3>⚠️ Gases sobre el umbral</h3>
              <ul>
                {activeAlerts.map((alert, index) => (
                  <li key={`${alert.gas}-${index}`}>
                    <span className="gas-name">{alert.gas}</span>
                    <span className="gas-value">{alert.value.toFixed(0)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="live-chart">
            <div className="live-chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 12, right: 24, bottom: 12, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={[minTime, maxTime]}
                    tickFormatter={(t) => `${t.toFixed(1)}s`}
                    stroke="#94a3b8"
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value: number) => value.toFixed(0)}
                    labelFormatter={(label) => `${label.toFixed(1)} s`}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: 12,
                      border: "1px solid rgba(148,163,184,0.2)",
                    }}
                  />
                  <Legend />
                  {filteredGases.map((gas) => (
                    <Line
                      key={gas}
                      type="monotone"
                      dataKey={gas}
                      stroke={GAS_COLORS[gas]}
                      dot={showSinglePoint}
                      isAnimationActive={false}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="live-chart-checkboxes">
              {GAS_KEYS.map((gas) => (
                <label key={gas} className="live-toggle">
                  <input
                    type="checkbox"
                    checked={selectedGases[gas]}
                    onChange={() => toggleGas(gas)}
                    disabled={!isConnected && data.length === 0}
                  />
                  {gas}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="live-bottom-panel">
        <div className="live-actions-row">
          <span className={`live-status${isConnected ? "" : " live-status-inactive"}`}>{renderStatus()}</span>

          <div className="live-actions-group">
            <button className="download-button" onClick={downloadLogs}>
              Descargar registro
            </button>
            <button onClick={portRef.current ? disconnectArduino : connectArduino}>
              {portRef.current ? "Desconectar Arduino" : "Conectar Arduino"}
            </button>
            <button onClick={resetSimulation}>Reiniciar</button>
          </div>
        </div>

        <section className="threshold-section">
          <p style={{ margin: "0 0 8px", color: "#cbd5f5", fontWeight: 500 }}>Valor máximo permitido</p>
          <form onSubmit={handleThresholdSubmit}>
            <input
              type="number"
              value={pendingThreshold}
              onChange={(event) => setPendingThreshold(Number(event.target.value))}
            />
            <button type="submit" disabled={threshold === pendingThreshold}>
              Actualizar umbral
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
