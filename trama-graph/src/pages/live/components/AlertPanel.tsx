import type { ActiveAlert } from "./../types";
import { gasColors } from "./GasChart";

interface AlertPanelProps {
  activeAlerts: ActiveAlert[];
  visibleGases: Record<string, boolean>;
  onToggleGasVisibility: (gas: string) => void;
}

const gasNames: Record<string, string> = {
  CO: "Monóxido de Carbono",
  AL: "Alcohol",
  H2: "Hidrógeno",
  CH4: "Metano",
  LPG: "Gas Licuado",
};

export default function AlertPanel({ 
  activeAlerts, 
  visibleGases, 
  onToggleGasVisibility 
}: AlertPanelProps) {
  return (
    <div style={{ 
      marginTop: 20, 
      padding: 0,
      borderRadius: 12,
    }}>
      <div>
        <h3 style={{ 
          marginBottom: 16, 
          fontSize: '1.2rem',
          fontWeight: 600
        }}>
          Mostrar/Ocultar Gases:
        </h3>
        <div style={{ 
          display: "flex", 
          gap: "12px",
          marginTop: 8 
        }}>
          {Object.entries(gasNames).map(([gas, name]) => (
            <label
              key={gas}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                fontSize: 14,
                padding: "8px 12px",
                borderRadius: 8,
                backgroundColor: visibleGases[gas] ? `${gasColors[gas]}15` : 'transparent',
                border: `1px solid ${visibleGases[gas] ? gasColors[gas] : '#e0e0e0'}`,
                transition: 'all 0.2s ease',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${gasColors[gas]}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = visibleGases[gas] ? `${gasColors[gas]}15` : 'transparent';
              }}
            >
              <input
                type="checkbox"
                checked={visibleGases[gas]}
                onChange={() => onToggleGasVisibility(gas)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: "pointer",
                  accentColor: gasColors[gas],
                  transform: 'scale(1.2)',
                }}
              />
              <span style={{ 
                color: gasColors[gas], 
                fontWeight: 600,
                fontSize: '14px'
              }}>
                {name} ({gas})
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {activeAlerts.length > 0 && (
        <div style={{ 
          marginTop: 24,
          borderRadius: 8,
        }}>
          <h3 style={{ 
            marginBottom: 12, 
            fontSize: '1.1rem',
            fontWeight: 600
          }}>
            ⚠️ Gases sobre el umbral:
          </h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px" 
          }}>
            {activeAlerts.map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: `${gasColors[a.gas]}15`,
                borderRadius: 6,
                border: `1px solid ${gasColors[a.gas]}30`
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: gasColors[a.gas]
                }}></div>
                <span style={{ 
                  color: gasColors[a.gas], 
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  <strong>{a.gas}</strong>: {a.value.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}