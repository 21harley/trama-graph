/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const WINDOW_TIME = 30;

type ChartPoint = {
  time: number;
  CO: number;
  AL: number;
  H2: number;
  CH4: number;
  LPG: number;
};

type AlertItem = { time: string; gas: string; value: number; threshold: number };

type ActiveAlert = { gas: string; value: number };

const DEFAULT_THRESHOLD = 20000;

export default function LivePage() {
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
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

  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("gasThreshold");
    return saved ? Number(saved) : DEFAULT_THRESHOLD;
  });
  const [data, setData] = useState<ChartPoint[]>([]);
  const [pendingThreshold, setPendingThreshold] = useState<number>(threshold);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem("gasAlerts");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);

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
    a.download = `registro-alertas-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.txt`;
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
          const currentlyActive: ActiveAlert[] = [];

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
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      startTimeRef.current = Date.now();
      readSerial(port);
    } catch (err) {
      console.error("Error al conectar SDGM-PRO:", err);
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-start", width: "100%", paddingTop: "20px" }}>
        <button onClick={downloadLogs} style={{ marginLeft: 20 }}>
          Descargar registro
        </button>
      </div>

      <div style={{ display: "flex flex-col", marginLeft: 20 }}>
        <div style={{ paddingBlock: "20px", display: "flex", flexDirection: "column" }}>
          <label>Valor máximo permitido:</label>
          <div>
            <input
              style={{ maxWidth: "80px", padding: "10px", marginRight: 10 }}
              type="number"
              value={pendingThreshold}
              onChange={(e) => setPendingThreshold(Number(e.target.value))}
            />
            <button disabled={threshold === pendingThreshold} onClick={updateThreshold}>
              Actualizar umbral
            </button>
          </div>
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <div style={{ marginLeft: 20 }}>
          <h3>⚠️ Gases sobre el umbral:</h3>
          <ul>
            {activeAlerts.map((a, i) => (
              <li key={i}>
                <strong>{a.gas}</strong>: {a.value.toFixed(0)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginLeft: 20, marginBottom: 20 }}>
        <button onClick={portRef.current ? disconnectArduino : connectArduino}>
          {portRef.current ? "Desconectar SDGM-PRO" : "Conectar SDGM-PRO"}
        </button>

        <button style={{ marginLeft: 10 }} onClick={resetSimulation}>
          Reiniciar
        </button>
      </div>

      <div>
        <LineChart width={1200} height={600} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" type="number" domain={[minTime, maxTime]} tickFormatter={(t) => `${t.toFixed(1)}s`} />
          <YAxis />
          <Tooltip formatter={(value: any) => value.toFixed(0)} labelFormatter={(label) => `${label.toFixed(1)} s`} />
          <Legend />
          <Line type="monotone" dataKey="CO" stroke="#ff0000" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="AL" stroke="#00bfff" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="H2" stroke="#00ff00" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="CH4" stroke="#ffa500" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="LPG" stroke="#800080" dot={false} isAnimationActive={false} />
        </LineChart>
      </div>
    </div>
  );
}
