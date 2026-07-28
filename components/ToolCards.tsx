'use client';

import Link from 'next/link';
import {
  Crop,
  ImageMinus,
  ImagePlus,
  Layers3,
  Minimize2,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import type { TranslationKey } from '@/lib/i18n';

const tools: Array<{
  title: TranslationKey;
  description: TranslationKey;
  icon: LucideIcon;
  accent: string;
}> = [
  {
    title: 'tool.resize',
    description: 'tool.resizeDescription',
    icon: Crop,
    accent: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300',
  },
  {
    title: 'tool.adjust',
    description: 'tool.adjustDescription',
    icon: ImagePlus,
    accent: 'from-cyan-500/20 to-cyan-500/5 text-cyan-300',
  },
  {
    title: 'tool.background',
    description: 'tool.backgroundDescription',
    icon: ImageMinus,
    accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
  },
  {
    title: 'tool.watermark',
    description: 'tool.watermarkDescription',
    icon: Layers3,
    accent: 'from-violet-500/20 to-violet-500/5 text-violet-300',
  },
  {
    title: 'tool.compress',
    description: 'tool.compressDescription',
    icon: Minimize2,
    accent: 'from-amber-500/20 to-amber-500/5 text-amber-300',
  },
  {
    title: 'tool.convert',
    description: 'tool.convertDescription',
    icon: RefreshCw,
    accent: 'from-rose-500/20 to-rose-500/5 text-rose-300',
  },
];

export function ToolCards() {
  const { t } = useLanguage();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tools.map(({ title, description, icon: Icon, accent }) => (
        <article
          key={title}
          className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.055]"
        >
          <span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}>
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="text-base font-semibold text-white">{t(title)}</h3>
          <p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-400">{t(description)}</p>
          <Link
            href="/editor"
            className="mt-5 inline-flex text-xs font-semibold text-indigo-300 transition group-hover:text-indigo-200"
          >
            {t('tools.open')} →
          </Link>
        </article>
      ))}
    </div>
  );
}
