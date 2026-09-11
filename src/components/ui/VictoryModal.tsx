import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Gamepad2, RotateCcw, Trophy } from 'lucide-react';
import { Button } from './Button';

type VictoryModalProps = {
  show: boolean;
  onRestart: () => void;
  onMenu: () => void;
  title?: string;
  details?: ReactNode;
};

export const VictoryModal = ({
  show,
  onRestart,
  onMenu,
  title = '¡Nivel Completado!',
  details,
}: VictoryModalProps) => {
  const restartButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (show) restartButtonRef.current?.focus();
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
      role="presentation">
      <div className="bg-slate-900 border-2 border-indigo-500/50 p-5 sm:p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4 transform animate-in zoom-in-95 duration-300"
        role="dialog" aria-modal="true" aria-labelledby="victory-modal-title">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-5 sm:mb-6 shrink-0">
          <Trophy size={40} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
        </div>
        <h2 id="victory-modal-title" className="text-2xl sm:text-3xl font-black text-white mb-2 text-center">{title}</h2>
        <p className="text-slate-400 mb-6 sm:mb-8 text-center">¡Excelente trabajo para tu entrenamiento cognitivo!</p>
        {details && <div className="w-full max-w-xl mb-6 sm:mb-8">{details}</div>}
        <div className="flex flex-col gap-3 w-full">
          <Button ref={restartButtonRef} variant="primary" onClick={onRestart} className="w-full text-lg py-3">
            <RotateCcw size={20} /> Jugar de nuevo
          </Button>
          <Button variant="outline" onClick={onMenu} className="w-full text-lg py-3">
            <Gamepad2 size={20} /> Volver al Menú
          </Button>
        </div>
      </div>
    </div>
  );
};
