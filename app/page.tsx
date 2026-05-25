'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ExportActions } from '@/components/ExportActions';
import { MainImagesUploader } from '@/components/MainImagesUploader';
import { PreviewGrid } from '@/components/PreviewGrid';
import { WatermarkControls } from '@/components/WatermarkControls';
import { WatermarkUploader } from '@/components/WatermarkUploader';
import { MAX_MAIN_IMAGES, getExportFilename, isValidSourceImageType, isValidWatermarkImageType } from '@/lib/file-utils';
import { renderWatermarkedImage } from '@/lib/canvas-watermark';
import type { WatermarkSettings } from '@/types/watermark';

type MainImageItem = { id: string; file: File; src: string; name: string; previewDataUrl?: string; dimensions?: string; error?: string; };

const initial: WatermarkSettings = { mode: 'image', xPercent: 85, yPercent: 85, widthPercent: 20, rotation: 0, opacity: 0.8, blendMode: 'source-over', repeat: false, flipX: false, flipY: false, shadow: false, shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 2, shadowOffsetY: 2, stroke: false, strokeColor: '#ffffff', strokeWidth: 2, grayscale: 0, brightness: 100, contrast: 100, invert: 0, blur: 0, text: 'Nowhere Mark', fontSize: 48, textColor: '#ffffff', textStrokeColor: '#000000', textBold: true, textItalic: false, letterSpacing: 0, layoutPreset: 'bottom-right' };

export default function Page() {
  const [mainImages, setMainImages] = useState<MainImageItem[]>([]);
  const [watermarkSrc, setWatermarkSrc] = useState<string | undefined>();
  const [watermarkName, setWatermarkName] = useState<string | undefined>();
  const [settings, setSettings] = useState<WatermarkSettings>(initial);
  const [error, setError] = useState('');
  const canRenderWatermark = settings.mode !== 'image' || !!watermarkSrc;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!mainImages.length || !canRenderWatermark) return;
      for (const item of mainImages) {
        try {
          const previewDataUrl = await renderWatermarkedImage({ mainImageSrc: item.src, watermarkSettings: settings, watermarkImageSrc: watermarkSrc });
          const img = new Image();
          img.src = previewDataUrl;
          await new Promise((r) => (img.onload = r));
          if (!cancelled) setMainImages((prev) => prev.map((p) => p.id === item.id ? { ...p, previewDataUrl, dimensions: `${img.width} × ${img.height}` } : p));
        } catch {
          if (!cancelled) setMainImages((prev) => prev.map((p) => p.id === item.id ? { ...p, error: 'Preview render failed' } : p));
        }
      }
    };
    setMainImages((prev) => prev.map((p) => ({ ...p, previewDataUrl: undefined })));
    run();
    return () => { cancelled = true; };
  }, [settings, watermarkSrc, canRenderWatermark]);

  const onMainFiles = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const supported = selected.filter(isValidSourceImageType);
    if (supported.length !== selected.length) setError('Some files were skipped due to unsupported types.');
    const remaining = MAX_MAIN_IMAGES - mainImages.length;
    const accepted = supported.slice(0, Math.max(0, remaining));
    if (supported.length > remaining) setError(`Too many images. You can add ${remaining} more.`);
    const items = accepted.map((file, index) => ({ id: `${Date.now()}-${index}-${file.name}`, file, src: URL.createObjectURL(file), name: file.name }));
    setMainImages((prev) => [...prev, ...items].slice(0, MAX_MAIN_IMAGES));
  };

  const onWatermarkFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!isValidWatermarkImageType(f)) return setError('Unsupported watermark file type.');
    setError('');
    setWatermarkName(f.name);
    setWatermarkSrc(URL.createObjectURL(f));
  };

  const exportOne = (idx: number) => {
    const item = mainImages[idx];
    if (!item?.previewDataUrl) return;
    const a = document.createElement('a');
    a.href = item.previewDataUrl;
    a.download = getExportFilename(idx + 1);
    a.click();
  };

  const canExport = useMemo(() => mainImages.some((m) => !!m.previewDataUrl), [mainImages]);

  return <main className='mx-auto min-h-screen max-w-7xl bg-slate-50 p-4 md:p-8'>
    <AppHeader />
    <div className='grid gap-4 lg:grid-cols-[360px_1fr]'>
      <section className='space-y-3'>
        <MainImagesUploader onFiles={onMainFiles} count={mainImages.length} remaining={MAX_MAIN_IMAGES - mainImages.length} />
        <WatermarkUploader onFiles={onWatermarkFiles} fileName={watermarkName} />
        <div className='flex gap-2'>
          <button className='flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm' onClick={() => setMainImages([])}>Clear all images</button>
          <button className='flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm' onClick={() => setSettings(initial)}>Reset settings</button>
        </div>
        <WatermarkControls settings={settings} setSettings={setSettings} />
        {settings.mode === 'image' && !watermarkSrc && <p className='text-sm text-red-600'>Please upload a watermark image for image mode.</p>}
        {!!error && <p className='text-sm text-red-600'>{error}</p>}
        <ExportActions canExport={canExport && canRenderWatermark} onExportAll={() => mainImages.forEach((_, idx) => exportOne(idx))} />
      </section>
      <section>
        <PreviewGrid items={mainImages} onExport={exportOne} onRemove={(id) => setMainImages((prev) => prev.filter((p) => p.id !== id))} />
      </section>
    </div>
  </main>;
}
