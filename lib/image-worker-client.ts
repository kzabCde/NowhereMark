'use client';

import {
  calculateResizeDimensions,
  clampCenter,
  centerCropForAspect,
  normalizeCrop,
  trackedTextWidth,
} from '@/lib/image-math';
import type { ProjectSettings, RenderResult } from '@/types/editor';
import type { WatermarkSettings } from '@/types/watermark';

type WorkerResponse = {
  id: number;
  ok: boolean;
  blob?: Blob;
  width?: number;
  height?: number;
  error?: string;
};

type PendingRequest = {
  resolve: (result: RenderResult) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let requestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

function getWorker() {
  if (worker) return worker;
  worker = new Worker('/image-render.worker.js');
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const pending = pendingRequests.get(event.data.id);
    if (!pending) return;
    pendingRequests.delete(event.data.id);
    if (
      event.data.ok
      && event.data.blob
      && typeof event.data.width === 'number'
      && typeof event.data.height === 'number'
    ) {
      pending.resolve({
        blob: event.data.blob,
        width: event.data.width,
        height: event.data.height,
      });
    } else {
      pending.reject(new Error(event.data.error ?? 'Image render failed'));
    }
  };
  worker.onerror = () => {
    pendingRequests.forEach(({ reject }) => reject(new Error('Image worker failed')));
    pendingRequests.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode image'));
    };
    image.src = url;
  });
}

function drawTrackedText(
  context: CanvasRenderingContext2D,
  text: string,
  letterSpacing: number,
  settings: WatermarkSettings,
) {
  const characters = Array.from(text);
  const widths = characters.map((character) => context.measureText(character).width);
  const totalWidth = widths.reduce((total, width) => total + width, 0)
    + Math.max(0, characters.length - 1) * letterSpacing;
  let cursor = -totalWidth / 2;
  characters.forEach((character, index) => {
    const characterCenter = cursor + widths[index] / 2;
    if (settings.stroke) {
      context.strokeStyle = settings.textStrokeColor;
      context.lineWidth = settings.strokeWidth;
      context.strokeText(character, characterCenter, 0);
    }
    context.fillText(character, characterCenter, 0);
    cursor += widths[index] + letterSpacing;
  });
}

function drawWatermark(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  settings: WatermarkSettings,
  watermark: HTMLImageElement | null,
) {
  const watermarkWidth = (settings.widthPercent / 100) * canvasWidth;
  const watermarkHeight = watermark
    ? watermarkWidth * (watermark.naturalHeight / watermark.naturalWidth)
    : Math.max(18, (settings.fontSize / 1000) * canvasWidth * 1.5);
  const fontSize = Math.max(12, (settings.fontSize / 1000) * canvasWidth);
  const font = `${settings.textItalic ? 'italic ' : ''}${settings.textBold ? '700 ' : '400 '}${fontSize}px Arial, sans-serif`;
  context.font = font;
  const textWidth = trackedTextWidth(
    Array.from(settings.text).map((character) => context.measureText(character).width),
    settings.letterSpacing,
  );
  const contentWidth = settings.mode === 'text'
    ? textWidth
    : Math.max(watermarkWidth, textWidth);
  const contentHeight = settings.mode === 'hybrid'
    ? watermarkHeight + fontSize * 1.5
    : Math.max(watermarkHeight, fontSize * 1.5);
  const drawX = clampCenter(
    (settings.xPercent / 100) * canvasWidth,
    contentWidth,
    canvasWidth,
  );
  const drawY = clampCenter(
    (settings.yPercent / 100) * canvasHeight,
    contentHeight,
    canvasHeight,
  );

  context.save();
  context.globalAlpha = settings.opacity;
  context.globalCompositeOperation = settings.blendMode;

  const drawAt = (x: number, y: number) => {
    context.save();
    context.translate(x, y);
    context.rotate((settings.rotation * Math.PI) / 180);
    if ((settings.mode === 'image' || settings.mode === 'hybrid') && watermark) {
      const offsetY = settings.mode === 'hybrid' ? -fontSize * 0.4 : 0;
      context.drawImage(
        watermark,
        -watermarkWidth / 2,
        -watermarkHeight / 2 + offsetY,
        watermarkWidth,
        watermarkHeight,
      );
    }
    if (settings.mode === 'text' || settings.mode === 'hybrid') {
      context.font = font;
      context.fillStyle = settings.textColor;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const offsetY = settings.mode === 'hybrid' ? watermarkHeight / 2 + fontSize * 0.45 : 0;
      context.translate(0, offsetY);
      drawTrackedText(context, settings.text, settings.letterSpacing, settings);
    }
    context.restore();
  };

  if (settings.repeat) {
    const stepX = Math.max(100, contentWidth * 1.35);
    const stepY = Math.max(80, contentHeight * 1.45);
    for (let tileY = -stepY; tileY < canvasHeight + stepY; tileY += stepY) {
      for (let tileX = -stepX; tileX < canvasWidth + stepX; tileX += stepX) {
        drawAt(tileX, tileY);
      }
    }
  } else {
    drawAt(drawX, drawY);
  }
  context.restore();
}

