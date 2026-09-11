import { Suspense, useState } from 'react';
import { GameMenu } from './app/GameMenu';
import { GameShell } from './app/GameShell';
import { gameComponents } from './app/gameRegistry';
import type { GameProps, GameType } from './types/game';

const GameLoading = () => (
  <div className="flex min-h-48 items-center justify-center text-slate-300" role="status">
    Cargando juego...
  </div>
);

type LoadedGameProps = GameProps & {
  game: Exclude<GameType, 'menu'>;
};

const LoadedGame = ({ game, onMenu }: LoadedGameProps) => {
  const GameComponent = gameComponents[game];

  return (
    <Suspense fallback={<GameLoading />}>
      <GameComponent onMenu={onMenu} />
    </Suspense>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<GameType>('menu');

  if (currentView !== 'menu') {
    return (
      <GameShell view={currentView} onBack={() => setCurrentView('menu')}>
        <LoadedGame game={currentView} />
      </GameShell>
    );
  }

  return <GameMenu onSelect={setCurrentView} />;
}
