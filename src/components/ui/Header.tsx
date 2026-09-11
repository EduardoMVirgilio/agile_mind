import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from './Button';

type HeaderProps = {
  title: string;
  onBack: () => void;
  onRestart?: () => void;
};

export const Header = ({ title, onBack, onRestart }: HeaderProps) => (
  <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-sm sticky top-0 z-10">
    <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
      <ArrowLeft size={20} /> <span className="hidden sm:inline">Volver</span>
    </Button>
    <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
      {title}
    </h1>
    <div className="w-[88px] flex justify-end">
      {onRestart && (
        <Button
          variant="ghost"
          onClick={onRestart}
          className="!px-3 !py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <RotateCcw size={20} />
        </Button>
      )}
    </div>
  </div>
);
