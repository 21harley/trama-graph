import { gasColors } from "./GasChart";
import { useLiveStore } from "../store";

const gasNames: Record<string, string> = {
  CO: "Monóxido de Carbono",
  AL: "Alcohol",
  H2: "Hidrógeno",
  CH4: "Metano",
  LPG: "Gas Licuado",
};

export default function GasVisibilityPanel() {
  const visibleGases = useLiveStore((s) => s.visibleGases);
  const toggleGasVisibility = useLiveStore((s) => s.toggleGasVisibility);

  return (
    <div
      style={{
        padding: 0,
        borderRadius: 12,
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: 4,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(gasNames).map(([gas, name]) => (
            <label
            title="Mostrar/Ocultar Gases"
              key={gas}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                fontSize: 14,
                padding: "4px 6px",
                borderRadius: 8,
                backgroundColor: visibleGases[gas]
                  ? `${gasColors[gas]}15`
                  : "transparent",
                border: `1px solid ${
                  visibleGases[gas] ? gasColors[gas] : "#e0e0e0"
                }`,
                transition: "all 0.2s ease",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${gasColors[gas]}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = visibleGases[gas]
                  ? `${gasColors[gas]}15`
                  : "transparent";
              }}
            >
              <input
                type="checkbox"
                checked={visibleGases[gas]}
                onChange={() => toggleGasVisibility(gas)}
                style={{
                  width: 14,
                  height: 14,
                  cursor: "pointer",
                  accentColor: gasColors[gas],
                  transform: "scale(1.2)",
                }}
              />
              <span
                style={{
                  color: gasColors[gas],
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {name} ({gas})
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