async function renderOnMainThread(input: {
  sourceBlob: Blob;
  watermarkBlob?: Blob;
  settings: ProjectSettings;
  previewMaxDimension?: number;
}): Promise<RenderResult> {
  const source = await loadImage(input.sourceBlob);
  const watermark = input.watermarkBlob ? await loadImage(input.watermarkBlob) : null;
  const configuredCrop = input.settings.transform.crop;
  const crop = configuredCrop.aspectRatio
    ? centerCropForAspect(
      source.naturalWidth,
      source.naturalHeight,
      configuredCrop.aspectRatio[0],
      configuredCrop.aspectRatio[1],
    )
    : normalizeCrop(configuredCrop);
  const cropX = Math.round((crop.xPercent / 100) * source.naturalWidth);
  const cropY = Math.round((crop.yPercent / 100) * source.naturalHeight);
  const cropWidth = Math.max(1, Math.round((crop.widthPercent / 100) * source.naturalWidth));
  const cropHeight = Math.max(1, Math.round((crop.heightPercent / 100) * source.naturalHeight));
  const requestedSize = calculateResizeDimensions(
    cropWidth,
    cropHeight,
    input.settings.transform.resize,
  );
  const swapsDimensions = input.settings.transform.rotation === 90
    || input.settings.transform.rotation === 270;
  const rawWidth = swapsDimensions ? requestedSize.height : requestedSize.width;
  const rawHeight = swapsDimensions ? requestedSize.width : requestedSize.height;
  const previewScale = input.previewMaxDimension
    ? Math.min(1, input.previewMaxDimension / Math.max(rawWidth, rawHeight))
    : 1;
  const drawWidth = Math.max(1, Math.round(requestedSize.width * previewScale));
  const drawHeight = Math.max(1, Math.round(requestedSize.height * previewScale));
  const outputWidth = swapsDimensions ? drawHeight : drawWidth;
  const outputHeight = swapsDimensions ? drawWidth : drawHeight;
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');

  if (input.settings.output.mimeType === 'image/jpeg') {
    context.fillStyle = input.settings.output.backgroundColor;
    context.fillRect(0, 0, outputWidth, outputHeight);
  }
  context.save();
  context.translate(outputWidth / 2, outputHeight / 2);
  context.rotate((input.settings.transform.rotation * Math.PI) / 180);
  context.scale(
    input.settings.transform.flipX ? -1 : 1,
    input.settings.transform.flipY ? -1 : 1,
  );
  const adjustments = input.settings.adjustments;
  context.filter = [
    `brightness(${adjustments.brightness}%)`,
    `contrast(${adjustments.contrast}%)`,
    `saturate(${adjustments.saturation}%)`,
    `grayscale(${adjustments.grayscale}%)`,
    `blur(${adjustments.blur}px)`,
  ].join(' ');
  context.drawImage(
    source,
    cropX,
    cropY,
    Math.min(cropWidth, source.naturalWidth - cropX),
    Math.min(cropHeight, source.naturalHeight - cropY),
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();
  context.filter = 'none';
  if (input.settings.watermarkEnabled) {
    drawWatermark(context, outputWidth, outputHeight, input.settings.watermark, watermark);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error('Image encoding failed')),
      input.settings.output.mimeType,
      input.settings.output.quality,
    );
  });
  return { blob, width: outputWidth, height: outputHeight };
}

export async function renderImage(input: {
  sourceBlob: Blob;
  watermarkBlob?: Blob;
  settings: ProjectSettings;
  previewMaxDimension?: number;
}): Promise<RenderResult> {
  if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
    return renderOnMainThread(input);
  }

  const id = ++requestId;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    getWorker().postMessage({ id, ...input });
  });
}
