'use client';

export function WatermarkUploader({ onFile }: { onFile: (f: File | null) => void }) {
  return <div><label className='mb-1 block text-sm font-medium'>Watermark image</label><input className='w-full text-sm' type='file' accept='.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml' onChange={(e) => onFile(e.target.files?.[0] ?? null)} /></div>;
}
