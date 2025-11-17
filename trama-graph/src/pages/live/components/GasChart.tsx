import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import GasVisibilityPanel from "./GasVisibilityPanel";
import ThresholdControl from "./ThresholdControl";

interface GasChartProps {
  data: any[];
  minTime: number;
  maxTime: number;
  visibleGases: Record<string, boolean>;
}

export const gasColors: Record<string, string> = {
  CO: "#ff0000",
  AL: "#00bfff",
  H2: "#00ff00",
  CH4: "#ffa500",
  LPG: "#800080",
};

export default function GasChart({ data, minTime, maxTime, visibleGases }: GasChartProps) {
  return (
    <div
      style={{
        marginLeft: 20,
        width: "90%",
        height: "45%",
        display: "grid",
        placeItems: "center",
        marginTop: "20px",
      }}
    >
      <ResponsiveContainer width="100%" aspect={3.5}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            type="number" 
            domain={[minTime, maxTime]} 
            tickFormatter={(t) => `${t.toFixed(1)}s`} 
          />
          <YAxis />
          <Tooltip 
            formatter={(value: any) => value.toFixed(0)} 
            labelFormatter={(label) => `${label.toFixed(1)} s`} 
          />
          <Legend />
          
          {visibleGases.CO && (
            <Line 
              type="monotone" 
              dataKey="CO" 
              stroke={gasColors.CO} 
              dot={false} 
              isAnimationActive={false} 
            />
          )}
          
          {visibleGases.AL && (
            <Line 
              type="monotone" 
              dataKey="AL" 
              stroke={gasColors.AL} 
              dot={false} 
              isAnimationActive={false} 
            />
          )}
          
          {visibleGases.H2 && (
            <Line 
              type="monotone" 
              dataKey="H2" 
              stroke={gasColors.H2} 
              dot={false} 
              isAnimationActive={false} 
            />
          )}
          
          {visibleGases.CH4 && (
            <Line 
              type="monotone" 
              dataKey="CH4" 
              stroke={gasColors.CH4} 
              dot={false} 
              isAnimationActive={false} 
            />
          )}
          
          {visibleGases.LPG && (
            <Line 
              type="monotone" 
              dataKey="LPG" 
              stroke={gasColors.LPG} 
              dot={false} 
              isAnimationActive={false} 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent:"center" }}>
          <ThresholdControl />
          <GasVisibilityPanel />
        </div>
    </div>
  );
}