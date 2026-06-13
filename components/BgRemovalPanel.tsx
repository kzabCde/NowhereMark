'use client';

import { useCallback, useState } from 'react';
import { Download, Eraser, Loader2, X, Undo2, AlertCircle, ImagePlus, Wand2 } from 'lucide-react';
import { UploadDropzone } from '@/components/UploadDropzone';
import { MAX_MAIN_IMAGES, getExportFilename, isValidSourceImageType } from '@/lib/file-utils';
import { removeBgFromUrl, type BgRemovalProgress } from '@/lib/bg-removal';

type BgImageItem = {
  id: string;
  src: string;
  name: string;
  bgRemovedSrc?: string;
  bgRemoving?: boolean;
  bgProgress?: BgRemovalProgress;
  bgError?: string;
};

export function BgRemovalPanel() {
  const [images, setImages] = useState<BgImageItem[]>([]);
  const [error, setError] = useState('');

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    const supported = selected.filter(isValidSourceImageType);
    if (supported.length !== selected.length) setError('Some files were skipped (unsupported format).');
    const remaining = MAX_MAIN_IMAGES - images.length;
    const accepted = supported.slice(0, Math.max(0, remaining));
    if (supported.length > remaining) setError(`Too many images — you can add ${remaining} more.`);
    else if (selected.length === supported.length) setError('');
    setImages((prev) => [
      ...prev,
      ...accepted.map((file, idx) => ({
        id: `${Date.now()}-${idx}-${file.name}`,
        src: URL.createObjectURL(file),
        name: file.name,
      })),
    ].slice(0, MAX_MAIN_IMAGES));
  };

  const removeBg = useCallback(async (id: string) => {
    setImages((prev) => prev.map((p) =>
      p.id === id ? { ...p, bgRemoving: true, bgError: undefined } : p,
    ));
    try {
      const item = images.find((m) => m.id === id);
      if (!item) return;
      const resultSrc = await removeBgFromUrl(item.src, (progress) => {
        setImages((prev) => prev.map((p) => p.id === id ? { ...p, bgProgress: progress } : p));
      });
      setImages((prev) => prev.map((p) =>
        p.id === id ? { ...p, bgRemovedSrc: resultSrc, bgRemoving: false, bgProgress: undefined } : p,
      ));
    } catch (err) {
      setImages((prev) => prev.map((p) =>
        p.id === id
          ? { ...p, bgRemoving: false, bgError: err instanceof Error ? err.message : 'Failed', bgProgress: undefined }
          : p,
      ));
    }
  }, [images]);

  const undoBg = (id: string) => {
    setImages((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      if (p.bgRemovedSrc) URL.revokeObjectURL(p.bgRemovedSrc);
      return { ...p, bgRemovedSrc: undefined, bgError: undefined };
    }));
  };

  const removeAll = async () => {
    for (const img of images) {
      if (!img.bgRemovedSrc && !img.bgRemoving) await removeBg(img.id);
    }
  };

  const exportOne = (item: BgImageItem) => {
    const src = item.bgRemovedSrc ?? item.src;
    const a = document.createElement('a');
    a.href = src;
    a.download = getExportFilename();
    a.click();
  };

  const exportAll = () => images.forEach((img) => exportOne(img));

  const anyProcessed = images.some((m) => !!m.bgRemovedSrc);
  const anyPending = images.some((m) => !m.bgRemovedSrc && !m.bgRemoving);

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

        {/* Upload */}
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/40">1</span>
            <h2 className="text-sm font-semibold text-slate-100">Upload images</h2>
            <span className="ml-auto text-xs text-slate-400">{images.length} / {MAX_MAIN_IMAGES}</span>
          </div>
          <UploadDropzone
            label=""
            helper={images.length === 0 ? 'Drag & drop images here, or click to browse' : `Add more (${MAX_MAIN_IMAGES - images.length} remaining)`}
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onFiles={onFiles}
            disabled={images.length >= MAX_MAIN_IMAGES}
          />
          {images.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${(images.length / MAX_MAIN_IMAGES) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">{images.length} / {MAX_MAIN_IMAGES}</span>
            </div>
          )}
          {images.length > 0 && (
            <button
              onClick={() => setImages([])}
              className="mt-2 w-full rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:border-red-500/60 hover:text-red-400"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Remove BG section */}
        {images.length > 0 && (
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/40">2</span>
              <h2 className="text-sm font-semibold text-slate-100">Remove background</h2>
            </div>

            <div className="mb-3 rounded-lg border border-slate-700/60 bg-slate-800/40 p-3 text-xs text-slate-400 leading-relaxed">
              AI model runs entirely in your browser — no images are uploaded to any server.
              First use downloads the model (~20 MB) and caches it for future sessions.
            </div>

            <button
              onClick={removeAll}
              disabled={!anyPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/60 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Wand2 className="h-4 w-4" />
              {anyPending ? 'Remove background from all' : 'All images processed'}
            </button>
          </div>
        )}

        {/* Export */}
        {images.length > 0 && (
          <div className="sticky bottom-3 rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <button
              disabled={!anyProcessed}
              onClick={exportAll}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              Export all (PNG)
            </button>
            {!anyProcessed && (
              <p className="mt-1.5 text-center text-[10px] text-slate-500">
                Remove background from at least one image to export
              </p>
            )}
          </div>
        )}
      </aside>

      {/* Grid */}
      <section>
        {images.length === 0 ? (
          <BgEmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((item) => (
              <BgImageCard
                key={item.id}
                item={item}
                onRemoveBg={() => removeBg(item.id)}
                onUndoBg={() => undoBg(item.id)}
                onRemove={() => setImages((prev) => prev.filter((p) => p.id !== item.id))}
                onExport={() => exportOne(item)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BgImageCard({
  item,
  onRemoveBg,
  onUndoBg,
  onRemove,
  onExport,
}: {
  item: BgImageItem;
  onRemoveBg: () => void;
  onUndoBg: () => void;
  onRemove: () => void;
  onExport: () => void;
}) {
  const displaySrc = item.bgRemovedSrc ?? item.src;

  return (
    <article className="group rounded-xl border border-slate-700/80 bg-slate-900/85 shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition hover:border-slate-600">
      <div className="relative">
        <img
          src={displaySrc}
          alt={item.name}
          className={`h-auto w-full rounded-t-xl border-b border-slate-700/60 object-cover ${item.bgRemovedSrc ? 'bg-checkered' : 'bg-slate-950'}`}
          style={{ maxHeight: 240 }}
        />

        {/* Remove card button */}
        <button
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-full border border-slate-600/60 bg-slate-900/80 p-1 text-slate-400 opacity-0 backdrop-blur-sm transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Status badge */}
        {item.bgRemovedSrc && (
          <span className="absolute left-2 top-2 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            BG removed
          </span>
        )}
        {item.bgRemoving && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Processing…
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="mb-2 truncate text-xs font-medium text-slate-100" title={item.name}>{item.name}</p>

        {/* Progress */}
        {item.bgRemoving && item.bgProgress && (
          <div className="mb-2 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{item.bgProgress.phase === 'download' ? 'Downloading model…' : 'Removing background…'}</span>
              <span>{item.bgProgress.percent}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-indigo-500 transition-all duration-200" style={{ width: `${item.bgProgress.percent}%` }} />
            </div>
          </div>
        )}
        {item.bgRemoving && !item.bgProgress && (
          <div className="mb-2 flex items-center gap-1.5 text-[10px] text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Initialising AI model…
          </div>
        )}
        {item.bgError && (
          <div className="mb-2 flex items-center gap-1 text-[10px] text-red-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {item.bgError}
          </div>
        )}

        <div className="flex gap-1.5">
          {item.bgRemovedSrc ? (
            <button
              onClick={onUndoBg}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </button>
          ) : (
            <button
              onClick={onRemoveBg}
              disabled={item.bgRemoving}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-xs font-medium text-slate-300 transition hover:border-indigo-500/60 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:opacity-50"
            >
              <Eraser className="h-3 w-3" /> Remove BG
            </button>
          )}
          <button
            onClick={onExport}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300/80 bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white"
          >
            <Download className="h-3 w-3" />
            {item.bgRemovedSrc ? 'Export PNG' : 'Export'}
          </button>
        </div>
      </div>
    </article>
  );
}

function BgEmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
      <ImagePlus className="mb-4 h-10 w-10 text-slate-600" />
      <h3 className="mb-1 text-base font-semibold text-slate-200">No images uploaded</h3>
      <p className="mb-4 text-sm text-slate-500">Upload images to remove their backgrounds</p>
      <div className="space-y-2 text-left">
        {[
          'Supports JPG, PNG, WebP',
          'AI runs locally — fully private',
          'Export as PNG with transparency',
        ].map((t, i) => (
          <p key={i} className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}
