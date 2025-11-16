import { useEffect, useState } from "react";

import { useLiveStore, DEFAULT_THRESHOLD, GAS_KEYS, type GasKey } from "../store";

const gasDisplayNames: Record<GasKey, string> = {
  CO: "Monóxido de Carbono",
  AL: "Alcohol",
  H2: "Hidrógeno",
  CH4: "Metano",
  LPG: "Gas Licuado",
};

export default function ThresholdControl() {
  const thresholds = useLiveStore((state) => state.thresholds);
  const alarmEnabled = useLiveStore((state) => state.alarmEnabled);
  const updateThreshold = useLiveStore((state) => state.updateThreshold);
  const setAlarmEnabledForGas = useLiveStore((state) => state.setAlarmEnabledForGas);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localThresholds, setLocalThresholds] = useState(() => ({ ...thresholds }));
  const [localAlarmEnabled, setLocalAlarmEnabled] = useState(() => ({ ...alarmEnabled }));

  useEffect(() => {
    setLocalThresholds({ ...thresholds });
    setLocalAlarmEnabled({ ...alarmEnabled });
  }, [thresholds, alarmEnabled]);

  const handleOpenModal = () => {
    setLocalThresholds({ ...thresholds });
    setLocalAlarmEnabled({ ...alarmEnabled });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    GAS_KEYS.forEach((gas) => {
      updateThreshold(gas, localThresholds[gas]);
      setAlarmEnabledForGas(gas, localAlarmEnabled[gas]);
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trama:disconnect-arduino"));
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        style={{
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "#e2e8f0",
          cursor: "pointer",
          fontWeight: 600,
          transition: "all 0.2s ease",
        }}
        onClick={handleOpenModal}
      >
        Configurar umbrales
      </button>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "min(90vw, 720px)",
              maxHeight: "90vh",
              background: "#0f172a",
              borderRadius: 16,
              border: "1px solid #1e293b",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(8,15,26,0.6)",
              overflow: "auto",
            }}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 4 }}>Umbrales por gas</h2>
                <p style={{ fontSize: "0.9rem", color: "#cbd5f5" }}>
                  Ajusta los valores límite y las alertas visuales. Al confirmar se desconectará el Arduino.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 24,
              }}
            >
              <thead>
                <tr style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "left" }}>
                  <th style={{ paddingBlock: 12 }}>Gas</th>
                  <th style={{ paddingBlock: 12 }}>Umbral (ppm)</th>
                  <th style={{ paddingBlock: 12 }}>Alerta visual</th>
                </tr>
              </thead>
              <tbody>
                {GAS_KEYS.map((gas) => (
                  <tr key={gas} style={{ borderTop: "1px solid #1e293b" }}>
                    <td style={{ paddingBlock: 12 }}>
                      <strong style={{ color: "#e2e8f0" }}>{gasDisplayNames[gas]}</strong>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{gas}</div>
                    </td>
                    <td style={{ paddingBlock: 12 }}>
                      <input
                        type="number"
                        min={1}
                        value={localThresholds[gas] ?? DEFAULT_THRESHOLD}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value);
                          setLocalThresholds((prev) => ({
                            ...prev,
                            [gas]: Number.isFinite(nextValue) && nextValue > 0 ? nextValue : DEFAULT_THRESHOLD,
                          }));
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid #334155",
                          background: "#1e293b",
                          color: "#e2e8f0",
                        }}
                      />
                    </td>
                    <td style={{ paddingBlock: 12 }}>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          color: "#e2e8f0",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={localAlarmEnabled[gas] ?? true}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setLocalAlarmEnabled((prev) => ({ ...prev, [gas]: checked }));
                          }}
                          style={{ width: 18, height: 18, accentColor: "#38bdf8" }}
                        />
                        Mostrar alerta cuando supere el umbral
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <footer
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "transparent",
                  color: "#e2e8f0",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                  color: "#0f172a",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Guardar cambios
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}