'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { applyLayoutPreset } from '@/lib/watermark-presets';
import type { LayoutPreset, WatermarkSettings } from '@/types/watermark';

const presets: LayoutPreset[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
  'tiled-diagonal',
];

const blendModes: GlobalCompositeOperation[] = [
  'source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
];

export function WatermarkControls({
  settings,
  setSettings,
}: {
  settings: WatermarkSettings;
  setSettings: (s: WatermarkSettings) => void;
}) {
  const update = <K extends keyof WatermarkSettings>(k: K, v: WatermarkSettings[K]) =>
    setSettings({ ...settings, [k]: v });

  return (
    <div className="space-y-3 text-slate-100">
      {/* Mode */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Mode</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['image', 'text', 'hybrid'] as const).map((m) => (
            <button
              key={m}
              onClick={() => update('mode', m)}
              className={`rounded-lg border py-1.5 text-xs font-medium capitalize transition ${
                settings.mode === m
                  ? 'border-indigo-400/80 bg-indigo-500/20 text-indigo-200'
                  : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Text input (text/hybrid) */}
      {(settings.mode === 'text' || settings.mode === 'hybrid') && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Watermark text</label>
          <input
            value={settings.text}
            onChange={(e) => update('text', e.target.value)}
            placeholder="Your watermark text…"
            className="w-full rounded-lg border border-slate-600 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500/60 focus:outline-none"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Color</label>
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) => update('textColor', e.target.value)}
                className="h-8 w-full cursor-pointer rounded-md border border-slate-600 bg-slate-950 p-0.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Font size: {settings.fontSize}px</label>
              <input
                type="range"
                min={12}
                max={200}
                value={settings.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
                className="mt-1.5 w-full accent-indigo-400"
              />
            </div>
          </div>
          <div className="mt-2 flex gap-3">
            <Toggle
              label="Bold"
              checked={settings.textBold}
              onChange={(v) => update('textBold', v)}
            />
            <Toggle
              label="Italic"
              checked={settings.textItalic}
              onChange={(v) => update('textItalic', v)}
            />
          </div>
        </div>
      )}

      {/* Layout preset */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Layout preset</label>
        <select
          value={settings.layoutPreset}
          onChange={(e) => {
            const p = e.target.value as LayoutPreset;
            setSettings({ ...settings, layoutPreset: p, ...applyLayoutPreset(p) });
          }}
          className="w-full rounded-lg border border-slate-600 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500/60 focus:outline-none"
        >
          {presets.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Position & Size */}
      <Collapsible title="Position & Size">
        <SliderRow label="X position" value={settings.xPercent} min={0} max={100} unit="%" onChange={(v) => update('xPercent', v)} />
        <SliderRow label="Y position" value={settings.yPercent} min={0} max={100} unit="%" onChange={(v) => update('yPercent', v)} />
        <SliderRow label="Size" value={settings.widthPercent} min={2} max={100} unit="%" onChange={(v) => update('widthPercent', v)} />
        <SliderRow label="Rotation" value={settings.rotation} min={-180} max={180} unit="°" onChange={(v) => update('rotation', v)} />
      </Collapsible>

      {/* Appearance */}
      <Collapsible title="Appearance">
        <SliderRow
          label="Opacity"
          value={Math.round(settings.opacity * 100)}
          min={0}
          max={100}
          unit="%"
          onChange={(v) => update('opacity', v / 100)}
        />
        <div className="mt-2">
          <label className="mb-1 block text-xs text-slate-400">Blend mode</label>
          <select
            value={settings.blendMode}
            onChange={(e) => update('blendMode', e.target.value as GlobalCompositeOperation)}
            className="w-full rounded-lg border border-slate-600 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-100"
          >
            {blendModes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Toggle label="Repeat" checked={settings.repeat} onChange={(v) => update('repeat', v)} />
          <Toggle label="Flip X" checked={settings.flipX} onChange={(v) => update('flipX', v)} />
          <Toggle label="Flip Y" checked={settings.flipY} onChange={(v) => update('flipY', v)} />
        </div>
      </Collapsible>

      {/* Shadow & Stroke */}
      <Collapsible title="Shadow & Stroke">
        <Toggle label="Shadow" checked={settings.shadow} onChange={(v) => update('shadow', v)} />
        {settings.shadow && (
          <div className="mt-2 space-y-2 pl-2">
            <div className="flex items-center gap-2">
              <label className="w-20 shrink-0 text-xs text-slate-400">Color</label>
              <input type="color" value={settings.shadowColor} onChange={(e) => update('shadowColor', e.target.value)}
                className="h-7 w-full cursor-pointer rounded border border-slate-600 bg-slate-950 p-0.5" />
            </div>
            <SliderRow label="Blur" value={settings.shadowBlur} min={0} max={40} onChange={(v) => update('shadowBlur', v)} />
            <SliderRow label="Offset X" value={settings.shadowOffsetX} min={-20} max={20} onChange={(v) => update('shadowOffsetX', v)} />
            <SliderRow label="Offset Y" value={settings.shadowOffsetY} min={-20} max={20} onChange={(v) => update('shadowOffsetY', v)} />
          </div>
        )}
        <div className="mt-2">
          <Toggle label="Stroke" checked={settings.stroke} onChange={(v) => update('stroke', v)} />
          {settings.stroke && (
            <div className="mt-2 space-y-2 pl-2">
              <div className="flex items-center gap-2">
                <label className="w-20 shrink-0 text-xs text-slate-400">Color</label>
                <input type="color" value={settings.strokeColor} onChange={(e) => update('strokeColor', e.target.value)}
                  className="h-7 w-full cursor-pointer rounded border border-slate-600 bg-slate-950 p-0.5" />
              </div>
              <SliderRow label="Width" value={settings.strokeWidth} min={1} max={20} onChange={(v) => update('strokeWidth', v)} />
            </div>
          )}
        </div>
      </Collapsible>

      {/* Image effects */}
      <Collapsible title="Image effects">
        <SliderRow label="Grayscale" value={settings.grayscale} min={0} max={100} unit="%" onChange={(v) => update('grayscale', v)} />
        <SliderRow label="Brightness" value={settings.brightness} min={0} max={200} unit="%" onChange={(v) => update('brightness', v)} />
        <SliderRow label="Contrast" value={settings.contrast} min={0} max={200} unit="%" onChange={(v) => update('contrast', v)} />
        <SliderRow label="Invert" value={settings.invert} min={0} max={100} unit="%" onChange={(v) => update('invert', v)} />
        <SliderRow label="Blur" value={settings.blur} min={0} max={20} unit="px" onChange={(v) => update('blur', v)} />
      </Collapsible>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums text-slate-300">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-400"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300 select-none">
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${
          checked ? 'bg-indigo-500' : 'bg-slate-600'
        }`}
      >
        <span
          className={`absolute h-3 w-3 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
      {label}
    </label>
  );
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/30">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-slate-100"
      >
        {title}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-slate-700/60 px-3 pb-3">{children}</div>}
    </div>
  );
}
