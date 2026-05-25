import { UploadDropzone } from '@/components/UploadDropzone';

export function WatermarkUploader({ onFiles, fileName }: { onFiles: (files: FileList | null) => void; fileName?: string; }) {
  return <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2'>
    <UploadDropzone label='Watermark file' helper='Upload one watermark file' accept='.png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml' onFiles={onFiles} />
    <p className='text-xs text-slate-600'>{fileName ? `Selected: ${fileName}` : 'No watermark selected'}</p>
  </div>;
}
