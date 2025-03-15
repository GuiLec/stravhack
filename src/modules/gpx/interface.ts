export interface GPXPoint {
  lat: number;
  lon: number;
  ele: number | null;
  time: string | null;
  atemp: number | null;
  hr: number | null;
  cad: number | null;
}
