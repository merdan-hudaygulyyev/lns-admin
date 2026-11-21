import type { SupportedImageExt } from "./file";

interface ImageFormat {
  ext: SupportedImageExt;
  mime: string;
  matches: (buffer: Buffer) => boolean;
}

function startsWith(buffer: Buffer, bytes: number[] | string, offset = 0): boolean {
  const needle = typeof bytes === "string" ? Buffer.from(bytes, "latin1") : Buffer.from(bytes);
  return buffer.length >= offset + needle.length && buffer.subarray(offset, offset + needle.length).equals(needle);
}

function isIsoBmff(buffer: Buffer, brands: string[]): boolean {
  if (!startsWith(buffer, [0x00, 0x00, 0x00, 0x18]) || !startsWith(buffer, "ftyp", 4)) return false;
  const brand = buffer.subarray(8, 12).toString("latin1");
  return brands.includes(brand);
}

/** Detection is based on magic bytes, never on the user-provided file name. */
const formats: ImageFormat[] = [
  { ext: "jpg", mime: "image/jpeg", matches: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  { ext: "png", mime: "image/png", matches: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  { ext: "gif", mime: "image/gif", matches: (b) => startsWith(b, "GIF87a") || startsWith(b, "GIF89a") },
  { ext: "webp", mime: "image/webp", matches: (b) => startsWith(b, "RIFF") && startsWith(b, "WEBP", 8) },
  { ext: "avif", mime: "image/avif", matches: (b) => isIsoBmff(b, ["avif", "avis"]) },
  { ext: "bmp", mime: "image/bmp", matches: (b) => startsWith(b, "BM") },
  { ext: "tiff", mime: "image/tiff", matches: (b) => startsWith(b, [0x49, 0x49, 0x2a, 0x00]) || startsWith(b, [0x4d, 0x4d, 0x00, 0x2a]) },
  { ext: "svg", mime: "image/svg+xml", matches: (b) => /^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(b.toString("utf8", 0, 2048)) },
  { ext: "heic", mime: "image/heic", matches: (b) => isIsoBmff(b, ["heic", "heix", "heif", "mif1", "msf1", "hei8"]) },
  { ext: "ico", mime: "image/x-icon", matches: (b) => startsWith(b, [0x00, 0x00, 0x01, 0x00]) },
];

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  ...formats.map((format) => format.mime),
  "image/jpg",
  "image/x-ms-bmp",
  "image/vnd.microsoft.icon",
]);

export function detectImageFormat(buffer: Buffer): ImageFormat | undefined {
  return formats.find((format) => format.matches(buffer));
}

/** Accept only MIME types that truthfully describe the detected format. */
export function mimeMatchesFormat(mime: string, format: ImageFormat): boolean {
  if (mime === format.mime) return true;
  if (format.ext === "jpg") return mime === "image/jpg";
  if (format.ext === "bmp") return mime === "image/x-ms-bmp";
  if (format.ext === "ico") return mime === "image/vnd.microsoft.icon";
  if (format.ext === "heic") return mime === "image/heif";
  return false;
}

/**
 * SVGs are active content. We remove scripts, event handlers, external
 * references and embedded HTML. The static file route additionally serves
 * SVGs with a restrictive CSP and `nosniff`.
 */
export function sanitizeSvg(buffer: Buffer): Buffer {
  let svg = buffer.toString("utf8");
  svg = svg.replace(/<!DOCTYPE[^>]*>/gi, "");
  svg = svg.replace(/<\?xml[^>]*\?>/gi, "");
  svg = svg.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
  svg = svg.replace(/<script\b[^>]*\/>/gi, "");
  svg = svg.replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject\s*>/gi, "");
  svg = svg.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  svg = svg.replace(/href\s*=\s*(?:"\s*javascript:|'\s*javascript:)/gi, 'href="blocked:');
  svg = svg.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, "");
  svg = svg.replace(/<(?:embed|object|link|meta)\b[^>]*>/gi, "");
  return Buffer.from(svg, "utf8");
}
