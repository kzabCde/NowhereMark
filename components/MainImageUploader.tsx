'use client';

export function MainImageUploader({ onFile }: { onFile: (f: File | null) => void }) {
  return <div><label className='mb-1 block text-sm font-medium'>Main image</label><input className='w-full text-sm' type='file' accept='.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp' onChange={(e) => onFile(e.target.files?.[0] ?? null)} /></div>;
}
