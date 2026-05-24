const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SUPPORTED_WATERMARK_TYPES = ['image/png', 'image/webp', 'image/svg+xml'];

export function isValidSourceImageType(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type);
}

export function isValidWatermarkImageType(file: File): boolean {
  return SUPPORTED_WATERMARK_TYPES.includes(file.type);
}

export function getExportFilename(now = new Date()): string {
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  return `nowhere-mark-${stamp}.png`;
}
