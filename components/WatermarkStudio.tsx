'use client';
import { useEffect, useMemo, useState } from 'react';
import { DownloadButton } from '@/components/DownloadButton';
import { ImageUploader } from '@/components/ImageUploader';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { WatermarkControls } from '@/components/WatermarkControls';
import { WatermarkPreview } from '@/components/WatermarkPreview';
import { renderWatermarkedImage } from '@/lib/canvas-watermark';
import { getExportFilename, isValidWatermarkImageType } from '@/lib/file-utils';
import { clampTransform, presetToTransform } from '@/lib/watermark-transform';
import type { ImageWatermarkSettings, TextWatermarkSettings, WatermarkMode, WatermarkPosition, WatermarkTransform } from '@/types/watermark';

const defaultTransform: WatermarkTransform = { xPercent: 75, yPercent: 82, widthPercent: 22, rotation: 0, opacity: 0.9 };

export function WatermarkStudio() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [mode, setMode] = useState<WatermarkMode>('text');
  const [preset, setPreset] = useState<WatermarkPosition>('bottom-right');
  const [transform, setTransform] = useState<WatermarkTransform>(defaultTransform);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkError, setWatermarkError] = useState<string | null>(null);
  const [textSettings, setTextSettings] = useState<TextWatermarkSettings>({ text: 'Nowhere Mark', sizePercent: 4.5, color: '#ffffff', opacity: 0.9, marginPercent: 2, rotation: 0, position: 'bottom-right' });
  const [imageSettings, setImageSettings] = useState<ImageWatermarkSettings>({ sizePercent: 22, opacity: 0.9, marginPercent: 2, rotation: 0, position: 'bottom-right' });
  const [result, setResult] = useState<string | null>(null);

  const sourceUrl = useMemo(() => (sourceFile ? URL.createObjectURL(sourceFile) : null), [sourceFile]);
  const watermarkUrl = useMemo(() => (watermarkFile ? URL.createObjectURL(watermarkFile) : null), [watermarkFile]);
  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); if (watermarkUrl) URL.revokeObjectURL(watermarkUrl); }, [sourceUrl, watermarkUrl]);
  useEffect(() => setTransform((t)=>clampTransform({ ...t, opacity: mode === 'text' ? textSettings.opacity : imageSettings.opacity })), [mode, textSettings.opacity, imageSettings.opacity]);

  useEffect(() => {
    async function render() {
      if (!sourceUrl) return setResult(null);
      const settings = {
        mode,
        text: textSettings.text,
        imageSrc: watermarkUrl ?? undefined,
        xPercent: transform.xPercent,
        yPercent: transform.yPercent,
        widthPercent: transform.widthPercent,
        rotation: transform.rotation,
        opacity: transform.opacity,
        color: textSettings.color
      };
      const png = await renderWatermarkedImage({ imageSrc: sourceUrl, settings });
      setResult(png);
    }
    void render();
  }, [sourceUrl, watermarkUrl, mode, textSettings, imageSettings, transform]);

  return <main className='mx-auto max-w-6xl p-4 md:p-8'>
    <h1 className='text-2xl font-semibold'>Nowhere Mark</h1><p className='mb-4 text-sm text-slate-600 dark:text-slate-400'>Add your mark. Protect your image.</p>
    <div className='grid gap-4 lg:grid-cols-[1.5fr_1fr]'>
      <div className='space-y-4'><ImageUploader onFile={setSourceFile} error={sourceError} setError={setSourceError} /><WatermarkPreview originalSrc={sourceUrl ?? undefined} watermarkedSrc={result ?? undefined} mode={mode} text={textSettings.text} imageSrc={watermarkUrl ?? undefined} color={textSettings.color} transform={transform} onTransformChange={(next)=>setTransform(clampTransform(next))} /></div>
      <div className='space-y-4'><WatermarkControls mode={mode} setMode={setMode} text={textSettings} setText={setTextSettings} image={imageSettings} setImage={setImageSettings} imageError={watermarkError} watermarkPreviewSrc={watermarkUrl ?? undefined} positionPreset={preset} onPresetChange={(p)=>{setPreset(p); const n = presetToTransform(p); setTransform((t)=>clampTransform({ ...t, ...n }));}} onResetPosition={()=>setTransform(defaultTransform)} onImageWatermark={(file)=>{ if(!file) return; if(!isValidWatermarkImageType(file)){setWatermarkError('Unsupported watermark file. Please use PNG, JPG, JPEG, SVG, or WebP.'); return;} setWatermarkError(null); setWatermarkFile(file); }} /><DownloadButton disabled={!result} onDownload={()=>{ if(!result) return; const a=document.createElement('a'); a.href=result; a.download=getExportFilename(); a.click(); }} /><PrivacyNotice /></div>
    </div>
  </main>;
}
