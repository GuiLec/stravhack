import { ChartPoint } from "@/modules/chart/interface";
import { Stats } from "@/modules/stats/interface";

export const computeStats = (data: ChartPoint[]): Stats => {
  if (data.length < 2) {
    return { duration: 0, distance: 0, avgHR: 0, avgSpeed: 0 };
  }
  const startTime = new Date(data[0].time!).getTime();
  const endTime = new Date(data[data.length - 1].time!).getTime();
  const duration = (endTime - startTime) / 1000; // seconds
  const distance =
    data[data.length - 1].cumulativeDistance - data[0].cumulativeDistance;
  const avgHR = data.reduce((sum, p) => sum + (p.hr || 0), 0) / data.length;
  const avgSpeed = data.reduce((sum, p) => sum + p.speed, 0) / data.length;
  return { duration, distance, avgHR, avgSpeed };
};
