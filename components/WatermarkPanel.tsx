'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MainImagesUploader } from '@/components/MainImagesUploader';
import { WatermarkUploader } from '@/components/WatermarkUploader';
import { WatermarkControls } from '@/components/WatermarkControls';
import { WatermarkPreviewGrid } from '@/components/WatermarkPreviewGrid';
import { ExportActions } from '@/components/ExportActions';
import { SectionCard } from '@/components/SectionCard';
import { MAX_MAIN_IMAGES, getExportFilename, isValidSourceImageType, isValidWatermarkImageType } from '@/lib/file-utils';
import { renderWatermarkedImage } from '@/lib/canvas-watermark';
import type { WatermarkSettings } from '@/types/watermark';

export type WatermarkImageItem = {
  id: string;
  file: File;
  src: string;
  name: string;
  previewDataUrl?: string;
  dimensions?: string;
  error?: string;
};

const initial: WatermarkSettings = {
  mode: 'image',
  xPercent: 85,
  yPercent: 85,
  widthPercent: 20,
  rotation: 0,
  opacity: 0.8,
  blendMode: 'source-over',
  repeat: false,
  flipX: false,
  flipY: false,
  shadow: false,
  shadowColor: '#000000',
  shadowBlur: 4,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  stroke: false,
  strokeColor: '#ffffff',
  strokeWidth: 2,
  grayscale: 0,
  brightness: 100,
  contrast: 100,
  invert: 0,
  blur: 0,
  text: 'Nowhere Mark',
  fontSize: 48,
  textColor: '#ffffff',
  textStrokeColor: '#000000',
  textBold: true,
  textItalic: false,
  letterSpacing: 0,
  layoutPreset: 'bottom-right',
};

export function WatermarkPanel() {
  const [images, setImages] = useState<WatermarkImageItem[]>([]);
  const [watermarkSrc, setWatermarkSrc] = useState<string | undefined>();
  const [watermarkName, setWatermarkName] = useState<string | undefined>();
  const [settings, setSettings] = useState<WatermarkSettings>(initial);
  const [error, setError] = useState('');
  const renderGenRef = useRef(0);

  const canRender = settings.mode !== 'image' || !!watermarkSrc;

  useEffect(() => {
    let cancelled = false;
    const gen = ++renderGenRef.current;

    const run = async () => {
      if (!images.length || !canRender) return;
      setImages((prev) => prev.map((p) => ({ ...p, previewDataUrl: undefined, error: undefined })));

      for (const item of images) {
        if (cancelled || renderGenRef.current !== gen) return;
        try {
          const previewDataUrl = await renderWatermarkedImage({
            mainImageSrc: item.src,
            watermarkSettings: settings,
            watermarkImageSrc: watermarkSrc,
          });
          const img = new Image();
          img.src = previewDataUrl;
          await new Promise((r) => { img.onload = r; });
          if (!cancelled && renderGenRef.current === gen) {
            setImages((prev) =>
              prev.map((p) =>
                p.id === item.id
                  ? { ...p, previewDataUrl, dimensions: `${img.width} × ${img.height}` }
                  : p,
              ),
            );
          }
        } catch {
          if (!cancelled && renderGenRef.current === gen) {
            setImages((prev) =>
              prev.map((p) => p.id === item.id ? { ...p, error: 'Preview render failed' } : p),
            );
          }
        }
      }
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, watermarkSrc, canRender, images.map((m) => m.id).join(',')]);

  const onMainFiles = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const supported = selected.filter(isValidSourceImageType);
    if (supported.length !== selected.length) setError('Some files were skipped (unsupported format).');
    const remaining = MAX_MAIN_IMAGES - images.length;
    const accepted = supported.slice(0, Math.max(0, remaining));
    if (supported.length > remaining) setError(`Too many images — you can add ${remaining} more.`);
    else if (selected.length === supported.length) setError('');
    const items: WatermarkImageItem[] = accepted.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      file,
      src: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...items].slice(0, MAX_MAIN_IMAGES));
  };

  const onWatermarkFile = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!isValidWatermarkImageType(f)) return setError('Unsupported watermark file type.');
    setError('');
    setWatermarkName(f.name);
    setWatermarkSrc(URL.createObjectURL(f));
  };

  const exportOne = (idx: number) => {
    const item = images[idx];
    if (!item?.previewDataUrl) return;
    const a = document.createElement('a');
    a.href = item.previewDataUrl;
    a.download = getExportFilename(idx + 1);
    a.click();
  };

  const canExport = useMemo(() => images.some((m) => !!m.previewDataUrl), [images]);

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-3">
        {!!error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <span className="shrink-0">⚠</span>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-200">✕</button>
          </div>
        )}

        <SectionCard step={1} title="Upload images" hint={`${images.length} / ${MAX_MAIN_IMAGES}`}>
          <MainImagesUploader
            onFiles={onMainFiles}
            count={images.length}
            remaining={MAX_MAIN_IMAGES - images.length}
          />
          {images.length > 0 && (
            <button
              onClick={() => setImages([])}
              className="mt-1 w-full rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:border-red-500/60 hover:text-red-400"
            >
              Clear all images
            </button>
          )}
        </SectionCard>

        {(settings.mode === 'image' || settings.mode === 'hybrid') && (
          <SectionCard step={2} title="Watermark image" hint={watermarkName ? '✓' : 'required'}>
            <WatermarkUploader onFiles={onWatermarkFile} fileName={watermarkName} />
          </SectionCard>
        )}

        <SectionCard step={settings.mode === 'text' ? 2 : 3} title="Watermark settings">
          <WatermarkControls settings={settings} setSettings={setSettings} />
          <button
            onClick={() => setSettings(initial)}
            className="mt-2 w-full rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
          >
            Reset to defaults
          </button>
        </SectionCard>

        <ExportActions
          canExport={canExport && canRender}
          onExportAll={() => images.forEach((_, idx) => exportOne(idx))}
        />
      </aside>

      {/* Preview */}
      <section>
        {settings.mode === 'image' && !watermarkSrc && images.length > 0 && (
          <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
            Upload a watermark image (Step 2) to see preview.
          </div>
        )}
        <WatermarkPreviewGrid
          items={images}
          onExport={exportOne}
          onRemove={(id) => setImages((prev) => prev.filter((p) => p.id !== id))}
        />
      </section>
    </div>
  );
}
