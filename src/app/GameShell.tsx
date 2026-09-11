import React, { useState } from 'react';
import { Header } from '../components/ui/Header';
import type { GameProps, GameType } from '../types/game';

type GameShellProps = {
  view: GameType;
  onBack: () => void;
  children: React.ReactElement<GameProps>;
};

export const GameShell = ({ view, onBack, children }: GameShellProps) => {
  const titles = {
    'number-connect': 'Number Connect',
    'word-search': 'Word Search',
    sudoku: 'Mini Sudoku',
    euler: 'Euler Pattern',
    menu: '',
  };
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header title={titles[view]} onBack={onBack} onRestart={() => setResetKey((prev) => prev + 1)} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-20">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
          {React.cloneElement(children, { key: resetKey, onMenu: onBack })}
        </div>
      </main>
    </div>
  );
};
