import { UploadDropzone } from '@/components/UploadDropzone';

export function WatermarkUploader({ onFiles, fileName }: { onFiles: (files: FileList | null) => void; fileName?: string; }) {
  return <div className='space-y-2 rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'>
    <UploadDropzone label='Watermark file' helper='Upload one watermark file' accept='.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml' onFiles={onFiles} />
    <p className='text-xs text-slate-300'>{fileName ? `Selected: ${fileName}` : 'No watermark selected'}</p>
  </div>;
}
