'use client';
import { applyLayoutPreset } from '@/lib/watermark-presets';
import type { LayoutPreset, WatermarkSettings } from '@/types/watermark';

const presets: LayoutPreset[] = ['top-left','top-center','top-right','center-left','center','center-right','bottom-left','bottom-center','bottom-right','tiled-diagonal'];

export function WatermarkControls({ settings, setSettings }: { settings: WatermarkSettings; setSettings: (s: WatermarkSettings) => void }) {
  const update = <K extends keyof WatermarkSettings>(k: K, v: WatermarkSettings[K]) => setSettings({ ...settings, [k]: v });
  return <div className='space-y-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800'>
    <select value={settings.mode} onChange={(e)=>update('mode', e.target.value as WatermarkSettings['mode'])} className='w-full rounded border p-1 bg-transparent'>
      <option value='image'>Image</option><option value='text'>Text</option><option value='hybrid'>Hybrid</option>
    </select>
    <input value={settings.text} onChange={(e)=>update('text',e.target.value)} placeholder='Watermark text' className='w-full rounded border p-1 bg-transparent' />
    <div className='grid grid-cols-2 gap-2 text-xs'>{[['xPercent','X %',0,100],['yPercent','Y %',0,100],['widthPercent','Size %',2,100],['rotation','Rotation',-180,180],['opacity','Opacity',0,1]].map(([k,l,min,max])=><label key={k}>{l}<input type='range' min={min} max={max} step={k==='opacity'?0.01:1} value={settings[k as keyof WatermarkSettings] as number} onChange={(e)=>update(k as keyof WatermarkSettings, Number(e.target.value) as never)} /></label>)}</div>
    <label className='text-xs block'>Blend <select value={settings.blendMode} onChange={(e)=>update('blendMode', e.target.value as GlobalCompositeOperation)} className='w-full rounded border p-1 bg-transparent'><option>source-over</option><option>multiply</option><option>screen</option><option>overlay</option><option>darken</option><option>lighten</option></select></label>
    <div className='grid grid-cols-2 gap-2 text-xs'>{['repeat','flipX','flipY','shadow','stroke'].map((k)=><label key={k}><input type='checkbox' checked={settings[k as keyof WatermarkSettings] as boolean} onChange={(e)=>update(k as keyof WatermarkSettings, e.target.checked as never)} /> {k}</label>)}</div>
    <label className='text-xs block'>Preset <select value={settings.layoutPreset} onChange={(e)=>{ const p=e.target.value as LayoutPreset; const vals=applyLayoutPreset(p); setSettings({...settings, layoutPreset:p, ...vals});}} className='w-full rounded border p-1 bg-transparent'>{presets.map(p=><option key={p} value={p}>{p}</option>)}</select></label>
  </div>;
}
