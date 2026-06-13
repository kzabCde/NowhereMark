import { Download, Loader2, X, AlertCircle } from 'lucide-react';
import type { WatermarkImageItem } from '@/components/WatermarkPanel';
import { EmptyState } from '@/components/EmptyState';

type Props = {
  items: WatermarkImageItem[];
  onExport: (idx: number) => void;
  onRemove: (id: string) => void;
};

export function WatermarkPreviewGrid({ items, onExport, onRemove }: Props) {
  if (!items.length) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, idx) => (
        <article
          key={item.id}
          className="group rounded-xl border border-slate-700/80 bg-slate-900/85 shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition hover:border-slate-600"
        >
          <div className="relative">
            {item.previewDataUrl ? (
              <img
                src={item.previewDataUrl}
                alt={`Preview ${item.name}`}
                className="h-auto w-full rounded-t-xl border-b border-slate-700/60 bg-slate-950"
              />
            ) : item.error ? (
              <div className="flex h-48 items-center justify-center gap-2 rounded-t-xl border-b border-slate-700/60 bg-slate-800 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {item.error}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center gap-2 rounded-t-xl border-b border-slate-700/60 bg-slate-800 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                Rendering…
              </div>
            )}

            <button
              aria-label={`Remove ${item.name}`}
              onClick={() => onRemove(item.id)}
              className="absolute right-2 top-2 rounded-full border border-slate-600/60 bg-slate-900/80 p-1 text-slate-400 opacity-0 backdrop-blur-sm transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-3">
            <div className="mb-2.5 min-w-0">
              <p className="truncate text-xs font-medium text-slate-100" title={item.name}>{item.name}</p>
              {item.dimensions && <p className="text-[10px] text-slate-500">{item.dimensions}</p>}
            </div>
            <button
              onClick={() => onExport(idx)}
              disabled={!item.previewDataUrl}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300/80 bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
