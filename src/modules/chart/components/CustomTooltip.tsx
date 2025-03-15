import { ChartPoint } from "@/modules/chart/interface";
import { TooltipProps } from "recharts";

export const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const point: ChartPoint = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <p>Temps : {point.time}</p>
        <p>Distance : {point.cumulativeDistance.toFixed(2)} km</p>
        <p>Altitude : {point.ele} m</p>
        <p>Pente : {point.slope.toFixed(2)} %</p>
        <p>Vitesse : {point.speed.toFixed(2)} km/h</p>
        <p>HR : {point.hr} bpm</p>
      </div>
    );
  }
  return null;
};
