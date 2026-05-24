export type WatermarkMode = 'image' | 'text' | 'hybrid';
export type LayoutPreset =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'tiled-diagonal';

export interface WatermarkSettings {
  mode: WatermarkMode;
  watermarkImageSrc?: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  rotation: number;
  opacity: number;
  blendMode: GlobalCompositeOperation;
  repeat: boolean;
  flipX: boolean;
  flipY: boolean;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  grayscale: number;
  brightness: number;
  contrast: number;
  invert: number;
  blur: number;
  text: string;
  fontSize: number;
  textColor: string;
  textStrokeColor: string;
  textBold: boolean;
  textItalic: boolean;
  letterSpacing: number;
  layoutPreset: LayoutPreset;
}
