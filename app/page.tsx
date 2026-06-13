'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ExportActions } from '@/components/ExportActions';
import { MainImagesUploader } from '@/components/MainImagesUploader';
import { PreviewGrid } from '@/components/PreviewGrid';
import { WatermarkControls } from '@/components/WatermarkControls';
import { WatermarkUploader } from '@/components/WatermarkUploader';
import { MAX_MAIN_IMAGES, getExportFilename, isValidSourceImageType, isValidWatermarkImageType } from '@/lib/file-utils';
import { renderWatermarkedImage } from '@/lib/canvas-watermark';
import { removeBgFromUrl, type BgRemovalProgress } from '@/lib/bg-removal';
import type { WatermarkSettings } from '@/types/watermark';

export type MainImageItem = {
  id: string;
  file: File;
  src: string;
  name: string;
  previewDataUrl?: string;
  dimensions?: string;
  error?: string;
  bgRemovedSrc?: string;
  bgRemoving?: boolean;
  bgProgress?: BgRemovalProgress;
  bgError?: string;
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

export default function Page() {
  const [mainImages, setMainImages] = useState<MainImageItem[]>([]);
  const [watermarkSrc, setWatermarkSrc] = useState<string | undefined>();
  const [watermarkName, setWatermarkName] = useState<string | undefined>();
  const [settings, setSettings] = useState<WatermarkSettings>(initial);
  const [error, setError] = useState('');
  const renderGenRef = useRef(0);

  const canRenderWatermark = settings.mode !== 'image' || !!watermarkSrc;

  useEffect(() => {
    let cancelled = false;
    const gen = ++renderGenRef.current;

    const run = async () => {
      if (!mainImages.length || !canRenderWatermark) return;
      setMainImages((prev) => prev.map((p) => ({ ...p, previewDataUrl: undefined, error: undefined })));

      for (const item of mainImages) {
        if (cancelled || renderGenRef.current !== gen) return;
        const effectiveSrc = item.bgRemovedSrc ?? item.src;
        try {
          const previewDataUrl = await renderWatermarkedImage({
            mainImageSrc: effectiveSrc,
            watermarkSettings: settings,
            watermarkImageSrc: watermarkSrc,
          });
          const img = new Image();
          img.src = previewDataUrl;
          await new Promise((r) => { img.onload = r; });
          if (!cancelled && renderGenRef.current === gen) {
            setMainImages((prev) =>
              prev.map((p) =>
                p.id === item.id
                  ? { ...p, previewDataUrl, dimensions: `${img.width} × ${img.height}` }
                  : p,
              ),
            );
          }
        } catch {
          if (!cancelled && renderGenRef.current === gen) {
            setMainImages((prev) =>
              prev.map((p) =>
                p.id === item.id ? { ...p, error: 'Preview render failed' } : p,
              ),
            );
          }
        }
      }
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, watermarkSrc, canRenderWatermark, mainImages.map((m) => m.bgRemovedSrc).join(','), mainImages.map((m) => m.id).join(',')]);

  const onMainFiles = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const supported = selected.filter(isValidSourceImageType);
    if (supported.length !== selected.length) setError('Some files were skipped (unsupported format).');
    const remaining = MAX_MAIN_IMAGES - mainImages.length;
    const accepted = supported.slice(0, Math.max(0, remaining));
    if (supported.length > remaining) setError(`Too many images — you can add ${remaining} more.`);
    const items = accepted.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      file,
      src: URL.createObjectURL(file),
      name: file.name,
    }));
    setMainImages((prev) => [...prev, ...items].slice(0, MAX_MAIN_IMAGES));
    if (supported.length <= remaining && selected.length === supported.length) setError('');
  };

  const onWatermarkFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!isValidWatermarkImageType(f)) return setError('Unsupported watermark file type.');
    setError('');
    setWatermarkName(f.name);
    setWatermarkSrc(URL.createObjectURL(f));
  };

  const removeBgForImage = useCallback(async (id: string) => {
    const item = mainImages.find((m) => m.id === id);
    if (!item) return;
    if (item.bgRemovedSrc) {
      // Undo: revert to original
      URL.revokeObjectURL(item.bgRemovedSrc);
      setMainImages((prev) => prev.map((p) => p.id === id ? { ...p, bgRemovedSrc: undefined, bgProgress: undefined, bgError: undefined } : p));
      return;
    }
    setMainImages((prev) => prev.map((p) => p.id === id ? { ...p, bgRemoving: true, bgError: undefined } : p));
    try {
      const resultSrc = await removeBgFromUrl(item.src, (progress) => {
        setMainImages((prev) => prev.map((p) => p.id === id ? { ...p, bgProgress: progress } : p));
      });
      setMainImages((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, bgRemovedSrc: resultSrc, bgRemoving: false, bgProgress: undefined } : p,
        ),
      );
    } catch (err) {
      setMainImages((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, bgRemoving: false, bgError: err instanceof Error ? err.message : 'Background removal failed', bgProgress: undefined }
            : p,
        ),
      );
    }
  }, [mainImages]);

  const exportOne = (idx: number) => {
    const item = mainImages[idx];
    if (!item?.previewDataUrl) return;
    const a = document.createElement('a');
    a.href = item.previewDataUrl;
    a.download = getExportFilename(idx + 1);
    a.click();
  };

  const canExport = useMemo(() => mainImages.some((m) => !!m.previewDataUrl), [mainImages]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-4 md:p-8">
      <AppHeader />

      {!!error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <span className="shrink-0">⚠</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* ── Left sidebar ── */}
        <aside className="space-y-3">
          {/* Step 1 */}
          <SectionCard step={1} title="Upload images" hint={`${mainImages.length} / ${MAX_MAIN_IMAGES}`}>
            <MainImagesUploader
              onFiles={onMainFiles}
              count={mainImages.length}
              remaining={MAX_MAIN_IMAGES - mainImages.length}
            />
            {mainImages.length > 0 && (
              <button
                onClick={() => setMainImages([])}
                className="mt-1 w-full rounded-md border border-slate-700 bg-transparent px-3 py-1.5 text-xs text-slate-400 transition hover:border-red-500/60 hover:text-red-400"
              >
                Clear all images
              </button>
            )}
          </SectionCard>

          {/* Step 2 – only relevant for image/hybrid mode */}
          {(settings.mode === 'image' || settings.mode === 'hybrid') && (
            <SectionCard step={2} title="Watermark image" hint={watermarkName ? '✓ uploaded' : 'required'}>
              <WatermarkUploader onFiles={onWatermarkFiles} fileName={watermarkName} />
            </SectionCard>
          )}

          {/* Step 3 – Settings */}
          <SectionCard
            step={settings.mode === 'text' ? 2 : 3}
            title="Watermark settings"
          >
            <WatermarkControls settings={settings} setSettings={setSettings} />
            <button
              onClick={() => setSettings(initial)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-transparent px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
            >
              Reset to defaults
            </button>
          </SectionCard>

          {/* Export */}
          <ExportActions
            canExport={canExport && canRenderWatermark}
            onExportAll={() => mainImages.forEach((_, idx) => exportOne(idx))}
          />
        </aside>

        {/* ── Preview area ── */}
        <section>
          <PreviewGrid
            items={mainImages}
            onExport={exportOne}
            onRemove={(id) => setMainImages((prev) => prev.filter((p) => p.id !== id))}
            onRemoveBg={removeBgForImage}
          />
        </section>
      </div>
    </main>
  );
}

function SectionCard({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/40">
          {step}
        </span>
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {hint && (
          <span className="ml-auto text-xs text-slate-400">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
