'use client';

export function WatermarkPreview({ originalSrc, watermarkedSrc }: { originalSrc: string | null; watermarkedSrc: string | null }) {
  return <div className="grid gap-4 md:grid-cols-2">{[ ['Original',originalSrc], ['Watermarked', watermarkedSrc] ].map(([label,src])=><div key={label} className="rounded-lg border border-slate-200 p-2 dark:border-slate-800"><p className="mb-2 text-xs uppercase tracking-wide text-slate-500">{label}</p>{src?<img src={src} alt={label} className="w-full rounded"/>:<div className="flex h-44 items-center justify-center text-sm text-slate-500">No image yet</div>}</div>)}</div>;
}
