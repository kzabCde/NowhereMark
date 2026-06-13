import { PrivacyBadge } from '@/components/PrivacyBadge';

export function AppHeader() {
  return (
    <header className="mb-5 rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-900/90 to-slate-900/70 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Nowhere Mark</h1>
          <p className="mt-0.5 text-sm text-slate-400">Privacy-first image tools — everything runs in your browser</p>
        </div>
        <PrivacyBadge />
      </div>
    </header>
  );
}
