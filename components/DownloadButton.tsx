'use client';
import { Download } from 'lucide-react';

export function DownloadButton({ onDownload, disabled }: { onDownload: () => void; disabled: boolean }) {
  return <button type="button" disabled={disabled} onClick={onDownload} className="inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"><Download className="h-4 w-4" />Download PNG</button>;
}
