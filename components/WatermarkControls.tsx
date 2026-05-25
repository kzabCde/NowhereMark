'use client';
import { applyLayoutPreset } from '@/lib/watermark-presets';
import type { LayoutPreset, WatermarkSettings } from '@/types/watermark';

const presets: LayoutPreset[] = ['top-left','top-center','top-right','center-left','center','center-right','bottom-left','bottom-center','bottom-right','tiled-diagonal'];

export function WatermarkControls({ settings, setSettings }: { settings: WatermarkSettings; setSettings: (s: WatermarkSettings) => void }) {
  const update = <K extends keyof WatermarkSettings>(k: K, v: WatermarkSettings[K]) => setSettings({ ...settings, [k]: v });
  return <div className='space-y-3 rounded-xl border border-slate-700 bg-slate-900/80 p-4 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)]'>
    <div className='grid grid-cols-3 gap-2'>
      {(['image', 'text', 'hybrid'] as const).map((mode) => <button key={mode} onClick={() => update('mode', mode)} className={`rounded-md border px-2 py-1 text-xs font-medium capitalize ${settings.mode === mode ? 'border-slate-200 bg-slate-100 text-slate-900' : 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'}`}>{mode}</button>)}
    </div>
    <input value={settings.text} onChange={(e)=>update('text',e.target.value)} placeholder='Watermark text' className='w-full rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-slate-100 placeholder:text-slate-400' />
    <div className='grid grid-cols-2 gap-2 text-xs'>{[['xPercent','X %',0,100],['yPercent','Y %',0,100],['widthPercent','Size %',2,100],['rotation','Rotation',-180,180],['opacity','Opacity',0,1]].map(([k,l,min,max])=><label key={k} className='text-slate-200'>{l}<input className='mt-1 w-full accent-slate-100' type='range' min={min} max={max} step={k==='opacity'?0.01:1} value={settings[k as keyof WatermarkSettings] as number} onChange={(e)=>update(k as keyof WatermarkSettings, Number(e.target.value) as never)} /></label>)}</div>
    <label className='block text-xs text-slate-200'>Blend <select value={settings.blendMode} onChange={(e)=>update('blendMode', e.target.value as GlobalCompositeOperation)} className='mt-1 w-full rounded border border-slate-600 bg-slate-950 p-1 text-slate-100'><option>source-over</option><option>multiply</option><option>screen</option><option>overlay</option><option>darken</option><option>lighten</option></select></label>
    <div className='grid grid-cols-2 gap-2 text-xs'>{['repeat','flipX','flipY','shadow','stroke'].map((k)=><label key={k} className='flex items-center gap-2 text-slate-200'><input className='accent-slate-100' type='checkbox' checked={settings[k as keyof WatermarkSettings] as boolean} onChange={(e)=>update(k as keyof WatermarkSettings, e.target.checked as never)} /> {k}</label>)}</div>
    <label className='block text-xs text-slate-200'>Preset <select value={settings.layoutPreset} onChange={(e)=>{ const p=e.target.value as LayoutPreset; const vals=applyLayoutPreset(p); setSettings({...settings, layoutPreset:p, ...vals});}} className='mt-1 w-full rounded border border-slate-600 bg-slate-950 p-1 text-slate-100'>{presets.map(p=><option key={p} value={p}>{p}</option>)}</select></label>
  </div>;
}
