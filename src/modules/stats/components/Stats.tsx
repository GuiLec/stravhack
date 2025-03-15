import React from "react";
import { Stats } from "@/modules/stats/interface";

interface Props {
  stats: Stats;
  decrementHR: () => void;
  incrementHR: () => void;
}

export const StatsSection = ({ stats, incrementHR, decrementHR }: Props) => (
  <div style={{ marginTop: "20px" }}>
    <h3>Statistiques de la sélection</h3>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "8px", fontWeight: "bold" }}>Durée</td>
          <td style={{ padding: "8px", textAlign: "center" }}>
            {stats.duration} secondes
          </td>
          <td style={{ padding: "8px" }} />
        </tr>
        <tr>
          <td style={{ padding: "8px", fontWeight: "bold" }}>Distance</td>
          <td style={{ padding: "8px", textAlign: "center" }}>
            {stats.distance.toFixed(2)} km
          </td>
          <td style={{ padding: "8px" }} />
        </tr>
        <tr>
          <td style={{ padding: "8px", fontWeight: "bold" }}>HR moyen</td>
          <td style={{ padding: "8px", textAlign: "center" }}>
            {stats.avgHR.toFixed(2)} bpm
          </td>
          <td style={{ padding: "8px", textAlign: "center" }}>
            <button
              onClick={decrementHR}
              style={{
                marginRight: "5px",
                width: "30px",
                height: "30px",
                verticalAlign: "middle",
              }}
            >
              -
            </button>
            <button
              onClick={incrementHR}
              style={{
                width: "30px",
                height: "30px",
                verticalAlign: "middle",
              }}
            >
              +
            </button>
          </td>
        </tr>
        <tr>
          <td style={{ padding: "8px", fontWeight: "bold" }}>
            Vitesse moyenne
          </td>
          <td style={{ padding: "8px", textAlign: "center" }}>
            {stats.avgSpeed.toFixed(2)} km/h
          </td>
          <td style={{ padding: "8px", textAlign: "center" }}>
            <button
              style={{
                marginRight: "5px",
                width: "30px",
                height: "30px",
                verticalAlign: "middle",
              }}
            >
              -
            </button>
            <button
              style={{
                width: "30px",
                height: "30px",
                verticalAlign: "middle",
              }}
            >
              +
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
