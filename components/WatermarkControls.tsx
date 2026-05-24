'use client';
import { PositionSelector } from '@/components/PositionSelector';
import type { ImageWatermarkSettings, TextWatermarkSettings, WatermarkMode } from '@/types/watermark';

export function WatermarkControls(props: {
  mode: WatermarkMode; setMode: (m: WatermarkMode)=>void;
  text: TextWatermarkSettings; setText: (v: TextWatermarkSettings)=>void;
  image: ImageWatermarkSettings; setImage: (v: ImageWatermarkSettings)=>void;
  onImageWatermark: (f?: File)=>void; imageError: string | null;
  watermarkPreviewSrc?: string;
}) {
  const { mode,setMode,text,setText,image,setImage,onImageWatermark,imageError,watermarkPreviewSrc } = props;
  const base = mode === 'text' ? text : image;
  return <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
    <div className="flex gap-2"><button onClick={()=>setMode('text')} className={`rounded px-3 py-1 text-sm ${mode==='text'?'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900':'border border-slate-300 dark:border-slate-700'}`}>Text</button><button onClick={()=>setMode('image')} className={`rounded px-3 py-1 text-sm ${mode==='image'?'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900':'border border-slate-300 dark:border-slate-700'}`}>Image</button></div>
    {mode==='text'?<><input value={text.text} onChange={(e)=>setText({...text,text:e.target.value})} placeholder='Watermark text' className='w-full rounded border border-slate-300 bg-transparent px-2 py-1 dark:border-slate-700'/><label className='block text-xs'>Font size <input type='range' min={12} max={180} value={text.fontSize} onChange={(e)=>setText({...text,fontSize:Number(e.target.value)})}/></label><label className='block text-xs'>Color <input type='color' value={text.color} onChange={(e)=>setText({...text,color:e.target.value || '#ffffff'})}/></label></>:<><input type='file' accept='.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml' onChange={(e)=>onImageWatermark(e.target.files?.[0])} className='text-xs'/>{imageError?<p className='text-xs text-red-500'>{imageError}</p>:null}{watermarkPreviewSrc?<div className='rounded border border-slate-300 p-2 dark:border-slate-700'><p className='mb-2 text-xs text-slate-500'>Watermark preview</p><img src={watermarkPreviewSrc} alt='Uploaded watermark preview' className='max-h-24 w-auto rounded' /></div>:<p className='text-xs text-amber-600 dark:text-amber-400'>Upload a watermark image first.</p>}<label className='block text-xs'>Size % <input type='range' min={5} max={60} value={image.sizePercent} onChange={(e)=>setImage({...image,sizePercent:Number(e.target.value)})}/></label></>}
    <label className='block text-xs'>Opacity <input type='range' min={0.1} max={1} step={0.05} value={base.opacity} onChange={(e)=>mode==='text'?setText({...text,opacity:Number(e.target.value)}):setImage({...image,opacity:Number(e.target.value)})}/></label>
    <label className='block text-xs'>Margin <input type='range' min={0} max={120} value={base.margin} onChange={(e)=>mode==='text'?setText({...text,margin:Number(e.target.value)}):setImage({...image,margin:Number(e.target.value)})}/></label>
    <label className='block text-xs'>Rotation <input type='range' min={-180} max={180} value={base.rotation} onChange={(e)=>mode==='text'?setText({...text,rotation:Number(e.target.value)}):setImage({...image,rotation:Number(e.target.value)})}/></label>
    <PositionSelector value={base.position} onChange={(v)=>mode==='text'?setText({...text,position:v}):setImage({...image,position:v})} />
  </div>;
}
