'use client';
import { Upload } from 'lucide-react';
import { isValidSourceImageType } from '@/lib/file-utils';

export function ImageUploader({ onFile, error, setError }: { onFile: (f: File) => void; error: string | null; setError: (e: string | null) => void }) {
  const handleFile = (file?: File) => {
    if (!file) return;
    if (!isValidSourceImageType(file)) {
      setError('Unsupported file type. Please upload JPG, JPEG, PNG, or WebP.');
      return;
    }
    setError(null);
    onFile(file);
  };

  return <label onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault(); handleFile(e.dataTransfer.files[0]);}} className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
    <Upload className="mb-2 h-6 w-6" />
    <span className="text-sm">Drag & drop image or click to select</span>
    <input className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(e)=>handleFile(e.target.files?.[0])} />
    {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
  </label>;
}
