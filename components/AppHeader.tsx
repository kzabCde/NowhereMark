import { PrivacyBadge } from '@/components/PrivacyBadge';
import { ImageIcon, Layers, Eraser } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="mb-6 rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-900/90 to-slate-900/70 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-700/70 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Nowhere Mark</h1>
          <p className="mt-0.5 text-sm text-slate-400">Add your mark. Protect your image.</p>
        </div>
        <PrivacyBadge />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <FeaturePill icon={<ImageIcon className="h-3.5 w-3.5" />} label="Watermark" />
        <FeaturePill icon={<Eraser className="h-3.5 w-3.5" />} label="Remove Background" />
        <FeaturePill icon={<Layers className="h-3.5 w-3.5" />} label="Batch up to 9 images" />
      </div>
    </header>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
      {icon}
      {label}
    </span>
  );
}
