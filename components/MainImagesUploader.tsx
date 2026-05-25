import { UploadDropzone } from '@/components/UploadDropzone';

export function MainImagesUploader({ onFiles, count, remaining }: { onFiles: (files: FileList | null) => void; count: number; remaining: number; }) {
  return <div className='space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'>
    <UploadDropzone label='Main images' helper='Drag & drop images here, or click to browse' accept='.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp' multiple onFiles={onFiles} />
    <p className='text-xs text-slate-300'>{count} / 9 images selected • {remaining} remaining</p>
  </div>;
}
