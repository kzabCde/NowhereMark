import { PrivacyBadge } from '@/components/PrivacyBadge';

export function AppHeader() {
  return <header className='mb-6 rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-900/90 to-slate-900/70 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.45)]'>
    <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-4'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight text-slate-50'>Nowhere Mark</h1>
        <p className='text-sm text-slate-300'>Add your mark. Protect your image.</p>
      </div>
      <PrivacyBadge />
    </div>
  </header>;
}
