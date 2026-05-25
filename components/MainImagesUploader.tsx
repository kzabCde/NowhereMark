import { UploadDropzone } from '@/components/UploadDropzone';

export function MainImagesUploader({ onFiles, count, remaining }: { onFiles: (files: FileList | null) => void; count: number; remaining: number; }) {
  return <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2'>
    <UploadDropzone label='Main images' helper='Drag & drop images here, or click to browse' accept='.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp' multiple onFiles={onFiles} />
    <p className='text-xs text-slate-600'>{count} / 9 images selected • {remaining} remaining</p>
  </div>;
}
