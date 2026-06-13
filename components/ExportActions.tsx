import { Download } from 'lucide-react';

export function ExportActions({
  canExport,
  onExportAll,
}: {
  canExport: boolean;
  onExportAll: () => void;
}) {
  return (
    <div className="sticky bottom-3 rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-sm">
      <button
        disabled={!canExport}
        onClick={onExportAll}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download className="h-4 w-4" />
        Export all images
      </button>
      {!canExport && (
        <p className="mt-1.5 text-center text-[10px] text-slate-500">
          Upload images and configure watermark to export
        </p>
      )}
    </div>
  );
}
