'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { WatermarkPanel } from '@/components/WatermarkPanel';
import { BgRemovalPanel } from '@/components/BgRemovalPanel';
import { Layers, Eraser } from 'lucide-react';

type Tab = 'watermark' | 'bgremoval';

export default function Page() {
  const [tab, setTab] = useState<Tab>('watermark');

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-4 md:p-8">
      <AppHeader />

      {/* Tab switcher */}
      <div className="mb-5 flex gap-2 rounded-xl border border-slate-700/80 bg-slate-900/70 p-1.5">
        <TabButton
          active={tab === 'watermark'}
          onClick={() => setTab('watermark')}
          icon={<Layers className="h-4 w-4" />}
          label="Watermark"
        />
        <TabButton
          active={tab === 'bgremoval'}
          onClick={() => setTab('bgremoval')}
          icon={<Eraser className="h-4 w-4" />}
          label="Remove Background"
        />
      </div>

      {tab === 'watermark' ? <WatermarkPanel /> : <BgRemovalPanel />}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
