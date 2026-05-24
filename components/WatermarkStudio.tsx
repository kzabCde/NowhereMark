'use client';
import { useEffect, useMemo, useState } from 'react';
import { DownloadButton } from '@/components/DownloadButton';
import { ImageUploader } from '@/components/ImageUploader';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { WatermarkControls } from '@/components/WatermarkControls';
import { WatermarkPreview } from '@/components/WatermarkPreview';
import { renderWatermarkedCanvas, loadImage } from '@/lib/canvas-watermark';
import { getExportFilename, isValidWatermarkImageType } from '@/lib/file-utils';
import type { ImageWatermarkSettings, TextWatermarkSettings, WatermarkMode } from '@/types/watermark';

export function WatermarkStudio() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [mode, setMode] = useState<WatermarkMode>('text');
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkError, setWatermarkError] = useState<string | null>(null);
  const [textSettings, setTextSettings] = useState<TextWatermarkSettings>({ text: 'Nowhere Mark', fontSize: 48, color: '#ffffff', opacity: 0.8, margin: 24, rotation: -20, position: 'bottom-right' });
  const [imageSettings, setImageSettings] = useState<ImageWatermarkSettings>({ sizePercent: 20, opacity: 0.8, margin: 24, rotation: 0, position: 'bottom-right' });
  const [result, setResult] = useState<string | null>(null);

  const sourceUrl = useMemo(() => (sourceFile ? URL.createObjectURL(sourceFile) : null), [sourceFile]);
  const watermarkUrl = useMemo(() => (watermarkFile ? URL.createObjectURL(watermarkFile) : null), [watermarkFile]);

  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); if (watermarkUrl) URL.revokeObjectURL(watermarkUrl); }, [sourceUrl, watermarkUrl]);

  useEffect(() => {
    async function render() {
      if (!sourceUrl) return setResult(null);
      const sourceImage = await loadImage(sourceUrl);
      let wmImage: HTMLImageElement | null = null;
      if (mode === 'image' && watermarkUrl) {
        wmImage = await loadImage(watermarkUrl);
      }
      const canvas = await renderWatermarkedCanvas(sourceImage, mode, textSettings, imageSettings, wmImage);
      setResult(canvas.toDataURL('image/png'));
    }
    void render();
  }, [sourceUrl, watermarkUrl, mode, textSettings, imageSettings]);

  return <main className='mx-auto max-w-6xl p-4 md:p-8'>
    <h1 className='text-2xl font-semibold'>Nowhere Mark</h1><p className='mb-4 text-sm text-slate-600 dark:text-slate-400'>Add your mark. Protect your image.</p>
    <div className='grid gap-4 lg:grid-cols-[1.5fr_1fr]'>
      <div className='space-y-4'><ImageUploader onFile={setSourceFile} error={sourceError} setError={setSourceError} /><WatermarkPreview originalSrc={sourceUrl ?? undefined} watermarkedSrc={result ?? undefined} /></div>
      <div className='space-y-4'><WatermarkControls mode={mode} setMode={setMode} text={textSettings} setText={setTextSettings} image={imageSettings} setImage={setImageSettings} imageError={watermarkError} watermarkPreviewSrc={watermarkUrl ?? undefined} onImageWatermark={(file)=>{ if(!file) return; if(!isValidWatermarkImageType(file)){setWatermarkError('Unsupported watermark file. Please use PNG, JPG, JPEG, SVG, or WebP.'); return;} setWatermarkError(null); setWatermarkFile(file); }} /><DownloadButton disabled={!result} onDownload={()=>{ if(!result) return; const a=document.createElement('a'); a.href=result; a.download=getExportFilename(); a.click(); }} /><PrivacyNotice /></div>
    </div>
  </main>;
}
