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
  margin: number;
  rotation: number;
  position: WatermarkPosition;
}

export interface TextWatermarkSettings extends BaseWatermarkSettings {
  text: string;
  fontSize: number;
  color: string;
}

export interface ImageWatermarkSettings extends BaseWatermarkSettings {
  sizePercent: number;
}
