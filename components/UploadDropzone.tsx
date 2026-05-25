'use client';

import { Upload } from 'lucide-react';
import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react';

type Props = {
  label: string;
  helper: string;
  accept: string;
  multiple?: boolean;
  onFiles: (files: FileList | null) => void;
  disabled?: boolean;
};

export function UploadDropzone({ label, helper, accept, multiple, onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const preventDefaults = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };

  return <div>
    <label className='mb-2 block text-sm font-medium text-slate-100'>{label}</label>
    <div
      role='button'
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }
      }}
      onDragEnter={(e) => { preventDefaults(e); setIsDragging(true); }}
      onDragOver={(e) => { preventDefaults(e); setIsDragging(true); }}
      onDragLeave={(e) => { preventDefaults(e); setIsDragging(false); }}
      onDrop={(e) => { preventDefaults(e); setIsDragging(false); if (!disabled) onFiles(e.dataTransfer.files); }}
      className={`rounded-xl border-2 border-dashed p-6 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100/80 ${
        isDragging ? 'border-slate-100 bg-slate-700/50 shadow-[0_0_0_1px_rgba(255,255,255,0.4)]' : 'border-slate-500/80 bg-slate-900/60 hover:border-slate-300'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <Upload className='mx-auto mb-2 h-5 w-5 text-slate-300' />
      <p className='text-sm font-medium text-slate-100'>{isDragging ? 'Drop files here' : helper}</p>
    </div>
    <input ref={inputRef} type='file' className='hidden' accept={accept} multiple={multiple} onChange={(e) => onFiles(e.target.files)} />
  </div>;
}
