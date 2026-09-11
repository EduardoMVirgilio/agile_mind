import type { ReactNode } from 'react';
import type { GameType } from '../../types/game';

type GameCardProps = {
  game: Exclude<GameType, 'menu'>;
  title: string;
  description: string;
  icon: ReactNode;
  accent: 'indigo' | 'emerald' | 'cyan' | 'rose';
  bestTimeMs?: number;
  onSelect: (game: Exclude<GameType, 'menu'>) => void;
  onShowBest: () => void;
  bestResultLabel: string;
};

const accentStyles = {
  indigo: {
    border: 'hover:border-indigo-500/50',
    shadow: 'hover:shadow-indigo-500/10',
    background: 'bg-indigo-500/10',
    icon: 'bg-indigo-500/20 text-indigo-400 ring-indigo-500/30 group-hover:bg-indigo-500',
    button: 'border-indigo-400/60 text-indigo-300 hover:bg-indigo-500/10 focus:ring-indigo-400',
  },
  emerald: {
    border: 'hover:border-emerald-500/50',
    shadow: 'hover:shadow-emerald-500/10',
    background: 'bg-emerald-500/10',
    icon: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30 group-hover:bg-emerald-500',
    button: 'border-emerald-400/60 text-emerald-300 hover:bg-emerald-500/10 focus:ring-emerald-400',
  },
  cyan: {
    border: 'hover:border-cyan-500/50',
    shadow: 'hover:shadow-cyan-500/10',
    background: 'bg-cyan-500/10',
    icon: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/30 group-hover:bg-cyan-500',
    button: 'border-cyan-400/60 text-cyan-300 hover:bg-cyan-500/10 focus:ring-cyan-400',
  },
  rose: {
    border: 'hover:border-rose-500/50',
    shadow: 'hover:shadow-rose-500/10',
    background: 'bg-rose-500/10',
    icon: 'bg-rose-500/20 text-rose-400 ring-rose-500/30 group-hover:bg-rose-500',
    button: 'border-rose-400/60 text-rose-300 hover:bg-rose-500/10 focus:ring-rose-400',
  },
} as const;

export const GameCard = ({
  game,
  title,
  description,
  icon,
  accent,
  bestTimeMs,
  onSelect,
  onShowBest,
  bestResultLabel,
}: GameCardProps) => {
  const styles = accentStyles[accent];

  return (
    <div
      onClick={() => onSelect(game)}
      className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${styles.border} ${styles.shadow}`}
    >
      <div className={`absolute right-0 top-0 -z-10 h-32 w-32 rounded-bl-full transition-transform group-hover:scale-110 ${styles.background}`} />
      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-colors group-hover:text-white ${styles.icon}`}>
        {icon}
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
      <p className="text-slate-400">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-sm font-bold text-emerald-400">
          {bestTimeMs !== undefined ? `Best: ${(bestTimeMs / 1000).toFixed(1)} s` : 'No completed games yet'}
        </p>
        {bestTimeMs !== undefined && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onShowBest();
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${styles.button}`}
            aria-haspopup="dialog"
            aria-label={bestResultLabel}
          >
            Ver mejor resultado
          </button>
        )}
      </div>
    </div>
  );
};
