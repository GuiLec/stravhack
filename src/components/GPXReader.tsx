"use client";
import { GPXChart } from "@/modules/chart/components/GPXChart";
import { ChartPoint } from "@/modules/chart/interface";
import { formatXML } from "@/modules/gpx/utils/formatXML";
import { parseGPX } from "@/modules/gpx/utils/parseGPX";
import { processPoints } from "@/modules/gpx/utils/processPoints";
import { StatsSection } from "@/modules/stats/components/Stats";
import { Stats } from "@/modules/stats/interface";
import { computeStats } from "@/modules/stats/utils/computeStats";
import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import Image from "next/image";
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
    setSelectedRange(null);
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

  const updateGPX = (updateFn: (xmlDoc: Document) => void) => {
    if (!originalGPX) return;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(originalGPX, "application/xml");
    updateFn(xmlDoc);
    const serializer = new XMLSerializer();
    const newGPX = serializer.serializeToString(xmlDoc);
    setOriginalGPX(newGPX);
  };

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
      const newDuration = origDuration / alpha;
      const diff = newDuration - origDuration;
      let currentTime = T0;
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
      for (let i = endIndex + 1; i < trkpts.length; i++) {
        const timeEl = trkpts[i].getElementsByTagName("time")[0];
        const newTime = new Date(times[i].getTime() + diff);
        timeEl.textContent = newTime.toISOString();
      }
    });
  };

  const incrementSpeed = () => adjustSpeed(1.05);
  const decrementSpeed = () => adjustSpeed(0.95);

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

  const resampleGPX = (xmlString: string): string => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    const trkpts = xmlDoc.getElementsByTagName("trkpt");
    if (trkpts.length === 0) return xmlString;

    const points: Array<{
      lat: number;
      lon: number;
      ele: number | null;
      time: Date;
      hr: number | null;
      cad: number | null;
      atemp: number | null;
    }> = [];

    for (let i = 0; i < trkpts.length; i++) {
      const trkpt = trkpts[i];
      const lat = parseFloat(trkpt.getAttribute("lat")!);
      const lon = parseFloat(trkpt.getAttribute("lon")!);
      const eleEl = trkpt.getElementsByTagName("ele")[0];
      const ele = eleEl ? parseFloat(eleEl.textContent!) : null;
      const timeEl = trkpt.getElementsByTagName("time")[0];
      const time = timeEl ? new Date(timeEl.textContent!) : new Date(0);

      let hr: number | null = null;
      let cad: number | null = null;
      let atemp: number | null = null;
      const ext = trkpt.getElementsByTagName("ns3:TrackPointExtension")[0];
      if (ext) {
        const hrEl = ext.getElementsByTagName("ns3:hr")[0];
        const cadEl = ext.getElementsByTagName("ns3:cad")[0];
        const atempEl = ext.getElementsByTagName("ns3:atemp")[0];
        hr = hrEl ? parseInt(hrEl.textContent!, 10) : null;
        cad = cadEl ? parseInt(cadEl.textContent!, 10) : null;
        atemp = atempEl ? parseFloat(atempEl.textContent!) : null;
      }

      points.push({ lat, lon, ele, time, hr, cad, atemp });
    }

    if (!points.length || !points[0].time) return xmlString;

    const startTime = points[0].time.getTime();
    const endTime = points[points.length - 1].time.getTime();
    const newTimes: Date[] = [];
    for (let t = startTime; t <= endTime; t += 1000) {
      newTimes.push(new Date(t));
    }

    const newPoints: typeof points = [];
    let originalIndex = 0;
    for (const newTime of newTimes) {
      const newTimeMs = newTime.getTime();
      while (
        originalIndex < points.length - 1 &&
        points[originalIndex + 1].time.getTime() <= newTimeMs
      ) {
        originalIndex++;
      }

      const prevPoint = points[originalIndex];
      const nextPoint =
        originalIndex < points.length - 1
          ? points[originalIndex + 1]
          : prevPoint;

      if (newTimeMs === prevPoint.time.getTime()) {
        newPoints.push(prevPoint);
        continue;
      }

      const prevTime = prevPoint.time.getTime();
      const nextTime = nextPoint.time.getTime();
      const interval = nextTime - prevTime;
      const factor = interval > 0 ? (newTimeMs - prevTime) / interval : 0;

      const interpolate = (
        a: number | null,
        b: number | null
      ): number | null => {
        if (a === null || b === null)
          return a !== null ? a : b !== null ? b : null;
        return a + (b - a) * factor;
      };

      const interpolated = {
        lat: interpolate(prevPoint.lat, nextPoint.lat) || 0,
        lon: interpolate(prevPoint.lon, nextPoint.lon) || 0,
        ele: interpolate(prevPoint.ele, nextPoint.ele),
        time: newTime,
        hr: interpolate(prevPoint.hr, nextPoint.hr),
        cad: interpolate(prevPoint.cad, nextPoint.cad),
        atemp: interpolate(prevPoint.atemp, nextPoint.atemp),
      };

      newPoints.push(interpolated);
    }

    const gpx = xmlDoc.documentElement;
    const trk = gpx.getElementsByTagName("trk")[0];
    const trkseg = trk.getElementsByTagName("trkseg")[0];
    while (trkseg.firstChild) {
      trkseg.removeChild(trkseg.firstChild);
    }

    for (const point of newPoints) {
      const trkpt = xmlDoc.createElement("trkpt");
      trkpt.setAttribute("lat", point.lat.toFixed(12));
      trkpt.setAttribute("lon", point.lon.toFixed(12));

      if (point.ele !== null) {
        const ele = xmlDoc.createElement("ele");
        ele.textContent = point.ele!.toFixed(6);
        trkpt.appendChild(ele);
      }

      const time = xmlDoc.createElement("time");
      const isoTime = point.time.toISOString().replace(/\.\d+Z$/, ".000Z");
      time.textContent = isoTime;
      trkpt.appendChild(time);

      if (point.hr !== null || point.cad !== null || point.atemp !== null) {
        const extensions = xmlDoc.createElement("extensions");
        const trackExt = xmlDoc.createElement("ns3:TrackPointExtension");

        if (point.atemp !== null) {
          const atemp = xmlDoc.createElement("ns3:atemp");
          atemp.textContent = point.atemp.toFixed(1);
          trackExt.appendChild(atemp);
        }

        if (point.hr !== null) {
          const hr = xmlDoc.createElement("ns3:hr");
          hr.textContent = Math.round(point.hr).toString();
          trackExt.appendChild(hr);
        }

        if (point.cad !== null) {
          const cad = xmlDoc.createElement("ns3:cad");
          cad.textContent = Math.round(point.cad).toString();
          trackExt.appendChild(cad);
        }

        extensions.appendChild(trackExt);
        trkpt.appendChild(extensions);
      }

      trkseg.appendChild(trkpt);
    }

    const serializer = new XMLSerializer();
    const xml = serializer.serializeToString(xmlDoc);
    return formatXML(xml);
  };

  const downloadGPX = () => {
    if (!originalGPX) return;
    const resampledXML = resampleGPX(originalGPX);
    const blob = new Blob([resampledXML], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "updated.gpx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleXAxisModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setXAxisMode(event.target.value as "time" | "distance");
  };

  return (
    <div>
      <Image
        src="/assets/stravhack_logo.png"
        alt="Stravhack Logo"
        width={200}
        height={100}
        layout="intrinsic"
      />

      <Typography
        variant="h3"
        component={"h1"}
        color="primary"
        fontWeight="bold"
      >
        {"Tu as faim de KOM mais tu n'as pas les jambes ?"}
      </Typography>
      <Typography variant="body1" fontWeight={"bold"}>
        {"Alors donne un petit coup de boost à ta sortie !"}
      </Typography>
      <Box sx={{ height: "20px" }} />
      <label htmlFor="upload-gpx-file">
        <input
          id="upload-gpx-file"
          type="file"
          accept=".gpx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <Button variant="outlined" component="span">
          Charge un fichier GPX
        </Button>
      </label>
      <Box sx={{ height: "20px" }} />
      {chartData.length > 0 && (
        <>
          <GPXChart
            chartData={chartData}
            xAxisMode={xAxisMode}
            handleBrushChange={handleBrushChange}
            brushStartIndex={selectedRange?.startIndex}
            brushEndIndex={selectedRange?.endIndex}
          />
          <div>
            <RadioGroup row value={xAxisMode} onChange={handleXAxisModeChange}>
              <FormControlLabel
                value="time"
                control={<Radio />}
                label="Heure"
              />
              <FormControlLabel
                value="distance"
                control={<Radio />}
                label="Distance"
              />
            </RadioGroup>
          </div>
          <StatsSection
            decrementHR={decrementHR}
            incrementHR={incrementHR}
            incrementSpeed={incrementSpeed}
            decrementSpeed={decrementSpeed}
            stats={stats!}
          />
          <div style={{ marginTop: "10px" }}>
            <Button variant="contained" onClick={downloadGPX}>
              {"Télécharger le fichier GPX modifié"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
