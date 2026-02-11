import { useEffect, useState } from "react";

import tuercaIcon from "../../../assets/tuerca.svg";
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
  const measurementEnabled = useLiveStore((state) => state.measurementEnabled);
  const storeAllMeasurements = useLiveStore((state) => state.storeAllMeasurements);
  const updateThreshold = useLiveStore((state) => state.updateThreshold);
  const setAlarmEnabledForGas = useLiveStore((state) => state.setAlarmEnabledForGas);
  const setMeasurementEnabledForGas = useLiveStore((state) => state.setMeasurementEnabledForGas);
  const setStoreAllMeasurements = useLiveStore((state) => state.setStoreAllMeasurements);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localThresholds, setLocalThresholds] = useState(() => ({ ...thresholds }));
  const [localAlarmEnabled, setLocalAlarmEnabled] = useState(() => ({ ...alarmEnabled }));
  const [localMeasurementEnabled, setLocalMeasurementEnabled] = useState(() => ({ ...measurementEnabled }));
  const [localStoreAllMeasurements, setLocalStoreAllMeasurements] = useState(storeAllMeasurements);
  const [activeSection, setActiveSection] = useState<"thresholds" | "measurements">("thresholds");

  useEffect(() => {
    setLocalThresholds({ ...thresholds });
    setLocalAlarmEnabled({ ...alarmEnabled });
    setLocalMeasurementEnabled({ ...measurementEnabled });
    setLocalStoreAllMeasurements(storeAllMeasurements);
  }, [thresholds, alarmEnabled, measurementEnabled, storeAllMeasurements]);

  const handleOpenModal = () => {
    setLocalThresholds({ ...thresholds });
    setLocalAlarmEnabled({ ...alarmEnabled });
    setLocalMeasurementEnabled({ ...measurementEnabled });
    setLocalStoreAllMeasurements(storeAllMeasurements);
    setActiveSection("thresholds");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    GAS_KEYS.forEach((gas) => {
      updateThreshold(gas, localThresholds[gas]);
      setAlarmEnabledForGas(gas, localAlarmEnabled[gas]);
      setMeasurementEnabledForGas(gas, localMeasurementEnabled[gas]);
    });
    setStoreAllMeasurements(localStoreAllMeasurements);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trama:disconnect-arduino"));
    }

    setIsModalOpen(false);
  };

  const getTabButtonStyle = (isActive: boolean) => ({
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid #334155",
    background: isActive ? "linear-gradient(135deg, #38bdf8, #6366f1)" : "transparent",
    color: isActive ? "#0f172a" : "#e2e8f0",
    cursor: "pointer",
    fontWeight: isActive ? 700 : 500,
    transition: "all 0.2s ease",
  });

  return (
    <>
      <button
        type="button"
        title="Configurar parámetros"
        style={{
          maxWidth: 84,
          maxHeight: 38,
          borderRadius: "12%",
          border: "1px solid #334155",
          background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.2))",
          color: "#e2e8f0",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          transition: "all 0.2s ease",
        }}
        aria-label="Configurar parámetros"
        onClick={handleOpenModal}
      >
        <img src={tuercaIcon} alt="Configuración" width={20} height={20} />

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
              maxHeight: "95vh",
              background: "#0f172a",
              borderRadius: 16,
              border: "1px solid #1e293b",
              padding: "12px",
              paddingLeft: "24px",
              paddingRight: "24px",
              boxShadow: "0 20px 50px rgba(8,15,26,0.6)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{
                  display:"flex",
                  justifyContent:"space-between"
                }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4, display:"inline-block"  }}>Configuración avanzada</h2>
                <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  padding: "0",
                  border: "none",
                  margin: "0",
                  height: "30px",
                  width: "24px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
                </div>
                <p style={{ fontSize: "0.9rem", color: "#cbd5f5" }}>
                  Ajusta los umbrales o gestiona qué gases se envían al backend. Al confirmar se desconectará el
                  SDGM-PRO para aplicar los cambios.
                </p>
              </div>
            </header>

            <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button
                type="button"
                style={getTabButtonStyle(activeSection === "thresholds")}
                onClick={() => setActiveSection("thresholds")}
              >
                Umbrales
              </button>
              <button
                type="button"
                style={getTabButtonStyle(activeSection === "measurements")}
                onClick={() => setActiveSection("measurements")}
              >
                Mediciones
              </button>
            </nav>

            <div
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {activeSection === "thresholds" ? (
                <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginBottom: 0,
                    }}
                  >
                    <thead>
                      <tr style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "left" }}>
                        <th style={{ paddingBlock: 10 }}>Gas</th>
                        <th style={{ paddingBlock: 10 }}>Umbral (ppm)</th>
                        <th style={{ paddingBlock: 10 }}>Alerta visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GAS_KEYS.map((gas) => (
                        <tr key={gas} style={{ borderTop: "1px solid #1e293b" }}>
                          <td style={{ paddingBlock: 10 }}>
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
                              title="Mostrar/Ocultar Gases"
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
                                style={{ width: 14, height: 14, accentColor: "#38bdf8" }}
                              />
                              Mostrar alerta cuando supere el umbral
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16,  height: "400px"}}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #1e293b",
                      borderRadius: 12,
                      padding: "12px 16px",
                      background: "rgba(30, 41, 59, 0.65)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ color: "#e2e8f0", fontWeight: 600 }}>Guardar todas las mediciones</span>
                      <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                        Si está activo, se almacenarán incluso las mediciones que no superen el umbral.
                      </span>
                    </div>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#e2e8f0" }}>
                      <input
                        type="checkbox"
                        checked={localStoreAllMeasurements}
                        onChange={(event) => setLocalStoreAllMeasurements(event.target.checked)}
                        style={{ width: 16, height: 16, accentColor: "#38bdf8" }}
                      />
                      Guardar todas las mediciones
                    </label>
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ height: "100%", overflowY: "auto", paddingRight: 2 }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          marginBottom: 0,
                        }}
                      >
                        <thead>
                          <tr style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "left" }}>
                            <th style={{ paddingBlock: 12 }}>Gas</th>
                            <th style={{ paddingBlock: 12 }}>Enviar medición al backend</th>
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
                                <label
                                  title="Mostrar/Ocultar Gases"
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
                                    checked={localMeasurementEnabled[gas] ?? true}
                                    onChange={(event) => {
                                      const checked = event.target.checked;
                                      setLocalMeasurementEnabled((prev) => ({ ...prev, [gas]: checked }));
                                    }}
                                    style={{ width: 14, height: 14, accentColor: "#38bdf8" }}
                                  />
                                  Habilitar envío de medición
                                </label>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

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