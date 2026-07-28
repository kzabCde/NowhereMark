'use client';

export function ExportButton({ onExport, disabled }: { onExport: () => void; disabled?: boolean }) {
  return <button disabled={disabled} onClick={onExport} className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900">Export PNG</button>;
}
