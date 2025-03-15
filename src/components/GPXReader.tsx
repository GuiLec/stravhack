"use client";
import { GPXChart } from "@/modules/chart/components/GPXChart";
import { ChartPoint } from "@/modules/chart/interface";
import { parseGPX } from "@/modules/gpx/utils/parseGPX";
import { processPoints } from "@/modules/gpx/utils/processPoints";
import { StatsSection } from "@/modules/stats/components/Stats";
import { computeStats } from "@/modules/stats/utils/computeStats";
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
        setStats(computeStats(processedData));
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
        setStats(computeStats(selected));
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
          {stats && <StatsSection stats={stats} />}
        </>
      )}
    </div>
  );
};
