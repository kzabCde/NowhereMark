'use client';
import { PositionSelector } from '@/components/PositionSelector';
import type { ImageWatermarkSettings, TextWatermarkSettings, WatermarkMode, WatermarkPosition } from '@/types/watermark';

export function WatermarkControls(props: {
  mode: WatermarkMode; setMode: (m: WatermarkMode)=>void;
  text: TextWatermarkSettings; setText: (v: TextWatermarkSettings)=>void;
  image: ImageWatermarkSettings; setImage: (v: ImageWatermarkSettings)=>void;
  onImageWatermark: (f?: File)=>void; imageError: string | null;
  watermarkPreviewSrc?: string;
  positionPreset: WatermarkPosition;
  onPresetChange: (v: WatermarkPosition)=>void;
  onResetPosition: ()=>void;
}) {
  const { mode,setMode,text,setText,image,setImage,onImageWatermark,imageError,watermarkPreviewSrc,positionPreset,onPresetChange,onResetPosition } = props;
  const base = mode === 'text' ? text : image;
  return <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
    <div className='flex items-center justify-between'><div className="flex gap-2"><button onClick={()=>setMode('text')} className={`rounded px-3 py-1 text-sm ${mode==='text'?'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900':'border border-slate-300 dark:border-slate-700'}`}>Text</button><button onClick={()=>setMode('image')} className={`rounded px-3 py-1 text-sm ${mode==='image'?'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900':'border border-slate-300 dark:border-slate-700'}`}>Image</button></div><button type='button' onClick={onResetPosition} className='rounded border px-2 py-1 text-xs'>Reset Position</button></div>
    {mode==='text'?<><input value={text.text} onChange={(e)=>setText({...text,text:e.target.value})} placeholder='Watermark text' className='w-full rounded border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-700'/><label className='block text-xs'>Color <input type='color' value={text.color} onChange={(e)=>setText({...text,color:e.target.value || '#ffffff'})}/></label></>:<><input type='file' accept='.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml' onChange={(e)=>onImageWatermark(e.target.files?.[0])} className='text-xs'/>{imageError?<p className='text-xs text-red-500'>{imageError}</p>:null}{watermarkPreviewSrc?<img src={watermarkPreviewSrc} alt='Uploaded watermark preview' className='max-h-24 w-auto rounded border p-1' />:<p className='text-xs text-amber-600 dark:text-amber-400'>Upload a watermark image first.</p>}</>}
    <label className='block text-xs'>Opacity <input type='range' min={0.1} max={1} step={0.05} value={base.opacity} onChange={(e)=>mode==='text'?setText({...text,opacity:Number(e.target.value)}):setImage({...image,opacity:Number(e.target.value)})}/></label>
    <PositionSelector value={positionPreset} onChange={onPresetChange} />
  </div>;
}
