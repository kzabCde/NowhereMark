export function ExportActions({ canExport, onExportAll }: { canExport: boolean; onExportAll: () => void; }) {
  return <div className='sticky bottom-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm'>
    <button disabled={!canExport} onClick={onExportAll} className='w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40'>Export all</button>
  </div>;
}
