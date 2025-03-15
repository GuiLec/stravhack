export const formatXML = (xml: string): string => {
  const PADDING = "  ";
  let xmlDeclaration = "";
  // Extract XML declaration if present.
  if (xml.startsWith("<?xml")) {
    const index = xml.indexOf("?>");
    if (index !== -1) {
      xmlDeclaration = xml.substring(0, index + 2);
      xml = xml.substring(index + 2);
    }
  }
  // Remove whitespace between tags.
  xml = xml.replace(/>\s+</g, "><").trim();
  // Insert newline between tags.
  xml = xml.replace(/>(?=<)/g, ">\n");
  const lines = xml.split("\n");
  let indent = 0;
  let formatted = "";
  lines.forEach((line) => {
    if (line.match(/^<\/\w/)) {
      indent--;
    }
    formatted += PADDING.repeat(indent) + line + "\n";
    if (line.match(/^<\w([^>]*[^\/])?>/) && !line.includes("</")) {
      indent++;
    }
  });
  formatted = formatted.trim();
  return xmlDeclaration ? xmlDeclaration + "\n" + formatted : formatted;
};
