import { EmptyState } from '@/components/EmptyState';
import { PreviewCard } from '@/components/PreviewCard';

type Item = { id: string; name: string; previewDataUrl?: string; dimensions?: string };

export function PreviewGrid({ items, onExport, onRemove }: { items: Item[]; onExport: (idx: number) => void; onRemove: (id: string) => void; }) {
  if (!items.length) return <EmptyState />;
  return <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>{items.map((item, idx) => <PreviewCard key={item.id} name={item.name} previewDataUrl={item.previewDataUrl} dimensions={item.dimensions} onExport={() => onExport(idx)} onRemove={() => onRemove(item.id)} />)}</div>;
}
