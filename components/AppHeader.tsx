import { PrivacyBadge } from '@/components/PrivacyBadge';

export function AppHeader() {
  return <header className='mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>Nowhere Mark</h1>
        <p className='text-sm text-slate-600'>Add your mark. Protect your image.</p>
      </div>
      <PrivacyBadge />
    </div>
  </header>;
}
