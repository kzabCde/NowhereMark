'use client';

import { useMemo, useState } from 'react';
import { ExportButton } from '@/components/ExportButton';
import { LivePreviewCanvas } from '@/components/LivePreviewCanvas';
import { MainImageUploader } from '@/components/MainImageUploader';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { WatermarkControls } from '@/components/WatermarkControls';
import { WatermarkUploader } from '@/components/WatermarkUploader';
import { renderWatermarkedCanvas } from '@/lib/canvas-watermark';
import { getExportFilename, isValidSourceImageType, isValidWatermarkImageType, loadHtmlImage } from '@/lib/file-utils';
import type { WatermarkSettings } from '@/types/watermark';

const initial: WatermarkSettings = { mode: 'image', xPercent: 85, yPercent: 85, widthPercent: 20, rotation: 0, opacity: 0.8, blendMode: 'source-over', repeat: false, lockAspectRatio: true, flipHorizontal: false, flipVertical: false, shadowEnabled: false, shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 2, shadowOffsetY: 2, strokeEnabled: false, strokeColor: '#ffffff', strokeWidth: 2, grayscale: 0, brightness: 100, contrast: 100, invert: 0, blur: 0, text: 'Nowhere Mark', fontSize: 48, textColor: '#ffffff', textStrokeColor: '#000000', textBold: true, textItalic: false, letterSpacing: 0, layoutPreset: 'bottom-right' };

export default function Page() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<WatermarkSettings>(initial);
  const canExport = useMemo(() => !!sourceImage, [sourceImage]);

  return <main className='mx-auto max-w-7xl p-4 md:p-8'>
    <h1 className='mb-4 text-2xl font-semibold'>Nowhere Mark</h1>
    <div className='grid gap-4 lg:grid-cols-[360px_1fr]'>
      <section className='space-y-3'>
        <MainImageUploader onFile={async (f)=>{ if(!f || !isValidSourceImageType(f)) return; setSourceImage(await loadHtmlImage(f)); }} />
        <WatermarkUploader onFile={async (f)=>{ if(!f || !isValidWatermarkImageType(f)) return; setWatermarkImage(await loadHtmlImage(f)); }} />
        <WatermarkControls settings={settings} setSettings={setSettings} />
        <ExportButton disabled={!canExport} onExport={()=>{ if(!sourceImage) return; const canvas = renderWatermarkedCanvas({ sourceImage, sourceWidth: sourceImage.naturalWidth, sourceHeight: sourceImage.naturalHeight, settings, watermarkImage }); const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download=getExportFilename(); a.click(); }} />
        <PrivacyNotice />
      </section>
      <section>
        <LivePreviewCanvas sourceImage={sourceImage} watermarkImage={watermarkImage} settings={settings} />
      </section>
    </div>
  </main>;
}
