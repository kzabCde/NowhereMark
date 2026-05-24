'use client';
import { useEffect, useRef } from 'react';
import { renderWatermarkedCanvas } from '@/lib/canvas-watermark';
import type { WatermarkSettings } from '@/types/watermark';

type Props = {
  sourceImage: HTMLImageElement | null;
  watermarkImage: HTMLImageElement | null;
  settings: WatermarkSettings;
};

export function LivePreviewCanvas({ sourceImage, watermarkImage, settings }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!sourceImage || !ref.current) return;
    const raf = requestAnimationFrame(() => {
      renderWatermarkedCanvas({
        sourceImage,
        sourceWidth: sourceImage.naturalWidth,
        sourceHeight: sourceImage.naturalHeight,
        settings,
        watermarkImage,
        targetCanvas: ref.current ?? undefined,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [sourceImage, watermarkImage, settings]);

  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"><canvas ref={ref} className="h-auto w-full rounded" /></div>;
}
