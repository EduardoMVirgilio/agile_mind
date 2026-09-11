import { useCallback, useState } from "react";
import { Brain, GitCommit, Hash, Type, X } from "lucide-react";
import { GameCard } from "../components/game/GameCard";
import { BestResultDialog } from "../components/sharing/BestResultDialog";
import { ShareResult } from "../components/sharing/ShareResult";
import { useNumberConnectRanking } from "../store/numberConnectStore";
import { useSudokuRanking } from "../store/sudokuStore";
import { useWordSearchRanking } from "../store/wordSearchStore";
import { useEulerPatternRanking } from "../store/eulerPatternStore";
import type { GameType } from "../types/game";
import { useEscapeKey } from "../hooks/useEscapeKey";

type GameMenuProps = {
  onSelect: (game: Exclude<GameType, "menu">) => void;
};

export const GameMenu = ({ onSelect }: GameMenuProps) => {
  const games = useNumberConnectRanking((state) => state.games);
  const bestResult = games[0];
  const wordSearchGames = useWordSearchRanking((state) => state.games);
  const bestWordSearchResult = wordSearchGames[0];
  const sudokuGames = useSudokuRanking((state) => state.games);
  const bestSudokuResult = sudokuGames[0];
  const eulerGames = useEulerPatternRanking((state) => state.games);
  const bestEulerResult = eulerGames[0];
  const [showBestResult, setShowBestResult] = useState(false);
  const [showBestWordSearchResult, setShowBestWordSearchResult] =
    useState(false);
  const [showBestSudokuResult, setShowBestSudokuResult] = useState(false);
  const [showBestEulerResult, setShowBestEulerResult] = useState(false);

  const closeBestResults = useCallback(() => {
    setShowBestResult(false);
    setShowBestWordSearchResult(false);
    setShowBestSudokuResult(false);
    setShowBestEulerResult(false);
  }, []);

  useEscapeKey(
    showBestResult || showBestWordSearchResult || showBestSudokuResult || showBestEulerResult,
    closeBestResults,
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 md:mb-20 text-center animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 ring-1 ring-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Brain size={48} className="text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Agile{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Mind
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everyday Mental Agility Games
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          <GameCard
            game="number-connect"
            title="Number Connect"
            description="Connect the numbers in order to fill in the entire grid without crossing over or reusing cells."
            icon={<Hash size={28} />}
            accent="indigo"
            bestTimeMs={bestResult?.timeMs}
            onSelect={onSelect}
            onShowBest={() => setShowBestResult(true)}
            bestResultLabel="Ver detalles y compartir el mejor resultado de Number Connect"
          />
          <GameCard
            game="word-search"
            title="Word Search"
            description="Find the words."
            icon={<Type size={28} />}
            accent="emerald"
            bestTimeMs={bestWordSearchResult?.timeMs}
            onSelect={onSelect}
            onShowBest={() => setShowBestWordSearchResult(true)}
            bestResultLabel="Ver detalles y compartir el mejor resultado de Word Search"
          />
          <GameCard
            game="sudoku"
            title="Mini Sudoku"
            description="Fill in the grid so that each row and each column completes the number sequence."
            icon={
              <div className="grid grid-cols-2 gap-0.5">
                <div className="h-3 w-3 rounded-sm bg-current" />
                <div className="h-3 w-3 rounded-sm border-2 border-current" />
                <div className="h-3 w-3 rounded-sm border-2 border-current" />
                <div className="h-3 w-3 rounded-sm bg-current" />
              </div>
            }
            accent="cyan"
            bestTimeMs={bestSudokuResult?.timeMs}
            onSelect={onSelect}
            onShowBest={() => setShowBestSudokuResult(true)}
            bestResultLabel="Ver detalles y compartir el mejor resultado de Mini Sudoku"
          />
          <GameCard
            game="euler"
            title="Euler Pattern"
            description="Draw the entire geometric pattern in a single stroke without repeating any edges."
            icon={<GitCommit size={28} />}
            accent="rose"
            bestTimeMs={bestEulerResult?.timeMs}
            onSelect={onSelect}
            onShowBest={() => setShowBestEulerResult(true)}
            bestResultLabel="Ver detalles y compartir el mejor resultado de Euler Pattern"
          />
        </div>

        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>Eduardo Miguel Virgilio - 2026.</p>
        </footer>
        {bestResult && showBestResult && (
          <BestResultDialog
            title="Number Connect"
            accent="indigo"
            onClose={() => setShowBestResult(false)}
            details={
              <div className="mb-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Tiempo</p>
                  <p className="text-xl font-black text-emerald-400">{(bestResult.timeMs / 1000).toFixed(1)} s</p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Números</p>
                  <p className="text-xl font-black text-white">{bestResult.numberCount}</p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Celdas</p>
                  <p className="text-xl font-black text-white">{bestResult.cells}/{bestResult.cells}</p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Partidas</p>
                  <p className="text-xl font-black text-white">{games.length}</p>
                </div>
              </div>
            }
            shareResult={{
              title: "Number Connect",
              timeMs: bestResult.timeMs,
              stats: [
                { label: "Quantity Numbers:", value: bestResult.numberCount, emoji: "🔢" },
                {
                  label: "Date:",
                  value: new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(bestResult.playedAt)),
                  emoji: "📅",
                },
              ],
            }}
            fileName="agile-mind-number-connect-best.webp"
          />
        )}
        {bestWordSearchResult && showBestWordSearchResult && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            role="presentation"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget)
                setShowBestWordSearchResult(false);
            }}
          >
            <section
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-emerald-500/50 bg-slate-900 p-5 shadow-2xl sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="best-word-search-result-title"
              aria-describedby="best-word-search-result-description"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                    Word Search
                  </p>
                  <h2
                    id="best-word-search-result-title"
                    className="mt-1 text-2xl font-black text-white"
                  >
                    Mejor resultado
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBestWordSearchResult(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  aria-label="Cerrar mejor resultado de Word Search"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="mb-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Tiempo</p>
                  <p className="text-xl font-black text-emerald-400">
                    {(bestWordSearchResult.timeMs / 1000).toFixed(1)} s
                  </p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Palabras</p>
                  <p className="text-xl font-black text-white">
                    {bestWordSearchResult.wordCount}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Cuadrícula</p>
                  <p className="text-xl font-black text-white">
                    {bestWordSearchResult.gridSize}×
                    {bestWordSearchResult.gridSize}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Partidas</p>
                  <p className="text-xl font-black text-white">
                    {wordSearchGames.length}
                  </p>
                </div>
              </div>
              <p
                id="best-word-search-result-description"
                className="mb-5 text-center text-sm text-slate-400"
              >
                Jugado el{" "}
                {new Intl.DateTimeFormat("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(bestWordSearchResult.playedAt))}
              </p>
              <ShareResult
                result={{
                  title: "Word Search",
                  timeMs: bestWordSearchResult.timeMs,
                  stats: [
                    {
                      label: "Palabras:",
                      value: bestWordSearchResult.wordCount,
                      emoji: "🔤",
                    },
                    {
                      label: "Cuadrícula:",
                      value: `${bestWordSearchResult.gridSize}×${bestWordSearchResult.gridSize}`,
                      emoji: "🧩",
                    },
                    {
                      label: "Fecha:",
                      value: new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "long",
                      }).format(new Date(bestWordSearchResult.playedAt)),
                      emoji: "📅",
                    },
                  ],
                }}
                fileName="agile-mind-word-search-best.webp"
              />
            </section>
          </div>
        )}
        {bestSudokuResult && showBestSudokuResult && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            role="presentation"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) setShowBestSudokuResult(false);
            }}
          >
            <section
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-cyan-500/50 bg-slate-900 p-5 shadow-2xl sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="best-sudoku-result-title"
              aria-describedby="best-sudoku-result-description"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-cyan-300">Mini Sudoku</p>
                  <h2 id="best-sudoku-result-title" className="mt-1 text-2xl font-black text-white">
                    Mejor resultado
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBestSudokuResult(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  aria-label="Cerrar mejor resultado de Mini Sudoku"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="mb-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Tiempo</p>
                  <p className="text-xl font-black text-emerald-400">
                    {(bestSudokuResult.timeMs / 1000).toFixed(1)} s
                  </p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Tablero</p>
                  <p className="text-xl font-black text-white">{bestSudokuResult.size}×{bestSudokuResult.size}</p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Partidas</p>
                  <p className="text-xl font-black text-white">{sudokuGames.length}</p>
                </div>
              </div>
              <p id="best-sudoku-result-description" className="mb-5 text-center text-sm text-slate-400">
                Jugado el{" "}
                {new Intl.DateTimeFormat("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(bestSudokuResult.playedAt))}
              </p>
              <ShareResult
                result={{
                  title: "Mini Sudoku",
                  timeMs: bestSudokuResult.timeMs,
                  stats: [
                    {
                      label: "Tablero:",
                      value: `${bestSudokuResult.size}×${bestSudokuResult.size}`,
                      emoji: "🧩",
                    },
                    {
                      label: "Fecha:",
                      value: new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "long",
                      }).format(new Date(bestSudokuResult.playedAt)),
                      emoji: "📅",
                    },
                  ],
                }}
                fileName="agile-mind-mini-sudoku-best.webp"
              />
            </section>
          </div>
        )}
        {bestEulerResult && showBestEulerResult && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            role="presentation"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) setShowBestEulerResult(false);
            }}
          >
            <section
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-rose-500/50 bg-slate-900 p-5 shadow-2xl sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="best-euler-result-title"
              aria-describedby="best-euler-result-description"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-rose-300">Euler Pattern</p>
                  <h2 id="best-euler-result-title" className="mt-1 text-2xl font-black text-white">
                    Mejor resultado
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBestEulerResult(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  aria-label="Cerrar mejor resultado de Euler Pattern"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="mb-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Tiempo</p>
                  <p className="text-xl font-black text-emerald-400">
                    {(bestEulerResult.timeMs / 1000).toFixed(1)} s
                  </p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Nodos</p>
                  <p className="text-xl font-black text-white">{bestEulerResult.level}</p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Errores</p>
                  <p className="text-xl font-black text-white">{bestEulerResult.errors}</p>
                </div>
                <div className="rounded-lg bg-slate-800 p-3">
                  <p className="text-xs text-slate-400">Partidas</p>
                  <p className="text-xl font-black text-white">{eulerGames.length}</p>
                </div>
              </div>
              <p id="best-euler-result-description" className="mb-5 text-center text-sm text-slate-400">
                Jugado el{" "}
                {new Intl.DateTimeFormat("es-ES", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(bestEulerResult.playedAt))}
              </p>
              <ShareResult
                result={{
                  title: "Euler Pattern",
                  timeMs: bestEulerResult.timeMs,
                  stats: [
                    {
                      label: "Nodos:",
                      value: bestEulerResult.level,
                      emoji: "🔗",
                    },
                    {
                      label: "Errores:",
                      value: bestEulerResult.errors,
                      emoji: "⚠️",
                    },
                    {
                      label: "Fecha:",
                      value: new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "long",
                      }).format(new Date(bestEulerResult.playedAt)),
                      emoji: "📅",
                    },
                  ],
                }}
                fileName="agile-mind-euler-pattern-best.webp"
              />
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
