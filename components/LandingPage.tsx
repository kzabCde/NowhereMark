'use client';

import Link from 'next/link';
import { ArrowRight, Check, Images, LockKeyhole, SlidersHorizontal } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ToolCards } from '@/components/ToolCards';
import { useLanguage } from '@/components/LanguageProvider';

export function LandingPage() {
  const { t } = useLanguage();
  const steps = [
    t('landing.step.upload'),
    t('landing.step.transform'),
    t('landing.step.refine'),
    t('landing.step.export'),
  ];

  return (
    <>
      <AppHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[110px]" aria-hidden="true" />
          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr] md:px-8">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-indigo-200">
                {t('landing.eyebrow')}
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl">
                {t('landing.title')}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                {t('landing.description')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(99,102,241,0.22)] transition hover:bg-indigo-400"
                >
                  {t('landing.primary')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tools"
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                >
                  {t('landing.secondary')}
                </Link>
              </div>
              <div className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-5">
                <Metric value="6" label={t('landing.metric.tools')} />
                <Metric value="9" label={t('landing.metric.images')} />
                <Metric value="0" label={t('landing.metric.upload')} />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-indigo-500/15 via-transparent to-cyan-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c111b]/95 p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Local workspace</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                  <div className="space-y-2">
                    {[SlidersHorizontal, Images, LockKeyhole].map((Icon, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[11px] ${
                          index === 0
                            ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200'
                            : 'border-white/5 bg-white/[0.025] text-slate-500'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {steps[index]}
                      </div>
                    ))}
                  </div>
                  <div className="image-demo relative min-h-72 overflow-hidden rounded-xl border border-white/10">
                    <div className="absolute inset-5 rounded-xl border border-white/20 bg-gradient-to-br from-indigo-400/30 via-cyan-300/10 to-slate-950 shadow-2xl">
                      <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/10 bg-black/40 p-3 backdrop-blur">
                        <span className="block h-1.5 w-16 rounded bg-white/60" />
                        <span className="mt-2 block h-1.5 w-28 rounded bg-white/20" />
                      </div>
                      <span className="absolute right-4 top-4 rounded-md bg-white/90 px-2 py-1 text-[9px] font-black tracking-wider text-slate-900">
                        NOWHERE
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-[10px] text-emerald-300">
                  <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3" /> Non-destructive pipeline</span>
                  <span>1080 × 1350 · WebP</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">NOWHERE MARK SUITE</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{t('tools.title')}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{t('tools.description')}</p>
            </div>
            <ToolCards />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="grid gap-10 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-white/[0.025] to-cyan-500/5 p-8 md:grid-cols-[1fr_1.1fr] md:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">WORKFLOW</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">{t('landing.workflow')}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">{t('landing.workflowDescription')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <span className="text-xs font-bold text-indigo-300">0{index + 1}</span>
                  <p className="mt-6 text-sm font-semibold text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 first:pl-0">
      <span className="block text-2xl font-semibold text-white">{value}</span>
      <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</span>
    </div>
  );
}
