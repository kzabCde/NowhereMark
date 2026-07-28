'use client';

import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-slate-500 sm:flex-row md:px-8">
        <p>{t('footer.copy')}</p>
        <p className="inline-flex items-center gap-1.5 text-emerald-300/80">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t('privacy.local')}
        </p>
      </div>
    </footer>
  );
}
