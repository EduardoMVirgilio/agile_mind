import { useCallback, useEffect, useState } from 'react';
import type { PointerEvent } from 'react';
import { VictoryModal } from '../components/ui/VictoryModal';
import { useNumberConnectRanking } from '../store/numberConnectStore';
import type { GameProps } from '../types/game';
import { cx } from '../utils/classNames';
import { useGameTimer } from '../hooks/useGameTimer';

const NUMBER_CONNECT_SIZE = 6;
const TOTAL_CELLS = NUMBER_CONNECT_SIZE * NUMBER_CONNECT_SIZE;
const MIN_NUMBER_COUNT = 10;
const MAX_NUMBER_COUNT = Math.floor(TOTAL_CELLS / 2);

const createRoute = () => {
  const isVertical = Math.random() < 0.5;
  const route = Array.from({ length: NUMBER_CONNECT_SIZE }, (_, line) => {
    const cells = Array.from({ length: NUMBER_CONNECT_SIZE }, (_, position) =>
      isVertical ? position * NUMBER_CONNECT_SIZE + line : line * NUMBER_CONNECT_SIZE + position,
    );
    return line % 2 === 0 ? cells : cells.reverse();
  }).flat();

  return Math.random() < 0.5 ? route.reverse() : route;
};

export const NumberConnect = ({ onMenu }: GameProps) => {
  const [grid, setGrid] = useState<number[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    elapsedTime,
    start: startTimer,
    reset: resetTimer,
    getElapsedTime,
  } = useGameTimer({ active: isPlaying, finished: isWon });
  const addGame = useNumberConnectRanking((state) => state.addGame);
  const ranking = useNumberConnectRanking((state) => state.games);

  const generateLevel = useCallback(() => {
    const numberCount = MIN_NUMBER_COUNT + Math.floor(Math.random() * (MAX_NUMBER_COUNT - MIN_NUMBER_COUNT + 1));
    const newGrid = Array(TOTAL_CELLS).fill(0);

    const route = createRoute();

    newGrid[route[0]] = 1;
    for (let number = 1; number < numberCount - 1; number++) {
      const segmentStart = 1 + Math.floor(((number - 1) * (TOTAL_CELLS - 2)) / (numberCount - 2));
      const segmentEnd = 1 + Math.floor((number * (TOTAL_CELLS - 2)) / (numberCount - 2)) - 1;
      const routePosition = segmentStart + Math.floor(Math.random() * (segmentEnd - segmentStart + 1));
      newGrid[route[routePosition]] = number + 1;
    }
    newGrid[route[TOTAL_CELLS - 1]] = numberCount;

    setGrid(newGrid);
    setMaxNumber(numberCount);
    setPath([]);
    setTargetNumber(1);
    setIsWon(false);
    setIsPlaying(false);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const handlePointerDown = (index: number) => {
    if (grid[index] === 1) {
      setPath([index]);
      setTargetNumber(2);
      setIsPlaying(true);
      startTimer();
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (path.length === 0 || isWon) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const indexStr = el?.getAttribute('data-index');

    if (indexStr !== null && indexStr !== undefined) {
      const index = parseInt(indexStr, 10);
      const lastIndex = path[path.length - 1];

      if (index !== lastIndex) {
        const existingPathIndex = path.indexOf(index);
        if (existingPathIndex >= 0) {
          const shortenedPath = path.slice(0, existingPathIndex + 1);
          const connectedNumbers = shortenedPath
            .map((cellIndex) => grid[cellIndex])
            .filter((number) => number > 0);
          setPath(shortenedPath);
          setTargetNumber((connectedNumbers.at(-1) ?? 1) + 1);
          return;
        }

        const x1 = lastIndex % NUMBER_CONNECT_SIZE;
        const y1 = Math.floor(lastIndex / NUMBER_CONNECT_SIZE);
        const x2 = index % NUMBER_CONNECT_SIZE;
        const y2 = Math.floor(index / NUMBER_CONNECT_SIZE);

        const isAdjacent = Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;

        if (isAdjacent) {
          if (!path.includes(index) && (grid[index] === 0 || grid[index] === targetNumber)) {
            const newPath = [...path, index];
            const nextTarget = grid[index] === targetNumber ? targetNumber + 1 : targetNumber;
            setPath(newPath);
            setTargetNumber(nextTarget);
            if (grid[index] === maxNumber && newPath.length === TOTAL_CELLS) {
              setIsWon(true);
              const finalTime = getElapsedTime();
              setIsPlaying(false);
              addGame({ timeMs: finalTime, numberCount: maxNumber, cells: TOTAL_CELLS });
            }
          }
        }
      }
    }
  };

  const handlePointerUp = () => {
    // Keep the path so players can continue after releasing the pointer.
  };

  const formattedTime = `${(elapsedTime / 1000).toFixed(1)} s`;
  const formatPlayedAt = (playedAt: string) =>
    new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(playedAt));

  return (
    <div className="flex flex-col items-center max-w-md mx-auto w-full p-4">
      <div className="mb-6 text-center">
        <p className="text-indigo-400 font-bold mt-2">
          Next: {targetNumber <= maxNumber ? targetNumber : '¡Completado!'}
        </p>
        <p className="text-slate-400 mt-2">Tiempo: {formattedTime}</p>
        {isWon && <p className="text-emerald-400 font-bold mt-1">Nivel completado en {formattedTime}</p>}
        <p className="text-slate-400 mt-2">
          Path: {path.map((cellIndex) => grid[cellIndex]).filter((number) => number > 0).join(' → ') || 'ninguno'}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Victory: Connect the numbers in order and go through all the cells.
        </p>
      </div>

      <div
        className="grid grid-cols-6 gap-1 sm:gap-2 w-full touch-none select-none bg-slate-800 p-2 sm:p-4 rounded-xl shadow-inner relative"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {grid.map((num, i) => {
          const inPath = path.includes(i);
          const isStart = num === 1;
          const isEnd = num === maxNumber;
          const isTarget = num === targetNumber;

          return (
            <div
              key={i}
              data-index={i}
              onPointerDown={() => handlePointerDown(i)}
              className={cx(
                'aspect-square flex items-center justify-center rounded-lg text-lg sm:text-xl font-bold transition-colors duration-150 cursor-pointer',
                num === 0 ? 'bg-slate-900/50 text-transparent' : 'bg-slate-700 shadow-sm',
                inPath ? 'bg-indigo-500 text-white shadow-indigo-500/50 scale-105 z-10 ring-2 ring-indigo-300' : 'text-slate-300',
                isTarget && !inPath ? 'ring-2 ring-emerald-400 animate-pulse' : '',
                (isStart || isEnd) && !inPath ? 'ring-2 ring-indigo-400' : '',
              )}
            >
              {num > 0 ? num : ''}
            </div>
          );
        })}
      </div>

      <VictoryModal
        show={isWon}
        onRestart={generateLevel}
        onMenu={onMenu ?? (() => {})}
        title="¡Nivel Completado!"
        details={
          <div className="rounded-lg bg-slate-800 p-4 text-center">
            <div className="mt-5 text-left">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-200">Ranking de partidas</p>
                <p className="text-xs text-slate-500">{ranking.length} registradas</p>
              </div>
              {ranking.length > 0 ? (
                <div className="ranking-scrollbar max-h-56 space-y-2 overflow-y-auto pr-2">
                  {ranking.map((game, index) => (
                    <div
                      key={game.id}
                      className={cx(
                        'rounded-lg border p-3',
                        index === 0
                          ? 'border-amber-400/40 bg-amber-400/10'
                          : 'border-slate-700 bg-slate-900/60',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-slate-200">
                          #{index + 1} {index === 0 ? '🏆' : ''}
                        </span>
                        <span className="text-lg font-black text-emerald-400">
                          {(game.timeMs / 1000).toFixed(1)} s
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>Números: <strong className="text-slate-200">{game.numberCount}</strong></span>
                        <span className="col-span-2">Jugado: {formatPlayedAt(game.playedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-slate-900/60 p-3 text-center text-xs text-slate-500">
                  Todavía no hay partidas completadas.
                </p>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
};
