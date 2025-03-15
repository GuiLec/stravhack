"use client";
import { GPXChart } from "@/modules/chart/components/GPXChart";
import { ChartPoint } from "@/modules/chart/interface";
import { parseGPX } from "@/modules/gpx/utils/parseGPX";
import { processPoints } from "@/modules/gpx/utils/processPoints";
import { StatsSection } from "@/modules/stats/components/Stats";
import { Stats } from "@/modules/stats/interface";
import { computeStats } from "@/modules/stats/utils/computeStats";
import React, { useState } from "react";

interface SelectedRange {
  startIndex: number;
  endIndex: number;
}

export const GPXReader = () => {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [xAxisMode, setXAxisMode] = useState<"time" | "distance">("time");
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(
    null
  );
  const [originalGPX, setOriginalGPX] = useState<string | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".gpx")) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const xmlText = e.target?.result as string;
        setOriginalGPX(xmlText);
        const parsedPoints = parseGPX(xmlText);
        const processedData = processPoints(parsedPoints);
        setChartData(processedData);
        console.log("Données traitées :", processedData);
        setStats(computeStats(processedData));
        setSelectedRange({
          startIndex: 0,
          endIndex: processedData.length - 1,
        });
      };
      reader.readAsText(file);
    } else {
      alert("Veuillez sélectionner un fichier GPX valide.");
    }
  };

  // Update HR for points in the selected zone.
  const updateHRForSelectedRange = (delta: number) => {
    if (selectedRange) {
      const { startIndex, endIndex } = selectedRange;
      const newChartData = chartData.map((point, index) => {
        if (index >= startIndex && index <= endIndex) {
          return { ...point, hr: point.hr != null ? point.hr + delta : delta };
        }
        return point;
      });
      setChartData(newChartData);
      // Recompute stats for the modified zone.
      const selected = newChartData.slice(startIndex, endIndex + 1);
      if (selected.length > 1) {
        setStats(computeStats(selected));
      }
    }
  };

  const incrementHR = () => {
    updateHRForSelectedRange(1);
  };

  const decrementHR = () => {
    updateHRForSelectedRange(-1);
  };

  const toggleXAxisMode = () => {
    setXAxisMode(xAxisMode === "time" ? "distance" : "time");
  };

  const handleBrushChange = (brush: {
    startIndex?: number;
    endIndex?: number;
  }) => {
    if (brush && brush.startIndex != null && brush.endIndex != null) {
      setSelectedRange({
        startIndex: brush.startIndex,
        endIndex: brush.endIndex,
      });
      const selected = chartData.slice(brush.startIndex, brush.endIndex + 1);
      if (selected.length > 1) {
        setStats(computeStats(selected));
      }
    }
  };

  // Generate an updated GPX file from the original XML,
  // modifying only the HR values for points in the affected zone.
  const downloadGPX = () => {
    if (!originalGPX) return;
    // Parse the original GPX XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(originalGPX, "application/xml");
    const trkpts = xmlDoc.getElementsByTagName("trkpt");
    // Iterate through each trackpoint.
    for (let i = 0; i < trkpts.length; i++) {
      // Only update HR if we have a selected range and the index is in that range.
      if (
        selectedRange &&
        i >= selectedRange.startIndex &&
        i <= selectedRange.endIndex
      ) {
        const updatedHR = chartData[i].hr;
        // Locate the ns3:TrackPointExtension element.
        const trackPointExtension = trkpts[i].getElementsByTagName(
          "ns3:TrackPointExtension"
        )[0];
        if (trackPointExtension) {
          const hrEl = trackPointExtension.getElementsByTagName("ns3:hr")[0];
          if (hrEl) {
            hrEl.textContent = updatedHR != null ? updatedHR.toString() : "0";
          }
        }
      }
    }
    const serializer = new XMLSerializer();
    const updatedXML = serializer.serializeToString(xmlDoc);
    const blob = new Blob([updatedXML], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "updated.gpx";
    a.click();
    URL.revokeObjectURL(url);
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
            brushStartIndex={
              selectedRange ? selectedRange.startIndex : undefined
            }
            brushEndIndex={selectedRange ? selectedRange.endIndex : undefined}
          />
          {stats && (
            <StatsSection
              decrementHR={decrementHR}
              incrementHR={incrementHR}
              stats={stats}
            />
          )}
          <div style={{ marginTop: "10px" }}>
            <button onClick={downloadGPX}>Télécharger le GPX modifié</button>
          </div>
        </>
      )}
    </div>
  );
};
