"use client";
import { GPXChart } from "@/modules/chart/components/GPXChart";
import { ChartPoint } from "@/modules/chart/interface";
import { parseGPX } from "@/modules/gpx/utils/parseGPX";
import { processPoints } from "@/modules/gpx/utils/processPoints";
import { StatsSection } from "@/modules/stats/components/Stats";
import { Stats } from "@/modules/stats/interface";
import { computeStats } from "@/modules/stats/utils/computeStats";
import React, { useState, useEffect } from "react";

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

  // When originalGPX changes, update chart data and stats.
  useEffect(() => {
    if (originalGPX) {
      const parsed = parseGPX(originalGPX);
      const processed = processPoints(parsed);
      setChartData(processed);
      setStats(computeStats(processed));
      setSelectedRange((prev) => {
        if (!prev) {
          return { startIndex: 0, endIndex: processed.length - 1 };
        } else {
          return {
            startIndex: prev.startIndex,
            endIndex: Math.min(prev.endIndex, processed.length - 1),
          };
        }
      });
    }
  }, [originalGPX]);

  useEffect(() => {
    if (chartData.length && selectedRange) {
      const { startIndex, endIndex } = selectedRange;
      const selectedData = chartData.slice(startIndex, endIndex + 1);
      setStats(computeStats(selectedData));
    }
  }, [chartData, selectedRange]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".gpx")) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const xmlText = e.target?.result as string;
        setOriginalGPX(xmlText);
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid GPX file.");
    }
  };

  // Helper: Parse the current GPX XML, perform an update, and save back.
  const updateGPX = (updateFn: (xmlDoc: Document) => void) => {
    if (!originalGPX) return;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(originalGPX, "application/xml");
    updateFn(xmlDoc);
    const serializer = new XMLSerializer();
    const newGPX = serializer.serializeToString(xmlDoc);
    setOriginalGPX(newGPX);
  };

  // Adjust speed by compressing (alpha > 1) or expanding (alpha < 1) the duration
  // in the selected range. The first and last times remain fixed.
  const adjustSpeed = (alpha: number) => {
    if (!selectedRange) {
      alert("No range selected.");
      return;
    }
    const { startIndex, endIndex } = selectedRange;
    updateGPX((xmlDoc) => {
      const trkpts = xmlDoc.getElementsByTagName("trkpt");
      const times: Date[] = [];
      for (let i = 0; i < trkpts.length; i++) {
        const timeEl = trkpts[i].getElementsByTagName("time")[0];
        if (!timeEl || !timeEl.textContent) {
          alert("Missing time data in GPX.");
          return;
        }
        times[i] = new Date(timeEl.textContent);
      }
      const T0 = times[startIndex].getTime();
      const T1 = times[endIndex].getTime();
      const origDuration = T1 - T0;
      // New duration is compressed/expanded by factor alpha.
      const newDuration = origDuration / alpha;
      const diff = newDuration - origDuration; // negative for compression
      let currentTime = T0;
      // Update selected range timestamps (linearly interpolated)
      trkpts[startIndex].getElementsByTagName("time")[0].textContent = new Date(
        currentTime
      ).toISOString();
      for (let i = startIndex; i < endIndex; i++) {
        const nextTrkpt = trkpts[i + 1];
        const nextTimeEl = nextTrkpt.getElementsByTagName("time")[0];
        const interval = times[i + 1].getTime() - times[i].getTime();
        const newInterval = interval / alpha;
        currentTime += newInterval;
        nextTimeEl.textContent = new Date(currentTime).toISOString();
      }
      // Shift all points after the selected range to avoid gaps.
      for (let i = endIndex + 1; i < trkpts.length; i++) {
        const timeEl = trkpts[i].getElementsByTagName("time")[0];
        const newTime = new Date(times[i].getTime() + diff);
        timeEl.textContent = newTime.toISOString();
      }
    });
  };

  const incrementSpeed = () => adjustSpeed(1.1);
  const decrementSpeed = () => adjustSpeed(0.9);

  // Update HR in the selected range.
  const updateHR = (delta: number) => {
    if (!selectedRange) return;
    const { startIndex, endIndex } = selectedRange;
    updateGPX((xmlDoc) => {
      const trkpts = xmlDoc.getElementsByTagName("trkpt");
      for (let i = startIndex; i <= endIndex; i++) {
        let ext = trkpts[i].getElementsByTagName("ns3:TrackPointExtension")[0];
        if (!ext) {
          ext = xmlDoc.createElement("ns3:TrackPointExtension");
          trkpts[i].appendChild(ext);
        }
        let hrEl = ext.getElementsByTagName("ns3:hr")[0];
        if (!hrEl) {
          hrEl = xmlDoc.createElement("ns3:hr");
          ext.appendChild(hrEl);
        }
        const currentHR = parseInt(hrEl.textContent || "0", 10);
        hrEl.textContent = Math.max(0, currentHR + delta).toString();
      }
    });
  };

  const incrementHR = () => updateHR(1);
  const decrementHR = () => updateHR(-1);

  const toggleXAxisMode = () => {
    setXAxisMode(xAxisMode === "time" ? "distance" : "time");
  };

  const handleBrushChange = (brush: {
    startIndex?: number;
    endIndex?: number;
  }) => {
    if (brush.startIndex != null && brush.endIndex != null) {
      setSelectedRange({
        startIndex: brush.startIndex,
        endIndex: brush.endIndex,
      });
      const selected = chartData.slice(brush.startIndex, brush.endIndex + 1);
      setStats(computeStats(selected));
    }
  };

  const downloadGPX = () => {
    if (!originalGPX) return;
    const blob = new Blob([originalGPX], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "updated.gpx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Parse and Visualize GPX File</h2>
      <input type="file" accept=".gpx" onChange={handleFileChange} />
      {chartData.length > 0 && (
        <>
          <button onClick={toggleXAxisMode}>
            {`Switch to ${xAxisMode === "time" ? "distance" : "time"} axis`}
          </button>
          <GPXChart
            chartData={chartData}
            xAxisMode={xAxisMode}
            handleBrushChange={handleBrushChange}
            brushStartIndex={selectedRange?.startIndex}
            brushEndIndex={selectedRange?.endIndex}
          />
          <StatsSection
            decrementHR={decrementHR}
            incrementHR={incrementHR}
            incrementSpeed={incrementSpeed}
            decrementSpeed={decrementSpeed}
            stats={stats!}
          />
          <div style={{ marginTop: "10px" }}>
            <button onClick={downloadGPX}>Download Modified GPX</button>
          </div>
        </>
      )}
    </div>
  );
};
