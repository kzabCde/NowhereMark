import { EmptyState } from '@/components/EmptyState';
import { PreviewCard } from '@/components/PreviewCard';
import type { MainImageItem } from '@/app/page';

type Props = {
  items: MainImageItem[];
  onExport: (idx: number) => void;
  onRemove: (id: string) => void;
  onRemoveBg: (id: string) => void;
};

export function PreviewGrid({ items, onExport, onRemove, onRemoveBg }: Props) {
  if (!items.length) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, idx) => (
        <PreviewCard
          key={item.id}
          name={item.name}
          previewDataUrl={item.previewDataUrl}
          dimensions={item.dimensions}
          error={item.error}
          bgRemovedSrc={item.bgRemovedSrc}
          bgRemoving={item.bgRemoving}
          bgProgress={item.bgProgress}
          bgError={item.bgError}
          onExport={() => onExport(idx)}
          onRemove={() => onRemove(item.id)}
          onRemoveBg={() => onRemoveBg(item.id)}
        />
      ))}
    </div>
  );
}
