import { ImagePlus, Layers, Eraser, Download } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
      <ImagePlus className="mb-4 h-10 w-10 text-slate-600" />
      <h3 className="mb-1 text-base font-semibold text-slate-200">No images yet</h3>
      <p className="mb-6 text-sm text-slate-500">Upload up to 9 images to get started</p>

      <div className="grid max-w-xs grid-cols-1 gap-2 text-left sm:max-w-sm">
        {[
          { icon: <ImagePlus className="h-3.5 w-3.5" />, text: 'Upload images (JPG, PNG, WebP)' },
          { icon: <Eraser className="h-3.5 w-3.5" />, text: 'Optionally remove backgrounds with AI' },
          { icon: <Layers className="h-3.5 w-3.5" />, text: 'Add text or image watermarks' },
          { icon: <Download className="h-3.5 w-3.5" />, text: 'Export as PNG — all local, no upload' },
        ].map(({ icon, text }, i) => (
          <div key={i} className="flex items-center gap-2.5 text-xs text-slate-500">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400">
              {icon}
            </span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
