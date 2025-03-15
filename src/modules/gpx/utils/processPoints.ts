import { ChartPoint } from "@/modules/chart/interface";
import { GPXPoint } from "@/modules/gpx/interface";

// Calcul de la distance entre deux coordonnées via la formule de Haversine
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calcul et enrichissement des points pour le graphe (distance cumulée, vitesse, pente)
export function processPoints(points: GPXPoint[]): ChartPoint[] {
  const chartData: ChartPoint[] = [];
  let cumulativeDistance = 0;
  for (let i = 0; i < points.length; i++) {
    if (i > 0) {
      const prev = points[i - 1];
      const curr = points[i];
      // Distance entre les deux points (en km)
      const d = haversineDistance(prev.lat, prev.lon, curr.lat, curr.lon);
      cumulativeDistance += d;
      // Calcul de la vitesse : km/h
      const prevTime = prev.time ? new Date(prev.time).getTime() : 0;
      const currTime = curr.time ? new Date(curr.time).getTime() : 0;
      const timeDiffHours = (currTime - prevTime) / (1000 * 3600);
      const speed = timeDiffHours > 0 ? d / timeDiffHours : 0;
      // Calcul de la pente en % (variation d'altitude / distance horizontale)
      const altitudeDiff = (curr.ele ?? 0) - (prev.ele ?? 0);
      const horizontalDistanceMeters = d * 1000;
      const slope =
        horizontalDistanceMeters > 0
          ? (altitudeDiff / horizontalDistanceMeters) * 100
          : 0;

      chartData.push({
        ...curr,
        cumulativeDistance,
        speed,
        slope,
      });
    } else {
      chartData.push({
        ...points[i],
        cumulativeDistance: 0,
        speed: 0,
        slope: 0,
      });
    }
  }
  return chartData;
}
