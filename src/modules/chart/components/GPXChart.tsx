import { CustomTooltip } from "@/modules/chart/components/CustomTooltip";
import { ChartPoint } from "@/modules/chart/interface";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  CartesianGrid,
  Legend,
  Area,
} from "recharts";

interface GPXChartProps {
  chartData: ChartPoint[];
  xAxisMode: string;
  handleBrushChange: (brush: {
    startIndex?: number;
    endIndex?: number;
  }) => void;
  brushStartIndex?: number;
  brushEndIndex?: number;
}

export const GPXChart = ({
  chartData,
  xAxisMode,
  handleBrushChange,
  brushStartIndex,
  brushEndIndex,
}: GPXChartProps) => {
  return (
    <ComposedChart width={800} height={400} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey={xAxisMode === "time" ? "time" : "cumulativeDistance"}
        tickFormatter={(value) =>
          xAxisMode === "time"
            ? new Date(value).toLocaleTimeString()
            : value.toFixed(2)
        }
      />
      <YAxis
        yAxisId="left"
        label={{
          value: "HR",
          angle: -90,
          position: "insideLeft",
        }}
      />
      <YAxis
        yAxisId="right"
        orientation="right"
        label={{ value: "Vitesse", angle: 90, position: "insideRight" }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="hr"
        name="HR"
        stroke="#ff7300"
        dot={false}
      />
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="speed"
        name="Vitesse"
        stroke="#387908"
        dot={false}
      />
      <Area
        yAxisId="left"
        type="monotone"
        dataKey="ele"
        name="Altitude"
        stroke="none"
        fill="rgba(211,211,211,0.5)"
        dot={false}
      />
      <Brush
        dataKey={xAxisMode === "time" ? "time" : "cumulativeDistance"}
        height={30}
        stroke="#8884d8"
        onChange={handleBrushChange}
        startIndex={brushStartIndex}
        endIndex={brushEndIndex}
      />
    </ComposedChart>
  );
};
