import { UploadDropzone } from '@/components/UploadDropzone';
import { CheckCircle } from 'lucide-react';

export function WatermarkUploader({
  onFiles,
  fileName,
}: {
  onFiles: (files: FileList | null) => void;
  fileName?: string;
}) {
  return (
    <div className="space-y-2">
      <UploadDropzone
        label=""
        helper="Drop watermark file here (PNG, SVG, WebP)"
        accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
        onFiles={onFiles}
      />
      {fileName && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" />
          {fileName}
        </p>
      )}
    </div>
  );
}
