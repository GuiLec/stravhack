"use client";
import React, { useState } from "react";

interface GPXPoint {
  lat: number;
  lon: number;
  ele: number | null;
  time: string | null;
  atemp: number | null;
  hr: number | null;
  cad: number | null;
}

function parseGPX(xmlString: string): GPXPoint[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const trkpts = xmlDoc.getElementsByTagName("trkpt");
  const points: GPXPoint[] = [];

  for (let i = 0; i < trkpts.length; i++) {
    const trkpt = trkpts[i];
    const lat = parseFloat(trkpt.getAttribute("lat")!);
    const lon = parseFloat(trkpt.getAttribute("lon")!);
    const eleEl = trkpt.getElementsByTagName("ele")[0];
    const timeEl = trkpt.getElementsByTagName("time")[0];
    const ele = eleEl ? parseFloat(eleEl.textContent!) : null;
    const time = timeEl ? timeEl.textContent : null;

    // Extraction des extensions dans ns3:TrackPointExtension
    let atemp: number | null = null;
    let hr: number | null = null;
    let cad: number | null = null;
    const trackPointExtension = trkpt.getElementsByTagName(
      "ns3:TrackPointExtension"
    )[0];
    if (trackPointExtension) {
      const atempEl = trackPointExtension.getElementsByTagName("ns3:atemp")[0];
      const hrEl = trackPointExtension.getElementsByTagName("ns3:hr")[0];
      const cadEl = trackPointExtension.getElementsByTagName("ns3:cad")[0];

      if (atempEl) atemp = parseFloat(atempEl.textContent!);
      if (hrEl) hr = parseInt(hrEl.textContent!, 10);
      if (cadEl) cad = parseInt(cadEl.textContent!, 10);
    }

    points.push({
      lat,
      lon,
      ele,
      time,
      atemp,
      hr,
      cad,
    });
  }
  return points;
}

export const GPXReader = () => {
  const [points, setPoints] = useState<GPXPoint[]>([]);

  interface GPXPoint {
    lat: number;
    lon: number;
    ele: number | null;
    time: string | null;
    atemp: number | null;
    hr: number | null;
    cad: number | null;
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".gpx")) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const xmlText = e.target?.result as string;
        const parsedPoints: GPXPoint[] = parseGPX(xmlText);
        setPoints(parsedPoints);
        console.log("Points extraits :", parsedPoints);
      };
      reader.readAsText(file);
    } else {
      alert("Veuillez sélectionner un fichier GPX valide.");
    }
  };

  return (
    <div>
      <h2>Parser un fichier GPX</h2>
      <input type="file" accept=".gpx" onChange={handleFileChange} />
      {points.length > 0 && (
        <div>
          <h3>Données extraites :</h3>
          <pre>{JSON.stringify(points, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
