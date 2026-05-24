const SOURCE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const WATERMARK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export const MAX_MAIN_IMAGES = 9;

export const isValidSourceImageType = (file: File) => SOURCE_TYPES.includes(file.type);
export const isValidWatermarkImageType = (file: File) => WATERMARK_TYPES.includes(file.type);
export const getExportFilename = (index?: number, now = new Date()) => {
  const ts = now.toISOString().replace(/[:.]/g, '-');
  return typeof index === 'number' ? `nowhere-mark-${index}-${ts}.png` : `nowhere-mark-${ts}.png`;
};
