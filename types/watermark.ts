export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type WatermarkMode = 'text' | 'image';

export interface BaseWatermarkSettings {
  opacity: number;
  marginPercent: number;
  rotation: number;
  position: WatermarkPosition;
}

export interface TextWatermarkSettings extends BaseWatermarkSettings {
  text: string;
  sizePercent: number;
  color: string;
}

export interface ImageWatermarkSettings extends BaseWatermarkSettings {
  sizePercent: number;
}

export type WatermarkSettings = {
  mode: WatermarkMode;
  text: string;
  imageSrc?: string;
  position: WatermarkPosition;
  opacity: number;
  size: number;
  margin: number;
  rotation: number;
  color: string;
};
