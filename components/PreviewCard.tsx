import { Download, Loader2, X, Eraser, Undo2, AlertCircle } from 'lucide-react';
import type { BgRemovalProgress } from '@/lib/bg-removal';

type Props = {
  name: string;
  previewDataUrl?: string;
  dimensions?: string;
  error?: string;
  bgRemovedSrc?: string;
  bgRemoving?: boolean;
  bgProgress?: BgRemovalProgress;
  bgError?: string;
  onExport: () => void;
  onRemove: () => void;
  onRemoveBg: () => void;
};

export function PreviewCard({
  name,
  previewDataUrl,
  dimensions,
  error,
  bgRemovedSrc,
  bgRemoving,
  bgProgress,
  bgError,
  onExport,
  onRemove,
  onRemoveBg,
}: Props) {
  return (
    <article className="group rounded-xl border border-slate-700/80 bg-slate-900/85 shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition hover:border-slate-600">
      {/* Image area */}
      <div className="relative">
        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt={`Preview ${name}`}
            className={`h-auto w-full rounded-t-xl border-b border-slate-700/60 ${bgRemovedSrc ? 'bg-checkered' : 'bg-slate-950'}`}
          />
        ) : error ? (
          <div className="flex h-48 items-center justify-center gap-2 rounded-t-xl border-b border-slate-700/60 bg-slate-800 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center gap-2 rounded-t-xl border-b border-slate-700/60 bg-slate-800 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            Rendering…
          </div>
        )}

        {/* Remove button (top-right) */}
        <button
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-full border border-slate-600/60 bg-slate-900/80 p-1 text-slate-400 opacity-0 backdrop-blur-sm transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* BG removed badge */}
        {bgRemovedSrc && !bgRemoving && (
          <span className="absolute left-2 top-2 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            BG removed
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="p-3">
        {/* File info */}
        <div className="mb-2.5 min-w-0">
          <p className="truncate text-xs font-medium text-slate-100" title={name}>{name}</p>
          {dimensions && <p className="text-[10px] text-slate-500">{dimensions}</p>}
        </div>

        {/* BG removal progress */}
        {bgRemoving && bgProgress && (
          <div className="mb-2.5 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{bgProgress.phase === 'download' ? 'Downloading model…' : 'Processing…'}</span>
              <span>{bgProgress.percent}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${bgProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {bgRemoving && !bgProgress && (
          <div className="mb-2.5 flex items-center gap-1.5 text-[10px] text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Initialising AI model…
          </div>
        )}

        {bgError && (
          <p className="mb-2 text-[10px] text-red-400">{bgError}</p>
        )}

        {/* Actions */}
        <div className="flex gap-1.5">
          <button
            onClick={onRemoveBg}
            disabled={bgRemoving}
            title={bgRemovedSrc ? 'Undo background removal' : 'Remove background'}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              bgRemovedSrc
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-indigo-500/60 hover:bg-indigo-500/10 hover:text-indigo-300'
            }`}
          >
            {bgRemovedSrc ? (
              <><Undo2 className="h-3 w-3" /> Undo BG</>
            ) : (
              <><Eraser className="h-3 w-3" /> Remove BG</>
            )}
          </button>

          <button
            onClick={onExport}
            disabled={!previewDataUrl}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300/80 bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3 w-3" />
            Export
          </button>
        </div>
      </div>
    </article>
  );
}
