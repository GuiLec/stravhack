import React from "react";
import { Stats } from "@/modules/stats/interface";
import { Typography } from "@mui/material";

interface Props {
  stats: Stats;
  decrementHR: () => void;
  incrementHR: () => void;
  incrementSpeed: () => void;
  decrementSpeed: () => void;
  activityStartDate: string;
  setActivityStartDate: (value: string) => void;
  updateActivityStartDate: (newDate: Date) => void;
}

export const StatsSection = ({
  stats,
  incrementHR,
  decrementHR,
  incrementSpeed,
  decrementSpeed,
  activityStartDate,
  setActivityStartDate,
  updateActivityStartDate,
}: Props) => (
  <div style={{ marginTop: "20px" }}>
    <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
      {"Joue à modifier ta sortie !"}
    </Typography>
    <table
      style={{
        width: "100%",
        maxWidth: "800px",
        borderCollapse: "collapse",
        tableLayout: "fixed",
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "8px", fontWeight: "bold" }}>
            {" Début de l'activité"}
          </td>
          <td style={{ padding: "8px", textAlign: "center" }}>
            <input
              type="datetime-local"
              value={activityStartDate}
              onChange={(e) => setActivityStartDate(e.target.value)}
            />
          </td>
          <td style={{ padding: "8px", textAlign: "center" }}>
            <button
              onClick={() =>
                updateActivityStartDate(new Date(activityStartDate))
              }
              style={{
                padding: "5px 10px",
                fontSize: "1rem",
              }}
            >
              {"Mettre à jour la date"}
            </button>
          </td>
        </tr>
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
              onClick={decrementSpeed}
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
              onClick={incrementSpeed}
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
