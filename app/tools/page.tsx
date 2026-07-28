'use client';

import { AppHeader } from '@/components/AppHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ToolCards } from '@/components/ToolCards';
import { useLanguage } from '@/components/LanguageProvider';

export default function ToolsPage() {
  const { t } = useLanguage();
  return (
    <>
      <AppHeader />
      <main className="mx-auto min-h-[calc(100vh-145px)] max-w-7xl px-4 py-16 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">NOWHERE MARK SUITE</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{t('tools.title')}</h1>
        <p className="mb-10 mt-4 max-w-2xl text-sm leading-7 text-slate-400">{t('tools.description')}</p>
        <ToolCards />
      </main>
      <SiteFooter />
    </>
  );
}
