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

  const preventDefaults = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    setIsDragging(false);
    if (disabled) return;
    onFiles(e.dataTransfer.files);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div>
      <label className='mb-2 block text-sm font-medium text-slate-700'>{label}</label>
      <div
        role='button'
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={onKeyDown}
        onDragEnter={(e) => {
          preventDefaults(e);
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          preventDefaults(e);
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          preventDefaults(e);
          setIsDragging(false);
        }}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 ${
          isDragging ? 'border-slate-900 bg-slate-100' : 'border-slate-300 bg-white hover:border-slate-400'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <Upload className='mx-auto mb-2 h-5 w-5 text-slate-500' />
        <p className='text-sm font-medium text-slate-900'>{isDragging ? 'Drop files here' : helper}</p>
      </div>
      <input
        ref={inputRef}
        type='file'
        className='hidden'
        accept={accept}
        multiple={multiple}
        onChange={(e) => onFiles(e.target.files)}
      />
    </div>
  );
}
