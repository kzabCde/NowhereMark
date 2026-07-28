import type { Config } from '@imgly/background-removal';

export type BgRemovalProgress = {
  phase: 'download' | 'inference' | 'done';
  percent: number;
};

export async function removeBgFromUrl(
  imageSrc: string,
  onProgress?: (p: BgRemovalProgress) => void,
): Promise<string> {
  const response = await fetch(imageSrc);
  const blob = await response.blob();
  const resultBlob = await removeBgFromBlob(blob, onProgress);
  return URL.createObjectURL(resultBlob);
}

export async function removeBgFromBlob(
  blob: Blob,
  onProgress?: (p: BgRemovalProgress) => void,
): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal');

  const config: Config = {
    model: 'isnet_quint8',
    output: { format: 'image/png' },
    debug: false,
    progress: (key: string, current: number, total: number) => {
      if (!onProgress || total === 0) return;
      if (key.startsWith('fetch:')) {
        onProgress({ phase: 'download', percent: Math.round((current / total) * 100) });
      } else if (key.startsWith('compute:')) {
        onProgress({ phase: 'inference', percent: Math.round((current / total) * 100) });
      }
    },
  };

  const resultBlob = await removeBackground(blob, config);
  onProgress?.({ phase: 'done', percent: 100 });
  return resultBlob;
}
