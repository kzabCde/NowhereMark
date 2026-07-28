import type { CropSettings, ExportMime, ResizeSettings } from '@/types/editor';

export type ImageDimensions = { width: number; height: number };

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function calculateResizeDimensions(
  sourceWidth: number,
  sourceHeight: number,
  resize: ResizeSettings,
): ImageDimensions {
  const safeSourceWidth = Math.max(1, Math.round(sourceWidth));
  const safeSourceHeight = Math.max(1, Math.round(sourceHeight));
  const requestedWidth = resize.width && resize.width > 0 ? Math.round(resize.width) : null;
  const requestedHeight = resize.height && resize.height > 0 ? Math.round(resize.height) : null;

  if (!requestedWidth && !requestedHeight) {
    return { width: safeSourceWidth, height: safeSourceHeight };
  }

  if (!resize.keepAspectRatio) {
    return {
      width: requestedWidth ?? safeSourceWidth,
      height: requestedHeight ?? safeSourceHeight,
    };
  }

  const ratio = safeSourceWidth / safeSourceHeight;
  if (requestedWidth) {
    return {
      width: requestedWidth,
      height: Math.max(1, Math.round(requestedWidth / ratio)),
    };
  }

  return {
    width: Math.max(1, Math.round((requestedHeight ?? safeSourceHeight) * ratio)),
    height: requestedHeight ?? safeSourceHeight,
  };
}

export function centerCropForAspect(
  sourceWidth: number,
  sourceHeight: number,
  aspectWidth: number,
  aspectHeight: number,
): CropSettings {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = aspectWidth / aspectHeight;

  if (sourceRatio > targetRatio) {
    const widthPercent = (targetRatio / sourceRatio) * 100;
    return {
      xPercent: (100 - widthPercent) / 2,
      yPercent: 0,
      widthPercent,
      heightPercent: 100,
    };
  }

  const heightPercent = (sourceRatio / targetRatio) * 100;
  return {
    xPercent: 0,
    yPercent: (100 - heightPercent) / 2,
    widthPercent: 100,
    heightPercent,
  };
}

export function normalizeCrop(crop: CropSettings): CropSettings {
  const xPercent = clamp(crop.xPercent, 0, 99);
  const yPercent = clamp(crop.yPercent, 0, 99);
  const normalized: CropSettings = {
    xPercent,
    yPercent,
    widthPercent: clamp(crop.widthPercent, 1, 100 - xPercent),
    heightPercent: clamp(crop.heightPercent, 1, 100 - yPercent),
  };
  if (crop.aspectRatio) normalized.aspectRatio = crop.aspectRatio;
  return normalized;
}

export function extensionForMime(mimeType: ExportMime) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

export function getOutputFilename(
  sourceName: string,
  mimeType: ExportMime,
  suffix = 'edited',
) {
  const base = sourceName.replace(/\.[^/.]+$/, '') || 'image';
  return `${base}-${suffix}.${extensionForMime(mimeType)}`;
}

export function trackedTextWidth(characterWidths: number[], letterSpacing: number) {
  return characterWidths.reduce((total, width) => total + width, 0)
    + Math.max(0, characterWidths.length - 1) * letterSpacing;
}

export function clampCenter(position: number, contentSize: number, canvasSize: number) {
  const halfSize = Math.min(canvasSize / 2, Math.max(0, contentSize / 2));
  return clamp(position, halfSize, canvasSize - halfSize);
}
