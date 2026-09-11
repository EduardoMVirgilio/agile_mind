import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, PointerEvent } from 'react';
import { CheckCircle, Play, RotateCcw, Type } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VictoryModal } from '../components/ui/VictoryModal';
import { useWordSearchRanking } from '../store/wordSearchStore';
import type { GameProps } from '../types/game';
import { cx } from '../utils/classNames';

const DEFAULT_WORDS = ['REACT', 'VITE', 'TYPESCRIPT', 'LOGIC', 'CODE', 'WEB'];
const MIN_GRID_SIZE = 8;
const MAX_WORD_LENGTH = 20;
const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
const MIN_WORDS = 2;
const MAX_WORDS = 8;

type PlacedWord = {
  word: string;
  start: number[];
  end: number[];
};

export const WordSearch = ({ onMenu }: GameProps) => {
  const [gameWords, setGameWords] = useState<string[]>([]);
  const [wordInput, setWordInput] = useState(DEFAULT_WORDS.join(', '));
  const [configurationError, setConfigurationError] = useState('');
  const [grid, setGrid] = useState<string[][]>([]);
  const [gridSize, setGridSize] = useState(0);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<{ start: number[] | null; current: number[] | null }>({
    start: null,
    current: null,
  });
  const [isWon, setIsWon] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [focusedCell, setFocusedCell] = useState<[number, number]>([0, 0]);
  const startTimeRef = useRef<number | null>(null);
  const addGame = useWordSearchRanking((state) => state.addGame);
  const ranking = useWordSearchRanking((state) => state.games);

  const initGame = useCallback((words: string[]) => {
    const nextGridSize = Math.max(MIN_GRID_SIZE, Math.max(...words.map((word) => word.length)) + 2);
    const newGrid = Array(nextGridSize).fill(0).map(() => Array(nextGridSize).fill(''));
    const placed: PlacedWord[] = [];

    [...words].sort((a, b) => b.length - a.length).forEach((word) => {
      let placedOk = false;
      let attempts = 0;
      while (!placedOk && attempts < 1000) {
        attempts++;
        const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
        const startR = Math.floor(Math.random() * nextGridSize);
        const startC = Math.floor(Math.random() * nextGridSize);

        const endR = startR + dir[0] * (word.length - 1);
        const endC = startC + dir[1] * (word.length - 1);

        if (endR >= 0 && endR < nextGridSize && endC >= 0 && endC < nextGridSize) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const r = startR + dir[0] * i;
            const c = startC + dir[1] * i;
            if (newGrid[r][c] !== '' && newGrid[r][c] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[startR + dir[0] * i][startC + dir[1] * i] = word[i];
            }
            placed.push({ word, start: [startR, startC], end: [endR, endC] });
            placedOk = true;
          }
        }
      }
    });

    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < nextGridSize; r++) {
      for (let c = 0; c < nextGridSize; c++) {
        if (newGrid[r][c] === '') newGrid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }

    setGrid(newGrid);
    setGridSize(nextGridSize);
    setPlacedWords(placed);
    setFoundWords([]);
    setIsWon(false);
    setElapsedTime(0);
    startTimeRef.current = null;
    setSelection({ start: null, current: null });
    setFocusedCell([0, 0]);
  }, []);

  const parseWords = (value: string) => [...new Set(
    value
      .split(/[,\n]/)
      .map((word) => word.trim().toUpperCase().replace(/\s+/g, ''))
      .filter(Boolean),
  )];

  const handleStart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const words = parseWords(wordInput);
    const invalidWord = words.find((word) =>
      !/^[A-Z]+$/.test(word) || word.length < 2 || word.length > MAX_WORD_LENGTH);

    if (words.length < MIN_WORDS || words.length > MAX_WORDS) {
      setConfigurationError(`Define entre ${MIN_WORDS} y ${MAX_WORDS} palabras.`);
      return;
    }
    if (invalidWord) {
      setConfigurationError(`"${invalidWord}" debe tener solo letras y entre 2 y ${MAX_WORD_LENGTH} caracteres.`);
      return;
    }

    setConfigurationError('');
    setGameWords(words);
    initGame(words);
  };

  const getLineCells = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    const dr = r2 - r1;
    const dc = c2 - c1;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    if (steps === 0) return [[r1, c1]];
    if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return [];

    const rStep = dr / steps;
    const cStep = dc / steps;
    const cells = [];
    for (let i = 0; i <= steps; i++) {
      cells.push([r1 + rStep * i, c1 + cStep * i]);
    }
    return cells;
  }, []);

  const handlePointerDown = (r: number, c: number) => {
    if (isWon) return;
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
      setElapsedTime(0);
    }
    setSelection({ start: [r, c], current: [r, c] });
  };

  const finishSelection = useCallback((start: number[], current: number[]) => {
    if (isWon) return;
    const cells = getLineCells(start[0], start[1], current[0], current[1]);
    const selectedWord = cells.map(([r, c]) => grid[r][c]).join('');
    const selectedWordRev = selectedWord.split('').reverse().join('');
    const found = placedWords.find((w) => w.word === selectedWord || w.word === selectedWordRev);

    if (found && !foundWords.includes(found.word)) {
      const newFound = [...foundWords, found.word];
      setFoundWords(newFound);
      if (newFound.length === placedWords.length) {
        const finalTime = startTimeRef.current === null ? 0 : Date.now() - startTimeRef.current;
        setElapsedTime(finalTime);
        setIsWon(true);
        addGame({ timeMs: finalTime, wordCount: placedWords.length, gridSize });
      }
    }
  }, [addGame, foundWords, getLineCells, grid, isWon, placedWords]);

  const handlePointerMove = (e: PointerEvent) => {
    if (!selection.start || isWon) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const r = el?.getAttribute('data-r');
    const c = el?.getAttribute('data-c');
    if (r !== null && c !== null && r !== undefined && c !== undefined) {
      setSelection((prev) => ({ ...prev, current: [parseInt(r), parseInt(c)] }));
    }
  };

  const handlePointerUp = () => {
    if (!isWon && selection.start && selection.current) {
      finishSelection(selection.start, selection.current);
    }
    setSelection({ start: null, current: null });
  };

  const handleCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>, r: number, c: number) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    };
    if (moves[event.key]) {
      event.preventDefault();
      const [dr, dc] = moves[event.key];
      const next: [number, number] = [
        Math.min(gridSize - 1, Math.max(0, r + dr)),
        Math.min(gridSize - 1, Math.max(0, c + dc)),
      ];
      document.querySelector<HTMLButtonElement>(`[data-cell="${next[0]}-${next[1]}"]`)?.focus();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!selection.start) {
        handlePointerDown(r, c);
      } else {
        finishSelection(selection.start, [r, c]);
        setSelection({ start: null, current: null });
      }
    }
  };

  useEffect(() => {
    if (startTimeRef.current === null || isWon) return;

    const timer = window.setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current!);
    }, 100);

    return () => window.clearInterval(timer);
  }, [isWon, selection.start]);

  const activeCells = useMemo(() => {
    if (selection.start && selection.current) {
      return getLineCells(selection.start[0], selection.start[1], selection.current[0], selection.current[1]);
    }
    return [];
  }, [selection, getLineCells]);

  const formattedTime = `${(elapsedTime / 1000).toFixed(1)} s`;
  const formatPlayedAt = (playedAt: string) =>
    new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(playedAt));

  if (gameWords.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl p-4 sm:p-8" aria-labelledby="word-search-setup-title">
        <section className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Type size={28} className="text-indigo-400" aria-hidden="true" />
            <div>
              <h1 id="word-search-setup-title" className="text-2xl font-black text-white">Configura tu búsqueda</h1>
              <p className="text-slate-400">Elige las palabras que quieres encontrar.</p>
            </div>
          </div>
          <form onSubmit={handleStart} noValidate>
            <label htmlFor="word-list" className="mb-2 block font-bold text-slate-200">
              Palabras
            </label>
            <textarea
              id="word-list"
              value={wordInput}
              onChange={(event) => setWordInput(event.target.value)}
              rows={4}
              aria-describedby="word-list-help word-list-error"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 p-3 text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
              placeholder="Ejemplo: REACT, VITE, LOGIC"
            />
            <p id="word-list-help" className="mt-2 text-sm text-slate-400">
              Separa las palabras con comas o saltos de línea. Entre {MIN_WORDS} y {MAX_WORDS} palabras, de 2 a {MAX_WORD_LENGTH} letras. El tablero se ajustará a la palabra más larga.
            </p>
            <p id="word-list-error" className="mt-2 min-h-6 text-sm text-rose-300" role="alert">
              {configurationError}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="submit"><Play size={18} aria-hidden="true" /> Iniciar juego</Button>
              <Button type="button" variant="outline" onClick={() => setWordInput(DEFAULT_WORDS.join(', '))}>
                <RotateCcw size={18} aria-hidden="true" /> Restaurar ejemplo
              </Button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center max-w-5xl mx-auto p-4">
      <div
        role="grid"
        aria-label={`Cuadrícula de búsqueda de palabras de ${gridSize} por ${gridSize}`}
        aria-describedby="word-search-instructions"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        className="grid w-full max-w-2xl gap-0.5 sm:gap-1 bg-slate-800 p-2 rounded-xl touch-none select-none relative"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {grid.map((row, r) => (
          <div key={r} role="row" className="contents">
          {row.map((char, c) => {
          const isActive = activeCells.some(([ar, ac]) => ar === r && ac === c);
          let isFound = false;
          foundWords.forEach((fw) => {
            const pw = placedWords.find((p) => p.word === fw);
            if (pw) {
              const cells = getLineCells(pw.start[0], pw.start[1], pw.end[0], pw.end[1]);
              if (cells.some(([fr, fc]) => fr === r && fc === c)) isFound = true;
            }
          });

          return (
            <button
              key={`${r}-${c}`}
              data-r={r}
              data-c={c}
              data-cell={`${r}-${c}`}
              type="button"
              role="gridcell"
              aria-label={`Fila ${r + 1}, columna ${c + 1}, letra ${char}${isFound ? ', encontrada' : ''}`}
              aria-selected={isActive || isFound}
              tabIndex={focusedCell[0] === r && focusedCell[1] === c ? 0 : -1}
              onFocus={() => setFocusedCell([r, c])}
              onPointerDown={() => handlePointerDown(r, c)}
              onKeyDown={(event) => handleCellKeyDown(event, r, c)}
              className={cx(
                'w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center font-bold rounded cursor-crosshair transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800',
                isActive ? 'bg-indigo-500 text-white' :
                isFound ? 'bg-emerald-500/50 text-emerald-100' :
                'bg-slate-700/50 text-slate-300 hover:bg-slate-600',
              )}
            >
              {char}
            </button>
          );
        })}
          </div>
        ))}
      </div>

      <div className="w-full lg:w-64 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white" aria-live="polite">
          <Type size={20} className="text-indigo-400" /> Palabras ({foundWords.length}/{placedWords.length})
        </h3>
        <p className="text-slate-400 mb-4" aria-live="polite">
          Tiempo: {formattedTime} · Cuadrícula: {gridSize} × {gridSize}
        </p>
        <p id="word-search-instructions" className="mb-4 text-sm text-slate-400">
          Arrastra desde una letra hasta otra o usa las flechas y pulsa Enter para seleccionar los extremos.
        </p>
        <ul className="flex flex-wrap lg:flex-col gap-2">
          {gameWords.map((word) => {
            const found = foundWords.includes(word);
            return (
              <li
                key={word}
                className={cx(
                  'px-3 py-1.5 rounded-lg text-sm sm:text-base font-semibold flex items-center gap-2',
                  found ? 'bg-emerald-500/20 text-emerald-400 line-through decoration-2' : 'bg-slate-700/50 text-slate-300',
                )}
              >
                {found && <CheckCircle size={16} />}
                {word}
              </li>
            );
          })}
        </ul>
      </div>

      <VictoryModal
        show={isWon}
        onRestart={() => initGame(gameWords)}
        onMenu={onMenu ?? (() => {})}
        title="¡Búsqueda completada!"
        details={
          <div className="rounded-lg bg-slate-800 p-4 text-center">
            <p className="text-emerald-400 font-bold">Completado en {formattedTime}</p>
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
                      <p className="mt-2 text-xs text-slate-400">
                        Palabras: <strong className="text-slate-200">{game.wordCount}</strong>
                      </p>
                      <p className="text-xs text-slate-400">Jugado: {formatPlayedAt(game.playedAt)}</p>
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
