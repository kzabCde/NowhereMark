'use client';
import { FreeTransformWatermark } from '@/components/FreeTransformWatermark';
import type { WatermarkMode, WatermarkTransform } from '@/types/watermark';

type WatermarkPreviewProps = {
  originalSrc?: string;
  watermarkedSrc?: string;
  mode: WatermarkMode;
  text: string;
  imageSrc?: string;
  color: string;
  transform: WatermarkTransform;
  onTransformChange: (next: WatermarkTransform) => void;
};

export function WatermarkPreview({ originalSrc, watermarkedSrc, mode, text, imageSrc, color, transform, onTransformChange }: WatermarkPreviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Original (Editable)</p>
        {originalSrc ? (
          <div className='relative'>
            <img src={originalSrc} alt='Original' className="w-full rounded" />
            <FreeTransformWatermark mode={mode} text={text} imageSrc={imageSrc} color={color} transform={transform} onTransformChange={onTransformChange} />
          </div>
        ) : <div className="flex h-44 items-center justify-center text-sm text-slate-500">No image yet</div>}
      </div>
      <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Watermarked (Export)</p>
        {watermarkedSrc ? <img src={watermarkedSrc} alt='Watermarked' className='w-full rounded' /> : <div className="flex h-44 items-center justify-center text-sm text-slate-500">No image yet</div>}
      </div>
    </div>
  );
}
