'use client';

export function TransformHandles({ onResizeStart, onRotateStart }: { onResizeStart: (corner: string, e: React.PointerEvent<HTMLButtonElement>) => void; onRotateStart: (e: React.PointerEvent<HTMLButtonElement>) => void; }) {
  const corners = [
    { key: 'nw', cls: '-left-3 -top-3 cursor-nwse-resize' },
    { key: 'ne', cls: '-right-3 -top-3 cursor-nesw-resize' },
    { key: 'sw', cls: '-left-3 -bottom-3 cursor-nesw-resize' },
    { key: 'se', cls: '-right-3 -bottom-3 cursor-nwse-resize' }
  ];
  return <>
    {corners.map((c) => <button key={c.key} type='button' onPointerDown={(e)=>onResizeStart(c.key,e)} className={`absolute h-7 w-7 rounded-full border-2 border-white bg-slate-900 ${c.cls}`} />)}
    <button type='button' onPointerDown={onRotateStart} className='absolute -top-12 left-1/2 h-7 w-7 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-blue-600' />
  </>;
}
