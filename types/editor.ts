import type { WatermarkSettings } from '@/types/watermark';

export type Locale = 'th' | 'en';
export type EditorTool = 'transform' | 'adjust' | 'background' | 'watermark' | 'export';
export type ExportMime = 'image/png' | 'image/jpeg' | 'image/webp';

export interface CropSettings {
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  aspectRatio?: [number, number];
}

export interface ResizeSettings {
  width: number | null;
  height: number | null;
  keepAspectRatio: boolean;
}

export interface AdjustmentSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  blur: number;
}

export interface TransformSettings {
  crop: CropSettings;
  resize: ResizeSettings;
  rotation: 0 | 90 | 180 | 270;
  flipX: boolean;
  flipY: boolean;
}

export interface OutputSettings {
  mimeType: ExportMime;
  quality: number;
  backgroundColor: string;
}

export interface ProjectSettings {
  transform: TransformSettings;
  adjustments: AdjustmentSettings;
  watermarkEnabled: boolean;
  watermark: WatermarkSettings;
  output: OutputSettings;
}

export interface WorkspaceImage {
  id: string;
  file: File;
  sourceUrl: string;
  name: string;
  width: number;
  height: number;
  backgroundBlob?: Blob;
  backgroundUrl?: string;
  backgroundRemoving?: boolean;
  backgroundError?: string;
}

export interface RenderRequest {
  settings: ProjectSettings;
  previewMaxDimension?: number;
}

export interface RenderResult {
  blob: Blob;
  width: number;
  height: number;
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  transform: {
    crop: {
      xPercent: 0,
      yPercent: 0,
      widthPercent: 100,
      heightPercent: 100,
    },
    resize: {
      width: null,
      height: null,
      keepAspectRatio: true,
    },
    rotation: 0,
    flipX: false,
    flipY: false,
  },
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    blur: 0,
  },
  watermarkEnabled: false,
  watermark: {
    mode: 'text',
    xPercent: 85,
    yPercent: 85,
    widthPercent: 20,
    rotation: 0,
    opacity: 0.8,
    blendMode: 'source-over',
    repeat: false,
    flipX: false,
    flipY: false,
    shadow: true,
    shadowColor: '#000000',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    stroke: false,
    strokeColor: '#ffffff',
    strokeWidth: 2,
    grayscale: 0,
    brightness: 100,
    contrast: 100,
    invert: 0,
    blur: 0,
    text: 'Nowhere Mark',
    fontSize: 48,
    textColor: '#ffffff',
    textStrokeColor: '#000000',
    textBold: true,
    textItalic: false,
    letterSpacing: 0,
    layoutPreset: 'bottom-right',
  },
  output: {
    mimeType: 'image/png',
    quality: 0.9,
    backgroundColor: '#ffffff',
  },
};
