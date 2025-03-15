"use client";
import { GPXChart } from "@/modules/chart/components/GPXChart";
import { ChartPoint } from "@/modules/chart/interface";
import { parseGPX } from "@/modules/gpx/utils/parseGPX";
import { processPoints } from "@/modules/gpx/utils/processPoints";
import React, { useState } from "react";

interface Stats {
  duration: number; // en secondes
  distance: number; // en km
  avgHR: number;
  avgSpeed: number;
}

export const GPXReader = () => {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [xAxisMode, setXAxisMode] = useState<"time" | "distance">("time");
  const [stats, setStats] = useState<Stats | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".gpx")) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const xmlText = e.target?.result as string;
        const parsedPoints = parseGPX(xmlText);
        const processedData = processPoints(parsedPoints);
        setChartData(processedData);
        console.log("Données traitées :", processedData);
      };
      reader.readAsText(file);
    } else {
      alert("Veuillez sélectionner un fichier GPX valide.");
    }
  };

  const toggleXAxisMode = () => {
    setXAxisMode(xAxisMode === "time" ? "distance" : "time");
  };

  const handleBrushChange = (brush: {
    startIndex?: number;
    endIndex?: number;
  }) => {
    if (brush && brush.startIndex != null && brush.endIndex != null) {
      const selected = chartData.slice(brush.startIndex, brush.endIndex + 1);
      if (selected.length > 1) {
        const startTime = new Date(selected[0].time!).getTime();
        const endTime = new Date(selected[selected.length - 1].time!).getTime();
        const duration = (endTime - startTime) / 1000; // en secondes
        const distance =
          selected[selected.length - 1].cumulativeDistance -
          selected[0].cumulativeDistance;
        const avgHR =
          selected.reduce((sum, p) => sum + (p.hr || 0), 0) / selected.length;
        const avgSpeed =
          selected.reduce((sum, p) => sum + p.speed, 0) / selected.length;
        setStats({
          duration,
          distance,
          avgHR,
          avgSpeed,
        });
      }
    }
  };

  return (
    <div>
      <h2>Parser et visualiser un fichier GPX</h2>
      <input type="file" accept=".gpx" onChange={handleFileChange} />
      {chartData.length > 0 && (
        <>
          <button onClick={toggleXAxisMode}>
            {`Afficher l'axe en ${xAxisMode === "time" ? "distance" : "temps"}`}
          </button>
          <GPXChart
            chartData={chartData}
            xAxisMode={xAxisMode}
            handleBrushChange={handleBrushChange}
          />
          {stats && (
            <div style={{ marginTop: "20px" }}>
              <h3>Statistiques de la sélection</h3>
              <p>Durée : {stats.duration} secondes</p>
              <p>Distance : {stats.distance.toFixed(2)} km</p>
              <p>HR moyen : {stats.avgHR.toFixed(2)} bpm</p>
              <p>Vitesse moyenne : {stats.avgSpeed.toFixed(2)} km/h</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
