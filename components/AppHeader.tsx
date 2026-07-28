'use client';

import Link from 'next/link';
import { Languages, Menu, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

export function AppHeader() {
  const { locale, toggleLocale, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06080c]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Nowhere Mark home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_24px_rgba(99,102,241,0.16)]">
            <span className="text-sm font-black tracking-tighter">NM</span>
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-white">NOWHERE MARK</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">{t('brand.tagline')}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <NavLink href="/">{t('nav.home')}</NavLink>
          <NavLink href="/tools">{t('nav.tools')}</NavLink>
          <Link
            href="/editor"
            className="ml-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            {t('nav.editor')}
          </Link>
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t('nav.language')}
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <Languages className="h-4 w-4" />
            {locale === 'th' ? 'EN' : 'TH'}
          </button>
          <span className="ml-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t('privacy.local')}
          </span>
        </nav>

        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-slate-300 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#090d14] px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <NavLink href="/" onClick={() => setMobileOpen(false)}>{t('nav.home')}</NavLink>
            <NavLink href="/tools" onClick={() => setMobileOpen(false)}>{t('nav.tools')}</NavLink>
            <NavLink href="/editor" onClick={() => setMobileOpen(false)}>{t('nav.editor')}</NavLink>
            <button
              type="button"
              onClick={toggleLocale}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300"
            >
              <Languages className="h-4 w-4" />
              {locale === 'th' ? 'English' : 'ภาษาไทย'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}
