import { Download, Loader2, X } from 'lucide-react';

type Props = { name: string; previewDataUrl?: string; dimensions?: string; onExport: () => void; onRemove: () => void; };

export function PreviewCard({ name, previewDataUrl, dimensions, onExport, onRemove }: Props) {
  return <article className='rounded-xl border border-slate-700 bg-slate-900/85 p-3 shadow-[0_10px_25px_rgba(0,0,0,0.4)]'>
    <div className='mb-2 flex justify-end'>
      <button aria-label={`Remove ${name}`} onClick={onRemove} className='rounded p-1 text-slate-300 hover:bg-slate-700/80 hover:text-slate-100'>
        <X className='h-4 w-4' />
      </button>
    </div>
    {previewDataUrl ? <img src={previewDataUrl} alt={`Preview ${name}`} className='h-auto w-full rounded-lg border border-slate-600 bg-slate-950' /> : <div className='flex h-48 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-200'><Loader2 className='mr-2 h-4 w-4 animate-spin' />Rendering…</div>}
    <div className='mt-3 flex items-center justify-between gap-2'>
      <div className='min-w-0'>
        <p className='truncate text-xs font-medium text-slate-100'>{name}</p>
        {dimensions && <p className='text-xs text-slate-300'>{dimensions}</p>}
      </div>
      <button onClick={onExport} disabled={!previewDataUrl} className='inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-900 hover:bg-white disabled:opacity-50'><Download className='h-3 w-3' />Export</button>
    </div>
  </article>;
}
