'use client';

import { useEffect, useMemo, useState } from 'react';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { WatermarkControls } from '@/components/WatermarkControls';
import { MAX_MAIN_IMAGES, getExportFilename, isValidSourceImageType, isValidWatermarkImageType } from '@/lib/file-utils';
import { renderWatermarkedImage } from '@/lib/canvas-watermark';
import type { WatermarkSettings } from '@/types/watermark';

type MainImageItem = {
  id: string;
  file: File;
  src: string;
  name: string;
  previewDataUrl?: string;
  error?: string;
};

const initial: WatermarkSettings = { mode: 'image', xPercent: 85, yPercent: 85, widthPercent: 20, rotation: 0, opacity: 0.8, blendMode: 'source-over', repeat: false, flipX: false, flipY: false, shadow: false, shadowColor: '#000000', shadowBlur: 4, shadowOffsetX: 2, shadowOffsetY: 2, stroke: false, strokeColor: '#ffffff', strokeWidth: 2, grayscale: 0, brightness: 100, contrast: 100, invert: 0, blur: 0, text: 'Nowhere Mark', fontSize: 48, textColor: '#ffffff', textStrokeColor: '#000000', textBold: true, textItalic: false, letterSpacing: 0, layoutPreset: 'bottom-right' };

export default function Page() {
  const [mainImages, setMainImages] = useState<MainImageItem[]>([]);
  const [watermarkSrc, setWatermarkSrc] = useState<string | undefined>();
  const [settings, setSettings] = useState<WatermarkSettings>(initial);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string>('');

  const canRenderWatermark = settings.mode !== 'image' || !!watermarkSrc;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!mainImages.length) return;
      setIsRendering(true);
      const next = [...mainImages];
      for (let i = 0; i < next.length; i += 1) {
        try {
          next[i] = { ...next[i], previewDataUrl: await renderWatermarkedImage({ mainImageSrc: next[i].src, watermarkSettings: settings, watermarkImageSrc: watermarkSrc }) };
          if (!cancelled) setMainImages((prev) => prev.map((p) => (p.id === next[i].id ? next[i] : p)));
        } catch {
          if (!cancelled) setMainImages((prev) => prev.map((p) => (p.id === next[i].id ? { ...p, error: 'Preview render failed' } : p)));
        }
      }
      if (!cancelled) setIsRendering(false);
    };
    if (canRenderWatermark) run();
    return () => {
      cancelled = true;
    };
  }, [settings, watermarkSrc, canRenderWatermark]);

  const onMainFiles = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const valid = selected.filter(isValidSourceImageType).slice(0, MAX_MAIN_IMAGES);
    if (selected.length > MAX_MAIN_IMAGES) setError(`You can upload up to ${MAX_MAIN_IMAGES} images.`);
    else setError('');
    const items = valid.map((file, index) => ({ id: `${Date.now()}-${index}-${file.name}`, file, src: URL.createObjectURL(file), name: file.name }));
    setMainImages(items);
  };

  const exportOne = (item: MainImageItem, index: number) => {
    if (!item.previewDataUrl) return;
    const a = document.createElement('a');
    a.href = item.previewDataUrl;
    a.download = getExportFilename(index + 1);
    a.click();
  };

  const exportAll = () => mainImages.forEach((img, i) => exportOne(img, i));

  const canExport = useMemo(() => mainImages.some((m) => !!m.previewDataUrl), [mainImages]);

  return <main className='mx-auto max-w-7xl p-4 md:p-8'>
    <h1 className='mb-4 text-2xl font-semibold'>Nowhere Mark</h1>
    <div className='grid gap-4 lg:grid-cols-[360px_1fr]'>
      <section className='space-y-3'>
        <div><label className='mb-1 block text-sm font-medium'>Main images</label><input className='w-full text-sm' type='file' multiple accept='.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp' onChange={(e) => onMainFiles(e.target.files)} /></div>
        <p className='text-xs text-slate-600'>{mainImages.length} / 9 images selected</p>
        <button className='w-full rounded border px-3 py-2 text-sm' onClick={() => setMainImages([])}>Clear all images</button>

        <div><label className='mb-1 block text-sm font-medium'>Watermark image</label><input className='w-full text-sm' type='file' accept='.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml' onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (!isValidWatermarkImageType(f)) return setError('Unsupported watermark file type.');
          setWatermarkSrc(URL.createObjectURL(f));
        }} /></div>

        <WatermarkControls settings={settings} setSettings={setSettings} />
        <button disabled={!canExport} onClick={exportAll} className='w-full rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900'>Export all images</button>
        {!mainImages.length && <p className='text-sm text-red-600'>Please select at least one main image.</p>}
        {settings.mode === 'image' && !watermarkSrc && <p className='text-sm text-red-600'>Please upload a watermark image for image mode.</p>}
        {!!error && <p className='text-sm text-red-600'>{error}</p>}
        <PrivacyNotice />
      </section>
      <section>
        {isRendering && <p className='mb-2 text-sm text-slate-600'>Rendering previews…</p>}
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {mainImages.map((item, idx) => <article key={item.id} className='rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900'>
            {item.previewDataUrl ? <img src={item.previewDataUrl} alt={`Preview ${item.name}`} className='h-auto w-full rounded' /> : <p className='text-sm'>Waiting for preview…</p>}
            <div className='mt-2 flex items-center justify-between gap-2'>
              <p className='truncate text-xs'>{item.name}</p>
              <button className='rounded border px-2 py-1 text-xs' onClick={() => exportOne(item, idx)} disabled={!item.previewDataUrl}>Export</button>
            </div>
          </article>)}
        </div>
      </section>
    </div>
  </main>;
}
