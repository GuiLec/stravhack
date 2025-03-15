import { GPXPoint } from "@/modules/gpx/interface";

export const parseGPX = (xmlString: string): GPXPoint[] => {
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

    // Extraction des extensions (température, HR, cadence)
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
};
