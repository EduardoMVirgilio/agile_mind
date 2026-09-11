import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Lightbulb, Play } from "lucide-react";
import { Button } from "../components/ui/Button";
import { VictoryModal } from "../components/ui/VictoryModal";
import { useSudokuRanking } from "../store/sudokuStore";
import type { GameProps } from "../types/game";
import { cx } from "../utils/classNames";

const HINT_PENALTY_MS = 10000;
const GIVEN_OPTIONS: Record<4 | 9, number[]> = {
  4: [4, 6, 8, 10, 12],
  9: [25, 30, 35, 40, 45, 50, 55, 60],
};

export const MiniSudoku = ({ onMenu }: GameProps) => {
  const [size, setSize] = useState<4 | 9>(4);
  const [givenCount, setGivenCount] = useState(10);
  const [isStarted, setIsStarted] = useState(false);
  const [board, setBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null,
  );
  const [isWon, setIsWon] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const startTimeRef = useRef<number | null>(null);
  const penaltyMsRef = useRef(0);
  const addGame = useSudokuRanking((state) => state.addGame);
  const ranking = useSudokuRanking((state) => state.games);

  const isValid = (
    grid: number[][],
    r: number,
    c: number,
    value: number,
    currentSize: number,
  ) => {
    const boxSize = currentSize === 4 ? 2 : 3;
    for (let i = 0; i < currentSize; i++) {
      if (grid[r][i] === value || grid[i][c] === value) return false;
    }
    const startRow = Math.floor(r / boxSize) * boxSize;
    const startCol = Math.floor(c / boxSize) * boxSize;
    for (let row = startRow; row < startRow + boxSize; row++) {
      for (let col = startCol; col < startCol + boxSize; col++) {
        if (grid[row][col] === value) return false;
      }
    }
    return true;
  };

  const generateSudoku = useCallback((currentSize: 4 | 9, givens: number) => {
    const solved = Array(currentSize)
      .fill(0)
      .map(() => Array(currentSize).fill(0));
    const solve = (grid: number[][]): boolean => {
      for (let row = 0; row < currentSize; row++) {
        for (let col = 0; col < currentSize; col++) {
          if (grid[row][col] !== 0) continue;
          const numbers = Array.from(
            { length: currentSize },
            (_, index) => index + 1,
          ).sort(() => Math.random() - 0.5);
          for (const number of numbers) {
            if (!isValid(grid, row, col, number, currentSize)) continue;
            grid[row][col] = number;
            if (solve(grid)) return true;
            grid[row][col] = 0;
          }
          return false;
        }
      }
      return true;
    };

    solve(solved);
    const nextBoard = solved.map((row) => [...row]);
    const initialFlags = Array(currentSize)
      .fill(0)
      .map(() => Array(currentSize).fill(true));
    let removed = 0;
    while (removed < currentSize * currentSize - givens) {
      const row = Math.floor(Math.random() * currentSize);
      const col = Math.floor(Math.random() * currentSize);
      if (nextBoard[row][col] !== 0) {
        nextBoard[row][col] = 0;
        initialFlags[row][col] = false;
        removed++;
      }
    }

    setBoard(nextBoard);
    setSolution(solved);
    setInitialBoard(initialFlags);
    setSelectedCell(null);
    setIsWon(false);
    setElapsedTime(0);
    setIsTimerRunning(false);
    penaltyMsRef.current = 0;
    setHintCount(0);
    setStatusMessage("");
    startTimeRef.current = null;
  }, []);

  const startGame = () => {
    generateSudoku(size, givenCount);
    setIsStarted(true);
  };

  const checkWin = (currentBoard: number[][]) => {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (currentBoard[row][col] === 0) return false;
        const withoutValue = currentBoard.map((line) => [...line]);
        withoutValue[row][col] = 0;
        if (!isValid(withoutValue, row, col, currentBoard[row][col], size))
          return false;
      }
    }
    return true;
  };

  const finishGameIfWon = (
    currentBoard: number[][],
    currentPenaltyMs = penaltyMsRef.current,
  ) => {
    if (!checkWin(currentBoard)) return;
    const finalTime =
      startTimeRef.current === null
        ? currentPenaltyMs
        : Date.now() - startTimeRef.current + currentPenaltyMs;
    setElapsedTime(finalTime);
    setIsWon(true);
    setStatusMessage("Sudoku completado correctamente.");
    addGame({ timeMs: finalTime, size });
  };

  const handleInput = (number: number) => {
    if (!selectedCell || isWon) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col]) {
      setStatusMessage("Esta celda es una pista fija y no se puede modificar.");
      return;
    }
    const nextBoard = board.map((line) => [...line]);
    if (number !== 0) {
      nextBoard[row][col] = 0;
      if (!isValid(nextBoard, row, col, number, size)) {
        setStatusMessage(
          "Ese número entra en conflicto con la fila, columna o región.",
        );
        return;
      }
    }
    if (startTimeRef.current === null && number !== 0) {
      startTimeRef.current = Date.now();
      setIsTimerRunning(true);
      setElapsedTime(0);
    }
    nextBoard[row][col] = number;
    setBoard(nextBoard);
    setStatusMessage(
      number === 0 ? "Celda borrada." : `Número ${number} introducido.`,
    );
    if (number !== 0) finishGameIfWon(nextBoard);
  };

  const requestHint = () => {
    if (isWon) return;
    const emptyCells = board.flatMap((line, row) =>
      line
        .map((value, col) =>
          value === 0 ? ([row, col] as [number, number]) : null,
        )
        .filter(Boolean),
    ) as [number, number][];
    const target =
      selectedCell && board[selectedCell[0]][selectedCell[1]] === 0
        ? selectedCell
        : emptyCells[0];
    if (!target) return;
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
      setIsTimerRunning(true);
    }
    const [row, col] = target;
    const nextBoard = board.map((line) => [...line]);
    nextBoard[row][col] = solution[row][col];
    const nextFlags = initialBoard.map((line) => [...line]);
    nextFlags[row][col] = true;
    setBoard(nextBoard);
    setInitialBoard(nextFlags);
    setSelectedCell(target);
    penaltyMsRef.current += HINT_PENALTY_MS;
    setElapsedTime(
      Date.now() - (startTimeRef.current ?? Date.now()) + penaltyMsRef.current,
    );
    setHintCount((value) => value + 1);
    setStatusMessage(
      `Pista aplicada. Se añadieron ${HINT_PENALTY_MS / 1000} segundos al tiempo.`,
    );
    finishGameIfWon(nextBoard, penaltyMsRef.current);
  };

  useEffect(() => {
    if (!isStarted || !isTimerRunning || startTimeRef.current === null || isWon)
      return;
    const timer = window.setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current! + penaltyMsRef.current);
    }, 100);
    return () => window.clearInterval(timer);
  }, [isStarted, isTimerRunning, isWon]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isStarted || isWon) return;
      if (event.key === "Backspace" || event.key === "Delete") handleInput(0);
      else if (/^[1-9]$/.test(event.key) && Number(event.key) <= size)
        handleInput(Number(event.key));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCell, board, size, isStarted, isWon, initialBoard]);

  const handleCellKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const nextRow = Math.min(size - 1, Math.max(0, row + move[0]));
    const nextCol = Math.min(size - 1, Math.max(0, col + move[1]));
    setSelectedCell([nextRow, nextCol]);
    document
      .querySelector<HTMLButtonElement>(`[data-cell="${nextRow}-${nextCol}"]`)
      ?.focus();
  };

  const formattedTime = `${(elapsedTime / 1000).toFixed(1)} s`;
  const formatPlayedAt = (playedAt: string) =>
    new Intl.DateTimeFormat("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(playedAt));

  if (!isStarted) {
    return (
      <main
        className="mx-auto w-full max-w-2xl p-4 sm:p-8"
        aria-labelledby="sudoku-setup-title"
      >
        <section className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-xl sm:p-8">
          <h1
            id="sudoku-setup-title"
            className="text-2xl font-black text-white"
          >
            Configura tu Sudoku
          </h1>
          <p className="mt-2 text-slate-300">
            Elige el tamaño y cuántos números quedarán visibles como pistas.
          </p>
          <fieldset className="mt-6">
            <legend className="mb-3 font-bold text-slate-100">
              Tamaño del tablero
            </legend>
            <div className="flex flex-wrap gap-3">
              {[4, 9].map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={size === option}
                  onClick={() => {
                    const nextSize = option as 4 | 9;
                    setSize(nextSize);
                    setGivenCount(
                      GIVEN_OPTIONS[nextSize][
                        Math.floor(GIVEN_OPTIONS[nextSize].length / 2)
                      ],
                    );
                  }}
                  className={cx(
                    "rounded-lg border-2 px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-white",
                    size === option
                      ? "border-indigo-400 bg-indigo-600 text-white"
                      : "border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-700",
                  )}
                >
                  {option}x{option} {option === 4 ? "Básico" : "Clásico"}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="mb-3 font-bold text-slate-100">
              Números visibles: {givenCount}
            </legend>
            <input
              aria-label={`Números visibles: ${givenCount}`}
              type="range"
              min={GIVEN_OPTIONS[size][0]}
              max={GIVEN_OPTIONS[size].at(-1)}
              step="1"
              value={givenCount}
              onChange={(event) => setGivenCount(Number(event.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="mt-1 flex justify-between text-sm text-slate-400">
              <span>{GIVEN_OPTIONS[size][0]} (difícil)</span>
              <span>{GIVEN_OPTIONS[size].at(-1)} (fácil)</span>
            </div>
          </fieldset>
          <Button onClick={startGame} className="mt-8 w-full sm:w-auto">
            <Play size={18} aria-hidden="true" /> Iniciar Sudoku
          </Button>
        </section>
      </main>
    );
  }

  const boxSize = size === 4 ? 2 : 3;
  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-col items-center p-4"
      aria-labelledby="sudoku-title"
    >
      <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="sudoku-title" className="text-2xl font-black text-white">
            Mini Sudoku {size}x{size}
          </h1>
          <p className="text-sm text-slate-300">
            {givenCount} números visibles · {hintCount} pistas usadas
          </p>
        </div>
        <p className="text-lg font-bold text-slate-200" aria-live="off">
          Tiempo: {formattedTime}
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {statusMessage}
      </p>
      <div
        role="grid"
        aria-label={`Sudoku de ${size} por ${size}`}
        aria-describedby="sudoku-instructions"
        className="grid rounded-xl bg-slate-800 p-2 shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gap: "2px",
        }}
      >
        {board.map((line, row) =>
          line.map((cell, col) => {
            const isSelected =
              selectedCell?.[0] === row && selectedCell?.[1] === col;
            const isFixed = initialBoard[row][col];
            return (
              <button
                key={`${row}-${col}`}
                type="button"
                role="gridcell"
                data-cell={`${row}-${col}`}
                aria-label={`Fila ${row + 1}, columna ${col + 1}, ${isFixed ? "pista fija" : cell ? `valor ${cell}` : "vacía"}`}
                aria-selected={isSelected}
                tabIndex={
                  isSelected || (!selectedCell && row === 0 && col === 0)
                    ? 0
                    : -1
                }
                onClick={() => setSelectedCell([row, col])}
                onKeyDown={(event) => handleCellKeyDown(event, row, col)}
                className={cx(
                  "flex h-10 w-10 items-center justify-center text-lg font-bold transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-white sm:h-12 sm:w-12 sm:text-xl",
                  (col + 1) % boxSize === 0 &&
                    col !== size - 1 &&
                    "border-r-2 border-slate-950",
                  (row + 1) % boxSize === 0 &&
                    row !== size - 1 &&
                    "border-b-2 border-slate-950",
                  isSelected
                    ? "bg-indigo-500 text-white"
                    : isFixed
                      ? "bg-slate-700 text-slate-100"
                      : "bg-slate-900 text-indigo-300 hover:bg-slate-700",
                )}
              >
                {cell || ""}
              </button>
            );
          }),
        )}
      </div>
      <p
        id="sudoku-instructions"
        className="mt-4 text-center text-sm text-slate-300"
      >
        Selecciona una celda. Usa las flechas para moverte y las teclas
        numéricas para jugar.
      </p>
      <div
        className="mt-5 grid w-full max-w-sm grid-cols-5 gap-2"
        aria-label="Controles del Sudoku"
      >
        {Array.from({ length: size }, (_, index) => index + 1).map((number) => (
          <Button
            key={number}
            variant="secondary"
            onClick={() => handleInput(number)}
            aria-label={`Introducir ${number}`}
            className="!py-3 text-xl"
          >
            {number}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => handleInput(0)}
          className="col-span-2 !py-3 text-rose-300"
        >
          Borrar
        </Button>
        <Button
          variant="outline"
          onClick={requestHint}
          className="col-span-3 !py-3 text-amber-300"
        >
          <Lightbulb size={18} aria-hidden="true" /> Pista (+
          {HINT_PENALTY_MS / 1000}s)
        </Button>
      </div>
      <VictoryModal
        show={isWon}
        onRestart={() => {
          generateSudoku(size, givenCount);
        }}
        onMenu={onMenu ?? (() => {})}
        title="¡Sudoku resuelto!"
        details={
          <div className="rounded-lg bg-slate-800 p-4 text-center">
            <p className="font-bold text-emerald-400">
              Completado en {formattedTime}
            </p>
            <p className="mt-2 text-slate-300">{hintCount} pistas utilizadas</p>
            <div className="mt-5 max-h-56 space-y-2 overflow-y-auto">
              {ranking.map((game, index) => (
                <div
                  key={game.id}
                  className="flex justify-between rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-left"
                >
                  <span className="font-bold text-slate-200">
                    #{index + 1} · {game.size}x{game.size}
                  </span>
                  <span className="text-right text-emerald-400">
                    {(game.timeMs / 1000).toFixed(1)} s
                    <small className="block text-slate-500">
                      {formatPlayedAt(game.playedAt)}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        }
      />
    </main>
  );
};
