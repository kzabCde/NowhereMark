const SOURCE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const WATERMARK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export const isValidSourceImageType = (file: File) => SOURCE_TYPES.includes(file.type);
export const isValidWatermarkImageType = (file: File) => WATERMARK_TYPES.includes(file.type);
export const getExportFilename = (now = new Date()) => `nowhere-mark-${now.toISOString().replace(/[:.]/g, '-')}.png`;

export async function loadHtmlImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  URL.revokeObjectURL(url);
  return img;
}
