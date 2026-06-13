import { UploadDropzone } from '@/components/UploadDropzone';
import { MAX_MAIN_IMAGES } from '@/lib/file-utils';

export function MainImagesUploader({
  onFiles,
  count,
  remaining,
}: {
  onFiles: (files: FileList | null) => void;
  count: number;
  remaining: number;
}) {
  return (
    <div className="space-y-2">
      <UploadDropzone
        label=""
        helper={count === 0 ? 'Drag & drop images here, or click to browse' : `Add more images (${remaining} remaining)`}
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        multiple
        onFiles={onFiles}
        disabled={remaining === 0}
      />
      {count > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(count / MAX_MAIN_IMAGES) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-slate-400">
            {count} / {MAX_MAIN_IMAGES}
          </span>
        </div>
      )}
    </div>
  );
}
