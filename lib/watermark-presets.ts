import type { LayoutPreset } from '@/types/watermark';

export function applyLayoutPreset(preset: LayoutPreset): Pick<{xPercent:number;yPercent:number;rotation:number;repeat:boolean},'xPercent'|'yPercent'|'rotation'|'repeat'> {
  const map: Record<Exclude<LayoutPreset, 'tiled-diagonal'>, [number, number]> = {
    'top-left': [10, 10], 'top-center': [50, 10], 'top-right': [90, 10],
    'center-left': [10, 50], center: [50, 50], 'center-right': [90, 50],
    'bottom-left': [10, 90], 'bottom-center': [50, 90], 'bottom-right': [90, 90],
  };
  if (preset === 'tiled-diagonal') return { xPercent: 50, yPercent: 50, rotation: -30, repeat: true };
  const [xPercent, yPercent] = map[preset];
  return { xPercent, yPercent, rotation: 0, repeat: false };
}
