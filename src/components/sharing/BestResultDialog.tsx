import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { ShareResult, type ShareResultData } from './ShareResult';

type BestResultDialogProps = {
  title: string;
  accent: 'indigo' | 'emerald' | 'cyan' | 'rose';
  details: ReactNode;
  shareResult: ShareResultData;
  fileName: string;
  onClose: () => void;
};

const accentStyles = {
  indigo: 'border-indigo-500/50 text-indigo-300 focus:ring-indigo-400',
  emerald: 'border-emerald-500/50 text-emerald-300 focus:ring-emerald-400',
  cyan: 'border-cyan-500/50 text-cyan-300 focus:ring-cyan-400',
  rose: 'border-rose-500/50 text-rose-300 focus:ring-rose-400',
} as const;

export const BestResultDialog = ({
  title,
  accent,
  details,
  shareResult,
  fileName,
  onClose,
}: BestResultDialogProps) => (
  <div
    className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    role="presentation"
    onPointerDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <section
      className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 bg-slate-900 p-5 shadow-2xl sm:p-8 ${accentStyles[accent]}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="best-result-title"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Mejor resultado</p>
          <h2 id="best-result-title" className="mt-1 text-2xl font-black text-white">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2"
          aria-label={`Cerrar mejor resultado de ${title}`}
        >
          <X size={22} />
        </button>
      </div>
      {details}
      <ShareResult result={shareResult} fileName={fileName} />
    </section>
  </div>
);
