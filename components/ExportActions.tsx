export function ExportActions({ canExport, onExportAll }: { canExport: boolean; onExportAll: () => void; }) {
  return <div className='sticky bottom-3 rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.45)]'>
    <button disabled={!canExport} onClick={onExportAll} className='w-full rounded-lg border border-slate-200/80 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45'>Export all</button>
  </div>;
}
