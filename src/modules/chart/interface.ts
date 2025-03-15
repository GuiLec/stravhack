import { GPXPoint } from "@/modules/gpx/interface";

export interface ChartPoint extends GPXPoint {
  cumulativeDistance: number; // en km
  speed: number; // km/h
  slope: number; // en pourcentage
}
