import type { WatermarkPosition } from '@/types/watermark';

const positions: WatermarkPosition[] = ['top-left','top-center','top-right','center-left','center','center-right','bottom-left','bottom-center','bottom-right'];

export function PositionSelector({ value, onChange }: { value: WatermarkPosition; onChange: (v: WatermarkPosition) => void }) {
  return <div className="grid grid-cols-3 gap-1">{positions.map((p)=><button key={p} type="button" onClick={()=>onChange(p)} className={`rounded border px-2 py-2 text-xs ${value===p?'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900':'border-slate-300 dark:border-slate-700'}`}>{p}</button>)}</div>;
}
