import type { Stats } from "@/modules/stats/interface";

interface Props {
  stats: Stats;
}
export const StatsSection = ({ stats }: Props) => (
  <div style={{ marginTop: "20px" }}>
    <h3>Statistiques de la sélection</h3>
    <p>Durée : {stats.duration} secondes</p>
    <p>Distance : {stats.distance.toFixed(2)} km</p>
    <p>HR moyen : {stats.avgHR.toFixed(2)} bpm</p>
    <p>Vitesse moyenne : {stats.avgSpeed.toFixed(2)} km/h</p>
  </div>
);
