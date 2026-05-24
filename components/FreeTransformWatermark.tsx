'use client';
import { useRef, useState } from 'react';
import { TransformHandles } from '@/components/TransformHandles';
import type { WatermarkMode, WatermarkTransform } from '@/types/watermark';
import { clampTransform } from '@/lib/watermark-transform';

export function FreeTransformWatermark({ mode, text, imageSrc, color, transform, onTransformChange }: { mode: WatermarkMode; text: string; imageSrc?: string; color: string; transform: WatermarkTransform; onTransformChange: (next: WatermarkTransform) => void; }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<{ type: 'drag'|'resize'|'rotate'; startX: number; startY: number; start: WatermarkTransform; corner?: string } | null>(null);

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (!interaction || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const dxPercent = ((clientX - interaction.startX) / rect.width) * 100;
    const dyPercent = ((clientY - interaction.startY) / rect.height) * 100;
    let next = { ...interaction.start };
    if (interaction.type === 'drag') {
      next.xPercent += dxPercent; next.yPercent += dyPercent;
    } else if (interaction.type === 'resize') {
      const sign = interaction.corner === 'nw' || interaction.corner === 'sw' ? -1 : 1;
      next.widthPercent += dxPercent * sign;
    } else {
      const cx = rect.left + (interaction.start.xPercent / 100) * rect.width;
      const cy = rect.top + (interaction.start.yPercent / 100) * rect.height;
      const a0 = Math.atan2(interaction.startY - cy, interaction.startX - cx);
      const a1 = Math.atan2(clientY - cy, clientX - cx);
      next.rotation = interaction.start.rotation + ((a1 - a0) * 180) / Math.PI;
    }
    onTransformChange(clampTransform(next));
  };

  const fontSize = Math.max(24, (transform.widthPercent / 100) * 460 / Math.max((text || 'Nowhere Mark').length, 6));
  const boxStyle: React.CSSProperties = {
    left: `${transform.xPercent}%`, top: `${transform.yPercent}%`, width: `${transform.widthPercent}%`,
    transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`, opacity: transform.opacity
  };

  return <div ref={rootRef} className='absolute inset-0 touch-none' onPointerMove={(e)=>updateFromPointer(e.clientX,e.clientY)} onPointerUp={()=>setInteraction(null)} onPointerCancel={()=>setInteraction(null)}>
    <div style={boxStyle} className='absolute border-2 border-blue-500/80 cursor-move select-none' onPointerDown={(e)=>{e.preventDefault(); (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId); setInteraction({ type:'drag', startX:e.clientX, startY:e.clientY, start: transform });}}>
      <div className='pointer-events-none flex min-h-8 min-w-8 items-center justify-center'>
        {mode === 'text' ? <span style={{ fontSize, color: color || '#ffffff', WebkitTextStroke: '1px rgba(0,0,0,0.75)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{text || 'Nowhere Mark'}</span> : imageSrc ? <img src={imageSrc} alt='wm' className='h-auto w-full' draggable={false} /> : <span className='text-xs text-white'>Upload watermark</span>}
      </div>
      <TransformHandles onResizeStart={(corner,e)=>{e.preventDefault(); setInteraction({ type:'resize', corner, startX:e.clientX, startY:e.clientY, start: transform });}} onRotateStart={(e)=>{e.preventDefault(); setInteraction({ type:'rotate', startX:e.clientX, startY:e.clientY, start: transform });}} />
    </div>
  </div>;
}
